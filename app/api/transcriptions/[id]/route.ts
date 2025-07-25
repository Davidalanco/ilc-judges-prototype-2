import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get single transcription by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('attorney_conversations')
      .select(`
        id,
        case_id,
        file_name,
        file_size,
        file_type,
        duration_seconds,
        transcript,
        speaker_count,
        speakers,
        analysis,
        transcript_quality,
        key_issues,
        strategic_elements,
        conversation_type,
        processing_status,
        created_at,
        updated_at,
        cases (
          id,
          case_name,
          case_type,
          court_level,
          constitutional_question,
          status
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching transcription:', error);
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get transcription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT - Update transcription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      transcript, 
      speakers, 
      speaker_count,
      key_issues,
      strategic_elements,
      conversation_type,
      transcript_quality 
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (transcript !== undefined) updateData.transcript = transcript;
    if (speakers !== undefined) updateData.speakers = speakers;
    if (speaker_count !== undefined) updateData.speaker_count = speaker_count;
    if (key_issues !== undefined) updateData.key_issues = key_issues;
    if (strategic_elements !== undefined) updateData.strategic_elements = strategic_elements;
    if (conversation_type !== undefined) updateData.conversation_type = conversation_type;
    if (transcript_quality !== undefined) updateData.transcript_quality = transcript_quality;

    const { data, error } = await supabaseAdmin
      .from('attorney_conversations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transcription:', error);
      return NextResponse.json({ error: 'Failed to update transcription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Transcription updated successfully'
    });

  } catch (error) {
    console.error('Update transcription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Delete transcription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, check if the transcription exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('attorney_conversations')
      .select('id, file_name')
      .eq('id', params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    // Delete the transcription
    const { error: deleteError } = await supabaseAdmin
      .from('attorney_conversations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting transcription:', deleteError);
      return NextResponse.json({ error: 'Failed to delete transcription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Transcription "${existing.file_name}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete transcription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 