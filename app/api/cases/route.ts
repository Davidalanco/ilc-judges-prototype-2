import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db, supabase } from '@/lib/db';
import '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
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
      title: case_name, // Required field
      case_name,
      case_type,
      constitutional_question,
      client_type,
      jurisdiction,
      penalties,
      precedent_target,
    });

    // If uploadId provided, link the file upload to this case
    if (uploadId) {
      // Get the file upload using Supabase
      const { data: uploads, error: uploadError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', session.user.id);

      if (!uploadError && uploads && uploads.length > 0) {
        const upload = uploads[0];
        
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const caseId = url.searchParams.get('id');
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    const updates = await request.json();
    console.log('💾 Updating case:', caseId, 'with data:', updates);

    // Map court_level to case_type for database storage (same logic as PATCH endpoint)
    const dbUpdates = { ...updates };
    if (updates.court_level !== undefined) {
      dbUpdates.case_type = updates.court_level;
      delete dbUpdates.court_level; // Remove so it doesn't cause errors
    }

    // Update the case
    const updatedCase = await db.updateCase(caseId, dbUpdates);
    
    console.log('✅ Case updated successfully:', updatedCase.case_name);

    // Map case_type back to court_level for response (same logic as PATCH endpoint)
    const mappedUpdatedCase = {
      ...updatedCase,
      court_level: updatedCase.case_type || ''
    };

    return NextResponse.json({
      success: true,
      case: mappedUpdatedCase,
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all cases for the authenticated user
    const cases = await db.getCasesByUserId(session.user.id);

    // Get conversation counts for each case and map field names
    const casesWithCounts = await Promise.all(
      cases.map(async (caseItem) => {
        const conversations = await db.getConversationsByCase(caseItem.id);
        return {
          ...caseItem,
          case_name: caseItem.case_name || caseItem.title, // Use AI-extracted case_name, fallback to title
          constitutional_question: caseItem.constitutional_question || caseItem.description, // Use AI-extracted constitutional_question, fallback to description
          court_level: caseItem.case_type || '', // Map case_type to court_level for frontend
          status: caseItem.status || 'draft', // Use status field
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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