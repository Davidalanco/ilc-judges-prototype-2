import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db, supabase } from '@/lib/db';
import '@/types/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = params;

    // Get the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check if user owns the case
    if (caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get related data
    const conversations = await db.getConversationsByCase(caseId);
    const justiceAnalysis = await db.getJusticeCaseAnalysis(caseId);
    
    // Get brief section chats
    const briefChats = await db.getBriefSectionChats(caseId);
    
    // Group chats by section
    const chatsBySectionId = briefChats.reduce((acc, chat) => {
      if (!acc[chat.section_id]) {
        acc[chat.section_id] = [];
      }
      acc[chat.section_id].push(chat);
      return acc;
    }, {} as Record<string, any[]>);

    // Map case_type to court_level for frontend compatibility
    const mappedCaseData = {
      ...caseData,
      court_level: caseData.case_type || '' // Map case_type to court_level
    };

    return NextResponse.json({
      success: true,
      case: mappedCaseData,
      conversations,
      justiceAnalysis,
      briefChats: chatsBySectionId
    });

  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = params;
    const updates = await request.json();

    // Get the case first to verify ownership
    const caseData = await db.getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Map court_level to case_type for database storage
    const dbUpdates = { ...updates };
    if (updates.court_level !== undefined) {
      dbUpdates.case_type = updates.court_level;
      delete dbUpdates.court_level; // Remove so it doesn't cause errors
    }

    // Update the case
    const updatedCase = await db.updateCase(caseId, dbUpdates);

    // Map case_type back to court_level for response
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
    console.error('Update case error:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = params;

    // Get the case first to verify ownership
    const caseData = await db.getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the case using Supabase client (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId);
      
    if (deleteError) {
      console.error('Error deleting case:', deleteError);
      return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
    }

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