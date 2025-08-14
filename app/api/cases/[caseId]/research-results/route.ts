import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cases/[caseId]/research-results
// Retrieve all research results for a case
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

    console.log(`📋 Loading research results for case: ${caseId}`);

    // Get all research results for this case
    const researchResults = await db.getResearchResultsByCase(caseId);

    console.log(`✅ Found ${researchResults.length} research results for case ${caseId}`);

    return NextResponse.json({
      success: true,
      caseId,
      researchResults,
      total: researchResults.length
    });

  } catch (error) {
    console.error('Research results retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve research results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
