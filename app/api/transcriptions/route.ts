import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all transcriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const caseId = searchParams.get('caseId') || '';

    let query = supabaseAdmin
      .from('attorney_conversations')
      .select(`
        id,
        case_id,
        file_name,
        file_size,
        file_type,
        s3_url,
        transcript,
        transcription_text,
        transcription_status,
        status,
        analysis_result,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add case filter if provided
    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,transcript.ilike.%${search}%,transcription_text.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transcriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      transcriptions: data || [], // Also provide transcriptions field for compatibility
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
      segments,
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
        file_type: file_type || 'audio/unknown',
        file_size: file_size || 0,
        s3_url: 'https://placeholder.com/audio.mp3',
        upload_status: 'completed',
        transcription_text: transcript,
        transcription_status: 'completed',
        analysis_result: {
          duration_seconds: duration_seconds || 0,
          speaker_count: speakers?.length || 1,
          speakers: speakers || [],
          segments: segments || []
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transcription:', error);
      return NextResponse.json({ error: 'Failed to create transcription' }, { status: 500 });
    }

    // Automatically trigger AI case analysis after transcription is saved
    if (case_id && transcript) {
      try {
        console.log('🤖 Triggering automatic AI case analysis for case:', case_id);
        const { analyzeLegalTranscript } = await import('@/lib/ai/case-analyzer');
        const analysis = await analyzeLegalTranscript(transcript);
        
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
          .eq('id', case_id);

        if (updateError) {
          console.error('Error updating case with AI analysis:', updateError);
        } else {
          console.log('✅ Case automatically updated with AI analysis');
        }
      } catch (aiError) {
        console.error('❌ Error in automatic AI analysis:', aiError);
        // Continue without failing the transcription save
      }
    }

    return NextResponse.json({
      success: true,
      data,
      aiAnalysisTriggered: !!case_id
    });

  } catch (error) {
    console.error('Create transcription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 