// AI-powered legal document summarization with type-specific prompts
// Optimized for circuit court decisions, dissents, records, and briefs

import { analyzeConversation } from './openai';

export interface DocumentSummary {
  documentId: string;
  type: 'decision' | 'dissent' | 'concurrence' | 'record' | 'brief_petitioner' | 'brief_respondent' | 'brief_amicus';
  keyArguments: string[];
  legalStandard: string;
  disposition?: string;
  notableQuotes: string[];
  citedCases: string[];
  aiSummary: string;
  weaknesses?: string[];
  strengths?: string[];
  metadata: {
    caseName: string;
    court: string;
    date: string;
    pageCount: number;
    wordCount: number;
  };
}

export interface DecisionSummary extends DocumentSummary {
  type: 'decision';
  judges: string[];
  disposition: "Affirmed" | "Reversed" | "Remanded" | "Dismissed" | "Vacated";
  legalHolding: string;
  reasoning: string[];
  factualBackground: string;
  proceduralHistory: string;
  implications: string;
}

export interface DissentSummary extends DocumentSummary {
  type: 'dissent';
  judge: string;
  mainDisagreement: string;
  alternativeReasoning: string[];
  criticsOfMajority: string[];
  proposedOutcome: string;
}

export interface BriefSummary extends DocumentSummary {
  type: 'brief_petitioner' | 'brief_respondent' | 'brief_amicus';
  party: string;
  mainArguments: Array<{
    issue: string;
    position: string;
    reasoning: string[];
    supportingCases: string[];
    counterarguments: string[];
  }>;
  requestedRelief: string;
  factualClaims: string[];
  statutoryArguments: string[];
  policyArguments: string[];
}

