import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import '@/types/auth';

// GET /api/briefs - Get briefs for a case
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    console.log(`📋 Fetching briefs for case: ${caseId}`);

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Get all briefs for this case
    const briefs = await db.getBriefsByCase(caseId);

    return NextResponse.json({
      success: true,
      briefs: briefs || []
    });

  } catch (error) {
    console.error('Error fetching briefs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}

// POST /api/briefs - Create a new brief
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, sections, metadata } = await request.json();

    if (!caseId || !sections) {
      return NextResponse.json({ 
        error: 'Case ID and sections are required' 
      }, { status: 400 });
    }

    console.log(`📝 Creating new brief for case: ${caseId}`);

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Prepare brief data
    const briefData = {
      case_id: caseId,
      sections: JSON.stringify(sections),
      content: sections.map((s: any) => s.content).join('\n\n'),
      status: metadata?.status || 'draft',
      version: 1,
      word_count: metadata?.totalWordCount || 0,
      persuasion_scores: metadata?.overallPersuasionScore ? JSON.stringify({
        overall: metadata.overallPersuasionScore,
        lastUpdated: new Date().toISOString()
      }) : null,
      custom_sections: null
    };

    // Create brief in database
    const savedBrief = await db.createBrief(briefData);

    console.log(`✅ Brief created with ID: ${savedBrief.id}`);

    return NextResponse.json({
      success: true,
      message: 'Brief created successfully',
      brief: savedBrief
    });

  } catch (error) {
    console.error('Error creating brief:', error);
    return NextResponse.json(
      { error: 'Failed to create brief' },
      { status: 500 }
    );
  }
}

// PUT /api/briefs - Update an existing brief
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, caseId, sections, metadata } = await request.json();

    if (!id || !caseId || !sections) {
      return NextResponse.json({ 
        error: 'Brief ID, case ID, and sections are required' 
      }, { status: 400 });
    }

    console.log(`📝 Updating brief: ${id}`);

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Prepare update data
    const updateData = {
      sections: JSON.stringify(sections),
      content: sections.map((s: any) => s.content).join('\n\n'),
      status: metadata?.status || 'draft',
      word_count: metadata?.totalWordCount || 0,
      persuasion_scores: metadata?.overallPersuasionScore ? JSON.stringify({
        overall: metadata.overallPersuasionScore,
        lastUpdated: new Date().toISOString()
      }) : null,
      updated_at: new Date().toISOString()
    };

    // Update brief in database
    const updatedBrief = await db.updateBrief(id, updateData);

    console.log(`✅ Brief updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Brief updated successfully',
      brief: updatedBrief
    });

  } catch (error) {
    console.error('Error updating brief:', error);
    return NextResponse.json(
      { error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}
