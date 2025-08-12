import { NextRequest, NextResponse } from 'next/server';

// POST /api/legal/research-keywords
// Search for legal documents using keywords and natural language queries
export async function POST(request: NextRequest) {
  try {
    const { query, searchMode = 'comprehensive', searchType = 'keywords' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log(`Starting keyword search for: "${query}" with mode: ${searchMode}`);

    // Use CourtListener V4 Search API directly for keyword searches
    const apiToken = process.env.COURTLISTENER_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'Legal database access not configured' },
        { status: 500 }
      );
    }

    const headers = {
      'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
      'Accept': 'application/json',
      'Authorization': `Token ${apiToken}`
    };

    // Build search strategies based on mode and query
    let searchStrategies: Array<{query: string, name: string}> = [];
    
    if (searchMode === 'exact') {
      // Exact phrase search
      searchStrategies = [
        { query: `"${query}"`, name: 'exact_phrase' }
      ];
    } else if (searchMode === 'related') {
      // Related terms and variations
      searchStrategies = [
        { query: `"${query}"`, name: 'exact_phrase' },
        { query: query, name: 'all_terms' },
        // Split multi-word queries for broader search
        ...(query.includes(' ') ? query.split(' ').filter(word => word.length > 3).map(word => ({
          query: word,
          name: `individual_term_${word}`
        })) : [])
      ];
    } else {
      // Comprehensive search
      searchStrategies = [
        { query: `"${query}"`, name: 'exact_phrase' },
        { query: query, name: 'all_terms' },
        // Individual terms for broader discovery
        ...(query.includes(' ') ? query.split(' ').filter(word => word.length > 2).map(word => ({
          query: word,
          name: `term_${word}`
        })) : []),
        // Try variations if it looks like a case name
        ...(query.includes('v.') || query.includes(' v ') ? [
          { query: query.replace(/v\./g, 'v'), name: 'case_name_variation' }
        ] : [])
      ];
    }

    const allResults: any[] = [];
    const errors: string[] = [];



    // Execute search strategies with content priority
    for (const strategy of searchStrategies.slice(0, 3)) { // Limit to first 3 strategies
      try {
        console.log(`Trying content-priority strategy: ${strategy.name} - "${strategy.query}"`);
        
        const params = new URLSearchParams();
        params.append('q', strategy.query);
        params.append('type', 'o'); // Case law opinions
        params.append('limit', '10');
        params.append('status', 'Published');
        params.append('format', 'json');

        const headers: Record<string, string> = {
          'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
          'Accept': 'application/json',
        };

        if (apiToken) {
          headers['Authorization'] = `Token ${apiToken}`;
        }

        const response = await fetch(`https://www.courtlistener.com/api/rest/v4/search/?${params.toString()}`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`V4 Search API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter and prioritize results that have snippets (indicating content availability)
        const resultsWithContent = data.results.filter((result: any) => 
          result.snippet && result.snippet.length > 100
        );
        
        console.log(`Found ${resultsWithContent.length}/${data.results.length} results with substantial content`);
        
        if (data.results && data.results.length > 0) {
          // Prioritize results with actual content - use all results but mark content availability
          const resultsToUse = resultsWithContent.length > 0 ? 
            [...resultsWithContent, ...data.results.filter((result: any) => !result.snippet || result.snippet.length <= 100)] :
            data.results;
          
          if (resultsToUse && resultsToUse.length > 0) {
            // Convert V4 results to our document format, marking content availability
            const documents = resultsToUse.map((result: any) => ({
              id: `cl-v4-${result.cluster_id}-${strategy.name}`,
              type: 'decision',
              title: `${result.caseName} - ${result.court}`,
              court: result.court || 'Unknown Court',
              docketNumber: result.docketNumber || `cluster-${result.cluster_id}`,
              date: result.dateFiled || 'Unknown Date',
              pageCount: 0,
              source: 'courtlistener',
              downloadUrl: result.absolute_url || '',
              plainText: result.snippet || '',
              authors: result.judge ? [result.judge] : [],
              isSelected: false,
              hasPlainText: !!(result.snippet && result.snippet.length > 100)
            }));

            allResults.push({
              strategy: strategy.name,
              totalFound: data.count,
              documents: documents
            });

            // If exact phrase found results, prioritize those
            if (strategy.name === 'exact_phrase' && documents.length > 0) {
              console.log(`Found exact phrase matches, prioritizing these results`);
              break;
            }
          }
        } else {
          errors.push(`Search strategy "${strategy.name}" failed: ${response.status}`);
        }
      } catch (error) {
        errors.push(`Search strategy "${strategy.name}" error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Combine and deduplicate results
    const allDocuments: any[] = [];
    const seenIds = new Set();
    let totalFound = 0;

    for (const result of allResults) {
      totalFound += result.totalFound;
      for (const doc of result.documents) {
        // Create a unique key based on cluster_id to avoid duplicates
        const uniqueKey = doc.id.split('-')[2]; // Extract cluster_id
        if (!seenIds.has(uniqueKey)) {
          seenIds.add(uniqueKey);
          allDocuments.push(doc);
        }
      }
    }

    // Format response to match citation search format
    const response = {
      citation: {
        original: query,
        parsed: {
          caseName: query,
          reporter: '',
          volume: '',
          page: '',
          fullCitation: query,
          isValid: false // Not a citation
        }
      },
      documents: allDocuments.slice(0, 20), // Limit to 20 results
      summary: {
        totalFound: Math.min(totalFound, 10000), // Cap at reasonable number
        documentsReturned: allDocuments.length,
        searchQueries: searchStrategies.map(s => ({ query: s.query, strategy: s.name })),
        errors: errors,
        searchType: 'keywords',
        searchMode: searchMode
      }
    };

    console.log(`Keyword search completed: ${allDocuments.length} unique documents from ${allResults.length} strategies`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Keyword search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform keyword search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
