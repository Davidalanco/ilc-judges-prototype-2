import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function generateWithGemini(prompt: string, model: string = 'gemini-2.5-pro'): Promise<string> {
  try {
    const geminiModel = genAI.getGenerativeModel({ model });
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWithGeminiStream(prompt: string, model: string = 'gemini-2.5-pro') {
  try {
    const geminiModel = genAI.getGenerativeModel({ model });
    
    const result = await geminiModel.generateContentStream(prompt);
    
    return result.stream;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate content stream with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
