import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create Supabase client for file upload
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/legal/upload-document
// Upload a legal document file and save metadata to database
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const documentType = formData.get('documentType') as string;
    const customTitle = formData.get('customTitle') as string;
    const description = formData.get('description') as string;

    // Use session user ID directly for security
    const userId = session.user.id;

    console.log(`📁 [UploadDocument] Starting upload for user ${userId}, case ${caseId}`);
    console.log(`📁 File: ${file?.name}, Type: ${documentType}, Title: ${customTitle}`);

    // Validate required fields
    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/rtf',
      'application/rtf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 50MB.` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const fileName = `${timestamp}_${uniqueId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = caseId 
      ? `${userId}/${caseId}/documents/${fileName}`
      : `${userId}/example-briefs/${fileName}`;

    console.log(`📁 [UploadDocument] Uploading to Supabase storage: ${filePath}`);

    // Upload file to Supabase storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('legal-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          caseId: caseId,
          documentType: documentType,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });

    if (uploadError) {
      console.error('❌ [UploadDocument] Storage upload failed:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ [UploadDocument] File uploaded to storage: ${uploadData.path}`);

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('legal-documents')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Insert document record into database
    const { data: documentData, error: dbError } = await supabase
      .from('legal_documents')
      .insert({
        case_id: caseId || null, // Allow null for example briefs
        document_type: documentType,
        case_title: customTitle || file.name,
        citation: customTitle || file.name, // Use title as citation for uploaded docs
        source_system: 'user_upload',
        has_plain_text: file.type === 'text/plain',
        local_file_path: filePath,
        download_url: publicUrl,
        page_count: null, // Will be extracted later if needed
        relevance_score: 1.0, // User uploads are highly relevant
        search_query: description || '',
        authors: [],
        legal_issues: [],
        parties: {},
        external_id: uniqueId,
        is_selected: documentType !== 'example_brief' // Don't auto-select example briefs
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ [UploadDocument] Database insert failed:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('legal-documents').remove([filePath]);
      
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ [UploadDocument] Document record created: ${documentData.id}`);

    // Extract text content for AI analysis (for supported file types)
    let extractedText = null;
    if (file.type === 'text/plain') {
      extractedText = await file.text();
    }
    // TODO: Add PDF text extraction using pdf-parse or similar library
    // TODO: Add Word document text extraction

    // Create document summary record if we have text
    if (extractedText) {
      try {
        const { error: summaryError } = await supabase
          .from('document_summaries')
          .insert({
            document_id: documentData.id,
            ai_summary: '', // Will be generated by AI later
            key_points: [],
            legal_standard: '',
            disposition: '',
            notable_quotes: [],
            cited_cases: [],
            holding: '',
            reasoning: '',
            precedent_value: '',
            confidence_score: 0
          });

        if (summaryError) {
          console.warn('⚠️ [UploadDocument] Failed to create summary record:', summaryError);
        }
      } catch (summaryErr) {
        console.warn('⚠️ [UploadDocument] Summary creation failed:', summaryErr);
      }
    }

    // Return success response
    const response = {
      success: true,
      document: {
        id: documentData.id,
        fileName: file.name,
        filePath: filePath,
        publicUrl: publicUrl,
        documentType: documentType,
        title: customTitle || file.name,
        description: description,
        fileSize: file.size,
        fileType: file.type,
        hasText: !!extractedText
      },
      message: `Document "${customTitle || file.name}" uploaded successfully`
    };

    console.log(`✅ [UploadDocument] Upload completed successfully for document: ${documentData.id}`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [UploadDocument] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
