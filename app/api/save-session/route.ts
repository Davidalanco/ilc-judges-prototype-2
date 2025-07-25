import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { transcription, fileName, fileSize, duration, language } = await request.json();
    
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 });
    }

    // For now, using demo user - TODO: Get from actual authentication
    const userId = 'demo-user';

    // Create a new case record with the transcription
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        user_id: userId,
        case_title: `Case from ${fileName}`,
        case_description: `Transcribed from audio file: ${fileName}`,
        court_level: 'supreme_court',
        case_status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (caseError) {
      console.error('Error creating case:', caseError);
      return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
    }

    // Save the transcription as an attorney conversation
    const { data: conversationData, error: conversationError } = await supabaseAdmin
      .from('attorney_conversations')
      .insert({
        case_id: caseData.id,
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        duration_seconds: duration,
        transcription_text: transcription,
        language_detected: language,
        speaker_count: 1, // TODO: Implement actual speaker detection
        conversation_type: 'strategy_session',
        processing_status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error saving conversation:', conversationError);
      return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      caseId: caseData.id,
      conversationId: conversationData.id,
      message: 'Session saved successfully'
    });

  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 