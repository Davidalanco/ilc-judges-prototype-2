import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

export async function POST(request: NextRequest) {
  try {
    const { caseInfo, transcriptionData } = await request.json();

    if (!caseInfo || !transcriptionData) {
      return NextResponse.json(
        { error: 'Case info and transcription data are required' },
        { status: 400 }
      );
    }

    console.log('💾 Storing case and transcription...');

    // First, create the case using existing db function
    const caseResult = await db.createCase({
      user_id: 'temp-user-id', // TODO: Get actual user ID from session
      case_name: caseInfo.caseName || 'Untitled Case',
      case_type: 'Supreme Court Amicus Brief',
      court_level: caseInfo.courtLevel || 'U.S. Supreme Court',
      constitutional_question: caseInfo.legalIssue || '',
      client_type: 'Amicus Curiae',
      jurisdiction: 'Federal',
      penalties: '',
      precedent_target: caseInfo.keyPrecedents?.[0] || ''
    });

    console.log('✅ Case created:', caseResult.id);

    // Now store the transcription using existing db function
    const conversationResult = await db.createConversation({
      case_id: caseResult.id,
      file_name: transcriptionData.fileName,
      file_size: transcriptionData.fileSize,
      file_type: transcriptionData.fileName?.includes('.') 
        ? transcriptionData.fileName.split('.').pop() || 'text'
        : 'text',
      s3_url: transcriptionData.fileUrl || '',
      duration_seconds: transcriptionData.duration === 'Unknown' 
        ? undefined 
        : parseInt(transcriptionData.duration?.replace(/[^\d]/g, '') || '0'),
      user_id: 'temp-user-id' // TODO: Get actual user ID from session
    });

    console.log('✅ Conversation created:', conversationResult.id);

    // Update the conversation with transcription data
    await db.updateConversation(conversationResult.id, {
      transcript: transcriptionData.transcription,
      speaker_count: transcriptionData.speakerCount || 0,
      speakers: transcriptionData.speakers || [],
      analysis: {
        extractedCaseInfo: caseInfo,
        segments: transcriptionData.segments || []
      },
      status: 'processed'
    });

    console.log('✅ Transcription data updated');

    return NextResponse.json({
      success: true,
      caseId: caseResult.id,
      transcriptionId: conversationResult.id,
      message: 'Case and transcription stored successfully'
    });

  } catch (error) {
    console.error('❌ Error in store-case-transcription:', error);
    
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Non-Error object thrown:', typeof error, error);
    }
    
    // Extract error details
    let errorMessage = 'Unknown error';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
      };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
      errorDetails = error;
    } else {
      errorMessage = String(error);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to store case and transcription',
        details: errorMessage,
        errorDetails: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
