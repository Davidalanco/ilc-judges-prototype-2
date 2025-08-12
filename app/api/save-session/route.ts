import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { transcription, fileName, fileSize, duration, language } = await request.json();
    
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 });
    }

    // For now, using existing user from working case - TODO: Get from actual authentication
    const userId = '37dc83ba-123b-4c86-9c61-903c085193a0';

    // Create a new case record with the transcription
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        user_id: userId,
        title: `Case from ${fileName}`,
        description: `Transcribed from audio file: ${fileName}`,
        court_level: 'Supreme Court',
        case_status: 'draft',
        status: 'draft',
        case_type: 'constitutional',
        current_step: 1,
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
        file_type: 'audio/unknown',
        s3_url: 'https://placeholder.com/audio.mp3',
        upload_status: 'completed',
        transcription_text: transcription,
        transcription_status: 'completed',
        analysis_result: {
          duration_seconds: duration,
          speaker_count: 1,
          language: language
        }
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error saving conversation:', conversationError);
      return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 });
    }

    // Automatically trigger AI case analysis after transcription is saved
    try {
      console.log('🤖 Triggering automatic AI case analysis...');
      const { analyzeLegalTranscript } = await import('@/lib/ai/case-analyzer');
      const analysis = await analyzeLegalTranscript(transcription);
      
      // Update the case with AI analysis results
      const { error: updateError } = await supabaseAdmin
        .from('cases')
        .update({
          case_name: analysis.caseName,
          court_level: analysis.courtLevel,
          constitutional_question: analysis.constitutionalQuestion,
          penalties: analysis.penalties,
          precedent_target: analysis.targetPrecedent,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseData.id);

      if (updateError) {
        console.error('Error updating case with AI analysis:', updateError);
      } else {
        console.log('✅ Case automatically updated with AI analysis');
      }
    } catch (aiError) {
      console.error('❌ Error in automatic AI analysis:', aiError);
      // Continue without failing the transcription save
    }

    return NextResponse.json({
      success: true,
      caseId: caseData.id,
      conversationId: conversationData.id,
      message: 'Session saved successfully',
      aiAnalysisTriggered: true
    });

  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 