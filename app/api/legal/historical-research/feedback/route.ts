import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { documentId, documentTitle, feedback, caseId, caseContext } = await request.json();

    if (!documentId || !documentTitle || !feedback) {
      return NextResponse.json(
        { error: 'Document ID, title, and feedback are required' },
        { status: 400 }
      );
    }

    console.log(`📝 Document feedback received: ${documentTitle} marked as ${feedback}`);
    console.log(`📋 Case context: ${caseContext}`);
    console.log(`🆔 Case ID: ${caseId}`);

    // TODO: Store feedback in database for machine learning
    // This will help Claude learn which documents are actually relevant
    // For now, we'll just log the feedback
    
    const feedbackData = {
      documentId,
      documentTitle,
      feedback,
      caseId,
      caseContext,
      timestamp: new Date().toISOString(),
      // Add any additional metadata for learning
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    };

    // In a real implementation, store this in a database
    // await storeFeedbackInDatabase(feedbackData);
    
    console.log('💾 Feedback logged for future AI training:', feedbackData);

    return NextResponse.json({
      success: true,
      message: `Document "${documentTitle}" marked as ${feedback}`,
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
