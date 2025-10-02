import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for direct operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cases/[caseId]/strategy-chat
// Retrieve strategy chat history for a case
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    console.log(`💬 Loading strategy chat for case: ${caseId}`);

    // Get strategy chat from research_results table with type 'strategy_chat'
    const { data: chatResults, error } = await supabase
      .from('research_results')
      .select('*')
      .eq('case_id', caseId)
      .eq('result_type', 'strategy_chat')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error loading strategy chat:', error);
      return NextResponse.json(
        { error: 'Failed to load strategy chat' },
        { status: 500 }
      );
    }

    // Extract chat history from results
    let chatHistory: any[] = [];
    if (chatResults && chatResults.length > 0) {
      // Get the most recent chat session
      const latestChat = chatResults[chatResults.length - 1];
      chatHistory = latestChat.results?.messages || [];
    }

    console.log(`✅ Loaded ${chatHistory.length} strategy chat messages for case ${caseId}`);

    return NextResponse.json({
      success: true,
      caseId,
      chatHistory,
      messageCount: chatHistory.length
    });

  } catch (error) {
    console.error('Strategy chat retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve strategy chat',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cases/[caseId]/strategy-chat
// Save strategy chat history for a case
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const { chatHistory } = await request.json();

    if (!caseId || !chatHistory) {
      return NextResponse.json(
        { error: 'Case ID and chat history are required' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving strategy chat for case: ${caseId} (${chatHistory.length} messages)`);

    // Check if there's already a strategy chat record for this case
    const { data: existingChat, error: fetchError } = await supabase
      .from('research_results')
      .select('id')
      .eq('case_id', caseId)
      .eq('result_type', 'strategy_chat')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error checking existing strategy chat:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check existing chat' },
        { status: 500 }
      );
    }

    const chatData = {
      messages: chatHistory,
      savedAt: new Date().toISOString(),
      messageCount: chatHistory.length
    };

    let result;
    if (existingChat && existingChat.length > 0) {
      // Update existing chat
      const { data, error } = await supabase
        .from('research_results')
        .update({
          results: chatData,
          search_query: `Strategy chat session - ${chatHistory.length} messages`
        })
        .eq('id', existingChat[0].id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating strategy chat:', error);
        return NextResponse.json(
          { error: 'Failed to update strategy chat' },
          { status: 500 }
        );
      }
      result = data;
      console.log(`✅ Updated strategy chat record: ${result.id}`);
    } else {
      // Create new chat record
      const { data, error } = await supabase
        .from('research_results')
        .insert({
          case_id: caseId,
          result_type: 'strategy_chat',
          search_query: `Strategy chat session - ${chatHistory.length} messages`,
          results: chatData
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating strategy chat:', error);
        return NextResponse.json(
          { error: 'Failed to save strategy chat' },
          { status: 500 }
        );
      }
      result = data;
      console.log(`✅ Created new strategy chat record: ${result.id}`);
    }

    return NextResponse.json({
      success: true,
      chatId: result.id,
      messageCount: chatHistory.length,
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Strategy chat save error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to save strategy chat',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[caseId]/strategy-chat
// Clear strategy chat history for a case
export async function DELETE(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Clearing strategy chat for case: ${caseId}`);

    // Delete all strategy chat records for this case
    const { data: deletedRecords, error } = await supabase
      .from('research_results')
      .delete()
      .eq('case_id', caseId)
      .eq('result_type', 'strategy_chat')
      .select();

    if (error) {
      console.error('Database error clearing strategy chat:', error);
      return NextResponse.json(
        { error: 'Failed to clear strategy chat' },
        { status: 500 }
      );
    }

    const deletedCount = deletedRecords?.length || 0;
    console.log(`✅ Cleared ${deletedCount} strategy chat record(s) for case ${caseId}`);

    return NextResponse.json({
      success: true,
      caseId,
      deletedCount,
      clearedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Strategy chat clear error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to clear strategy chat',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
