import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import '@/types/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
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

    return NextResponse.json({
      success: true,
      case: caseData,
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
    const session = await getServerSession();
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

    // Update the case
    const updatedCase = await db.updateCase(caseId, updates);

    return NextResponse.json({
      success: true,
      case: updatedCase,
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
    const session = await getServerSession();
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

    // Delete the case (CASCADE will handle related records)
    await db.query('DELETE FROM cases WHERE id = $1', [caseId]);

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