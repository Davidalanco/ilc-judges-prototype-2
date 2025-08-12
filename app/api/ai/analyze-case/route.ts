import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalTranscript, enhanceCaseAnalysis } from '@/lib/ai/case-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, existingAnalysis } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required and must be a string' },
        { status: 400 }
      );
    }

    if (transcript.length < 50) {
      return NextResponse.json(
        { error: 'Transcript too short for meaningful analysis' },
        { status: 400 }
      );
    }

    console.log('🤖 Starting AI case analysis for transcript length:', transcript.length);

    let analysis;
    
    if (existingAnalysis) {
      // Enhance existing analysis
      console.log('🔍 Enhancing existing case analysis');
      analysis = await enhanceCaseAnalysis(transcript, existingAnalysis);
    } else {
      // Fresh analysis
      console.log('🆕 Performing fresh case analysis');
      analysis = await analyzeLegalTranscript(transcript);
    }

    console.log('✅ Case analysis completed with confidence:', analysis.confidence);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      transcriptLength: transcript.length
    });

  } catch (error) {
    console.error('❌ Error in case analysis API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze case transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AI Case Analysis API',
    endpoints: {
      POST: 'Analyze legal transcript and extract case information',
    },
    requiredFields: {
      transcript: 'string - The legal transcript to analyze',
      existingAnalysis: 'object - Optional existing analysis to enhance'
    }
  });
}
