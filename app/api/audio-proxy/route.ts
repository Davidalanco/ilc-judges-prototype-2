import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const caseId = searchParams.get('caseId');
    const conversationId = searchParams.get('conversationId');
    
    let transcription, error;
    
    if (conversationId) {
      // Get the transcription record by conversation ID (more specific)
      const result = await supabaseAdmin
        .from('attorney_conversations')
        .select('s3_url, file_name, file_type')
        .eq('id', conversationId)
        .single();
      transcription = result.data;
      error = result.error;
    } else if (caseId) {
      // Get the transcription record by case ID (fallback to most recent)
      const result = await supabaseAdmin
        .from('attorney_conversations')
        .select('s3_url, file_name, file_type')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      transcription = result.data;
      error = result.error;
    } else {
      // No ID provided
      return new NextResponse(null, {
        status: 204, // No Content
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': '0'
        }
      });
    }

    if (error || !transcription) {
      console.log('No transcription found for caseId:', caseId, 'Error:', error?.message);
      // Return a silent audio response instead of 404 to prevent console errors
      return new NextResponse(null, {
        status: 204, // No Content
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': '0'
        }
      });
    }

    // Check if we have a real S3 URL
    if (transcription.s3_url && !transcription.s3_url.includes('example.com')) {
      try {
        // Proxy the real audio file from S3/Supabase
        const audioResponse = await fetch(transcription.s3_url);
        
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
        }
        
        return new NextResponse(audioResponse.body, {
          status: audioResponse.status,
          headers: {
            'Content-Type': transcription.file_type || 'audio/mpeg',
            'Content-Length': audioResponse.headers.get('Content-Length') || '',
            'Cache-Control': 'public, max-age=3600',
            'Accept-Ranges': 'bytes'
          }
        });
      } catch (error) {
        console.error('Error proxying audio:', error);
        // Fall through to demo response
      }
    }

    // Return demo response for development/fallback
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': '0',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Audio proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
