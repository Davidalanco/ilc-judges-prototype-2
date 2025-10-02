import { NextRequest, NextResponse } from 'next/server';
import { generateAIInstructions } from '@/lib/ai/generate-ai-instructions';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Truncate content if too long (keep first 8000 characters for analysis)
    const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + '...' : content;

    const analysisPrompt = `
You are a legal AI assistant analyzing a document for relevance to an upcoming amicus brief case. 

Analyze the following document content and provide:
1. A suggested relevance explanation (2-3 sentences)
2. 3-5 key insights that could be useful for the current case
3. The original case context (1-2 sentences)

Document content:
${truncatedContent}

Please respond with a JSON object containing:
{
  "suggestedRelevance": "Brief explanation of how this document relates to potential legal arguments",
  "suggestedInsights": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "suggestedContext": "Brief description of the original case or context"
}

Focus on:
- Legal principles and precedents mentioned
- Argumentation strategies used
- Constitutional or statutory interpretations
- Factual patterns that might be relevant
- Reasoning that could strengthen similar arguments
`;

    const instructions = await generateAIInstructions(analysisPrompt);
    
    if (!instructions) {
      throw new Error('Failed to generate analysis instructions');
    }

    // Use the AI instructions to analyze the document
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal research assistant specializing in analyzing documents for amicus brief preparation. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: instructions
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('AI analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const aiResponse = analysisData.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No analysis response received');
    }

    // Try to parse the JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      parsedAnalysis = {
        suggestedRelevance: aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : ''),
        suggestedInsights: [
          'Review the legal arguments presented in this document',
          'Consider the factual patterns and their legal implications',
          'Analyze the reasoning and precedent citations'
        ],
        suggestedContext: 'Document appears to contain relevant legal analysis and arguments.'
      };
    }

    // Ensure the response has the expected structure
    const result = {
      suggestedRelevance: parsedAnalysis.suggestedRelevance || 'This document contains relevant legal analysis that could inform your case arguments.',
      suggestedInsights: Array.isArray(parsedAnalysis.suggestedInsights) 
        ? parsedAnalysis.suggestedInsights 
        : ['Document contains relevant legal principles and arguments'],
      suggestedContext: parsedAnalysis.suggestedContext || 'Legal document with relevant case analysis and arguments.'
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Document relevance analysis error:', error);
    
    // Return a fallback response
    return NextResponse.json({
      suggestedRelevance: 'Please review this document and explain how it relates to your current case.',
      suggestedInsights: [
        'Identify key legal principles mentioned',
        'Note any relevant precedents or citations',
        'Consider how the reasoning might apply to your case'
      ],
      suggestedContext: 'Document appears to contain legal analysis and arguments.'
    });
  }
}
