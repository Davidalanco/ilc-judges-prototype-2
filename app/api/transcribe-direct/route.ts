import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithSpeakers } from '@/lib/ai/elevenlabs';
import { transcribeWithDeepgram } from '@/lib/ai/deepgram';
import { uploadFile, getFileUrl } from '@/lib/supabase';
import { db } from '@/lib/db';
import { debugLogger, logInfo, logError, logFileOp, logDbOp, logApiCall, logWarn } from '@/lib/debug-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let caseId: string | null = null; // Declare at top level for error handling
  let file: File | null = null;
  
  try {
    logInfo('TranscribeDirect', 'Starting transcription request', { 
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type')
    });
    
    // Get the form data
    const formData = await request.formData();
    file = formData.get('file') as File;
    caseId = formData.get('caseId') as string; // Optional case ID for organization
    
    logInfo('TranscribeDirect', 'Form data parsed', { 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      caseId: caseId || 'None'
    });
    
    if (!file) {
      logError('TranscribeDirect', 'No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB limit for Supabase free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      logError('TranscribeDirect', 'File too large', { 
        fileSize: file.size, 
        maxSize: maxSize,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2)
      });
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
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📁 File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        caseId: caseId || 'None'
      });
    }

    // Generate unique file path for storage
    const timestamp = Date.now();
    const userId = 'temp-user'; // TODO: Get from auth session
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = caseId ? `${userId}/${caseId}/${fileName}` : `${userId}/${fileName}`;
    
    logInfo('TranscribeDirect', 'Generated file path', { 
      timestamp,
      userId,
      fileName,
      filePath,
      originalName: file.name
    });

    // Try to upload file to Supabase storage first
    logFileOp('TranscribeDirect', 'Starting file upload to Supabase', { 
      bucket: 'audio-files',
      filePath,
      fileSize: file.size,
      metadata: {
        originalName: file.name,
        caseId: caseId || null,
        uploadedAt: new Date().toISOString()
      }
    });
    
    let uploadResult = await uploadFile('audio-files', filePath, file, {
      upsert: false,
      metadata: {
        originalName: file.name,
        caseId: caseId || null,
        uploadedAt: new Date().toISOString()
      }
    });

    // If Supabase upload fails, return the actual error immediately
    if (uploadResult.error) {
      logError('TranscribeDirect', 'Supabase upload failed', { 
        error: uploadResult.error.message,
        fileName: file.name,
        fileSize: file.size
      });
      return NextResponse.json({ 
        error: `Supabase upload failed: ${uploadResult.error.message}`,
        details: uploadResult.error
      }, { status: 500 });
    }

    console.log('File uploaded successfully to Supabase');

    // Get the real Supabase file URL
    const urlResult = getFileUrl('audio-files', uploadResult.data.path);
    const fileUrl = urlResult.data?.publicUrl;
    
    if (!fileUrl) {
      logError('TranscribeDirect', 'Failed to get public URL for uploaded file', { 
        path: uploadResult.data.path 
      });
      return NextResponse.json({ 
        error: 'File uploaded but public URL generation failed' 
      }, { status: 500 });
    }

    // Convert file to buffer for transcription
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use advanced AI for transcription with speaker identification (with fallback)
    logApiCall('TranscribeDirect', 'Starting transcription with ElevenLabs (primary)', {
      fileName: file.name,
      bufferSize: buffer.length,
      bufferSizeMB: (buffer.length / 1024 / 1024).toFixed(2)
    });
    
    let transcriptionResult;
    let transcriptionProvider = 'ElevenLabs';
    
    try {
      transcriptionResult = await transcribeAudioWithSpeakers(buffer, file.name);
      
      logApiCall('TranscribeDirect', 'ElevenLabs transcription completed successfully', {
        textLength: transcriptionResult.text?.length || 0,
        speakers: transcriptionResult.speakerCount || 0,
        duration: transcriptionResult.duration,
        language: transcriptionResult.language,
        hasSegments: !!transcriptionResult.segments,
        hasSpeakers: !!transcriptionResult.speakers
      });
      
    } catch (elevenLabsError: any) {
      const errorMessage = elevenLabsError instanceof Error ? elevenLabsError.message : String(elevenLabsError);
      
      logError('TranscribeDirect', 'ElevenLabs transcription failed, attempting Deepgram fallback', { 
        error: errorMessage,
        fileName: file.name
      });
      
      // Check if this is a rate limit or system busy error that warrants fallback
      const shouldFallback = /429|system_busy|Speech to Text API error|Too Many Requests/i.test(errorMessage);
      
      if (!shouldFallback) {
        // For non-rate-limit errors, don't fallback - throw the original error
        throw elevenLabsError;
      }
      
      logInfo('TranscribeDirect', 'Using Deepgram as fallback transcription service', {
        reason: 'ElevenLabs rate limited or system busy',
        fileName: file.name
      });
      
      try {
        transcriptionResult = await transcribeWithDeepgram(buffer, file.name);
        transcriptionProvider = 'Deepgram';
        
        logApiCall('TranscribeDirect', 'Deepgram fallback transcription completed successfully', {
          textLength: transcriptionResult.text?.length || 0,
          speakers: transcriptionResult.speakerCount || 0,
          duration: transcriptionResult.duration,
          language: transcriptionResult.language,
          hasSegments: !!transcriptionResult.segments,
          hasSpeakers: !!transcriptionResult.speakers
        });
        
      } catch (deepgramError: any) {
        logError('TranscribeDirect', 'Both ElevenLabs and Deepgram transcription failed', {
          elevenLabsError: errorMessage,
          deepgramError: deepgramError instanceof Error ? deepgramError.message : String(deepgramError),
          fileName: file.name
        });
        
        // If both fail, throw the Deepgram error with context
        throw new Error(`Transcription failed. Primary service (ElevenLabs): ${errorMessage}. Fallback service (Deepgram): ${deepgramError instanceof Error ? deepgramError.message : String(deepgramError)}`);
      }
    }

    // Store conversation record in database
    let conversationRecord = null;
    let actualCaseId = caseId;
    
    // If no caseId provided or "none" string, create a real case for the workflow
    if (!actualCaseId || actualCaseId === 'none') {
      logInfo('TranscribeDirect', 'No case ID provided, will create new case', {
        receivedCaseId: caseId,
        actualCaseId: actualCaseId
      });
      
      try {
        // Create a real case using an existing user ID from the database
        const newCase = await db.createCase({
          user_id: '37dc83ba-123b-4c86-9c61-903c085193a0', // Use existing user from DB
          case_name: `Case - ${file.name}`,
          case_type: 'constitutional',
          court_level: 'supreme'
        });
        
        actualCaseId = newCase.id;
        logDbOp('TranscribeDirect', 'Case created successfully', { 
          caseId: actualCaseId,
          caseName: newCase.title // Use 'title' field which is the actual database field
        });
        
        console.log('🎯 CASE CREATION SUCCESS:', {
          actualCaseId,
          caseName: newCase.title // Use 'title' field which is the actual database field
        });
      } catch (caseError) {
        logError('TranscribeDirect', 'Failed to create case', { 
          error: caseError instanceof Error ? caseError.message : 'Unknown error'
        });
        // Continue without database storage
      }
    }
    
    if (actualCaseId) {
      logDbOp('TranscribeDirect', 'Saving conversation to database', { 
        caseId: actualCaseId,
        fileName: file.name,
        fileSize: file.size
      });
      
      try {
        conversationRecord = await db.createConversation({
          case_id: actualCaseId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          s3_url: fileUrl,
          duration_seconds: Math.round(transcriptionResult.duration || 0)
        });

        console.log('🎯 CONVERSATION CREATION SUCCESS:', {
          conversationRecord,
          conversationId: conversationRecord?.id,
          actualCaseId
        });

        logDbOp('TranscribeDirect', 'Conversation record created successfully', { 
          conversationId: conversationRecord.id,
          caseId: actualCaseId
        });

        // Update conversation with transcription results
        if (conversationRecord) {
          const updateResult = await db.updateConversation(conversationRecord.id, {
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
            key_issues: [], // Key issues analysis would be added later
            status: 'completed'
          });
          
          logDbOp('TranscribeDirect', 'Conversation updated with transcript successfully', { 
            conversationId: updateResult.id,
            transcriptLength: transcriptionResult.text?.length || 0,
            speakerCount: transcriptionResult.speakerCount || 0
          });
        }
      } catch (dbError) {
        logError('TranscribeDirect', 'Database storage failed', { 
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          caseId: actualCaseId,
          fileName: file?.name || 'Unknown'
        });
        // Continue with transcription results even if DB fails
      }
    } else {
      logWarn('TranscribeDirect', 'No caseId available, skipping database save');
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
      conversationId: conversationRecord?.id || null,
      transcriptionProvider: transcriptionProvider, // Include which service was used
      caseId: actualCaseId // Include the case ID for workflow persistence
    };
    
    console.log('🎯 FINAL RESULT OBJECT:', {
      conversationId: result.conversationId,
      caseId: result.caseId,
      actualCaseId,
      conversationRecordId: conversationRecord?.id,
      hasConversationRecord: !!conversationRecord
    });

    const totalDuration = Date.now() - startTime;
    logInfo('TranscribeDirect', 'Transcription request completed successfully', {
      totalDuration: `${totalDuration}ms`,
      textLength: transcriptionResult.text?.length || 0,
      speakerCount: transcriptionResult.speakerCount || 0,
      conversationId: conversationRecord?.id || 'None',
      caseId: actualCaseId || 'None',
      transcriptionProvider: transcriptionProvider
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    // Safely get file information for error logging
    let fileName = 'Unknown';
    let fileSize = 0;
    try {
      if (file) {
        fileName = file.name || 'Unknown';
        fileSize = file.size || 0;
      }
    } catch (e) {
      // File object might not be accessible
    }
    
    logError('TranscribeDirect', 'Transcription request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      totalDuration: `${totalDuration}ms`,
      fileName,
      fileSize,
      caseId: caseId || 'None'
    });
    
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