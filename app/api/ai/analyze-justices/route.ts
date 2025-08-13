import { NextRequest, NextResponse } from 'next/server';
import { analyzeJusticesWithClaude } from '@/lib/ai/claude';
import { db } from '@/lib/db';

// GET /api/ai/analyze-justices - Retrieve existing justice analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: caseId' 
      }, { status: 400 });
    }

    console.log('📋 Retrieving existing justice analysis for case:', caseId);

    const existingAnalysis = await db.getClaudeJusticeAnalysis(caseId);
    
    if (existingAnalysis) {
      console.log('✅ Found existing justice analysis');
      return NextResponse.json({
        success: true,
        justiceAnalysis: existingAnalysis,
        caseId,
        fromDatabase: true
      });
    } else {
      console.log('ℹ️ No existing justice analysis found');
      return NextResponse.json({
        success: false,
        message: 'No existing analysis found',
        caseId
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Error retrieving justice analysis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve justice analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json();

    if (!caseId) {
      return NextResponse.json({ 
        error: 'Missing required field: caseId' 
      }, { status: 400 });
    }

    console.log('🏛️ Starting AI justice analysis for case:', caseId);

    // Get case information from database
    const caseData = await db.getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ 
        error: 'Case not found' 
      }, { status: 404 });
    }

    // Get attorney conversations (transcriptions) from database
    const conversations = await db.getConversationsByCase(caseId);
    let transcription = '';
    if (conversations && conversations.length > 0) {
      // Use the most recent conversation with transcription
      const latestConversation = conversations.find(conv => conv.transcription_text) || conversations[0];
      transcription = latestConversation?.transcription_text || '';
    }

    if (!transcription) {
      return NextResponse.json({ 
        error: 'No transcription found for this case' 
      }, { status: 400 });
    }

    // Get legal documents from database
    const legalDocuments = await db.getLegalDocumentsByCase(caseId);
    let documentContext = '';
    if (legalDocuments && legalDocuments.length > 0) {
      const docs = legalDocuments.slice(0, 5).map(doc => {
        return `Document: ${doc.title || doc.file_name}\nCitation: ${doc.citation || 'Unknown'}\nRelevance: ${doc.relevance_score || 'N/A'}\nContent: ${doc.plain_text_content?.substring(0, 1500) || 'Content not available'}...`;
      });
      documentContext = docs.join('\n\n');
    }

    console.log('🧠 Sending justice analysis to Claude...');

    // Use Claude for justice analysis
    const justiceAnalysis = await analyzeJusticesWithClaude(caseData, transcription, documentContext);

    console.log('💾 Saving justice analysis to database...');
    try {
      await db.saveClaudeJusticeAnalysis(caseId, justiceAnalysis);
      console.log('✅ Justice analysis saved to database successfully');
    } catch (dbError) {
      console.error('⚠️ Failed to save to database, but analysis completed:', dbError);
      // Continue anyway - we still return the analysis
    }
    
    console.log('✅ Justice analysis completed successfully');

    return NextResponse.json({
      success: true,
      justiceAnalysis,
      caseId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in justice analysis:', error);
    return NextResponse.json({
      error: 'Failed to analyze justices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
