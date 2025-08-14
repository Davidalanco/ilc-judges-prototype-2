import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-build');

export async function generateWithGemini(prompt: string, model: string = 'gemini-2.5-pro'): Promise<string> {
  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWithGeminiStream(prompt: string, model: string = 'gemini-2.5-pro') {
  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    
    const result = await generativeModel.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw new Error(`Failed to generate streaming content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
