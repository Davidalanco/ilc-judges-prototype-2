import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const { strategyChatHistory, caseInformation, selectedDocuments, historicalResearch, justiceAnalysis } = await request.json();

    if (!strategyChatHistory || strategyChatHistory.length === 0) {
      return NextResponse.json({ error: 'Strategy chat history is required' }, { status: 400 });
    }

    // Build comprehensive context for outline generation
    let context = `You are a constitutional law expert creating a detailed brief outline. Based on the strategy discussion below, create a comprehensive outline for an amicus brief that incorporates all the strategic recommendations and constitutional arguments discussed.

CASE INFORMATION:
${JSON.stringify(caseInformation, null, 2)}

RELEVANT LEGAL DOCUMENTS (FULL CONTENT):
${selectedDocuments.map((doc: any) => `Title: ${doc.title} (${doc.type || 'document'})\nCitation: ${doc.citation || 'N/A'}\nFile: ${doc.fileName || 'N/A'}\nSource: ${doc.source || 'N/A'}\n\n${doc.content || 'N/A'}`).join('\n\n')}

HISTORICAL RESEARCH FINDINGS (FULL):
${JSON.stringify(historicalResearch, null, 2)}

JUSTICE ANALYSIS:
${JSON.stringify(justiceAnalysis, null, 2)}

STRATEGY DISCUSSION TO IMPLEMENT:`;

    strategyChatHistory.forEach((message: any, index: number) => {
      const role = message.role === 'user' ? 'ATTORNEY' : 'CONSTITUTIONAL EXPERT';
      context += `\n\n--- ${role} ---\n${message.content}`;
    });

    context += `

TASK: Create a detailed brief outline that implements ALL the strategic recommendations from the above discussion. The outline should:

1. Follow standard amicus brief structure
2. Incorporate every constitutional argument and creative strategy discussed
3. Include specific talking points for each section
4. Show how historical research and justice analysis will be used
5. Prioritize the most persuasive arguments based on the strategy discussion

Format your response as a structured outline with:
- Roman numerals for major sections (I, II, III, etc.)
- Capital letters for subsections (A, B, C, etc.)
- Numbers for specific points (1, 2, 3, etc.)
- Brief descriptions of key arguments and evidence for each point

Make this actionable - each point should be specific enough that a brief writer knows exactly what to include.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more structured output
      messages: [
        {
          role: 'user',
          content: context
        }
      ]
    });

    const outline = response.content[0].text;

    return NextResponse.json({
      success: true,
      outline,
      contextUsed: {
        caseInformation: !!caseInformation,
        selectedDocuments: selectedDocuments.length,
        historicalResearch: !!historicalResearch,
        justiceAnalysis: !!justiceAnalysis,
        chatHistoryLength: strategyChatHistory.length
      }
    });

  } catch (error) {
    console.error('Outline generation API error:', error);
    return NextResponse.json({ error: 'Failed to generate brief outline' }, { status: 500 });
  }
}
