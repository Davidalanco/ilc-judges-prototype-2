import { NextRequest, NextResponse } from 'next/server';

// GET /api/legal/get-working-documents
// Find cases that actually have retrievable content for testing
export async function GET() {
  try {
    console.log('Finding cases with actual downloadable content...');

    const apiToken = process.env.COURTLISTENER_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const headers = {
      'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
      'Accept': 'application/json',
      'Authorization': `Token ${apiToken}`
    };

    // Search for recent Supreme Court cases that are more likely to have content
    const searchQueries = [
      'Supreme Court Miranda',
      'Supreme Court Roe Wade',
      'Supreme Court Brown Board',
      'constitutional rights',
      'civil rights Supreme Court'
    ];

    const workingDocuments = [];

    for (const query of searchQueries) {
      try {
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('type', 'o');
        params.append('limit', '5');
        params.append('format', 'json');

        const response = await fetch(
          `https://www.courtlistener.com/api/rest/v4/search/?${params.toString()}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          
          for (const result of data.results) {
            // Check if this case has actual content by looking at the opinions
            if (result.opinions && result.opinions.length > 0) {
              for (const opinion of result.opinions) {
                // Check if we can get the actual opinion content
                try {
                  const opinionResponse = await fetch(
                    `https://www.courtlistener.com/api/rest/v3/opinions/${opinion.id}/?format=json`,
                    { headers }
                  );

                  if (opinionResponse.ok) {
                    const opinionData = await opinionResponse.json();
                    
                    if (opinionData.plain_text && opinionData.plain_text.length > 1000) {
                      workingDocuments.push({
                        id: `cl-v3-${result.cluster_id}-${opinion.id}`,
                        title: `${result.caseName} - ${result.court}`,
                        court: result.court,
                        date: result.dateFiled,
                        clusterId: result.cluster_id,
                        opinionId: opinion.id,
                        contentLength: opinionData.plain_text.length,
                        hasContent: true,
                        downloadUrl: opinionData.download_url || result.absolute_url,
                        contentPreview: opinionData.plain_text.substring(0, 200) + '...'
                      });

                      console.log(`Found working document: ${result.caseName} (${opinionData.plain_text.length} chars)`);
                      
                      // Limit to prevent too many API calls
                      if (workingDocuments.length >= 10) {
                        break;
                      }
                    }
                  }
                } catch (opinionError) {
                  console.error(`Error checking opinion ${opinion.id}:`, opinionError);
                }
              }
            }
            
            if (workingDocuments.length >= 10) break;
          }
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }
      
      if (workingDocuments.length >= 10) break;
    }

    console.log(`Found ${workingDocuments.length} documents with actual content`);

    return NextResponse.json({
      success: true,
      documentsFound: workingDocuments.length,
      documents: workingDocuments,
      message: workingDocuments.length > 0 
        ? `Found ${workingDocuments.length} cases with retrievable full text content`
        : 'No cases with full text content found in current search'
    });

  } catch (error) {
    console.error('Error finding working documents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to find working documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
