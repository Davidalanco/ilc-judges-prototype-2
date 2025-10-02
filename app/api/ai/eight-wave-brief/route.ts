import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import '@/types/auth';

// POST /api/ai/eight-wave-brief - Start 8-wave background brief generation
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, config } = await request.json();

    if (!caseId) {
      return NextResponse.json({ 
        error: 'Case ID is required' 
      }, { status: 400 });
    }

    console.log(`🚀 Starting 8-wave brief generation for case: ${caseId}`);

    // Verify user owns the case
    const caseData = await db.getCaseById(caseId);
    if (!caseData || caseData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Case not found or unauthorized' }, { status: 403 });
    }

    // Create the job record
    const job = await db.createBriefGenerationJob({
      case_id: caseId,
      config: {
        targetWordCount: 6000,
        aggressiveInclusion: true,
        modelPreference: 'gemini-2.5',
        ...config
      }
    });

    console.log(`✅ Created brief generation job: ${job.id}`);

    // Start processing waves in the background (non-blocking)
    processWavesInBackground(job.id, caseId, session.user.id).catch(error => {
      console.error(`❌ Background processing failed for job ${job.id}:`, error);
      // Update job status to failed
      db.updateBriefGenerationJob(job.id, {
        job_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      });
    });

    return NextResponse.json({
      success: true,
      message: '8-wave brief generation started in background',
      jobId: job.id,
      status: 'queued',
      estimatedCompletionMinutes: 15,
      wavesTotal: 8
    });

  } catch (error) {
    console.error('Error starting 8-wave brief generation:', error);
    return NextResponse.json(
      { error: 'Failed to start brief generation' },
      { status: 500 }
    );
  }
}

