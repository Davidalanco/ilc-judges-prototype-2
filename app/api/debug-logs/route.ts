import { NextResponse } from 'next/server';
import { debugLogger } from '@/lib/debug-logger';

export async function GET() {
  try {
    const logs = debugLogger.getAllLogs();
    const summary = debugLogger.getSummary();
    
    return NextResponse.json({
      success: true,
      summary,
      logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    debugLogger.clearLogs();
    
    return NextResponse.json({
      success: true,
      message: 'Logs cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
