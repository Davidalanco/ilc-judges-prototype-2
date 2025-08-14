import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai/claude';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('🔍 Raw request body received (keys):', Object.keys(requestBody));
    console.log('🔍 Case context length:', requestBody.caseContext?.length || 0);
    console.log('🔍 Legal issues:', requestBody.legalIssues);
    console.log('🔍 Exclude documents:', requestBody.excludeDocuments);
    
    const { caseContext, legalIssues, excludeDocuments, caseId } = requestBody;

    console.log('📋 Extracted caseContext:', caseContext);
    console.log('⚖️ Extracted legalIssues:', legalIssues);

    if (!caseContext) {
      console.log('❌ No case context provided!');
      return NextResponse.json(
        { error: 'Case context is required' },
        { status: 400 }
      );
    }

    // Check context size - if too large, truncate for API limits
    const maxContextLength = 20000; // Claude can handle about 100k tokens, but let's be conservative
    let processedContext = caseContext;
    if (caseContext.length > maxContextLength) {
      console.log(`⚠️ Context too large (${caseContext.length} chars), truncating to ${maxContextLength} chars`);
      processedContext = caseContext.substring(0, maxContextLength) + '\n\n[Content truncated for analysis]';
    }

    console.log(`Starting comprehensive historical research for all relevant constitutional principles`);

    const prompt = `You are a constitutional historian and legal strategist. Analyze this case and find ALL historical documents that are EXTREMELY relevant across any constitutional perspective.

CASE CONTEXT: ${processedContext}
LEGAL ISSUES: ${legalIssues || 'Constitutional analysis required'}

${excludeDocuments && excludeDocuments.length > 0 ? `
PREVIOUSLY MARKED AS NOT RELEVANT (DO NOT SUGGEST THESE AGAIN):
${excludeDocuments.map((title: string) => `- ${title}`).join('\n')}
` : ''}

COMPREHENSIVE ANALYSIS APPROACH:
Find documents that support ANY of these foundational principles that apply to this case:

1. RELIGIOUS LIBERTY & CONSCIENCE PROTECTION
   - Freedom from government coercion in religious matters
   - Protection of religious minorities from majoritarian oppression
   - Historical tradition of religious accommodation

2. CONSTITUTIONAL LIMITS & SEPARATION OF POWERS
   - Government operating within enumerated constitutional boundaries
   - Separation of powers and federalism principles
   - Protection against governmental overreach

3. PARENTAL RIGHTS & FAMILY AUTONOMY
   - Parents as primary guardians of children's welfare
   - Family sovereignty against state interference
   - Traditional recognition of parental authority

4. INDIVIDUAL LIBERTY & BODILY AUTONOMY
   - Protection of personal conscience and individual dignity
   - Historical recognition of fundamental human rights
   - Resistance to government compulsion

5. TRADITIONAL INSTITUTIONS & SOCIAL ORDER
   - Wisdom of historical practices that protected society
   - Proven institutions that promote human flourishing
   - Caution against radical changes that undermine stability

6. EQUAL PROTECTION & MINORITY RIGHTS
   - Protection of vulnerable groups from discrimination
   - Historical examples of minority protection
   - Constitutional guarantees of equal treatment

FIND THE MOST RELEVANT DOCUMENTS regardless of which principle they support. Focus on documents with 90%+ relevance to this specific case.

CRITICAL INSTRUCTION: You MUST return ONLY the JSON structure below, even if the case context seems unclear or incomplete. Make reasonable inferences based on available information. Do NOT return explanatory text or requests for more information.

Find documents in THREE categories with EXACTLY this JSON structure:

{
  "foundingDocuments": [
    {
      "title": "Document Title (Year)",
      "date": "YYYY",
      "relevanceScore": 95,
      "keyQuote": "Actual quote from document",
      "significance": "Why this document is powerful for this case",
      "psychologicalAppeal": "Which justices this appeals to and why",
      "archiveLocation": "Where this document is housed"
    }
  ],
  "historicalCases": [
    {
      "title": "Case Name v. Case Name (Year)",
      "date": "YYYY", 
      "relevanceScore": 92,
      "keyQuote": "Key holding or principle from case",
      "significance": "How this precedent supports the argument",
      "psychologicalAppeal": "Strategic value for different justices",
      "caseContext": "Brief factual background"
    }
  ],
  "colonialExamples": [
    {
      "title": "Historical Event or Practice (Year/Period)",
      "date": "YYYY or period",
      "relevanceScore": 88,
      "keyQuote": "Quote or key detail about the example",
      "significance": "What this historical example demonstrates",
      "psychologicalAppeal": "How this appeals to constitutional interpretation",
      "historicalContext": "Background and setting"
    }
  ]
}

REQUIREMENTS:
- Find 4-6 documents per category (12-18 total documents)
- ONLY include documents with 90%+ relevance to this specific case
- Actual historical documents (no fabrication)
- Key quotes should be short and impactful
- Prioritize documents that directly support this case's legal arguments
- Appeal to different judicial philosophies (originalist, textualist, traditionalist, liberal, pragmatist)
- Include variety: some well-known foundational documents, some lesser-known but highly relevant sources

For FOUNDING DOCUMENTS, focus on:
- Constitutional convention debates and ratification discussions
- Colonial charters and early state constitutions
- Founding fathers' writings and correspondence
- Religious/political treatises that influenced the founders

For HISTORICAL CASES, focus on:
- Early precedents that established the principle
- Cases showing evolution of constitutional interpretation
- Key Supreme Court decisions that shaped the doctrine

For COLONIAL EXAMPLES, focus on:
- Specific historical conflicts that tested the principle
- How different colonies/states handled similar issues
- Real stories of successful protection of this value
- Examples of what happens when principle is abandoned

Return ONLY the JSON structure with no additional text.`;

    console.log('🤖 Sending request to Claude...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log('✅ Received response from Claude');

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let historicalResearch;
    try {
      // Try to extract JSON from the response in case Claude added extra text
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content.text;
      historicalResearch = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      console.error('Parse error:', parseError);
      
      // Return a helpful error with the actual response for debugging
      throw new Error(`Failed to parse Claude response as JSON. Response was: ${content.text.substring(0, 500)}...`);
    }

    // Validate the response structure
    if (!historicalResearch.foundingDocuments || !historicalResearch.historicalCases || !historicalResearch.colonialExamples) {
      throw new Error('Missing required document categories in response');
    }

    console.log(`Historical research completed: ${historicalResearch.foundingDocuments.length} founding docs, ${historicalResearch.historicalCases.length} cases, ${historicalResearch.colonialExamples.length} colonial examples`);

    // Save research results to database for persistence
    let researchResultId = null;
    if (caseId) {
      try {
        console.log('💾 Saving historical research results to database...');
        const researchResult = await db.createResearchResult({
          case_id: caseId,
          search_query: `Historical research: ${legalIssues || 'Constitutional analysis'}`,
          result_type: 'historical_research',
          results: historicalResearch,
          relevance_scores: {
            foundingDocuments: historicalResearch.foundingDocuments.map(doc => doc.relevanceScore),
            historicalCases: historicalResearch.historicalCases.map(doc => doc.relevanceScore),
            colonialExamples: historicalResearch.colonialExamples.map(doc => doc.relevanceScore)
          }
        });
        researchResultId = researchResult.id;
        console.log(`✅ Saved historical research results to database: ${researchResultId}`);
      } catch (saveError) {
        console.error('❌ Failed to save research results to database:', saveError);
        // Continue anyway - don't fail the whole request if save fails
      }
    }

    return NextResponse.json({
      success: true,
      caseContext,
      research: historicalResearch,
      researchResultId,
      metadata: {
        totalDocuments: historicalResearch.foundingDocuments.length + historicalResearch.historicalCases.length + historicalResearch.colonialExamples.length,
        averageRelevance: Math.round(
          [...historicalResearch.foundingDocuments, ...historicalResearch.historicalCases, ...historicalResearch.colonialExamples]
            .reduce((sum, doc) => sum + doc.relevanceScore, 0) / 
          (historicalResearch.foundingDocuments.length + historicalResearch.historicalCases.length + historicalResearch.colonialExamples.length)
        ),
        researchCompletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Historical research error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error information
    let errorMessage = 'Failed to conduct historical research';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Check for specific error types
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'AI service request timeout';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'AI response parsing error';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
