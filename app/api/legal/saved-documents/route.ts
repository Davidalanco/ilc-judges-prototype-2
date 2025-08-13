import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/legal/saved-documents?caseId=xxx
// Retrieve all saved documents for a case with their AI summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching saved documents for case: ${caseId}`);

    // Get all legal documents for this case
    const documents = await db.getLegalDocumentsByCase(caseId);
    
    // For each document, get the AI summary and any user notes
    const documentsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        try {
          // Get AI summary
          const summary = await db.getDocumentSummary(doc.id, 'detailed');
          
          // Get user notes for this document
          const notes = await db.getResearchNotesByCase(caseId);
          const documentNotes = notes.filter(note => note.document_id === doc.id);

          // Extract full text and complete API data from the parties field
          const fullText = doc.parties?.full_text || '';
          const fullTextPreview = doc.parties?.preview || '';
          const hasCompleteCache = doc.parties?.complete_cache || false;
          
          return {
            ...doc,
            aiSummary: summary,
            userNotes: documentNotes,
            hasAiAnalysis: !!summary,
            noteCount: documentNotes.length,
            fullText: fullText, // Include full document text
            textPreview: fullTextPreview, // Include preview text
            hasFullText: !!(fullText && fullText.length > 100),
            completeApiData: hasCompleteCache ? {
              complete_cache: true,
              search_result: doc.parties?.search_result,
              cluster_data: doc.parties?.cluster_data,
              opinion_data: doc.parties?.opinion_data,
              docket_data: doc.parties?.docket_data,
              html_content: doc.parties?.html_content,
              html_with_citations: doc.parties?.html_with_citations,
              xml_content: doc.parties?.xml_content,
              court_info: doc.parties?.court_info,
              judges_info: doc.parties?.judges_info,
              cited_cases: doc.parties?.cited_cases,
              citation_count: doc.parties?.citation_count,
              precedential_status: doc.parties?.precedential_status,
              page_count: doc.parties?.page_count,
              api_fetch_timestamp: doc.parties?.api_fetch_timestamp
            } : undefined
          };
        } catch (error) {
          console.warn(`Failed to get details for document ${doc.id}:`, error);
          return {
            ...doc,
            aiSummary: null,
            userNotes: [],
            hasAiAnalysis: false,
            noteCount: 0
          };
        }
      })
    );

    // Group documents by type for better organization
    const groupedDocuments = {
      decisions: documentsWithDetails.filter(doc => doc.document_type === 'decision'),
      dissents: documentsWithDetails.filter(doc => doc.document_type === 'dissent'),
      concurrences: documentsWithDetails.filter(doc => doc.document_type === 'concurrence'),
      briefs: documentsWithDetails.filter(doc => doc.document_type.includes('brief')),
      other: documentsWithDetails.filter(doc => 
        !['decision', 'dissent', 'concurrence'].includes(doc.document_type) && 
        !doc.document_type.includes('brief')
      )
    };

    // Calculate case relationship insights
    const insights = {
      totalDocuments: documentsWithDetails.length,
      documentsWithAI: documentsWithDetails.filter(doc => doc.hasAiAnalysis).length,
      totalNotes: documentsWithDetails.reduce((sum, doc) => sum + doc.noteCount, 0),
      sourcesUsed: [...new Set(documentsWithDetails.map(doc => doc.source_system))],
      courtsRepresented: [...new Set(documentsWithDetails.map(doc => doc.court))].filter(Boolean),
      dateRange: {
        earliest: documentsWithDetails
          .filter(doc => doc.decision_date)
          .sort((a, b) => new Date(a.decision_date).getTime() - new Date(b.decision_date).getTime())[0]?.decision_date,
        latest: documentsWithDetails
          .filter(doc => doc.decision_date)
          .sort((a, b) => new Date(b.decision_date).getTime() - new Date(a.decision_date).getTime())[0]?.decision_date
      }
    };

    return NextResponse.json({
      success: true,
      caseId,
      documents: documentsWithDetails,
      groupedDocuments,
      insights,
      message: `Found ${documentsWithDetails.length} saved documents`
    });

  } catch (error) {
    console.error('Saved documents fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch saved documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
