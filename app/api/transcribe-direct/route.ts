import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithSpeakers } from '@/lib/ai/elevenlabs';
import { uploadFile, uploadFileFallback, getFileUrl } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string; // Optional case ID for organization
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB limit for Supabase free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB for transcription.' 
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

    // Generate unique file path for storage
    const timestamp = Date.now();
    const userId = 'temp-user'; // TODO: Get from auth session
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = caseId ? `${userId}/${caseId}/${fileName}` : `${userId}/${fileName}`;

    // Try to upload file to Supabase storage first
    console.log('Uploading file to Supabase storage...');
    let uploadResult = await uploadFile('audio-files', filePath, file, {
      upsert: false,
      metadata: {
        originalName: file.name,
        caseId: caseId || null,
        uploadedAt: new Date().toISOString()
      }
    });

    // If Supabase fails, use fallback storage
    if (uploadResult.error) {
      console.warn('Supabase upload failed, using fallback storage:', uploadResult.error.message);
      uploadResult = await uploadFileFallback('audio-files', filePath, file, {
        upsert: false,
        metadata: {
          originalName: file.name,
          caseId: caseId || null,
          uploadedAt: new Date().toISOString()
        }
      });
    }

    if (uploadResult.error) {
      console.error('Both Supabase and fallback storage failed:', uploadResult.error);
      return NextResponse.json({ 
        error: `File upload failed: ${uploadResult.error.message}` 
      }, { status: 500 });
    }

    console.log('File uploaded successfully (Supabase or fallback)');

    // Get the file URL (use fallback if needed)
    let fileUrl = '';
    if (uploadResult.data && 'path' in uploadResult.data) {
      // Fallback storage
      fileUrl = `fallback://${uploadResult.data.path}`;
    } else {
      // Supabase storage
      const urlResult = getFileUrl('audio-files', filePath);
      fileUrl = urlResult.data?.publicUrl || urlResult;
    }

    // Convert file to buffer for transcription
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use advanced AI for transcription with speaker identification
    const transcriptionResult = await transcribeAudioWithSpeakers(buffer, file.name);

    // Store conversation record in database if caseId provided
    let conversationRecord = null;
    if (caseId) {
      try {
        conversationRecord = await db.createConversation({
          case_id: caseId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          s3_url: fileUrl,
          duration_seconds: Math.round(transcriptionResult.duration || 0)
        });

        // Update conversation with transcription results
        if (conversationRecord) {
          await db.updateConversation(conversationRecord.id, {
            transcript: transcriptionResult.text,
            transcript_quality: 95.0, // High quality from ElevenLabs
            speaker_count: transcriptionResult.speakerCount || 0,
            speakers: transcriptionResult.speakers || [],
            analysis: {
              language: transcriptionResult.language,
              wordCount: transcriptionResult.text.split(' ').length,
              duration: transcriptionResult.duration,
              segments: transcriptionResult.segments
            },
            key_issues: transcriptionResult.keyIssues || [],
            status: 'completed'
          });
        }
      } catch (dbError) {
        console.warn('Database storage failed, but transcription succeeded:', dbError);
        // Continue with transcription results even if DB fails
      }
    }

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
      fileUrl: fileUrl,
      s3Key: filePath,
      processedAt: new Date().toISOString(),
      conversationId: conversationRecord?.id || null
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