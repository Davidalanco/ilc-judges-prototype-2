import { NextRequest, NextResponse } from 'next/server';
import { generateAIInstructions } from '@/lib/ai/generate-ai-instructions';

interface DocumentData {
  name: string;
  type: string;
  relevance: string;
  keyInsights: string[];
  caseContext: string;
}

interface CaseInfo {
  caseName: string;
  legalIssue: string;
  petitioner: string;
  respondent: string;
  keyPrecedents: string[];
  constitutionalQuestions: string[];
  overallTheme: string;
}

export async function POST(request: NextRequest) {
  try {
    const { caseInfo, documents }: { caseInfo: CaseInfo; documents: DocumentData[] } = await request.json();

    if (!caseInfo || !documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Case information and documents are required' },
        { status: 400 }
      );
    }

    // Prepare document summaries for AI analysis
    const documentSummaries = documents.map(doc => `
Document: ${doc.name}
Type: ${doc.type}
Relevance: ${doc.relevance}
Key Insights: ${doc.keyInsights.join(', ')}
Context: ${doc.caseContext}
`).join('\n');

    const outlinePrompt = `
You are a legal AI assistant specializing in amicus brief strategy and outline development. 

Create a comprehensive strategic outline for an amicus brief based on the following case information and relevant documents.

CASE INFORMATION:
- Case Name: ${caseInfo.caseName}
- Legal Issue: ${caseInfo.legalIssue}
- Petitioner: ${caseInfo.petitioner}
- Respondent: ${caseInfo.respondent}
- Key Precedents: ${caseInfo.keyPrecedents.join(', ')}
- Constitutional Questions: ${caseInfo.constitutionalQuestions.join(', ')}
- Overall Theme: ${caseInfo.overallTheme}

RELEVANT DOCUMENTS:
${documentSummaries}

Create a strategic outline that includes:

1. OVERALL STRATEGY (2-3 paragraphs): The overarching approach for this amicus brief, considering the legal issue, precedents, and insights from the documents.

2. CORE THEMES (3-5 themes): Key thematic arguments that will run throughout the brief.

3. BRIEF SECTIONS: Create 4-6 strategic sections for the amicus brief, prioritizing:
   - Primary Constitutional Argument (highest priority)
   - Secondary Legal Arguments (2-3 additional arguments)
   - Summary of Argument (synthesize ALL the arguments above)
   - Interest of Amicus Curiae (administrative, lower priority)

For each section, provide:
- Title
- Description (2-3 sentences)
- Key Arguments (3-5 bullet points)
- Supporting Evidence (2-3 items)
- Legal Basis (constitutional provisions, statutes, precedents)
- Priority (high/medium/low)
- Estimated word count

Respond with a JSON object in this exact format:
{
  "overallStrategy": "Comprehensive strategy description...",
  "coreThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "sections": [
    {
      "id": "interest_of_amicus",
      "title": "Interest of Amicus Curiae",
      "description": "Brief description of what this section covers...",
      "keyArguments": ["Argument 1", "Argument 2", "Argument 3"],
      "supportingEvidence": ["Evidence 1", "Evidence 2"],
      "legalBasis": ["Legal basis 1", "Legal basis 2"],
      "priority": "high",
      "estimatedWords": 300,
      "order": 1,
      "isCustom": false
    }
  ]
}

Focus on:
- Strategic coherence across all sections
- Leveraging insights from the provided documents
- Strong legal arguments based on precedents and constitutional principles
- Clear narrative flow that supports the overall theme
- Practical word count estimates for each section
- High-impact arguments that will resonate with the court
- Summary of Argument should synthesize and consolidate ALL previous arguments into a cohesive narrative
`;

    const instructions = await generateAIInstructions(outlinePrompt);
    
    if (!instructions) {
      throw new Error('Failed to generate outline instructions');
    }

    // Use the AI instructions to generate the case outline
    const outlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a legal strategy expert specializing in amicus brief development. Create comprehensive, strategic outlines that leverage legal precedents and constitutional principles effectively.'
          },
          {
            role: 'user',
            content: instructions
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!outlineResponse.ok) {
      const errorData = await outlineResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('AI outline generation failed');
    }

    const outlineData = await outlineResponse.json();
    const aiResponse = outlineData.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No outline response received');
    }

    // Try to parse the JSON response
    let parsedOutline;
    try {
      parsedOutline = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a structured fallback outline
      console.error('JSON parsing error:', parseError);
      parsedOutline = createFallbackOutline(caseInfo, documents);
    }

    // Ensure the response has the expected structure
    const result = {
      id: `outline_${Date.now()}`,
      name: `Strategic Outline for ${caseInfo.caseName}`,
      overallStrategy: parsedOutline.overallStrategy || createDefaultStrategy(caseInfo),
      coreThemes: Array.isArray(parsedOutline.coreThemes) ? parsedOutline.coreThemes : createDefaultThemes(caseInfo),
      sections: Array.isArray(parsedOutline.sections) ? parsedOutline.sections : createDefaultSections(),
      documentConnections: {},
      createdAt: new Date(),
      isGenerated: true
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Case outline generation error:', error);
    
    // Return a fallback outline structure
    const { caseInfo, documents } = await request.json().catch(() => ({ caseInfo: {}, documents: [] }));
    
    return NextResponse.json({
      id: `outline_${Date.now()}`,
      name: `Strategic Outline for ${caseInfo?.caseName || 'Case'}`,
      overallStrategy: createDefaultStrategy(caseInfo),
      coreThemes: createDefaultThemes(caseInfo),
      sections: createDefaultSections(),
      documentConnections: {},
      createdAt: new Date(),
      isGenerated: false
    });
  }
}