// Document-type-specific prompts for AI analysis
const SUMMARIZATION_PROMPTS = {
  decision: `
You are analyzing a circuit court decision. Provide a comprehensive summary focusing on:

1. **Legal Holding**: What is the main legal principle established?
2. **Disposition**: How was the case resolved (Affirmed/Reversed/Remanded/etc.)?
3. **Reasoning**: What were the key steps in the court's legal reasoning?
4. **Factual Background**: What are the essential facts?
5. **Procedural History**: How did the case reach this court?
6. **Notable Quotes**: Any significant quotable passages
7. **Cited Cases**: Key precedents referenced
8. **Implications**: What does this mean for future cases?

Format your response as structured JSON with these exact fields:
{
  "legalHolding": "string",
  "disposition": "Affirmed|Reversed|Remanded|Dismissed|Vacated",
  "reasoning": ["step1", "step2", "step3"],
  "factualBackground": "string",
  "proceduralHistory": "string",
  "notableQuotes": ["quote1", "quote2"],
  "citedCases": ["Case v. Name", "Another v. Case"],
  "implications": "string",
  "keyArguments": ["argument1", "argument2"],
  "legalStandard": "string"
}

Document text:
`,

  dissent: `
You are analyzing a dissenting opinion. Focus on:

1. **Main Disagreement**: What is the core disagreement with the majority?
2. **Alternative Reasoning**: How would the dissent have decided?
3. **Critics of Majority**: What flaws does the dissent identify?
4. **Proposed Outcome**: What result would the dissent reach?
5. **Key Arguments**: The dissent's strongest points
6. **Notable Quotes**: Memorable passages
7. **Cited Authority**: Cases/sources the dissent relies on

Format as JSON:
{
  "mainDisagreement": "string",
  "alternativeReasoning": ["reason1", "reason2"],
  "criticsOfMajority": ["criticism1", "criticism2"],
  "proposedOutcome": "string",
  "keyArguments": ["argument1", "argument2"],
  "notableQuotes": ["quote1", "quote2"],
  "citedCases": ["Case v. Name"],
  "legalStandard": "string",
  "weaknesses": ["weakness1", "weakness2"]
}

Document text:
`,

  brief_petitioner: `
You are analyzing a petitioner's brief. Extract:

1. **Main Arguments**: What are the key legal arguments?
2. **Requested Relief**: What does petitioner want the court to do?
3. **Factual Claims**: Key facts petitioner presents
4. **Legal Standard**: What legal test/standard does petitioner advocate?
5. **Supporting Cases**: Key precedents cited
6. **Statutory Arguments**: Any statutory interpretation arguments
7. **Policy Arguments**: Policy reasons for petitioner's position
8. **Potential Weaknesses**: Vulnerable points in the argument

Format as JSON:
{
  "mainArguments": [
    {
      "issue": "string",
      "position": "string", 
      "reasoning": ["reason1", "reason2"],
      "supportingCases": ["Case v. Name"],
      "counterarguments": ["counter1", "counter2"]
    }
  ],
  "requestedRelief": "string",
  "factualClaims": ["fact1", "fact2"],
  "legalStandard": "string",
  "statutoryArguments": ["arg1", "arg2"],
  "policyArguments": ["policy1", "policy2"],
  "citedCases": ["Case v. Name"],
  "keyArguments": ["argument1", "argument2"],
  "weaknesses": ["weakness1", "weakness2"],
  "strengths": ["strength1", "strength2"]
}

Document text:
`,

  brief_respondent: `
You are analyzing a respondent's brief. Extract:

1. **Defensive Arguments**: How does respondent defend the lower court?
2. **Counter-Arguments**: How does respondent address petitioner's claims?
3. **Factual Disputes**: Any disagreements with petitioner's facts
4. **Legal Standard**: What legal test does respondent advocate?
5. **Supporting Precedent**: Cases supporting respondent's position
6. **Policy Defense**: Policy reasons supporting respondent
7. **Attack on Petitioner**: Weaknesses identified in petitioner's case

Use the same JSON format as petitioner brief.

Document text:
`,

  brief_amicus: `
You are analyzing an amicus brief. Extract:

1. **Supporting Party**: Which party does this brief support?
2. **Unique Perspective**: What special insight does this amicus provide?
3. **Main Arguments**: Key legal arguments unique to this brief
4. **Supporting Evidence**: Special expertise or data provided
5. **Policy Arguments**: Broader policy implications highlighted
6. **Expertise Area**: What makes this amicus qualified to speak

Use the same JSON format as other briefs.

Document text:
`,

  concurrence: `
You are analyzing a concurring opinion. Focus on:

1. **Agreement with Result**: How does the concurrence agree with the majority?
2. **Different Reasoning**: What alternative reasoning does it provide?
3. **Additional Points**: What extra issues does it address?
4. **Future Implications**: What guidance does it offer for future cases?
5. **Limitations**: Any limits on the majority's reasoning
6. **Key Arguments**: The concurrence's main legal points

Format as JSON:
{
  "agreementWithResult": "string",
  "differentReasoning": ["reason1", "reason2"],
  "additionalPoints": ["point1", "point2"],
  "futureImplications": "string",
  "keyArguments": ["argument1", "argument2"],
  "notableQuotes": ["quote1", "quote2"],
  "citedCases": ["Case v. Name"],
  "legalStandard": "string"
}

Document text:
`,

  record: `
You are analyzing a case record/appendix. Extract:

1. **Key Facts**: Essential factual findings
2. **Timeline**: Chronological sequence of events
3. **Evidence**: Important pieces of evidence
4. **Witness Testimony**: Key witness statements
5. **Lower Court Proceedings**: What happened in lower courts
6. **Relevant Statutes**: Applicable laws
7. **Factual Disputes**: Areas where parties disagree on facts

Format as JSON:
{
  "keyFacts": ["fact1", "fact2"],
  "timeline": [{"date": "string", "event": "string"}],
  "evidence": ["evidence1", "evidence2"],
  "witnessTestimony": ["testimony1", "testimony2"],
  "lowerCourtProceedings": ["proceeding1", "proceeding2"],
  "relevantStatutes": ["statute1", "statute2"],
  "factualDisputes": ["dispute1", "dispute2"],
  "keyArguments": ["argument1", "argument2"],
  "legalStandard": "Not applicable to records"
}

Document text:
`
};

