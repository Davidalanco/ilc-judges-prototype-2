import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CaseAnalysis {
  caseName: string;
  courtLevel: string;
  constitutionalQuestion: string;
  penalties: string;
  targetPrecedent: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  legalIssues: string[];
  keyArguments: string[];
  confidence: number;
}

export interface CaseInformation {
  case_name: string;
  court_level: string;
  constitutional_question: string;
  penalties: string;
  precedent_target: string;
}

export async function analyzeLegalTranscript(transcript: string): Promise<CaseAnalysis> {
  try {
    const prompt = `
Analyze this legal transcript and extract the following information. If information is not explicitly stated, make reasonable inferences based on the content:

TRANSCRIPT:
${transcript}

Please extract and format the following information in JSON:

{
  "caseName": "The actual case name mentioned (e.g., 'Miller v. New York State Department of Health')",
  "courtLevel": "The court level (e.g., 'U.S. Supreme Court (Cert Petition from Second Circuit)', 'Federal District Court', 'State Supreme Court', etc.)",
  "constitutionalQuestion": "The main constitutional question or legal issue being addressed",
  "penalties": "Any fines, penalties, or sanctions mentioned",
  "targetPrecedent": "Key precedent cases mentioned that are being challenged or relied upon",
  "parties": {
    "plaintiff": "The plaintiff/petitioner",
    "defendant": "The defendant/respondent"
  },
  "legalIssues": ["Array of key legal issues discussed"],
  "keyArguments": ["Array of main legal arguments presented"],
  "confidence": 0.95
}

Rules:
- If a case name is not mentioned, create one based on the parties and legal issue
- If court level is unclear, infer from context (cert petitions = Supreme Court, appeals = Circuit Court, etc.)
- Constitutional questions should be specific and well-formed
- Include specific dollar amounts for penalties if mentioned
- Target precedent should focus on Supreme Court cases when possible
- Confidence should be 0.1-1.0 based on how clear the information is in the transcript
- Keep responses professional and legally accurate
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal expert specializing in Supreme Court cases and constitutional law. Analyze legal transcripts to extract case information accurately."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response - handle potential markdown formatting and extract JSON
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Try to extract JSON from the response if it's mixed with text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
    console.log('🔍 Attempting to parse AI response:', cleanResponse.substring(0, 200) + '...');
    
    const analysis = JSON.parse(cleanResponse) as CaseAnalysis;
    
    // Validate required fields
    if (!analysis.caseName || !analysis.courtLevel || !analysis.constitutionalQuestion) {
      throw new Error('Missing required fields in analysis');
    }

    return analysis;

  } catch (error) {
    console.error('Error analyzing transcript:', error);
    
    // Return a fallback analysis
    return {
      caseName: "Unknown Case",
      courtLevel: "Federal Court",
      constitutionalQuestion: "Constitutional question to be determined from transcript analysis",
      penalties: "To be determined",
      targetPrecedent: "To be determined",
      parties: {
        plaintiff: "Plaintiff",
        defendant: "Defendant"
      },
      legalIssues: ["Constitutional rights", "Legal analysis required"],
      keyArguments: ["Further analysis needed"],
      confidence: 0.1
    };
  }
}

export async function extractCaseInformation(transcript: string): Promise<CaseInformation> {
  try {
    const prompt = `
Analyze this legal transcript and extract ONLY the following case information fields. Be precise and specific:

TRANSCRIPT:
${transcript}

Extract the following information and return ONLY a JSON object with these exact fields:

{
  "case_name": "The actual case name mentioned (e.g., 'Miller v. New York State Department of Health')",
  "court_level": "The court level or appellate status (e.g., 'U.S. Supreme Court (Cert Petition from Second Circuit)', 'Second Circuit Court of Appeals', 'Federal District Court', etc.)",
  "constitutional_question": "The specific constitutional question or legal issue being addressed",
  "penalties": "Any specific fines, penalties, or sanctions mentioned (include dollar amounts)",
  "precedent_target": "Key precedent cases mentioned that are being challenged or relied upon"
}

Rules:
- Return ONLY valid JSON, no markdown or additional text
- If a case name is not mentioned, create one based on the parties and legal issue
- For court level, pay attention to appeals history (e.g., if case "lost at Second Circuit", consider Supreme Court cert petition status)
- If information is unclear, make reasonable inferences from context
- Keep constitutional questions specific and legally precise
- Include specific amounts for penalties if mentioned
- Focus on Supreme Court precedents when mentioned
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal expert. Extract case information from legal transcripts and return ONLY valid JSON with no additional formatting or text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean and parse JSON response
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const caseInfo = JSON.parse(cleanResponse) as CaseInformation;
    
    // Validate required fields
    if (!caseInfo.case_name || !caseInfo.constitutional_question) {
      throw new Error('Missing required case information');
    }

    return caseInfo;

  } catch (error) {
    console.error('Error extracting case information:', error);
    
    // Return fallback case information
    return {
      case_name: "Case Analysis Pending",
      court_level: "Federal Court",
      constitutional_question: "Constitutional question to be determined from transcript analysis",
      penalties: "To be determined",
      precedent_target: "To be determined"
    };
  }
}

export async function enhanceCaseAnalysis(transcript: string, existingAnalysis: Partial<CaseAnalysis>): Promise<CaseAnalysis> {
  try {
    const prompt = `
Based on this legal transcript and existing partial analysis, provide a complete and enhanced case analysis:

TRANSCRIPT:
${transcript}

EXISTING ANALYSIS:
${JSON.stringify(existingAnalysis, null, 2)}

Please provide a complete JSON response with all fields filled out and enhanced based on the transcript content. Focus on:
1. Making the constitutional question more specific and well-crafted
2. Identifying all relevant legal precedents mentioned
3. Extracting specific penalties, fines, or sanctions
4. Clarifying the exact court level and procedural posture
5. Identifying key legal arguments and constitutional issues

Return the same JSON structure as before, but with enhanced and more detailed information.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior legal analyst specializing in Supreme Court constitutional cases. Enhance and complete case analyses with precise legal terminology."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI enhancement');
    }

    return JSON.parse(response) as CaseAnalysis;

  } catch (error) {
    console.error('Error enhancing case analysis:', error);
    return existingAnalysis as CaseAnalysis;
  }
}
