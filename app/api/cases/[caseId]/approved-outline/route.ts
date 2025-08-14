import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

// POST /api/cases/[caseId]/approved-outline
// Save approved brief outline for a case
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const { outline } = await request.json();

    if (!caseId || !outline) {
      return NextResponse.json(
        { error: 'Case ID and outline are required' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving approved outline for case ${caseId}`);

    // Check if there's already an approved outline for this case
    const existingResults = await db.getResearchResultsByCase(caseId);
    const existingOutline = existingResults?.find(r => r.result_type === 'approved_outline');

    let savedOutline;
    if (existingOutline) {
      // Update existing outline (using manual update since we don't have an update function)
      const { data, error } = await supabase
        .from('research_results')
        .update({
          results: outline,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingOutline.id)
        .select()
        .single();
        
      if (error) throw error;
      savedOutline = data;
    } else {
      // Create new outline
      savedOutline = await db.createResearchResult({
        case_id: caseId,
        search_query: 'Approved Brief Outline',
        result_type: 'approved_outline',
        results: outline
      });
    }

    return NextResponse.json({
      success: true,
      outlineId: savedOutline.id,
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Approved outline save error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to save approved outline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/cases/[caseId]/approved-outline
// Load approved brief outline for a case
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

    console.log(`📋 Fetching approved outline for case: ${caseId}`);
    
    // Use db.getResearchResultsByCase to find the approved outline
    const researchResults = await db.getResearchResultsByCase(caseId);
    const approvedOutline = researchResults?.find(r => r.result_type === 'approved_outline');

    if (approvedOutline && approvedOutline.results) {
      return NextResponse.json({
        success: true,
        outline: approvedOutline.results,
        savedAt: approvedOutline.created_at
      });
    } else {
      return NextResponse.json({
        message: 'No approved outline found for this case',
        outline: null
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Approved outline fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch approved outline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
