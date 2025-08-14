import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const { document, caseContext, justiceAnalysis } = await request.json();

    if (!document || !document.title) {
      return NextResponse.json(
        { error: 'Document information is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting deep analysis for document: ${document.title}`);

    const prompt = `You are a Supreme Court legal strategist conducting a COMPREHENSIVE analysis of a historical document for a specific case. This is an expensive, in-depth analysis that should provide maximum strategic value.

DOCUMENT TO ANALYZE:
Title: ${document.title}
Relevance Score: ${document.relevanceScore}%
Key Quote: "${document.keyQuote}"
Significance: ${document.significance}
Strategic Appeal: ${document.strategicAppeal}
Archive Location: ${document.archiveLocation}
${document.historicalContext ? `Historical Context: ${document.historicalContext}` : ''}
${document.caseContext ? `Case Context: ${document.caseContext}` : ''}

CURRENT CASE CONTEXT:
${caseContext}

JUSTICE PSYCHOLOGY:
${justiceAnalysis ? JSON.stringify(justiceAnalysis, null, 2) : 'No justice analysis available'}

Provide a COMPREHENSIVE strategic analysis in the following JSON format:

{
  "legalFoundation": {
    "constitutionalPrinciples": ["List 3-5 specific constitutional principles this document supports"],
    "precedentialValue": "How this document establishes precedent for the current case",
    "doctrinalSupport": "Which legal doctrines this document reinforces"
  },
  "strategicUtility": {
    "primaryArguments": ["3-5 main arguments this document enables"],
    "counterArgumentDefense": "How this document defends against opposing arguments",
    "judicialPhilosophyAlignment": {
      "originalist": "Why originalists would find this compelling",
      "textualist": "Why textualists would find this compelling", 
      "traditionalist": "Why traditionalists would find this compelling",
      "pragmatist": "Why pragmatists would find this compelling"
    }
  },
  "specificJusticeTargeting": {
    "mostPersuasiveFor": ["Which current justices would find this most compelling and why"],
    "presentationStrategy": "How to present this document for maximum impact",
    "oralArgumentIntegration": "Specific ways to reference this in oral arguments"
  },
  "historicalAnalysis": {
    "timelineSignificance": "Why the timing of this document matters",
    "founderIntent": "What this reveals about founder/historical intent",
    "modernRelevance": "Why this historical precedent applies to modern circumstances"
  },
  "briefIntegration": {
    "optimalPlacement": "Where in the brief this should be positioned",
    "supportingCitations": "What other cases/documents should be cited alongside this",
    "rhetoricalFraming": "Specific language to frame this document persuasively"
  },
  "weaknessAnalysis": {
    "potentialCriticisms": ["How opponents might attack this document"],
    "mitigation strategies": ["How to address each potential criticism"],
    "contextualLimitations": "Historical or legal limitations of this document"
  },
  "practicalApplication": {
    "keyQuotesToHighlight": ["2-3 most powerful quotes beyond the main one"],
    "visualPresentation": "How to present this visually in brief or argument",
    "crossReferences": "Other documents/cases that amplify this one's impact"
  },
  "persuasionMetrics": {
    "emotionalResonance": "1-10 score with explanation for emotional impact",
    "intellectualRigor": "1-10 score with explanation for intellectual strength", 
    "precedentialWeight": "1-10 score with explanation for legal precedent value",
    "overallPowerRating": "1-10 overall strategic value with detailed justification"
  }
}

CRITICAL: This is an expensive analysis - provide maximum depth and strategic insight. Every section should contain specific, actionable intelligence for Supreme Court advocacy.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let claudeResponse = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON from Claude's response
    let analysisResult;
    try {
      // Look for JSON in the response
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      // Fallback: return the raw response with structure
      analysisResult = {
        error: 'Failed to parse structured analysis',
        rawAnalysis: claudeResponse,
        document: document
      };
    }

    console.log(`✅ Deep analysis completed for: ${document.title}`);

    return NextResponse.json({
      success: true,
      document: document,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
