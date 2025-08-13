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

    // Handle different document ID formats
    let clusterId: string;
    let opinionId: string | null = null;
    
    // V4 format: cl-v4-{clusterId}-{strategy}
    const v4Match = documentId.match(/^cl-v4-(\d+)-/);
    // V3 format: cl-{clusterId}-{opinionId}
    const v3Match = documentId.match(/^cl-(\d+)-(\d+)$/);
    
    if (v4Match) {
      clusterId = v4Match[1];
      console.log(`V4 document ID detected, cluster: ${clusterId}`);
    } else if (v3Match) {
      clusterId = v3Match[1];
      opinionId = v3Match[2];
      console.log(`V3 document ID detected, cluster: ${clusterId}, opinion: ${opinionId}`);
    } else {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }

    const apiToken = process.env.COURTLISTENER_API_TOKEN;
    const headers: Record<string, string> = {
      'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
      'Accept': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Token ${apiToken}`;
    }

    let fullText = '';
    let metadata: any = {};

    if (opinionId) {
      // V3 format - fetch specific opinion
      try {
        const response = await fetch(
          `https://www.courtlistener.com/api/rest/v3/opinions/${opinionId}/?format=json`,
          { headers }
        );

        if (response.ok) {
          const opinion = await response.json();
          fullText = opinion.plain_text || opinion.html || '';
          metadata = {
            title: opinion.type,
            author: opinion.author?.name_full || 'Unknown',
            dateCreated: opinion.date_created,
            wordCount: fullText.length,
            hasPlainText: !!opinion.plain_text
          };
        }
      } catch (error) {
        console.error('V3 opinion fetch error:', error);
      }
    }
    
    // If V4 format or V3 failed, try to get cluster details and first opinion
    if (!fullText) {
      try {
        const clusterResponse = await fetch(
          `https://www.courtlistener.com/api/rest/v3/clusters/${clusterId}/?format=json`,
          { headers }
        );

        if (clusterResponse.ok) {
          const cluster = await clusterResponse.json();
          console.log(`Cluster sub_opinions:`, cluster.sub_opinions);
          
          // Get the first sub-opinion for text content
          if (cluster.sub_opinions && cluster.sub_opinions.length > 0) {
            const firstOpinionUrl = cluster.sub_opinions[0];
            
            // Extract opinion ID from URL or use URL directly
            let opinionUrl;
            if (typeof firstOpinionUrl === 'string' && firstOpinionUrl.startsWith('https://')) {
              opinionUrl = firstOpinionUrl;
            } else {
              opinionUrl = `https://www.courtlistener.com/api/rest/v3/opinions/${firstOpinionUrl.id}/?format=json`;
            }
            
            console.log(`Fetching opinion from: ${opinionUrl}`);
            const opinionResponse = await fetch(opinionUrl, { headers });

            if (opinionResponse.ok) {
              const opinion = await opinionResponse.json();
              fullText = opinion.plain_text || opinion.html || '';
              console.log(`Opinion content length: ${fullText.length} characters`);
              metadata = {
                title: `${cluster.case_name} - ${opinion.type}`,
                author: opinion.author?.name_full || 'Unknown',
                dateCreated: cluster.date_filed,
                wordCount: fullText.length,
                hasPlainText: !!opinion.plain_text,
                clusterId: clusterId
              };
            }
          }
        }
      } catch (error) {
        console.error('Cluster fetch error:', error);
      }
    }
    
    // Fallback if no content found
    if (!fullText) {
      fullText = 'Document content not available from CourtListener database';
      metadata = {
        title: 'Content Unavailable',
        author: 'Unknown',
        dateCreated: new Date().toISOString(),
        wordCount: 0,
        hasPlainText: false,
        clusterId: clusterId
      };
    }
    
    return NextResponse.json({
      fullText,
      metadata
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