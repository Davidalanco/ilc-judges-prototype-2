import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { transcribeAudioWithSpeakers } from '@/lib/ai/elevenlabs';
import { analyzeConversation, extractCaseInfo } from '@/lib/ai/openai';
import { db, supabase } from '@/lib/db';
import '@/types/auth';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, forceReprocess } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Get conversation from database using Supabase client
    const { data: conversations, error: fetchError } = await supabase
      .from('attorney_conversations')
      .select('*')
      .eq('id', conversationId);

    if (fetchError || !conversations || conversations.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = conversations[0];

    // Verify user owns this conversation through the case
    const caseData = await db.getCaseById(conversation.case_id);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already transcribed
    if (conversation.transcription_text && conversation.analysis_result) {
      return NextResponse.json({
        success: true,
        transcript: conversation.transcription_text,
        analysis: conversation.analysis_result,
        message: 'Already transcribed'
      });
    }

    // Get file from S3
    const s3Key = conversation.s3_url.split('.amazonaws.com/')[1];
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key,
    });

    const s3Response = await s3Client.send(getObjectCommand);
    const audioBuffer = Buffer.from(await s3Response.Body!.transformToByteArray());

    // Transcribe audio with speaker identification
    const transcriptionResult = await transcribeAudioWithSpeakers(audioBuffer, conversation.file_name);

    // Analyze the conversation
    const analysisResult = await analyzeConversation(transcriptionResult.text);

    // Extract case information suggestions
    const caseInfoSuggestions = await extractCaseInfo(transcriptionResult.text);

    // Update conversation record with ElevenLabs data
    await db.updateConversation(conversationId, {
      transcript: transcriptionResult.text,
      transcript_quality: 95, // Placeholder, could be calculated based on transcription confidence
      speaker_count: transcriptionResult.speakerCount,
      speakers: transcriptionResult.speakers || [],
      analysis: {
        ...analysisResult,
        segments: transcriptionResult.segments || [], // Ensure segments are stored
        speakers: transcriptionResult.speakers || []
      },
      key_issues: analysisResult.keyIssues || [],
      status: 'transcribed'
    });

    // Update case with analysis
    await db.updateCase(conversation.case_id, {
      status: 'analyzed',
      current_step: 2
    });

    return NextResponse.json({
      success: true,
      transcript: transcriptionResult.text,
      analysis: analysisResult,
      caseInfoSuggestions,
      duration: transcriptionResult.duration,
      language: transcriptionResult.language,
      speakerCount: transcriptionResult.speakerCount,
      speakers: transcriptionResult.speakers,
      segments: transcriptionResult.segments || [], // Include segments in response
      message: 'Transcription and analysis complete'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Update conversation status to error
    const { conversationId } = await request.json().catch(() => ({}));
    if (conversationId) {
      await db.updateConversation(conversationId, {
        status: 'error'
      }).catch(console.error);
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 