// Main summarization function
export async function summarizeDocument(
  documentText: string,
  documentType: DocumentSummary['type'],
  metadata: DocumentSummary['metadata']
): Promise<DocumentSummary> {
  try {
    // Get the appropriate prompt for this document type
    const prompt = SUMMARIZATION_PROMPTS[documentType] || SUMMARIZATION_PROMPTS.decision;
    
    // Combine prompt with document text (truncate if too long)
    const maxTextLength = 15000; // Limit for API constraints
    const truncatedText = documentText.length > maxTextLength 
      ? documentText.substring(0, maxTextLength) + "...[TRUNCATED]"
      : documentText;
    
    const fullPrompt = prompt + truncatedText;
    
    console.log(`Summarizing ${documentType} document: ${metadata.caseName}`);
    
    // Use the existing OpenAI analysis function
    const analysis = await analyzeConversation(fullPrompt);
    
    // Parse the AI response (assuming it returns JSON)
    let parsedAnalysis: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If JSON parsing fails, create a basic summary
      console.warn('Failed to parse AI response as JSON, creating basic summary');
      parsedAnalysis = {
        keyArguments: ['Analysis could not be parsed'],
        legalStandard: 'Unable to determine',
        notableQuotes: [],
        citedCases: [],
        aiSummary: analysis.substring(0, 500)
      };
    }

    // Create the base summary
    const baseSummary: DocumentSummary = {
      documentId: `${metadata.caseName}-${documentType}-${Date.now()}`,
      type: documentType,
      keyArguments: parsedAnalysis.keyArguments || [],
      legalStandard: parsedAnalysis.legalStandard || '',
      disposition: parsedAnalysis.disposition,
      notableQuotes: parsedAnalysis.notableQuotes || [],
      citedCases: parsedAnalysis.citedCases || [],
      aiSummary: parsedAnalysis.aiSummary || analysis.substring(0, 1000),
      weaknesses: parsedAnalysis.weaknesses,
      strengths: parsedAnalysis.strengths,
      metadata: {
        ...metadata,
        wordCount: documentText.split(/\s+/).length
      }
    };

    return baseSummary;

  } catch (error) {
    console.error('Document summarization error:', error);
    
    // Return a basic summary if AI analysis fails
    return {
      documentId: `${metadata.caseName}-${documentType}-${Date.now()}`,
      type: documentType,
      keyArguments: ['Analysis failed - manual review required'],
      legalStandard: 'Could not be determined',
      notableQuotes: [],
      citedCases: [],
      aiSummary: `Failed to analyze ${documentType} document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        ...metadata,
        wordCount: documentText.split(/\s+/).length
      }
    };
  }
}

// Batch summarization for multiple documents
export async function summarizeDocuments(
  documents: Array<{
    text: string;
    type: DocumentSummary['type'];
    metadata: DocumentSummary['metadata'];
  }>
): Promise<DocumentSummary[]> {
  const summaries: DocumentSummary[] = [];
  
  for (const doc of documents) {
    try {
      const summary = await summarizeDocument(doc.text, doc.type, doc.metadata);
      summaries.push(summary);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to summarize document ${doc.metadata.caseName}:`, error);
    }
  }
  
  return summaries;
}

// Extract key legal concepts from a summary
export function extractLegalConcepts(summary: DocumentSummary): string[] {
  const concepts: Set<string> = new Set();
  
  // Extract from legal standard
  if (summary.legalStandard) {
    const standards = summary.legalStandard.match(/\b[A-Z][a-zA-Z\s]+(?:test|standard|analysis|doctrine|rule)\b/g);
    standards?.forEach(s => concepts.add(s.trim()));
  }
  
  // Extract from key arguments
  summary.keyArguments.forEach(arg => {
    const legalTerms = arg.match(/\b(?:constitutional|statutory|procedural|substantive|due process|equal protection|commerce clause|first amendment)\b/gi);
    legalTerms?.forEach(term => concepts.add(term.toLowerCase()));
  });
  
  return Array.from(concepts);
}

// Generate a comprehensive case context from all summaries
export function generateCaseContext(summaries: DocumentSummary[]): string {
  const context = [];
  
  // Group by document type
  const byType = summaries.reduce((acc, summary) => {
    if (!acc[summary.type]) acc[summary.type] = [];
    acc[summary.type].push(summary);
    return acc;
  }, {} as Record<string, DocumentSummary[]>);
  
  // Add circuit decision context
  if (byType.decision) {
    context.push("CIRCUIT COURT DECISION:");
    byType.decision.forEach(summary => {
      context.push(`- ${summary.metadata.caseName}: ${summary.aiSummary.substring(0, 200)}...`);
      context.push(`- Key Holdings: ${summary.keyArguments.join('; ')}`);
      if (summary.disposition) {
        context.push(`- Disposition: ${summary.disposition}`);
      }
    });
  }
  
  // Add dissent context
  if (byType.dissent) {
    context.push("\nDISSENTING OPINIONS:");
    byType.dissent.forEach(summary => {
      context.push(`- ${summary.aiSummary.substring(0, 200)}...`);
      context.push(`- Main Disagreement: ${summary.keyArguments.join('; ')}`);
    });
  }
  
  // Add brief context
  ['brief_petitioner', 'brief_respondent'].forEach(type => {
    if (byType[type]) {
      const label = type === 'brief_petitioner' ? 'PETITIONER ARGUMENTS' : 'RESPONDENT ARGUMENTS';
      context.push(`\n${label}:`);
      byType[type].forEach(summary => {
        context.push(`- ${summary.aiSummary.substring(0, 200)}...`);
        context.push(`- Key Arguments: ${summary.keyArguments.join('; ')}`);
      });
    }
  });
  
  return context.join('\n');
} 