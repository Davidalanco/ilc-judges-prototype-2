import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateChatResponse } from '@/lib/ai/openai';
import { db } from '@/lib/db';
import '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, sectionId, message, sectionContent } = await request.json();

    if (!caseId || !sectionId || !message) {
      return NextResponse.json({ 
        error: 'Case ID, section ID, and message are required' 
      }, { status: 400 });
    }

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Save user message to database
    await db.addBriefSectionChat({
      case_id: caseId,
      section_id: sectionId,
      role: 'user',
      content: message
    });

    // Generate AI response
    const aiResponse = await generateChatResponse(sectionId, message, caseData, sectionContent);

    // Save AI response to database
    await db.addBriefSectionChat({
      case_id: caseId,
      section_id: sectionId,
      role: 'assistant',
      content: aiResponse
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      message: 'Chat response generated successfully'
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat response' },
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

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const sectionId = searchParams.get('sectionId');

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID required' }, { status: 400 });
    }

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Get chat history
    const chats = await db.getBriefSectionChats(caseId, sectionId || undefined);

    if (sectionId) {
      // Return chats for specific section
      return NextResponse.json({
        success: true,
        chats: chats
      });
    } else {
      // Return all chats grouped by section
      const chatsBySectionId = chats.reduce((acc, chat) => {
        if (!acc[chat.section_id]) {
          acc[chat.section_id] = [];
        }
        acc[chat.section_id].push(chat);
        return acc;
      }, {} as Record<string, any[]>);

      return NextResponse.json({
        success: true,
        chatsBySectionId
      });
    }

  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    );
  }
} 