// GET /api/ai/eight-wave-brief?jobId=xxx - Get job status and progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const caseId = searchParams.get('caseId');

    if (!jobId && !caseId) {
      return NextResponse.json({ 
        error: 'Either jobId or caseId is required' 
      }, { status: 400 });
    }

    let jobs;
    if (jobId) {
      const job = await db.getBriefGenerationJob(jobId);
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      jobs = [job];
    } else {
      jobs = await db.getBriefGenerationJobsByCase(caseId!);
    }

    // Get logs for the job(s)
    const jobsWithLogs = await Promise.all(jobs.map(async (job) => {
      const logs = await db.getWaveLogsByJob(job.id);
      return {
        ...job,
        logs: logs
      };
    }));

    return NextResponse.json({
      success: true,
      jobs: jobsWithLogs
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processWavesInBackground(jobId: string, caseId: string, userId: string) {
  console.log(`🔄 Starting background processing for job ${jobId}`);

  try {
    // Update job status to in_progress
    await db.updateBriefGenerationJob(jobId, {
      job_status: 'in_progress'
    });

    // Load all necessary data once
    const contextData = await gatherAllContextData(caseId);
    
    console.log('📊 Context data gathered:', {
      caseInfo: !!contextData.caseInformation,
      documents: contextData.selectedDocuments?.length || 0,
      summaries: contextData.documentSummaries?.length || 0,
      strategyChatMessages: contextData.strategyChatHistory?.length || 0,
      historicalItems: (contextData.historicalResearch?.foundingDocuments?.length || 0) +
                      (contextData.historicalResearch?.historicalCases?.length || 0) +
                      (contextData.historicalResearch?.colonialExamples?.length || 0)
    });

    // Process each wave sequentially
    let currentBrief = null;
    let finalBriefId = null;
    
    for (let waveNumber = 1; waveNumber <= 8; waveNumber++) {
      const waveResult = await processWave(jobId, waveNumber, contextData, currentBrief);
      
      // Get updated brief for next wave
      if (waveResult && waveResult.briefId) {
        finalBriefId = waveResult.briefId;
        currentBrief = await db.getBriefById(waveResult.briefId);
      }
    }

    // Mark job as completed with final brief ID
    await db.updateBriefGenerationJob(jobId, {
      job_status: 'completed',
      completed_at: new Date().toISOString(),
      final_brief_id: finalBriefId,
      final_word_count: currentBrief?.word_count || 0
    });

    console.log(`✅ Completed 8-wave processing for job ${jobId}`);

  } catch (error) {
    console.error(`❌ Error in wave processing for job ${jobId}:`, error);
    
    await db.updateBriefGenerationJob(jobId, {
      job_status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    });

    throw error;
  }
}

async function gatherAllContextData(caseId: string) {
  // Get case information
  const caseData = await db.getCaseById(caseId);
  
  // Get attorney conversation (initial discussion)
  const conversations = await db.getConversationsByCase(caseId);
  const initialDiscussion = conversations.find(c => c.transcription_text);

  // Get strategy chat
  const researchResults = await db.getResearchResultsByCase(caseId);
  const strategyChatResult = researchResults?.find(r => r.result_type === 'strategy_chat');
  const strategyChatHistory = strategyChatResult?.results?.messages || [];

  // Get approved outline
  const approvedOutlineResult = researchResults?.find(r => r.result_type === 'approved_outline');
  const approvedOutline = approvedOutlineResult?.results;

  // Get justice analysis
  const justiceAnalysisResult = researchResults?.find(r => r.result_type === 'justice_analysis');
  const justiceAnalysis = justiceAnalysisResult?.results;

  // Get historical research
  const historicalResearchResult = researchResults?.find(r => r.result_type === 'historical_research');
  const historicalResearch = historicalResearchResult?.results;

  // Get selected documents
  const selectedDocuments = await db.getLegalDocumentsByCase(caseId);
  const selectedDocsWithContent = selectedDocuments
    .filter(doc => doc.is_selected)
    .map(doc => ({
      id: doc.id,
      title: doc.case_title,
      content: (doc as any).full_text || '',
      citation: doc.citation,
      relevance: doc.relevance_score,
      type: doc.document_type,
      fileName: doc.case_title,
      source: doc.source_system,
      url: doc.download_url
    }));

  // Get document summaries
  const documentSummaries = await Promise.all(
    selectedDocsWithContent.map(async (doc) => {
      const summary = await db.getDocumentSummary(doc.id);
      return summary;
    })
  );

  // Get reference brief (if any)
  const briefReferences = researchResults?.find(r => r.result_type === 'brief_references');
  const referenceBrief = briefReferences?.results;

  return {
    caseInformation: {
      caseId: caseId,
      caseName: caseData?.case_name,
      courtLevel: caseData?.case_type,
      constitutionalQuestion: caseData?.constitutional_question,
      transcript: initialDiscussion?.transcription_text,
      transcription: initialDiscussion?.transcription_text
    },
    selectedDocuments: selectedDocsWithContent,
    documentSummaries: documentSummaries.filter(Boolean),
    justiceAnalysis,
    historicalResearch,
    referenceBrief,
    strategyChatHistory,
    approvedOutline
  };
}

async function processWave(
  jobId: string, 
  waveNumber: number, 
  contextData: any, 
  currentBrief: any = null
): Promise<any> {
  const waveNames = {
    1: 'Backbone Draft',
    2: 'Historical Integration', 
    3: 'Document Integration',
    4: 'Justice Targeting',
    5: 'Adversarial Analysis',
    6: 'Style Conformance',
    7: 'Bluebook & Citations',
    8: 'Final Consolidation'
  };

  const waveName = waveNames[waveNumber as keyof typeof waveNames];
  const startTime = new Date().toISOString();

  console.log(`🌊 Starting Wave ${waveNumber}: ${waveName}`);

  try {
    // Update wave status to running
    await db.updateBriefGenerationJobWave(jobId, waveNumber, {
      status: 'running',
      timestamp: startTime
    });

    // Log wave start
    await db.createWaveLog({
      job_id: jobId,
      wave_number: waveNumber,
      wave_name: waveName,
      log_level: 'info',
      message: `Starting ${waveName}`,
      metadata: { startTime }
    });

    // Process the specific wave
    const waveResult = await executeWaveLogic(waveNumber, contextData, currentBrief, jobId);

    // Update wave status to completed
    await db.updateBriefGenerationJobWave(jobId, waveNumber, {
      status: 'completed',
      artifacts: waveResult,
      timestamp: new Date().toISOString()
    });

    // Log completion
    await db.createWaveLog({
      job_id: jobId,
      wave_number: waveNumber,
      wave_name: waveName,
      log_level: 'info',
      message: `Completed ${waveName}`,
      metadata: { 
        endTime: new Date().toISOString(),
        wordCount: waveResult.wordCount,
        citationsAdded: waveResult.citationsAdded || 0,
        sourcesUsed: waveResult.sourcesUsed || []
      }
    });

    console.log(`✅ Completed Wave ${waveNumber}: ${waveName}`);
    return waveResult;

  } catch (error) {
    console.error(`❌ Error in Wave ${waveNumber}: ${waveName}`, error);

    // Update wave status to failed
    await db.updateBriefGenerationJobWave(jobId, waveNumber, {
      status: 'failed',
      timestamp: new Date().toISOString()
    });

    // Log error
    await db.createWaveLog({
      job_id: jobId,
      wave_number: waveNumber,
      wave_name: waveName,
      log_level: 'error',
      message: `Failed ${waveName}: ${error.message}`,
      metadata: { error: error.message }
    });

    throw error;
  }
}

async function executeWaveLogic(
  waveNumber: number, 
  contextData: any, 
  currentBrief: any, 
  jobId: string
): Promise<any> {
  const { executeWave } = await import('@/lib/ai/eight-wave-processor');
  
  try {
    const result = await executeWave(waveNumber, contextData, currentBrief, jobId);
    
    // Log detailed wave results
    await db.createWaveLog({
      job_id: jobId,
      wave_number: waveNumber,
      wave_name: result.waveName,
      log_level: 'info',
      message: `Wave completed successfully`,
      metadata: {
        wordCount: result.wordCount,
        citationsAdded: result.citationsAdded,
        sourcesUsed: result.sourcesUsed,
        sourceMap: result.sourceMap
      }
    });

    // Log each individual log message from the wave
    for (const logMessage of result.logs) {
      await db.createWaveLog({
        job_id: jobId,
        wave_number: waveNumber,
        wave_name: result.waveName,
        log_level: 'debug',
        message: logMessage,
        metadata: {}
      });
    }

    // Log AI thoughts if available
    if (result.thoughts) {
      for (const thought of result.thoughts) {
        await db.createWaveLog({
          job_id: jobId,
          wave_number: waveNumber,
          wave_name: result.waveName,
          log_level: 'info',
          message: `[THOUGHT] ${thought.thought}`,
          metadata: {
            thoughtType: thought.type,
            mood: thought.mood,
            details: thought.details,
            timestamp: thought.timestamp
          }
        });
      }
    }

    return result;
    
  } catch (error) {
    await db.createWaveLog({
      job_id: jobId,
      wave_number: waveNumber,
      wave_name: `Wave ${waveNumber}`,
      log_level: 'error',
      message: `Wave execution failed: ${error.message}`,
      metadata: { error: error.stack }
    });
    
    throw error;
  }
}
