import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-build',
});

// Export the Claude client with multiple names for compatibility
export { anthropic };
export const claudeClient = anthropic;
export const claude = anthropic;

// Analyze Supreme Court justices for a specific case using Claude
export async function analyzeJusticesWithClaude(caseData: any, transcription: string, documentContext: string) {
  try {
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

    console.log('🧠 Sending justice analysis to Claude...');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const analysisContent = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!analysisContent) {
      throw new Error('No analysis content received from Claude');
    }

    console.log('📊 Raw Claude response:', analysisContent.substring(0, 500) + '...');

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
      console.error('❌ Error parsing Claude response:', parseError);
      console.error('Raw response:', analysisContent);
      
      // Return the raw response for debugging
      throw new Error(`Failed to parse Claude analysis: ${parseError}`);
    }

    return justiceAnalysis;

  } catch (error) {
    console.error('❌ Error in Claude justice analysis:', error);
    throw error;
  }
}

// Chat with a specific justice using Claude
export async function chatWithJustice(
  justiceName: string, 
  userMessage: string, 
  caseData: any, 
  justiceProfile: any,
  conversationHistory: Array<{role: string, content: string}> = []
) {
  try {
    const systemPrompt = `You are roleplaying as ${justiceName}, current Associate Justice of the Supreme Court of the United States. Respond as this justice would, based on their judicial philosophy, past opinions, and constitutional interpretation approach.

JUSTICE PROFILE:
${JSON.stringify(justiceProfile, null, 2)}

CASE CONTEXT:
- Case Name: ${caseData.case_name || 'Unknown'}
- Constitutional Question: ${caseData.constitutional_question || 'Unknown'}
- Case Type: ${caseData.case_type || 'Unknown'}

GUIDELINES:
- Stay in character as this specific justice
- Reference your actual judicial philosophy and past opinions when relevant
- Ask probing questions about legal arguments and constitutional interpretation
- Challenge weak arguments respectfully but firmly
- Provide realistic feedback on how persuasive arguments would be to you specifically
- Keep responses conversational but intellectually rigorous
- Don't make definitive commitments about how you would vote

The user is an attorney preparing arguments for this case and wants to understand your perspective.`;

    // Build conversation history for context
    const messages = [
      {
        role: 'user',
        content: systemPrompt + '\n\nUser question: ' + userMessage
      }
    ];

    // Add conversation history if provided
    if (conversationHistory.length > 0) {
      const historyContext = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      messages[0].content += '\n\nPrevious conversation:\n' + historyContext;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: messages
    });

    const responseContent = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!responseContent) {
      throw new Error('No response received from Claude');
    }

    return responseContent;

  } catch (error) {
    console.error('❌ Error in Claude justice chat:', error);
    throw error;
  }
}
