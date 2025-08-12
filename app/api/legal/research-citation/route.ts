import { NextRequest, NextResponse } from 'next/server';
import { parseCitation, validateCitation } from '@/lib/legal/citation-parser';
import { searchCaseDocuments, getDocumentContent } from '@/lib/legal/courtlistener';

// POST /api/legal/research-citation
// Search for case documents based on legal citation
export async function POST(request: NextRequest) {
  try {
    // Handle both old (citation) and new (query) parameter formats
    const { citation, query, searchMode = 'exact' } = await request.json();
    const searchQuery = citation || query;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return NextResponse.json(
        { error: 'Citation or query is required' },
        { status: 400 }
      );
    }

    console.log(`Starting citation research for: "${searchQuery}" with mode: ${searchMode}`);

    // Validate and parse the citation
    const validation = validateCitation(searchQuery);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid citation format',
          details: validation.errors,
          citation: searchQuery
        },
        { status: 400 }
      );
    }

    // Parse the citation into components
    const parsedCitation = parseCitation(searchQuery);
    console.log('Parsed citation:', parsedCitation);

    // Search for case documents using CourtListener with search mode
    const searchResults = await searchCaseDocuments(parsedCitation, searchMode);
    
    console.log(`Found ${searchResults.documents.length} documents from ${searchResults.totalFound} total results`);

    // Format response
    const response = {
      citation: {
        original: searchQuery,
        parsed: parsedCitation
      },
      documents: searchResults.documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        court: doc.court,
        docketNumber: doc.docketNumber,
        date: doc.date,
        pageCount: doc.pageCount,
        source: doc.source,
        downloadUrl: doc.downloadUrl,
        authors: doc.authors,
        hasPlainText: !!doc.plainText
      })),
      summary: {
        totalFound: searchResults.totalFound,
        documentsReturned: searchResults.documents.length,
        searchQueries: searchResults.searchQueries,
        errors: searchResults.errors
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Citation research error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to research citation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/legal/research-citation?documentId=xxx
// Get full text content for a specific document
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    const action = url.searchParams.get('action');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    if (action === 'content') {
      // This is a simplified implementation
      // In practice, you'd need to store document metadata and retrieve content
      console.log(`Retrieving content for document: ${documentId}`);
      
      // For now, return a placeholder response
      return NextResponse.json({
        documentId,
        content: 'Document content would be retrieved here',
        message: 'Content retrieval not fully implemented yet'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Document content retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve document content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 