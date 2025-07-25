import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      case_name,
      case_type,
      court_level,
      constitutional_question,
      client_type,
      jurisdiction,
      penalties,
      precedent_target,
      uploadId // Optional: link to an existing file upload
    } = body;

    if (!case_name) {
      return NextResponse.json({ error: 'Case name is required' }, { status: 400 });
    }

    // Create the case
    const newCase = await db.createCase({
      user_id: session.user.id,
      case_name,
      case_type,
      court_level,
      constitutional_question,
      client_type,
      jurisdiction,
      penalties,
      precedent_target,
    });

    // If uploadId provided, link the file upload to this case
    if (uploadId) {
      // Get the file upload
      const uploadResult = await db.query(
        'SELECT * FROM file_uploads WHERE id = $1 AND user_id = $2',
        [uploadId, session.user.id]
      );

      if (uploadResult.rows.length > 0) {
        const upload = uploadResult.rows[0];
        
        // Create conversation record
        await db.createConversation({
          case_id: newCase.id,
          file_name: upload.file_name,
          file_size: upload.file_size,
          file_type: upload.file_type,
          s3_url: upload.s3_url,
        });

        // Update case status
        await db.updateCase(newCase.id, { 
          status: 'processing',
          current_step: 1 
        });

        // Update upload status
        await db.updateFileUploadStatus(uploadId, 'linked');
      }
    }

    return NextResponse.json({
      success: true,
      case: newCase,
      message: 'Case created successfully'
    });

  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all cases for the user
    const cases = await db.getCasesByUserId(session.user.id);

    // Get conversation counts for each case
    const casesWithCounts = await Promise.all(
      cases.map(async (caseItem) => {
        const conversations = await db.getConversationsByCase(caseItem.id);
        return {
          ...caseItem,
          conversation_count: conversations.length,
          has_audio: conversations.length > 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      cases: casesWithCounts
    });

  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { error: 'Failed to get cases' },
      { status: 500 }
    );
  }
} 