function createDefaultStrategy(caseInfo: CaseInfo): string {
  return `This amicus brief will present a comprehensive analysis of the legal issues in ${caseInfo.caseName}, focusing on the constitutional principles at stake and their broader implications. The brief will leverage relevant precedents and legal scholarship to support the petitioner's position while providing unique insights that assist the court in reaching a just decision.`;
}

function createDefaultThemes(caseInfo: CaseInfo): string[] {
  return [
    'Constitutional Interpretation',
    'Legal Precedent and Consistency',
    'Broader Legal Implications',
    'Justice and Fairness'
  ];
}

function createDefaultSections() {
  return [
    {
      id: 'primary_constitutional_argument',
      title: 'Primary Constitutional Argument',
      description: 'Develops the main constitutional argument with detailed analysis and precedent support.',
      keyArguments: [
        'Constitutional text supports petitioner\'s position',
        'Precedent analysis favors petitioner',
        'Policy considerations support the argument'
      ],
      supportingEvidence: [
        'Relevant constitutional provisions',
        'Supreme Court precedent analysis',
        'Historical and textual analysis'
      ],
      legalBasis: [
        'Constitutional text',
        'Relevant precedents',
        'Legal scholarship'
      ],
      priority: 'high',
      estimatedWords: 800,
      order: 1,
      isCustom: false
    },
    {
      id: 'summary_of_argument',
      title: 'Summary of Argument',
      description: 'Synthesizes and summarizes all the legal arguments presented above, providing a concise overview of the amicus position.',
      keyArguments: [
        'Synthesis of primary constitutional argument',
        'Integration of secondary legal arguments',
        'Clear statement of overall legal position',
        'Summary of key precedents supporting the position'
      ],
      supportingEvidence: [
        'Consolidated precedent analysis from all arguments',
        'Unified constitutional and statutory framework',
        'Coherent narrative tying all arguments together'
      ],
      legalBasis: [
        'All constitutional provisions addressed',
        'Key Supreme Court precedents supporting position',
        'Complete statutory and regulatory framework'
      ],
      priority: 'high',
      estimatedWords: 500,
      order: 3,
      isCustom: false
    },
    {
      id: 'secondary_legal_argument',
      title: 'Secondary Legal Argument',
      description: 'Presents additional legal arguments that strengthen the overall position.',
      keyArguments: [
        'Statutory interpretation supports position',
        'Lower court precedent analysis',
        'Practical implications of the ruling'
      ],
      supportingEvidence: [
        'Statutory text and legislative history',
        'Lower court decisions',
        'Policy analysis and practical considerations'
      ],
      legalBasis: [
        'Relevant statutes',
        'Lower court precedents',
        'Policy considerations'
      ],
      priority: 'high',
      estimatedWords: 600,
      order: 2,
      isCustom: false
    },
    {
      id: 'interest_of_amicus',
      title: 'Interest of Amicus Curiae',
      description: 'Establishes the amicus curiae\'s interest in the case and expertise in the relevant legal area.',
      keyArguments: [
        'Amicus has expertise in the legal issues presented',
        'Case outcome will affect broader legal principles',
        'Amicus can provide unique perspective to assist the court'
      ],
      supportingEvidence: [
        'Amicus organization credentials and expertise',
        'Previous involvement in similar cases',
        'Legal scholarship and research contributions'
      ],
      legalBasis: [
        'Supreme Court Rule 37',
        'Relevant case law on amicus participation'
      ],
      priority: 'medium',
      estimatedWords: 300,
      order: 4,
      isCustom: false
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      description: 'Summarizes the arguments and requests specific relief from the court.',
      keyArguments: [
        'Restatement of key arguments',
        'Request for specific relief',
        'Appreciation for court\'s consideration'
      ],
      supportingEvidence: [
        'Summary of precedent support',
        'Constitutional principle reinforcement'
      ],
      legalBasis: [
        'Constitutional principles',
        'Precedent support'
      ],
      priority: 'high',
      estimatedWords: 200,
      order: 5,
      isCustom: false
    }
  ];
}

function createFallbackOutline(caseInfo: CaseInfo, documents: DocumentData[]): any {
  return {
    overallStrategy: createDefaultStrategy(caseInfo),
    coreThemes: createDefaultThemes(caseInfo),
    sections: createDefaultSections()
  };
}
