import { NextRequest, NextResponse } from 'next/server';
import { ProfessionalLegalSearch } from '@/lib/legal/professional-apis';

// POST /api/legal/research-citation-professional
// Professional citation research using LexisNexis and Westlaw
export async function POST(request: NextRequest) {
  try {
    const { citation } = await request.json();

    if (!citation || typeof citation !== 'string') {
      return NextResponse.json(
        { error: 'Citation is required' },
        { status: 400 }
      );
    }

    console.log(`Starting professional citation research for: "${citation}"`);

    // Check if professional APIs are configured
    const hasLexis = !!(
      process.env.LEXISNEXIS_API_KEY && 
      process.env.LEXISNEXIS_CLIENT_ID && 
      process.env.LEXISNEXIS_CLIENT_SECRET
    );
    
    const hasWestlaw = !!(
      process.env.WESTLAW_API_KEY && 
      process.env.WESTLAW_CLIENT_ID && 
      process.env.WESTLAW_CLIENT_SECRET
    );

    if (!hasLexis && !hasWestlaw) {
      return NextResponse.json({
        error: 'Professional legal databases not configured',
        suggestion: 'Please add LexisNexis or Westlaw API credentials to environment variables',
        fallbackUrl: '/api/legal/research-citation' // Fallback to free API
      }, { status: 503 });
    }

    const professionalSearch = new ProfessionalLegalSearch();
    
    const results = await professionalSearch.searchByCitation(citation);
    
    console.log(`Professional search completed: ${results.totalResults} documents from ${results.providers.join(', ')}`);

    // Transform results for frontend compatibility
    const transformedDocuments = results.documents.map(doc => ({
      id: doc.id,
      type: doc.documentType,
      title: doc.title,
      court: doc.court,
      docketNumber: doc.docketNumber,
      date: doc.date,
      pageCount: doc.pageCount,
      source: doc.provider,
      downloadUrl: doc.downloadUrl,
      authors: doc.judges,
      hasPlainText: doc.hasFullText,
      isSelected: false,
      citation: doc.citation,
      confidence: doc.confidence,
      shepardSignal: doc.shepardSignal,
      headnotes: doc.headnotes,
      citedCases: doc.citedCases,
      citingCases: doc.citingCases,
      keyTopics: doc.keyTopics,
    }));

    const response = {
      citation: {
        original: citation,
        parsed: {
          caseName: results.citationAnalysis.parsedComponents.caseName,
          reporter: results.citationAnalysis.parsedComponents.reporter,
          volume: results.citationAnalysis.parsedComponents.volume,
          page: results.citationAnalysis.parsedComponents.page,
          year: results.citationAnalysis.parsedComponents.year,
          court: results.citationAnalysis.parsedComponents.court,
          isValid: results.citationAnalysis.isValid,
        }
      },
      documents: transformedDocuments,
      summary: {
        totalFound: results.totalResults,
        documentsReturned: transformedDocuments.length,
        searchQueries: [`Professional search: ${citation}`],
        providers: results.providers,
        errors: [],
        isProfessional: true,
        qualityScore: 0.95, // Professional APIs have high quality
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Professional citation research error:', error);

    // If professional APIs fail, suggest fallback
    if (error.message.includes('authentication') || error.message.includes('401')) {
      return NextResponse.json({
        error: 'Professional API authentication failed',
        suggestion: 'Please check your LexisNexis/Westlaw API credentials',
        fallbackUrl: '/api/legal/research-citation',
        isProfessional: false,
      }, { status: 401 });
    }

    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return NextResponse.json({
        error: 'Professional API usage limit reached',
        suggestion: 'Please check your LexisNexis/Westlaw API usage limits',
        fallbackUrl: '/api/legal/research-citation',
        isProfessional: false,
      }, { status: 429 });
    }

    return NextResponse.json(
      { 
        error: 'Professional citation research failed',
        details: error.message,
        fallbackUrl: '/api/legal/research-citation',
        isProfessional: false,
      },
      { status: 500 }
    );
  }
} 