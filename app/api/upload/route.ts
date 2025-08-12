import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db, supabase } from '@/lib/db';
import '@/types/auth';

// Initialize S3 client
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload audio or video files only.' 
      }, { status: 400 });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 100MB.' 
      }, { status: 400 });
    }

    // Generate S3 key
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `conversations/${session.user.id}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        userId: session.user.id,
        uploadedAt: new Date().toISOString(),
      },
    }));

    const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // If caseId provided, create conversation record
    if (caseId) {
      // Verify user owns the case
      const caseData = await db.getCaseById(caseId);
      if (!caseData || caseData.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
      }

      // Create conversation record
      const conversation = await db.createConversation({
        case_id: caseId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        s3_url: s3Url,
      });

      // Update case status to indicate file uploaded
      await db.updateCase(caseId, { 
        status: 'processing',
        current_step: 1 
      });

      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        caseId: caseId,
        fileName: file.name,
        fileSize: file.size,
        s3Url: s3Url,
        message: 'File uploaded successfully and ready for processing'
      });
    } else {
      // Just save file upload record for later case creation
      const fileUpload = await db.createFileUpload({
        user_id: session.user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        s3_key: s3Key,
        s3_url: s3Url,
      });

      return NextResponse.json({
        success: true,
        uploadId: fileUpload.id,
        fileName: file.name,
        fileSize: file.size,
        s3Url: s3Url,
        message: 'File uploaded successfully'
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (caseId) {
      // Get conversations for a specific case
      const conversations = await db.getConversationsByCase(caseId);
      return NextResponse.json({ conversations });
    } else {
      // Get all file uploads for the user using Supabase
      const { data: uploads, error: uploadsError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (uploadsError) {
        console.error('Error fetching uploads:', uploadsError);
        return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
      }
      
      return NextResponse.json({ uploads: uploads || [] });
    }

  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json(
      { error: 'Failed to get uploads' },
      { status: 500 }
    );
  }
} 