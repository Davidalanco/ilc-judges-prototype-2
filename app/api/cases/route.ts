import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Temporary bypass authentication for development
    // const session = await getServerSession();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    console.log('📝 POST /api/cases - bypassing auth for development');

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
      user_id: '00000000-0000-0000-0000-000000000001', // Temporary fixed user ID for development
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
        [uploadId, '00000000-0000-0000-0000-000000000001']
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

export async function PUT(request: NextRequest) {
  try {
    // Temporary bypass authentication for development
    // const session = await getServerSession();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    console.log('🔄 PUT /api/cases - bypassing auth for development');

    const url = new URL(request.url);
    const caseId = url.searchParams.get('id');
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    const updates = await request.json();
    console.log('💾 Updating case:', caseId, 'with data:', updates);

    // Update the case
    const updatedCase = await db.updateCase(caseId, updates);
    
    console.log('✅ Case updated successfully:', updatedCase.case_name);

    return NextResponse.json({
      success: true,
      case: updatedCase,
      message: 'Case updated successfully'
    });

  } catch (error) {
    console.error('❌ Update case error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update case',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Temporary bypass authentication for development 
    // const session = await getServerSession();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    console.log('📋 GET /api/cases - bypassing auth for development');

    // Get all cases for the development user (use same user ID as in transcribe-direct)
    const cases = await db.getCasesByUserId('37dc83ba-123b-4c86-9c61-903c085193a0');

    // Get conversation counts for each case and map field names
    const casesWithCounts = await Promise.all(
      cases.map(async (caseItem) => {
        const conversations = await db.getConversationsByCase(caseItem.id);
        return {
          ...caseItem,
          case_name: caseItem.title, // Map title to case_name for frontend
          constitutional_question: caseItem.description, // Map description to constitutional_question
          status: caseItem.case_status, // Map case_status to status
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

export async function DELETE(request: NextRequest) {
  try {
    // Temporary bypass authentication for development
    console.log('🗑️ DELETE /api/cases - bypassing auth for development');

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('id');

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting case:', caseId);

    // Delete related attorney_conversations first (foreign key constraint)
    const { error: conversationsError } = await supabase
      .from('attorney_conversations')
      .delete()
      .eq('case_id', caseId);

    if (conversationsError) {
      console.error('Error deleting conversations:', conversationsError);
      return NextResponse.json({ 
        error: 'Failed to delete related conversations' 
      }, { status: 500 });
    }

    // Delete the case
    const { error: caseError } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId);

    if (caseError) {
      console.error('Error deleting case:', caseError);
      return NextResponse.json({ 
        error: 'Failed to delete case' 
      }, { status: 500 });
    }

    console.log('✅ Case deleted successfully:', caseId);

    return NextResponse.json({
      success: true,
      message: 'Case deleted successfully'
    });

  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
} 