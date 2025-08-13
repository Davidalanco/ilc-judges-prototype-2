import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for direct operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/legal/save-document
// Save a selected legal document with full text content and generate summary
export async function POST(request: NextRequest) {
  try {
    const { 
      document, 
      caseId, 
      userId, 
      researchSessionId,
      fullText 
    } = await request.json();

    console.log(`Saving document: ${document.title} for case ${caseId}`);

    // Validate required fields
    if (!document || !caseId || !userId) {
      return NextResponse.json(
        { error: 'Document, case ID, and user ID are required' },
        { status: 400 }
      );
    }

    // If no research session provided, create one
    let sessionId = researchSessionId;
    if (!sessionId) {
      const session = await db.createResearchSession({
        case_id: caseId,
        user_id: userId,
        session_name: `Research Session - ${new Date().toLocaleDateString()}`,
        description: `Legal research for ${document.title}`
      });
      sessionId = session.id;
    }

    // Create the legal document record - match actual database schema
    const legalDocument = await db.createLegalDocument({
      research_session_id: sessionId,
      case_id: caseId,
      external_id: document.id,
      source_system: 'courtlistener',
      document_type: document.type || 'decision',
      citation: document.title, // Use title as citation since it contains case name
      case_title: document.title,
      court: document.court,
      docket_number: document.docketNumber,
      decision_date: document.date,
      page_count: document.pageCount || 0,
      has_plain_text: document.hasPlainText || false,
      download_url: document.downloadUrl,
      authors: document.authors || [],
      search_query: document.searchQuery || '',
      relevance_score: 0.8
    });

    console.log(`Created legal document record: ${legalDocument.id}`);

    // If we have full text, save it and generate summary
    if (fullText && fullText.length > 100 && !fullText.includes('Document content not available')) {
      try {
        // Extract citations from the document text
        const citedCases = await extractCitationsFromText(fullText);
        console.log(`Extracted ${citedCases.length} citations from document`);

        // Generate AI summary
        console.log(`🤖 Starting AI summary generation for document: ${legalDocument.id}`);
        const summary = await generateDocumentSummary(legalDocument.id, document, fullText);
        console.log(`✅ Generated summary for document: ${legalDocument.id}`, {
          hasAiAnalysis: !!summary.aiAnalysis,
          keyPointsCount: summary.keyPoints?.length || 0,
          hasLegalStandard: !!summary.legalStandard,
          hasDisposition: !!summary.disposition,
          summaryPreview: summary.aiAnalysis?.substring(0, 100) + '...'
        });

        // Get the complete API data from CourtListener
        console.log('🔄 Fetching complete API data for permanent storage...');
        const completeApiData = await fetchCompleteCourtListenerData(document.id, document);
        
        // Store ALL data in the legal document record
        const completeData = {
          // Full text content
          full_text: fullText,
          full_text_length: fullText.length,
          preview: fullText.substring(0, 1000) + (fullText.length > 1000 ? '...' : ''),
          
          // Complete API responses - EVERYTHING from CourtListener
          search_result: completeApiData.searchResult || document,
          cluster_data: completeApiData.clusterData,
          opinion_data: completeApiData.opinionData,
          docket_data: completeApiData.docketData,
          
          // Content in multiple formats
          html_content: completeApiData.opinionData?.html,
          html_with_citations: completeApiData.opinionData?.html_with_citations,
          xml_content: completeApiData.opinionData?.xml_harvard,
          
          // Metadata
          stored_at: new Date().toISOString(),
          api_fetch_timestamp: completeApiData.timestamp,
          complete_cache: true, // Flag indicating we have ALL data
          
          // Citation analysis
          cited_cases: completeApiData.opinionData?.opinions_cited || [],
          citation_count: completeApiData.clusterData?.citation_count || 0,
          
          // Court and case details
          court_info: {
            court_id: completeApiData.searchResult?.court_id,
            court_name: completeApiData.searchResult?.court,
            court_citation_string: completeApiData.searchResult?.court_citation_string
          },
          
          // Judges and authorship
          judges_info: {
            panel_judges: completeApiData.clusterData?.panel || [],
            author: completeApiData.opinionData?.author_str,
            author_id: completeApiData.opinionData?.author_id,
            joined_by: completeApiData.opinionData?.joined_by_str
          },
          
          // Additional metadata
          precedential_status: completeApiData.clusterData?.precedential_status,
          source: completeApiData.clusterData?.source,
          sha1: completeApiData.opinionData?.sha1,
          page_count: completeApiData.opinionData?.page_count,
          extracted_by_ocr: completeApiData.opinionData?.extracted_by_ocr
        };

        await supabase
          .from('legal_documents')
          .update({ 
            local_file_path: `complete-data-${legalDocument.id}.json`,
            parties: completeData, // Store COMPLETE data in structured format
            has_plain_text: true
          })
          .eq('id', legalDocument.id);

        console.log(`💾 Stored complete API data: ${Object.keys(completeData).length} top-level fields, ${JSON.stringify(completeData).length} total characters`);

        // Store the document summary with full text analysis
        console.log(`💾 Saving AI summary to database...`, {
          document_id: legalDocument.id,
          ai_summary_length: summary.aiAnalysis?.length || 0,
          key_points_count: summary.keyPoints?.length || 0
        });
        const summaryRecord = await db.createDocumentSummary({
          document_id: legalDocument.id,
          summary_type: 'detailed',
          ai_model: 'gpt-4',
          cited_cases: citedCases,
          ai_summary: summary.aiAnalysis,
          key_points: summary.keyPoints || [],
          legal_standard: summary.legalStandard,
          disposition: summary.disposition,
          notable_quotes: summary.notableQuotes || [],
          holding: summary.holding,
          reasoning: summary.reasoning,
          precedent_value: summary.precedentValue,
          confidence_score: 0.85
        });
        console.log(`✅ AI summary saved to database with ID: ${summaryRecord.id}`);

        // Store full text content separately using Supabase storage or as a JSON field
        // For now, we'll add it to the legal document as metadata
        await db.updateLegalDocument(legalDocument.id, {
          has_plain_text: true,
          // Store full text in a structured way that won't overflow the database
          local_file_path: `full-text-${legalDocument.id}.txt` // Reference for future file storage
        });

        console.log(`Stored full text content for document: ${legalDocument.id}`);

        // Save citation relationships
        for (const citation of citedCases) {
          try {
            // Try to find the cited document in our database
            // This is a placeholder - you might want to search by citation
            // await db.createCitationRelationship({
            //   citing_document_id: legalDocument.id,
            //   cited_document_id: 'placeholder', // Would need to resolve citation
            //   relationship_type: 'cites',
            //   context: citation.context
            // });
          } catch (error) {
            console.warn(`Failed to save citation relationship for: ${citation.citation}`);
          }
        }

        return NextResponse.json({
          success: true,
          document: legalDocument,
          summary: summary,
          citationsFound: citedCases.length,
          message: `Document saved successfully with ${citedCases.length} citations extracted`
        });

      } catch (summaryError) {
        console.error('Summary generation failed:', summaryError);
        // Still return success for document save, but note summary failure
        return NextResponse.json({
          success: true,
          document: legalDocument,
          citationsFound: 0,
          warning: 'Document saved but summary generation failed',
          message: 'Document saved successfully (summary generation failed)'
        });
      }
    } else {
      // No full text available, save document metadata only
      await db.createDocumentSummary({
        document_id: legalDocument.id,
        summary_type: 'metadata_only',
        ai_model: 'gpt-4',
        cited_cases: [],
        ai_summary: 'Document saved with metadata only - full text not available',
        confidence_score: 0.3
      });

      return NextResponse.json({
        success: true,
        document: legalDocument,
        citationsFound: 0,
        message: 'Document metadata saved (full text not available)'
      });
    }

  } catch (error) {
    console.error('Document save error:', error);
    
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to save document',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Extract legal citations from document text
async function extractCitationsFromText(text: string): Promise<Array<{citation: string, context: string}>> {
  try {
    // Use regex patterns to find legal citations
    const citationPatterns = [
      // Federal cases: 123 F.3d 456, 123 F.Supp.2d 789, etc.
      /\b\d+\s+F\.(?:2d|3d|Supp\.(?:2d|3d)?|App\.)\s+\d+\b/g,
      // Supreme Court: 123 U.S. 456, 123 S.Ct. 789, etc.
      /\b\d+\s+(?:U\.S\.|S\.Ct\.|L\.Ed\.(?:2d)?)\s+\d+\b/g,
      // State cases: 123 Cal. 456, 123 N.Y.2d 789, etc.
      /\b\d+\s+[A-Z][a-z]*\.(?:2d|3d)?\s+\d+\b/g,
      // Case names: Name v. Name format
      /\b[A-Z][a-zA-Z\s&]+\sv\.?\s[A-Z][a-zA-Z\s&]+\b/g
    ];

    const citations: Array<{citation: string, context: string}> = [];
    const uniqueCitations = new Set<string>();

    for (const pattern of citationPatterns) {
      const matches = text.match(pattern) || [];
      for (const match of matches) {
        const citation = match.trim();
        if (!uniqueCitations.has(citation) && citation.length > 5) {
          uniqueCitations.add(citation);
          
          // Get context around the citation (50 chars before and after)
          const index = text.indexOf(citation);
          const start = Math.max(0, index - 50);
          const end = Math.min(text.length, index + citation.length + 50);
          const context = text.substring(start, end).trim();
          
          citations.push({ citation, context });
        }
      }
    }

    return citations.slice(0, 50); // Limit to 50 citations to avoid overwhelming the system
  } catch (error) {
    console.error('Citation extraction error:', error);
    return [];
  }
}

// Generate AI summary of the document
async function generateDocumentSummary(documentId: string, document: any, fullText: string) {
  try {
    const summaryUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/api/ai/summarize-document`;
    console.log(`🔍 Calling AI summary endpoint: ${summaryUrl}`);
    
    // Call the existing AI summarization endpoint
    const summaryResponse = await fetch(summaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          ...document,
          fullText: fullText
        },
        summaryType: 'decision'
      })
    });

    console.log(`📡 AI summary response status: ${summaryResponse.status}`);

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error(`❌ Summary API failed with status ${summaryResponse.status}:`, errorText);
      throw new Error(`Summary API failed: ${summaryResponse.status} - ${errorText}`);
    }

    const summaryData = await summaryResponse.json();
    console.log(`📥 AI summary response:`, {
      hasAiSummary: !!summaryData.aiSummary,
      responseKeys: Object.keys(summaryData),
      aiSummaryLength: summaryData.aiSummary?.length || 0
    });
    
    // Parse the AI response to extract structured information
    const aiAnalysis = summaryData.aiSummary || '';
    
    // Use structured data directly from summary API response
    return {
      aiAnalysis: aiAnalysis,
      keyPoints: summaryData.keyPoints || [],
      legalStandard: summaryData.legalStandard || '',
      disposition: summaryData.disposition || '',
      notableQuotes: summaryData.notableQuotes || [],
      holding: '', // Not in current API response
      reasoning: '', // Not in current API response  
      precedentValue: summaryData.significance || ''
    };

  } catch (error) {
    console.error('AI summary generation error:', error);
    throw error;
  }
}

// Helper functions to parse AI analysis
function extractKeyPoints(analysis: string): string[] {
  const match = analysis.match(/(?:Key|Main)\s+(?:Points|Holdings)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  if (match) {
    return match[1].split(/[•\-\*]\s*/).filter(point => point.trim().length > 10).slice(0, 5);
  }
  return [];
}

function extractLegalStandard(analysis: string): string {
  const match = analysis.match(/(?:Legal\s+Standard|Standard\s+Applied)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  return match ? match[1].trim().substring(0, 200) : '';
}

function extractDisposition(analysis: string): string {
  const match = analysis.match(/(?:Disposition|Case\s+Disposition|Outcome)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  return match ? match[1].trim().substring(0, 100) : '';
}

function extractNotableQuotes(analysis: string): string[] {
  const quotes = analysis.match(/"([^"]{20,200})"/g) || [];
  return quotes.slice(0, 3).map(quote => quote.replace(/"/g, ''));
}

function extractHolding(analysis: string): string {
  const match = analysis.match(/(?:Holding|Court\s+Held)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  return match ? match[1].trim().substring(0, 300) : '';
}

function extractReasoning(analysis: string): string {
  const match = analysis.match(/(?:Reasoning|Rationale)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  return match ? match[1].trim().substring(0, 500) : '';
}

function extractPrecedentValue(analysis: string): string {
  const match = analysis.match(/(?:Precedent|Significance)[:\s]*(.*?)(?:\n\n|\d\.)/s);
  return match ? match[1].trim().substring(0, 200) : '';
}

// Fetch complete CourtListener API data for permanent storage
async function fetchCompleteCourtListenerData(documentId: string, document: any) {
  const apiToken = process.env.COURTLISTENER_API_TOKEN;
  if (!apiToken) {
    console.warn('No API token available - storing document data only');
    return { timestamp: new Date().toISOString(), searchResult: document };
  }

  const headers = {
    'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
    'Accept': 'application/json',
    'Authorization': `Token ${apiToken}`
  };

  const result = {
    timestamp: new Date().toISOString(),
    searchResult: document,
    clusterData: null,
    opinionData: null,
    docketData: null
  };

  try {
    // Extract cluster ID from document
    const clusterId = document.cluster_id || documentId.split('-')[2]; // Try to extract from ID
    
    if (clusterId) {
      console.log(`📚 Fetching cluster data for ID: ${clusterId}`);
      
      // 1. Get cluster details
      try {
        const clusterResponse = await fetch(`https://www.courtlistener.com/api/rest/v4/clusters/${clusterId}/`, {
          headers
        });
        
        if (clusterResponse.ok) {
          result.clusterData = await clusterResponse.json();
          console.log('✅ Cluster data retrieved');
          
          // 2. Get opinion details if available
          if (result.clusterData.sub_opinions && result.clusterData.sub_opinions.length > 0) {
            const opinionUrl = result.clusterData.sub_opinions[0];
            const opinionId = opinionUrl.split('/').slice(-2)[0]; // Extract ID from URL
            
            console.log(`📄 Fetching opinion data for ID: ${opinionId}`);
            
            try {
              const opinionResponse = await fetch(`https://www.courtlistener.com/api/rest/v4/opinions/${opinionId}/`, {
                headers
              });
              
              if (opinionResponse.ok) {
                result.opinionData = await opinionResponse.json();
                console.log(`✅ Opinion data retrieved (${result.opinionData.plain_text?.length || 0} chars plain text)`);
              }
            } catch (opinionError) {
              console.warn('Failed to fetch opinion data:', opinionError);
            }
          }
          
          // 3. Get docket details if available
          if (result.clusterData.docket) {
            const docketId = result.clusterData.docket.split('/').slice(-2)[0]; // Extract ID from URL
            
            console.log(`⚖️ Fetching docket data for ID: ${docketId}`);
            
            try {
              const docketResponse = await fetch(`https://www.courtlistener.com/api/rest/v4/dockets/${docketId}/`, {
                headers
              });
              
              if (docketResponse.ok) {
                result.docketData = await docketResponse.json();
                console.log('✅ Docket data retrieved');
              }
            } catch (docketError) {
              console.warn('Failed to fetch docket data:', docketError);
            }
          }
        } else {
          console.warn(`Failed to fetch cluster data: ${clusterResponse.status}`);
        }
      } catch (clusterError) {
        console.warn('Failed to fetch cluster data:', clusterError);
      }
    } else {
      console.warn('No cluster ID found - cannot fetch complete API data');
    }
    
  } catch (error) {
    console.error('Error fetching complete CourtListener data:', error);
  }

  return result;
}
