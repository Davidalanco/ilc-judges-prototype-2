import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/ai/eight-wave-brief/thoughts?jobId=xxx
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

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

    // Get thought logs (logs with [THOUGHT] prefix)
    const allLogs = await db.getWaveLogsByJob(jobId);
    const thoughtLogs = allLogs.filter(log => log.message.startsWith('[THOUGHT]'));

    // Transform logs into thought format
    const thoughts = thoughtLogs.map(log => ({
      id: log.id,
      timestamp: log.created_at,
      type: log.metadata?.thoughtType || 'thinking',
      wave: log.wave_number,
      waveName: log.wave_name,
      thought: log.message.replace('[THOUGHT] ', ''),
      details: log.metadata?.details,
      mood: log.metadata?.mood || 'focused'
    }));

    return NextResponse.json({
      success: true,
      thoughts,
      jobId,
      jobStatus: job.job_status,
      currentWave: job.current_wave
    });

  } catch (error) {
    console.error('Error fetching AI thoughts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI thoughts' },
      { status: 500 }
    );
  }
}
