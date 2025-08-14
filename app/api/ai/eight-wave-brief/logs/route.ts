import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/ai/eight-wave-brief/logs?jobId=xxx&waveNumber=x
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const waveNumber = searchParams.get('waveNumber');

    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }

    // Verify job exists and user has access
    const job = await db.getBriefGenerationJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify user owns the case
    const caseData = await db.getCaseById(job.case_id);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to job' }, { status: 403 });
    }

    // Get logs
    let logs;
    if (waveNumber) {
      logs = await db.getWaveLogsByWave(jobId, parseInt(waveNumber));
    } else {
      logs = await db.getWaveLogsByJob(jobId);
    }

    return NextResponse.json({
      success: true,
      logs,
      jobId,
      waveNumber: waveNumber ? parseInt(waveNumber) : null
    });

  } catch (error) {
    console.error('Error fetching wave logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wave logs' },
      { status: 500 }
    );
  }
}
