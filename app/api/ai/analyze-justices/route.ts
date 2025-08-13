import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openai';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json();

    if (!caseId) {
      return NextResponse.json({ 
        error: 'Missing required field: caseId' 
      }, { status: 400 });
    }

    console.log('🏛️ Starting AI justice analysis for case:', caseId);

    // Get case information from database
    const caseData = await db.getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ 
        error: 'Case not found' 
      }, { status: 404 });
    }

    // Get attorney conversations (transcriptions) from database
    const conversations = await db.getConversationsByCase(caseId);
    let transcription = '';
    if (conversations && conversations.length > 0) {
      // Use the most recent conversation with transcription
      const latestConversation = conversations.find(conv => conv.transcription_text) || conversations[0];
      transcription = latestConversation?.transcription_text || '';
    }

    if (!transcription) {
      return NextResponse.json({ 
        error: 'No transcription found for this case' 
      }, { status: 400 });
    }

    // Get legal documents from database
    const legalDocuments = await db.getLegalDocumentsByCase(caseId);
    let documentContext = '';
    if (legalDocuments && legalDocuments.length > 0) {
      const docs = legalDocuments.slice(0, 5).map(doc => {
        return `Document: ${doc.title || doc.file_name}\nCitation: ${doc.citation || 'Unknown'}\nRelevance: ${doc.relevance_score || 'N/A'}\nContent: ${doc.plain_text_content?.substring(0, 1500) || 'Content not available'}...`;
      });
      documentContext = docs.join('\n\n');
    }

    // Create comprehensive prompt for AI justice analysis
    const analysisPrompt = `You are a Supreme Court expert analyzing how each of the 9 current justices would likely vote on this specific case. 

CASE CONTEXT:
- Case Name: ${caseData.case_name || 'Unknown'}
- Court Level: ${caseData.court_level || 'Unknown'}
- Constitutional Question: ${caseData.constitutional_question || 'Unknown'}
- Case Type: ${caseData.case_type || 'Unknown'}
- Client Type: ${caseData.client_type || 'Unknown'}
- Jurisdiction: ${caseData.jurisdiction || 'Unknown'}
- Penalties: ${caseData.penalties || 'Unknown'}
- Precedent Target: ${caseData.precedent_target || 'Unknown'}

ATTORNEY STRATEGY DISCUSSION:
${transcription}

SUPPORTING DOCUMENTS:
${documentContext}

For each justice, analyze their likely position based on:
1. Their judicial philosophy and past voting patterns
2. How they've ruled on similar constitutional issues
3. Their specific statements/opinions on related matters
4. How the specific facts of THIS case align with their known concerns

Provide analysis in this exact JSON format:
{
  "conservativeJustices": [
    {
      "name": "Justice Samuel A. Alito Jr.",
      "alignment": [0-100 number],
      "keyFactors": ["factor1", "factor2", "factor3"],
      "strategy": "specific strategy for this case",
      "confidence": "realistic assessment",
      "riskLevel": "minimal|low|medium|high",
      "caseSpecificAnalysis": "how this specific case facts/issues align with this justice's known positions",
      "historicalVotes": ["relevant case name where they voted similarly"]
    }
  ],
  "swingVotes": [
    {
      "name": "Chief Justice John G. Roberts Jr.",
      "alignment": [0-100 number],
      "keyFactors": ["factor1", "factor2", "factor3"],
      "strategy": "specific strategy for this case",
      "confidence": "realistic assessment",
      "riskLevel": "minimal|low|medium|high",
      "caseSpecificAnalysis": "detailed analysis for swing vote",
      "institutionalConcerns": "specific concerns about this case",
      "historicalVotes": ["relevant cases"]
    }
  ],
  "liberalJustices": [
    {
      "name": "Justice Elena Kagan",
      "alignment": [0-100 number],
      "keyFactors": ["factor1", "factor2", "factor3"],
      "strategy": "specific strategy for this case", 
      "confidence": "realistic assessment",
      "riskLevel": "minimal|low|medium|high",
      "caseSpecificAnalysis": "how this case aligns with liberal judicial philosophy",
      "historicalVotes": ["relevant cases"]
    }
  ],
  "overallStrategy": {
    "primaryApproach": "main strategic recommendation",
    "keySwingVote": "who is most important to persuade",
    "strongestArguments": ["arg1", "arg2", "arg3"],
    "risksToAvoid": ["risk1", "risk2"],
    "confidenceLevel": "overall confidence in victory",
    "recommendedFraming": "how to frame the case for maximum appeal"
  }
}

Be realistic about alignment scores - not every conservative justice will be 90%+ aligned. Consider the specific constitutional issues and how each justice has actually voted on similar cases. Factor in the specific facts of this case, not just general judicial philosophy.`;

    console.log('🤖 Sending justice analysis to OpenAI...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a Supreme Court legal expert with deep knowledge of each justice\'s voting patterns, judicial philosophy, and decision-making process. Provide realistic, case-specific analysis based on actual judicial behavior and constitutional law precedents.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent legal analysis
      max_tokens: 4000
    });

    const analysisContent = response.choices[0]?.message?.content;
    
    if (!analysisContent) {
      throw new Error('No analysis content received from OpenAI');
    }

    console.log('📊 Raw AI response:', analysisContent.substring(0, 500) + '...');

    // Parse the JSON response
    let justiceAnalysis;
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      justiceAnalysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.error('Raw response:', analysisContent);
      
      // Fallback: try to extract key information even if JSON parsing fails
      return NextResponse.json({
        error: 'Failed to parse AI analysis',
        rawResponse: analysisContent,
        caseId
      }, { status: 500 });
    }

    // Store the analysis in memory for now (we'll add database storage later)
    // TODO: Add justice analysis storage to database schema
    console.log('💾 Justice analysis completed (storing in database to be implemented)');

    console.log('✅ Justice analysis completed successfully');

    return NextResponse.json({
      success: true,
      justiceAnalysis,
      caseId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in justice analysis:', error);
    return NextResponse.json({
      error: 'Failed to analyze justices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
