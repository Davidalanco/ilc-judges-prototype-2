import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithSpeakers } from '@/lib/ai/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (1GB limit for ElevenLabs)
    const maxSize = 1024 * 1024 * 1024; // 1GB (ElevenLabs supports up to 1GB)
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 1GB for transcription.' 
      }, { status: 400 });
    }

    // Validate file type (ElevenLabs supports more formats)
    const allowedTypes = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.ogg', '.flac', '.aiff', '.mov', '.wmv', '.avi', '.mkv', '.3gpp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `File type ${fileExtension} not supported. Supported: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    console.log(`Starting advanced transcription with speaker identification for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Convert file to buffer for transcription
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use advanced AI for transcription with speaker identification
    const transcriptionResult = await transcribeAudioWithSpeakers(buffer, file.name);

    // Extract key information with speaker data
    const result = {
      transcription: transcriptionResult.text,
      duration: transcriptionResult.duration,
      language: transcriptionResult.language,
      segments: transcriptionResult.segments,
      speakers: transcriptionResult.speakers,
      speakerCount: transcriptionResult.speakerCount,
      fileName: file.name,
      fileSize: file.size,
      processedAt: new Date().toISOString()
    };

    console.log(`Advanced transcription completed: ${transcriptionResult.text.length} characters, ${transcriptionResult.speakerCount} speakers identified`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Transcription failed: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error during transcription' 
    }, { status: 500 });
  }
} 