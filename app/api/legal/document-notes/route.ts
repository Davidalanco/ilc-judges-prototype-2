import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/legal/document-notes
// Add a note to a specific document
export async function POST(request: NextRequest) {
  try {
    const { documentId, caseId, userId, title, content, noteType, tags, quoteText } = await request.json();

    if (!documentId || !caseId || !userId || !content) {
      return NextResponse.json(
        { error: 'Document ID, case ID, user ID, and content are required' },
        { status: 400 }
      );
    }

    console.log(`Adding note to document: ${documentId}`);

    // Create the research note
    const note = await db.createResearchNote({
      user_id: userId,
      case_id: caseId,
      document_id: documentId,
      research_session_id: '', // We'll get this from the document if needed
      note_type: noteType || 'general',
      title: title || 'Document Note',
      content: content,
      tags: tags || [],
      page_references: [], // Can be added later
      quote_text: quoteText || null
    });

    return NextResponse.json({
      success: true,
      note: note,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/legal/document-notes?documentId=xxx
// Get all notes for a specific document
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const caseId = searchParams.get('caseId');

    if (!documentId && !caseId) {
      return NextResponse.json(
        { error: 'Either document ID or case ID is required' },
        { status: 400 }
      );
    }

    let notes;
    if (documentId) {
      // Get notes for specific document
      const allNotes = await db.getResearchNotesByCase(caseId || 'dummy');
      notes = allNotes.filter(note => note.document_id === documentId);
    } else {
      // Get all notes for case
      notes = await db.getResearchNotesByCase(caseId || 'dummy');
    }

    return NextResponse.json({
      success: true,
      notes: notes,
      count: notes.length
    });

  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/legal/document-notes
// Update an existing note
export async function PUT(request: NextRequest) {
  try {
    const { noteId, title, content, tags, quoteText } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    if (quoteText !== undefined) updates.quote_text = quoteText;

    const updatedNote = await db.updateResearchNote(noteId, updates);

    return NextResponse.json({
      success: true,
      note: updatedNote,
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('Note update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
