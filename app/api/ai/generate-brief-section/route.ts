import { NextRequest, NextResponse } from 'next/server';
import { claudeClient } from '@/lib/ai/claude';
import { perplexityResearch } from '@/lib/ai/perplexity';

export async function POST(request: NextRequest) {
  try {
    const { sectionPrompt, context, sectionType, userInstructions } = await request.json();

    if (!sectionPrompt) {
      return NextResponse.json({ 
        error: 'Section prompt is required' 
      }, { status: 400 });
    }

    console.log(`🤖 Generating ${sectionType} section for amicus brief...`);

    // Conduct research if user instructions are provided
    let researchData = null;
    if (userInstructions && userInstructions.trim()) {
      console.log(`🔍 Conducting research based on user instructions...`);
      try {
        researchData = await perplexityResearch.researchForSection(
          sectionType, 
          userInstructions, 
          context
        );
        console.log(`✅ Research completed: ${researchData.sources.length} sources found`);
      } catch (researchError) {
        console.warn('⚠️ Research failed, proceeding without research data:', researchError);
      }
    }

    // Create a specialized prompt for brief generation using Claude GPT-5 Mini
    const systemPrompt = `You are an expert legal brief writer specializing in Supreme Court amicus briefs. You are using Claude GPT-5 Mini for maximum precision and legal accuracy. Your task is to write compelling, legally sound content that follows the highest standards of legal writing.

Key principles:
- Use clear, persuasive legal language appropriate for Supreme Court
- Cite relevant case law and precedents with proper Bluebook formatting
- Structure arguments logically with strong topic sentences
- Maintain formal legal tone appropriate for Supreme Court
- Focus on constitutional and legal principles
- Be concise but comprehensive
- Use proper legal citations when referencing cases
- Ensure arguments are well-reasoned and supported
- Integrate research findings naturally into the legal analysis
- Follow Supreme Court brief formatting standards

Write content that would be suitable for submission to the U.S. Supreme Court.`;

    // Build the enhanced prompt with research data
    let fullPrompt = `${systemPrompt}

CONTEXT:
${context}

SECTION TYPE: ${sectionType}

TEMPLATE PROMPT:
${sectionPrompt}`;

    // Add user instructions if provided
    if (userInstructions && userInstructions.trim()) {
      fullPrompt += `\n\nUSER INSTRUCTIONS:
${userInstructions}

Follow these specific instructions while maintaining Supreme Court standards.`;
    }

    // Add research data if available
    if (researchData) {
      fullPrompt += `\n\nRESEARCH FINDINGS:
${researchData.research}

SOURCES:
${researchData.sources.map((source, index) => `${index + 1}. ${source.title}: ${source.snippet}`).join('\n')}

Integrate these research findings naturally into your legal analysis. Use the sources to support your arguments with current, relevant information.`;
    }

    fullPrompt += `\n\nPlease generate professional, well-structured content for this section of an amicus brief. Use proper legal language and ensure the content flows naturally with the overall brief structure.`;

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Claude GPT-5 Mini equivalent
      max_tokens: 4000,
      temperature: 0.2, // Lower temperature for more precise legal writing
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
      timestamp: new Date().toISOString(),
      researchUsed: !!researchData,
      sources: researchData?.sources || []
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
