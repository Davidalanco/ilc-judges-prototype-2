import OpenAI from 'openai';
import { transcribeAudioWithSpeakers, ElevenLabsTranscriptionResult } from './elevenlabs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// Export the OpenAI client for use in other modules
export { openai };

// Transcribe audio file using ElevenLabs (with speaker identification)
export async function transcribeAudio(audioBuffer: Buffer, fileName: string) {
  try {
    // Use ElevenLabs for transcription with speaker identification
    const elevenLabsResult: ElevenLabsTranscriptionResult = await transcribeAudioWithSpeakers(audioBuffer, fileName);
    
    // Convert ElevenLabs format to match existing OpenAI format for compatibility
    return {
      text: elevenLabsResult.text,
      segments: elevenLabsResult.segments,
      duration: elevenLabsResult.duration,
      language: elevenLabsResult.language,
      speakers: elevenLabsResult.speakers, // Additional speaker information
      speakerCount: elevenLabsResult.speakerCount
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Analyze attorney conversation for legal issues
export async function analyzeConversation(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a legal analysis AI specializing in constitutional law and Supreme Court litigation. Analyze this attorney strategy discussion and extract key information in JSON format.

Return a JSON object with:
1. keyIssues: Array of legal issues with confidence scores (0-100)
2. caseType: Type of constitutional case
3. suggestedArguments: Array of potential legal arguments
4. targetJustices: Justices most likely to be sympathetic
5. risks: Potential challenges or weaknesses
6. recommendations: Strategic recommendations

Be precise and focus on constitutional law principles.`
        },
        {
          role: 'user',
          content: `Analyze this attorney conversation transcript:\n\n${transcript}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content!);
  } catch (error) {
    console.error('Conversation analysis error:', error);
    throw new Error('Failed to analyze conversation');
  }
}

// Analyze justice alignment for a specific case
export async function analyzeJusticeAlignment(caseData: any, justiceName: string, justiceProfile: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a Supreme Court justice analysis expert. Analyze how likely Justice ${justiceName} is to be sympathetic to this case based on their judicial philosophy and the case details.

Return a JSON object with:
1. alignmentScore: Number 0-100 indicating likelihood of support
2. keyFactors: Array of factors that influence their decision
3. strategy: Recommended approach to persuade this justice
4. confidenceLevel: "high", "medium", or "low"
5. persuasionEntryPoints: Array of specific arguments that might resonate

Consider the justice's ideology, past decisions, and known preferences.`
        },
        {
          role: 'user',
          content: `
Justice Profile: ${JSON.stringify(justiceProfile)}

Case Details:
- Name: ${caseData.case_name}
- Type: ${caseData.case_type}
- Constitutional Question: ${caseData.constitutional_question}
- Issues: ${JSON.stringify(caseData.key_issues || [])}

Analyze Justice ${justiceName}'s likely response to this case.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content!);
  } catch (error) {
    console.error('Justice analysis error:', error);
    throw new Error('Failed to analyze justice alignment');
  }
}

// Generate brief section content
export async function generateBriefSection(sectionType: string, caseData: any, userInput?: string) {
  try {
    const sectionPrompts = {
      'question': 'Generate a "Question Presented" section for this Supreme Court brief.',
      'summary': 'Generate a "Summary of Argument" section for this Supreme Court brief.',
      'argument1': 'Generate the first main argument section for this Supreme Court brief.',
      'argument2': 'Generate the second main argument section for this Supreme Court brief.',
      'argument3': 'Generate the third main argument section for this Supreme Court brief.',
      'conclusion': 'Generate a "Conclusion" section for this Supreme Court brief.'
    };

    const prompt = sectionPrompts[sectionType as keyof typeof sectionPrompts] || 
                  'Generate content for this brief section.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert Supreme Court brief writer specializing in constitutional law. Write professional, persuasive legal content that follows Supreme Court brief formatting and style.

Use proper legal citation format, compelling arguments, and constitutional analysis. Make the writing clear, authoritative, and persuasive.

${userInput ? `The user has requested: ${userInput}` : ''}`
        },
        {
          role: 'user',
          content: `
${prompt}

Case Details:
- Name: ${caseData.case_name}
- Type: ${caseData.case_type}
- Constitutional Question: ${caseData.constitutional_question}
- Court Level: ${caseData.court_level}

Write the content in proper legal brief format.`
        }
      ],
      temperature: 0.4,
    });

    return completion.choices[0].message.content!;
  } catch (error) {
    console.error('Brief generation error:', error);
    throw new Error('Failed to generate brief section');
  }
}

// Chat response for brief section discussions
export async function generateChatResponse(sectionId: string, userMessage: string, caseData: any, sectionContent?: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI legal assistant helping attorneys refine their Supreme Court brief. You're discussing the "${sectionId}" section.

Provide helpful, specific suggestions for improving the legal arguments, writing style, case citations, or strategic approach. Be concise but substantive.

Consider:
- Constitutional law principles
- Supreme Court preferences
- Justice-specific persuasion strategies
- Legal writing best practices
- Citation accuracy
- Argument strength`
        },
        {
          role: 'user',
          content: `
Case: ${caseData.case_name}
Section: ${sectionId}
${sectionContent ? `Current content: ${sectionContent.substring(0, 500)}...` : ''}

User question/comment: ${userMessage}

Provide a helpful response to improve this brief section.`
        }
      ],
      temperature: 0.6,
      max_tokens: 200,
    });

    return completion.choices[0].message.content!;
  } catch (error) {
    console.error('Chat response error:', error);
    throw new Error('Failed to generate response');
  }
}

// Extract case information from transcript
export async function extractCaseInfo(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Extract case information from this attorney conversation transcript. Return a JSON object with suggested values for:

1. case_name: Suggested case name
2. case_type: Type of legal case
3. court_level: Court where case is/will be heard
4. constitutional_question: Main constitutional question
5. client_type: Type of client representation
6. jurisdiction: Legal jurisdiction
7. parties: Parties involved in the case
8. legal_issues: Array of main legal issues discussed

Only extract information that is clearly mentioned or strongly implied in the transcript.`
        },
        {
          role: 'user',
          content: `Extract case information from this transcript:\n\n${transcript}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    return JSON.parse(completion.choices[0].message.content!);
  } catch (error) {
    console.error('Case extraction error:', error);
    throw new Error('Failed to extract case information');
  }
}

// Generate text using OpenAI GPT models
export async function generateText(prompt: string, model: string = 'gpt-4o'): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Text generation error:', error);
    throw new Error('Failed to generate text');
  }
}

 