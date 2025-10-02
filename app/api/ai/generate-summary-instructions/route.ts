import { NextRequest, NextResponse } from 'next/server';
import { generateAIInstructions } from '@/lib/ai/generate-ai-instructions';

interface ArgumentSection {
  id: string;
  title: string;
  description: string;
  keyArguments: string[];
  supportingEvidence: string[];
  legalBasis: string[];
  priority: string;
  estimatedWords: number;
  order: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      caseInfo, 
      previousArguments, 
      overallStrategy, 
      coreThemes 
    }: { 
      caseInfo: any;
      previousArguments: ArgumentSection[];
      overallStrategy: string;
      coreThemes: string[];
    } = await request.json();

    if (!caseInfo || !previousArguments || previousArguments.length === 0) {
      return NextResponse.json(
        { error: 'Case information and previous arguments are required' },
        { status: 400 }
      );
    }

    // Sort arguments by order to ensure proper synthesis
    const sortedArguments = previousArguments.sort((a, b) => a.order - b.order);

    // Create detailed argument summaries for AI analysis
    const argumentSummaries = sortedArguments.map(arg => `
${arg.title}:
- Description: ${arg.description}
- Key Arguments: ${arg.keyArguments.join(', ')}
- Supporting Evidence: ${arg.supportingEvidence.join(', ')}
- Legal Basis: ${arg.legalBasis.join(', ')}
- Priority: ${arg.priority}
`).join('\n');

    const summaryPrompt = `
You are a legal AI assistant specializing in creating compelling "Summary of Argument" sections for amicus briefs.

Create a comprehensive Summary of Argument that synthesizes and consolidates ALL the previous arguments into a cohesive, persuasive narrative.

CASE INFORMATION:
- Case Name: ${caseInfo.caseName}
- Legal Issue: ${caseInfo.legalIssue}
- Petitioner: ${caseInfo.petitioner}
- Respondent: ${caseInfo.respondent}
- Key Precedents: ${caseInfo.keyPrecedents?.join(', ') || 'Not specified'}
- Constitutional Questions: ${caseInfo.constitutionalQuestions?.join(', ') || 'Not specified'}

OVERALL STRATEGY:
${overallStrategy}

CORE THEMES:
${coreThemes.join(', ')}

PREVIOUS ARGUMENTS TO SYNTHESIZE:
${argumentSummaries}

Create a Summary of Argument that:

1. SYNTHESIZES ALL ARGUMENTS: Weave together the key points from all previous arguments into a unified narrative
2. MAINTAINS COHERENCE: Ensure logical flow and consistency across all synthesized arguments
3. HIGHLIGHTS STRENGTHS: Emphasize the strongest legal points and precedents
4. ADDRESSES THE ISSUE: Directly respond to the legal questions presented
5. PROVIDES CLARITY: Make complex legal arguments accessible and compelling

The Summary should:
- Start with a clear statement of the legal issue
- Synthesize the constitutional arguments from previous sections
- Integrate statutory and policy arguments seamlessly
- Reference key precedents that support the unified position
- Conclude with a compelling statement of why the court should rule in favor of the petitioner

Respond with a JSON object containing:
{
  "summaryContent": "Complete Summary of Argument text (500-800 words)",
  "keySynthesizedPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "precedentHighlights": ["Precedent 1", "Precedent 2", "Precedent 3"],
  "constitutionalFramework": "Brief statement of constitutional principles",
  "wordCount": 650
}

Focus on creating a compelling narrative that:
- Synthesizes rather than repeats previous arguments
- Creates logical connections between different legal theories
- Builds a cumulative case for the petitioner's position
- Uses the strongest precedents and constitutional principles
- Maintains professional tone while being persuasive
`;

    const instructions = await generateAIInstructions(summaryPrompt);
    
    if (!instructions) {
      throw new Error('Failed to generate summary instructions');
    }

    // Use the AI instructions to generate the summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a legal writing expert specializing in creating compelling Summary of Argument sections for Supreme Court amicus briefs. Focus on synthesis, coherence, and persuasive narrative development.'
          },
          {
            role: 'user',
            content: instructions
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('AI summary generation failed');
    }

    const summaryData = await summaryResponse.json();
    const aiResponse = summaryData.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No summary response received');
    }

    // Try to parse the JSON response
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a structured fallback summary
      console.error('JSON parsing error:', parseError);
      parsedSummary = createFallbackSummary(caseInfo, sortedArguments);
    }

    // Ensure the response has the expected structure
    const result = {
      summaryContent: parsedSummary.summaryContent || createFallbackSummary(caseInfo, sortedArguments).summaryContent,
      keySynthesizedPoints: Array.isArray(parsedSummary.keySynthesizedPoints) 
        ? parsedSummary.keySynthesizedPoints 
        : createFallbackSummary(caseInfo, sortedArguments).keySynthesizedPoints,
      precedentHighlights: Array.isArray(parsedSummary.precedentHighlights) 
        ? parsedSummary.precedentHighlights 
        : createFallbackSummary(caseInfo, sortedArguments).precedentHighlights,
      constitutionalFramework: parsedSummary.constitutionalFramework || createFallbackSummary(caseInfo, sortedArguments).constitutionalFramework,
      wordCount: parsedSummary.wordCount || 500
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Summary generation error:', error);
    
    // Return a fallback summary structure
    const { caseInfo, previousArguments = [] } = await request.json().catch(() => ({ caseInfo: {}, previousArguments: [] }));
    
    return NextResponse.json(createFallbackSummary(caseInfo, previousArguments));
  }
}

function createFallbackSummary(caseInfo: any, arguments: ArgumentSection[]): any {
  const argumentTitles = arguments.map(arg => arg.title).join(', ');
  
  return {
    summaryContent: `This amicus brief addresses the critical legal issues presented in ${caseInfo.caseName || 'this case'}. The arguments presented demonstrate that the petitioner's position is supported by constitutional principles, established precedent, and sound legal reasoning.

The primary constitutional argument establishes that [constitutional principle] supports the petitioner's position. This argument is reinforced by [secondary arguments] that demonstrate the broader legal framework supporting this position.

Key precedents including [relevant precedents] provide strong support for the petitioner's position. The statutory framework and policy considerations further bolster the constitutional arguments presented.

In conclusion, the cumulative weight of the constitutional, statutory, and policy arguments presented strongly supports the petitioner's position and warrants a favorable ruling from this Court.`,
    keySynthesizedPoints: [
      'Constitutional principles support petitioner\'s position',
      'Established precedent provides strong legal foundation',
      'Statutory framework reinforces constitutional arguments',
      'Policy considerations support the overall position'
    ],
    precedentHighlights: [
      'Relevant Supreme Court precedents',
      'Lower court decisions supporting position',
      'Constitutional interpretation principles'
    ],
    constitutionalFramework: 'The constitutional framework supports the petitioner\'s position through established principles and precedent.',
    wordCount: 500
  };
}
