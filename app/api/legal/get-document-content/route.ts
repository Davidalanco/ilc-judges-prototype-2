import { NextRequest, NextResponse } from 'next/server';

// POST /api/legal/get-document-content
// Fetch full document content from CourtListener
export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching document content for: ${documentId}`);

    // Extract CourtListener cluster and opinion IDs from our document ID format
    const match = documentId.match(/^cl-(\d+)-(\d+)$/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }

    const [, clusterId, opinionId] = match;

    // Fetch opinion content from CourtListener
    const apiToken = process.env.COURTLISTENER_API_TOKEN;
    const headers: Record<string, string> = {
      'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
      'Accept': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Token ${apiToken}`;
    }

    const response = await fetch(
      `https://www.courtlistener.com/api/rest/v3/opinions/${opinionId}/?format=json`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status}`);
    }

    const opinion = await response.json();
    
    // Extract text content
    const fullText = opinion.plain_text || opinion.html || 'Document content not available';
    
    return NextResponse.json({
      fullText,
      metadata: {
        title: opinion.type,
        author: opinion.author?.name_full || 'Unknown',
        dateCreated: opinion.date_created,
        wordCount: fullText.length,
        hasPlainText: !!opinion.plain_text
      }
    });

  } catch (error) {
    console.error('Document content fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch document content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 