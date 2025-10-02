import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json();
    
    // Test data with simple structure
    const testAnalysis = {
      conservativeJustices: [
        {
          name: "Justice Samuel A. Alito Jr.",
          alignment: 95,
          keyFactors: ["test factor"],
          strategy: "test strategy",
          confidence: "high",
          riskLevel: "low",
          caseSpecificAnalysis: "test analysis",
          historicalVotes: ["test case"]
        }
      ],
      liberalJustices: [],
      swingVotes: [],
      overallStrategy: {
        primaryApproach: "test approach"
      }
    };
    
    // Try to save the analysis
    await db.saveClaudeJusticeAnalysis(caseId, testAnalysis);
    
    return NextResponse.json({
      success: true,
      message: 'Test save successful'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
