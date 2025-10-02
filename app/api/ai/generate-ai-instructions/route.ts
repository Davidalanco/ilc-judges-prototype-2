import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { caseInfo, sectionId, sectionTitle } = await request.json();

    if (!caseInfo || !sectionId) {
      return NextResponse.json(
        { error: 'Case information and section ID are required' },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating AI instructions for section: ${sectionTitle}`);

    // Create a comprehensive prompt for generating AI instructions
    const prompt = `You are an expert legal AI assistant generating specific research and writing instructions for a Supreme Court amicus brief section.

CASE CONTEXT:
- Case Name: ${caseInfo.caseName || 'Not specified'}
- Legal Issue: ${caseInfo.legalIssue || 'Not specified'}
- Court Level: ${caseInfo.courtLevel || 'U.S. Supreme Court'}
- Petitioner: ${caseInfo.petitioner || 'Not specified'}
- Respondent: ${caseInfo.respondent || 'Not specified'}
- Key Precedents: ${caseInfo.keyPrecedents?.join(', ') || 'None specified'}
- Constitutional Questions: ${caseInfo.constitutionalQuestions?.join(', ') || 'None specified'}
- Overall Theme: ${caseInfo.overallTheme || 'Not specified'}

SECTION TO GENERATE INSTRUCTIONS FOR:
- Section ID: ${sectionId}
- Section Title: ${sectionTitle}

TRANSCRIPTION DATA AVAILABLE: ${caseInfo.transcriptionData ? 'Yes - strategy session transcription is available' : 'No'}

Generate specific, actionable AI instructions for this section that will guide the AI to:
1. Research the most relevant legal precedents and current developments
2. Focus on the specific constitutional and legal issues in this case
3. Emphasize the most persuasive arguments for this particular section
4. Include specific research directions using Perplexity API
5. Connect to the broader legal landscape and recent developments
6. Address the specific parties and their positions

The instructions should be detailed, specific, and actionable. They should tell the AI exactly what to research, how to structure the content, and what to emphasize.

Format the response as a single paragraph of clear, specific instructions that the AI can follow directly.`;

    const instructions = await generateWithGemini(prompt, 'gemini-2.5-pro');

    console.log('✅ Generated AI instructions:', instructions.substring(0, 200) + '...');

    return NextResponse.json({
      success: true,
      instructions: instructions.trim(),
      sectionId,
      sectionTitle
    });

  } catch (error) {
    console.error('❌ Error generating AI instructions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI instructions' },
      { status: 500 }
    );
  }
}
