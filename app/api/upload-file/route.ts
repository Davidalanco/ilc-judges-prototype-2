import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getFileUrl } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.webm'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `File type ${fileExtension} not allowed. Supported types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 400 });
    }

    // Generate file path
    const userId = 'demo-user'; // TODO: Get from actual authentication
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}_${sanitizedName}`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Determine correct MIME type for common audio formats
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = fileExtension.toLowerCase();
      switch (ext) {
        case '.mp3':
          mimeType = 'audio/mpeg';
          break;
        case '.wav':
          mimeType = 'audio/wav';
          break;
        case '.m4a':
          mimeType = 'audio/mp4';
          break;
        case '.mp4':
          mimeType = 'audio/mp4';
          break;
        case '.webm':
          mimeType = 'audio/webm';
          break;
        case '.ogg':
          mimeType = 'audio/ogg';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
    }

    // Upload to documents bucket which has more permissive MIME types
    const { data, error } = await uploadFile('documents', filePath, fileBuffer, {
      upsert: false,
      contentType: mimeType,
      metadata: { 
        mimetype: mimeType,
        size: file.size.toString(),
        originalName: file.name,
        fileType: 'audio'
      }
    });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}` 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = getFileUrl('documents', filePath);

    return NextResponse.json({
      success: true,
      fileData: {
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        filePath: filePath
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during upload' 
    }, { status: 500 });
  }
} 