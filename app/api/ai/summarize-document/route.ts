import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/summarize-document
// Generate AI summary of a legal document
export async function POST(request: NextRequest) {
  try {
    const { document, summaryType } = await request.json();

    if (!document || !summaryType) {
      return NextResponse.json(
        { error: 'Document and summary type are required' },
        { status: 400 }
      );
    }

    console.log(`Generating AI summary for ${summaryType}: ${document.title}`);

    // Create type-specific prompts for better summaries
    const getPrompt = (type: string, doc: any) => {
      const baseContext = `Document: ${doc.title}\nCourt: ${doc.court}\nDate: ${doc.date}\nPages: ${doc.pageCount}`;
      
      switch (type) {
        case 'decision':
          return `${baseContext}\n\nAs a legal expert, analyze this circuit court decision and provide a structured summary with:\n\n1. Key legal holdings and reasoning\n2. Legal standard applied (e.g., strict scrutiny, rational basis)\n3. Case disposition (affirmed, reversed, remanded)\n4. Notable quotes from the opinion\n5. Important cited cases and precedents\n6. Significance for future constitutional law cases\n\nProvide concise but comprehensive analysis suitable for Supreme Court brief preparation.`;

        case 'dissent':
          return `${baseContext}\n\nAs a legal expert, analyze this dissenting opinion and provide a structured summary with:\n\n1. Main points of disagreement with majority\n2. Alternative legal reasoning proposed\n3. Critique of majority's constitutional analysis\n4. Notable quotes from the dissent\n5. Cases cited to support dissenting view\n6. Potential influence on future Supreme Court review\n\nFocus on constitutional arguments that might appeal to different judicial philosophies.`;

        default:
          return `${baseContext}\n\nAs a legal expert, analyze this legal document and provide a structured summary with:\n\n1. Key factual and legal content\n2. Relevance to constitutional law analysis\n3. Important procedural or substantive information\n4. Notable quotes or citations\n5. Significance for case understanding\n\nProvide analysis suitable for Supreme Court brief preparation.`;
      }
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert constitutional law clerk preparing comprehensive case summaries for Supreme Court brief writing. Provide detailed, structured analysis focusing on constitutional principles, judicial reasoning, and strategic insights."
        },
        {
          role: "user",
          content: getPrompt(summaryType, document)
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiAnalysis = completion.choices[0]?.message?.content || 'Unable to generate summary';

    // Parse the AI response into structured data
    const summary = {
      keyPoints: extractKeyPoints(aiAnalysis, summaryType),
      legalStandard: extractLegalStandard(aiAnalysis, summaryType),
      disposition: extractDisposition(aiAnalysis, summaryType),
      notableQuotes: extractQuotes(aiAnalysis),
      citedCases: extractCitedCases(aiAnalysis),
      significance: extractSignificance(aiAnalysis),
      aiSummary: aiAnalysis
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('AI summarization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions to extract structured data from AI response
function extractKeyPoints(text: string, type: string): string[] {
  // Extract numbered points or bullet points from AI response
  const lines = text.split('\n');
  const keyPoints: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^\d+\.|^-|^•/) && trimmed.length > 10) {
      keyPoints.push(trimmed.replace(/^\d+\.|^-|^•/, '').trim());
    }
  }
  
  return keyPoints.slice(0, 5); // Limit to top 5 points
}

function extractLegalStandard(text: string, type: string): string {
  const patterns = [
    /legal standard[:\s]+([^.]+)/i,
    /standard applied[:\s]+([^.]+)/i,
    /constitutional test[:\s]+([^.]+)/i,
    /(strict scrutiny|rational basis|intermediate scrutiny)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return type === 'decision' ? 'Constitutional Analysis' : 
         type === 'dissent' ? 'Alternative Framework' : 'N/A';
}

function extractDisposition(text: string, type: string): string {
  const patterns = [
    /disposition[:\s]+([^.]+)/i,
    /(affirmed|reversed|remanded|dismissed)/i,
    /court\s+(affirmed|reversed|remanded|dismissed)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return type === 'decision' ? 'See full analysis' : 'N/A';
}

function extractQuotes(text: string): string[] {
  const quotes = text.match(/"([^"]+)"/g) || [];
  return quotes.slice(0, 3).map(q => q.replace(/"/g, ''));
}

function extractCitedCases(text: string): string[] {
  // Simple case name extraction
  const casePattern = /([A-Z][a-z]+\s+v\.\s+[A-Z][a-z]+)/g;
  const matches = text.match(casePattern) || [];
  return [...new Set(matches)].slice(0, 5); // Remove duplicates, limit to 5
}

function extractSignificance(text: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('significance') || 
        line.toLowerCase().includes('important') ||
        line.toLowerCase().includes('influence')) {
      return line.trim();
    }
  }
  return 'Provides important constitutional law guidance';
} 