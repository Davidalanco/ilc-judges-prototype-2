import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { briefId: string } }
) {
  try {
    const briefId = params.briefId;

    if (!briefId) {
      return NextResponse.json(
        { error: 'Brief ID is required' },
        { status: 400 }
      );
    }

    const brief = await db.getBriefById(briefId);

    if (!brief) {
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      brief
    });

  } catch (error) {
    console.error('Error fetching brief:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    );
  }
}
