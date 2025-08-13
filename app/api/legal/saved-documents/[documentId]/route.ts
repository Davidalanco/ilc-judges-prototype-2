import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for direct operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE /api/legal/saved-documents/[documentId]
// Delete a saved legal document and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting saved document: ${documentId}`);

    // First, get the document to verify it exists
    const document = await db.getLegalDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete related records in order (foreign key constraints)
    
    // 1. Delete research notes for this document
    const { error: notesError } = await supabase
      .from('research_notes')
      .delete()
      .eq('document_id', documentId);

    if (notesError) {
      console.error('Error deleting document notes:', notesError);
      return NextResponse.json({
        error: 'Failed to delete document notes',
        details: notesError.message
      }, { status: 500 });
    }

    // 2. Delete document summaries
    const { error: summariesError } = await supabase
      .from('document_summaries')
      .delete()
      .eq('document_id', documentId);

    if (summariesError) {
      console.error('Error deleting document summaries:', summariesError);
      return NextResponse.json({
        error: 'Failed to delete document summaries',
        details: summariesError.message
      }, { status: 500 });
    }

    // 3. Delete the main legal document record
    const { error: documentError } = await supabase
      .from('legal_documents')
      .delete()
      .eq('id', documentId);

    if (documentError) {
      console.error('Error deleting legal document:', documentError);
      return NextResponse.json({
        error: 'Failed to delete document',
        details: documentError.message
      }, { status: 500 });
    }

    console.log(`✅ Successfully deleted document: ${document.case_title}`);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      deletedDocument: {
        id: documentId,
        title: document.case_title
      }
    });

  } catch (error) {
    console.error('Delete saved document error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/legal/saved-documents/[documentId]
// Get a specific saved document with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    console.log(`📄 Fetching document: ${documentId}`);

    // Get the legal document
    const document = await db.getLegalDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get AI summary
    const summary = await db.getDocumentSummary(document.id, 'detailed');
    
    // Get user notes for this document
    const notes = await db.getResearchNotesByCase(document.case_id);
    const documentNotes = notes.filter(note => note.document_id === document.id);

    // Extract full text and complete API data from the parties field
    const fullText = document.parties?.full_text || '';
    const fullTextPreview = document.parties?.preview || '';
    const hasCompleteCache = document.parties?.complete_cache || false;
    
    const documentWithDetails = {
      ...document,
      aiSummary: summary,
      userNotes: documentNotes,
      hasAiAnalysis: !!summary,
      noteCount: documentNotes.length,
      fullText: fullText,
      textPreview: fullTextPreview,
      hasFullText: !!(fullText && fullText.length > 100),
      completeApiData: hasCompleteCache ? {
        complete_cache: true,
        search_result: document.parties?.search_result,
        cluster_data: document.parties?.cluster_data,
        opinion_data: document.parties?.opinion_data,
        docket_data: document.parties?.docket_data,
        html_content: document.parties?.html_content,
        html_with_citations: document.parties?.html_with_citations,
        xml_content: document.parties?.xml_content,
        court_info: document.parties?.court_info,
        judges_info: document.parties?.judges_info,
        cited_cases: document.parties?.cited_cases,
        citation_count: document.parties?.citation_count,
        precedential_status: document.parties?.precedential_status,
        page_count: document.parties?.page_count,
        api_fetch_timestamp: document.parties?.api_fetch_timestamp
      } : undefined
    };

    return NextResponse.json({
      success: true,
      document: documentWithDetails
    });

  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
