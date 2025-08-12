import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('🧪 Testing Supabase database connection...');
    
    // Test basic connection by trying to get user profiles
    const justices = await db.getJusticeProfiles();
    
    // Test conversation creation (with a proper UUID format)
    const testCaseId = crypto.randomUUID();
    
    try {
      const testConversation = await db.createConversation({
        case_id: testCaseId,
        file_name: 'test-file.m4a',
        file_size: 1024,
        file_type: 'audio/m4a',
        s3_url: 'test://url',
        duration_seconds: 60
      });
      
      console.log('✅ Test conversation created:', testConversation.id);
      
      // Clean up test data
      // Note: We don't have a delete method, so this will remain in the database
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and operations successful',
        justicesCount: justices.length,
        testConversationId: testConversation.id,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database operations failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        justicesCount: justices.length,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
