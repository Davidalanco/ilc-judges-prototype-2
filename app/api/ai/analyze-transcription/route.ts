import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('YOUR_ACTUAL_OPENAI_API_KEY_HERE')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          details: 'Please add your OpenAI API key to .env.local. Get it from: https://platform.openai.com/api-keys'
        },
        { status: 500 }
      );
    }

    console.log('🤖 Analyzing transcription with AI...');

    const systemPrompt = `You are an expert legal AI that analyzes attorney strategy session transcriptions to extract case information for amicus brief generation.

Your task is to analyze the provided transcription and extract relevant case information that would be useful for generating a Supreme Court amicus brief.

Extract information for these specific fields:
- caseName: The full case name (e.g., "Miller v. McDonald")
- legalIssue: The core legal question being litigated
- petitioner: The party bringing the case (plaintiff/petitioner)
- respondent: The party defending the case (defendant/respondent)
- keyPrecedents: Array of relevant case citations mentioned
- constitutionalQuestions: Array of constitutional issues discussed
- overallTheme: The broader legal theme or narrative

Guidelines:
1. Be precise and accurate - only extract information that is clearly stated or strongly implied
2. For case names, use the standard "Petitioner v. Respondent" format
3. For legal issues, write as a clear "whether" statement
4. For precedents, use proper citation format (e.g., "Case Name v. Case Name (Year)")
5. For constitutional questions, use specific constitutional terms
6. If information is unclear or not mentioned, leave that field empty
7. Focus on information that would be most relevant for amicus brief writing

Return your analysis as a JSON object with the extracted information.`;

    const userPrompt = `Please analyze this attorney strategy session transcription and extract the relevant case information:

${transcription}

Extract the case information and return it as a JSON object with the fields: caseName, legalIssue, petitioner, respondent, keyPrecedents (array), constitutionalQuestions (array), and overallTheme.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const aiResponse = response.choices[0].message.content;
    console.log('🤖 AI Response:', aiResponse);

    // Parse the AI response to extract JSON
    let extractedInfo;
    try {
      // Look for JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      // Fallback to a basic extraction
      extractedInfo = {
        caseName: '',
        legalIssue: '',
        petitioner: '',
        respondent: '',
        keyPrecedents: [],
        constitutionalQuestions: [],
        overallTheme: ''
      };
    }

    console.log('✅ Extracted case information:', extractedInfo);

    return NextResponse.json({
      success: true,
      extractedInfo,
      analysis: aiResponse
    });

  } catch (error) {
    console.error('❌ Error analyzing transcription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze transcription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
