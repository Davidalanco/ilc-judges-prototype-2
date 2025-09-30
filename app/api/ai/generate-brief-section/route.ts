import { NextRequest, NextResponse } from 'next/server';
import { claudeClient } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const { sectionPrompt, context, sectionType } = await request.json();

    if (!sectionPrompt) {
      return NextResponse.json({ 
        error: 'Section prompt is required' 
      }, { status: 400 });
    }

    console.log(`🤖 Generating ${sectionType} section for amicus brief...`);

    // Create a specialized prompt for brief generation
    const systemPrompt = `You are an expert legal brief writer specializing in Supreme Court amicus briefs. Your task is to write compelling, legally sound content that follows the highest standards of legal writing.

Key principles:
- Use clear, persuasive legal language
- Cite relevant case law and precedents
- Structure arguments logically with strong topic sentences
- Maintain formal legal tone appropriate for Supreme Court
- Focus on constitutional and legal principles
- Be concise but comprehensive
- Use proper legal citations when referencing cases
- Ensure arguments are well-reasoned and supported

Write content that would be suitable for submission to the U.S. Supreme Court.`;

    const fullPrompt = `${systemPrompt}

CONTEXT:
${context}

SECTION TYPE: ${sectionType}

PROMPT:
${sectionPrompt}

Please generate professional, well-structured content for this section of an amicus brief. Use proper legal language and ensure the content flows naturally with the overall brief structure.`;

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    const generatedContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    console.log(`✅ Generated ${sectionType} section (${generatedContent.length} characters)`);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      sectionType,
      wordCount: generatedContent.split(/\s+/).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating brief section:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate brief section',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
