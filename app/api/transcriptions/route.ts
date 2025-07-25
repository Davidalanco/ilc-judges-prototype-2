import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all transcriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
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
        conversation_type,
        processing_status,
        created_at,
        updated_at,
        cases (
          id,
          case_name,
          case_type,
          court_level,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,transcript.ilike.%${search}%,cases.case_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transcriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Transcriptions API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Create new transcription (alternative to transcribe-direct)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      case_id, 
      file_name, 
      transcript, 
      speakers, 
      duration_seconds,
      file_size,
      file_type 
    } = body;

    if (!transcript || !file_name) {
      return NextResponse.json({ 
        error: 'transcript and file_name are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('attorney_conversations')
      .insert({
        case_id,
        file_name,
        transcript,
        speaker_count: speakers?.length || 1,
        speakers: speakers || [],
        duration_seconds: duration_seconds || 0,
        file_size: file_size || 0,
        file_type: file_type || 'audio/unknown',
        conversation_type: 'manual_entry',
        processing_status: 'completed',
        transcript_quality: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transcription:', error);
      return NextResponse.json({ error: 'Failed to create transcription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Create transcription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 