import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for direct operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cases/[caseId]/brief-references
// Retrieve all reference briefs for a case
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

    console.log(`📋 Loading reference briefs for case: ${caseId}`);

    // Get all uploaded briefs/documents for this case that are example briefs
    const { data: briefReferences, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('case_id', caseId)
      .eq('document_type', 'example_brief')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error loading brief references:', error);
      return NextResponse.json(
        { error: 'Failed to load brief references' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${briefReferences?.length || 0} reference briefs for case ${caseId}`);

    return NextResponse.json({
      success: true,
      caseId,
      briefReferences: briefReferences || [],
      total: briefReferences?.length || 0
    });

  } catch (error) {
    console.error('Brief references retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve brief references',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cases/[caseId]/brief-references
// Save analyzed brief structure and metadata
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const { documentId, analyzedStructure, metadata } = await request.json();

    if (!caseId || !documentId) {
      return NextResponse.json(
        { error: 'Case ID and document ID are required' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving analyzed brief structure for document: ${documentId} in case: ${caseId}`);

    // Update the legal_document record with the analyzed structure
    const { data: updatedDoc, error } = await supabase
      .from('legal_documents')
      .update({
        // Store the analyzed structure in the legal_issues field as JSON
        legal_issues: analyzedStructure?.sections || [],
        // Store metadata in parties field
        parties: {
          ...metadata,
          analyzedAt: new Date().toISOString(),
          briefType: metadata?.briefType || 'amicus'
        }
      })
      .eq('id', documentId)
      .eq('case_id', caseId)
      .select()
      .single();

    if (error) {
      console.error('Database error saving brief structure:', error);
      return NextResponse.json(
        { error: 'Failed to save brief structure' },
        { status: 500 }
      );
    }

    console.log(`✅ Saved analyzed brief structure for document: ${documentId}`);

    return NextResponse.json({
      success: true,
      documentId,
      updatedDocument: updatedDoc
    });

  } catch (error) {
    console.error('Brief structure save error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to save brief structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
