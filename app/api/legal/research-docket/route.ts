import { NextRequest, NextResponse } from 'next/server';

// POST /api/legal/research-docket
// Search for all documents within a specific docket number
export async function POST(request: NextRequest) {
  try {
    const { docketNumber, searchMode = 'exact' } = await request.json();

    if (!docketNumber || typeof docketNumber !== 'string') {
      return NextResponse.json(
        { error: 'Docket number is required' },
        { status: 400 }
      );
    }

    console.log(`Starting docket search for: "${docketNumber}" with mode: ${searchMode}`);

    // Use CourtListener V4 Search API for docket searches
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

    // Build search strategies for docket numbers
    let searchStrategies: Array<{query: string, name: string, field?: string}> = [];
    
    const cleanDocket = docketNumber.trim();
    
    if (searchMode === 'exact') {
      // Exact docket number search
      searchStrategies = [
        { query: cleanDocket, name: 'exact_docket', field: 'docket_number' }
      ];
    } else if (searchMode === 'related') {
      // Related docket searches including variations
      searchStrategies = [
        { query: cleanDocket, name: 'exact_docket', field: 'docket_number' },
        { query: cleanDocket, name: 'docket_in_text' }, // Search in full text
        // Try with and without common prefixes/suffixes
        ...(cleanDocket.includes('-') ? [
          { query: cleanDocket.replace(/-/g, ' '), name: 'docket_spaced' },
          { query: cleanDocket.replace(/-/g, ''), name: 'docket_no_dash' }
        ] : []),
        // Try case number variations
        ...(cleanDocket.match(/\d+/) ? [
          { query: cleanDocket.match(/\d+/)?.[0] || '', name: 'case_number_only' }
        ] : [])
      ];
    } else {
      // Comprehensive docket search
      searchStrategies = [
        { query: cleanDocket, name: 'exact_docket', field: 'docket_number' },
        { query: cleanDocket, name: 'docket_in_text' },
        { query: `"${cleanDocket}"`, name: 'quoted_docket' },
        // Format variations
        ...(cleanDocket.includes('-') ? [
          { query: cleanDocket.replace(/-/g, ' '), name: 'docket_spaced' },
          { query: cleanDocket.replace(/-/g, ''), name: 'docket_no_dash' }
        ] : []),
        // Try without common prefixes like "No.", "Case", etc.
        ...(cleanDocket.toLowerCase().includes('no.') ? [
          { query: cleanDocket.toLowerCase().replace(/no\.\s*/g, ''), name: 'without_no_prefix' }
        ] : []),
        // Extract and search just the number part
        ...(cleanDocket.match(/\d+/) ? [
          { query: cleanDocket.match(/\d+/)?.[0] || '', name: 'case_number_only' }
        ] : [])
      ];
    }

    const allResults: any[] = [];
    const errors: string[] = [];
    const searchDetails: any[] = [];

    // Execute search strategies
    for (const strategy of searchStrategies) {
      try {
        console.log(`Trying ${strategy.name} strategy: "${strategy.query}"`);
        
        const params = new URLSearchParams();
        
        if (strategy.field === 'docket_number') {
          // Search for docket number specifically in RECAP documents
          params.append('q', `docketNumber:"${strategy.query}"`);
        } else {
          // Search in full text for RECAP documents
          params.append('q', `"${strategy.query}"`);
        }
        
        params.append('type', 'r'); // RECAP documents (more complete docket coverage)
        params.append('limit', '50'); // Higher limit for more complete results
        // Remove status filter for RECAP documents
        params.append('format', 'json');

        const response = await fetch(`https://www.courtlistener.com/api/rest/v4/search/?${params.toString()}`, {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ ${strategy.name} search failed: ${response.status} - ${errorText}`);
          errors.push(`${strategy.name}: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        console.log(`Found ${data.results?.length || 0}/${data.count || 0} results with potential content for ${strategy.name}`);

        if (data.results && data.results.length > 0) {
          // Process RECAP documents - extract individual documents from recap_documents array
          const processedResults: any[] = [];
          
          data.results.forEach((docketResult: any) => {
            if (docketResult && docketResult.recap_documents) {
              // Add each document from the docket
              docketResult.recap_documents.forEach((recapDoc: any) => {
                processedResults.push({
                  id: recapDoc.id,
                  docket_id: docketResult.docket_id,
                  cluster_id: recapDoc.id, // Use recap doc ID for deduplication
                  caseName: docketResult.caseName,
                  court: docketResult.court,
                  court_id: docketResult.court_id,
                  docketNumber: docketResult.docketNumber,
                  document_number: recapDoc.document_number,
                  entry_number: recapDoc.entry_number,
                  description: recapDoc.description,
                  document_type: recapDoc.document_type,
                  entry_date_filed: recapDoc.entry_date_filed,
                  absolute_url: recapDoc.absolute_url,
                  is_available: recapDoc.is_available,
                  searchStrategy: strategy.name,
                  searchQuery: strategy.query,
                  docketMatch: docketResult.docketNumber || 'Unknown'
                });
              });
            }
          });

          allResults.push(...processedResults);
          
          searchDetails.push({
            strategy: strategy.name,
            query: strategy.query,
            resultsFound: data.results.length,
            totalAvailable: data.count
          });

          // Log the processing results
          console.log(`✅ Processed ${processedResults.length} results for strategy: ${strategy.name}`);
          
          // Stop early if we have exact matches
          if (strategy.name === 'exact_docket' && processedResults.length > 0) {
            console.log('Found exact docket matches, prioritizing these results');
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Error in ${strategy.name} search:`, error);
        errors.push(`${strategy.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Remove duplicates based on cluster_id (like the working keyword search)
    const uniqueResults = allResults.filter((result, index, array) => 
      array.findIndex(r => (r.cluster_id || r.id) === (result.cluster_id || result.id)) === index
    );

    // Group by court and find the court with the most documents for this docket
    const courtGroups = new Map<string, any[]>();
    uniqueResults.forEach(result => {
      const court = result.court || 'Unknown Court';
      if (!courtGroups.has(court)) {
        courtGroups.set(court, []);
      }
      courtGroups.get(court)!.push(result);
    });

    // Find the court with the most documents for this docket
    let primaryCourt = '';
    let maxDocuments = 0;
    for (const [court, documents] of courtGroups.entries()) {
      if (documents.length > maxDocuments) {
        maxDocuments = documents.length;
        primaryCourt = court;
      }
    }

    // Only return documents from the primary court
    const courtFilteredResults = primaryCourt ? (courtGroups.get(primaryCourt) || []) : uniqueResults;

    console.log(`Docket search completed: ${courtFilteredResults.length} unique documents from ${searchStrategies.length} strategies`);
    console.log(`Primary court: ${primaryCourt} (${courtGroups.size} courts found)`);
    console.log(`Debug: allResults length = ${allResults.length}, uniqueResults length = ${uniqueResults.length}, courtFiltered = ${courtFilteredResults.length}`);

    // Transform RECAP documents to match frontend expectations
    const documents = courtFilteredResults.slice(0, 50).map((result: any) => ({
      id: `recap-${result.id}-${result.document_number}`,
      type: result.document_type || 'PACER Document',
      title: `Doc ${result.document_number}: ${result.description || 'Untitled Document'}`,
      court: result.court || 'Unknown Court',
      docketNumber: result.docketNumber || docketNumber,
      date: result.entry_date_filed || '',
      pageCount: result.page_count || 0,
      source: 'courtlistener' as const,
      downloadUrl: result.absolute_url || result.download_url || '',
      plainText: result.snippet || '',
      authors: result.judge ? [result.judge] : (result.author ? [result.author] : []),
      isSelected: false,
      hasPlainText: !!(
        (result.snippet && result.snippet.length > 50) ||
        (result.opinions && result.opinions.length > 0) ||
        (result.plain_text || result.html_with_citations)
      ),
      searchQuery: result.searchQuery,
      searchStrategy: result.searchStrategy,
      snippet: result.snippet,
      relevanceScore: result.searchStrategy === 'exact_docket' ? 1.0 : 0.8
    }));

    // Group by docket number for better organization
    const docketGroups = documents.reduce((groups: any, doc: any) => {
      const docket = doc.docketNumber || 'Unknown';
      if (!groups[docket]) {
        groups[docket] = [];
      }
      groups[docket].push(doc);
      return groups;
    }, {});

    const response = {
      success: true,
      searchQuery: docketNumber,
      searchMode,
      docketGroups,
      documents,
      summary: {
        totalFound: searchDetails.reduce((sum, detail) => sum + detail.totalAvailable, 0),
        documentsReturned: documents.length,
        primaryCourt,
        courtsFound: courtGroups.size,
        uniqueDockets: Object.keys(docketGroups).length,
        searchStrategies: searchDetails,
        errors
      },
      metadata: {
        searchType: 'docket',
        timestamp: new Date().toISOString(),
        hasExactMatches: searchDetails.some(s => s.strategy === 'exact_docket' && s.resultsFound > 0)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Docket search error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Docket search failed',
        searchQuery: request.body?.docketNumber || 'Unknown'
      },
      { status: 500 }
    );
  }
}
