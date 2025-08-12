import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use mock values if environment variables are not set (for development)
const mockUrl = 'https://mock.supabase.co'
const mockKey = 'mock-anon-key'

const finalUrl = supabaseUrl && supabaseUrl !== 'your-supabase-url' ? supabaseUrl : mockUrl;
const finalKey = supabaseKey && supabaseKey !== 'your-supabase-anon-key' ? supabaseKey : mockKey;
const finalServiceKey = supabaseServiceKey && supabaseServiceKey !== 'your-supabase-service-role-key' ? supabaseServiceKey : mockKey;

// Public client (for client-side operations)
export const supabase = createClient(finalUrl, finalKey)

// Service role client (for server-side operations)
export const supabaseAdmin = createClient(finalUrl, finalServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Check if we're using mock configuration
export const isUsingMockDatabase = finalUrl === mockUrl;

// Log warning if using mock configuration
if (isUsingMockDatabase) {
  console.warn('⚠️ Using mock Supabase configuration. Database operations will fail gracefully.');
}

// Storage helpers
export const uploadFile = async (
  bucket: 'audio-files' | 'documents' | 'exports',
  filePath: string,
  file: File | Buffer,
  options?: { upsert?: boolean; metadata?: Record<string, any>; contentType?: string }
) => {
  if (isUsingMockDatabase) {
    throw new Error('MOCK DATABASE DETECTED - Real Supabase connection required for file uploads');
  }

  try {
    // First, check if the bucket exists
    let bucketExists = false;
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      if (listError) {
        console.warn('Could not list buckets:', listError.message);
      } else {
        bucketExists = buckets?.some(b => b.name === bucket) || false;
      }
    } catch (listError) {
      console.warn('Bucket listing failed:', listError);
    }
    
    if (!bucketExists) {
      console.log(`Creating storage bucket '${bucket}'...`);
      try {
        const { data, error } = await supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 
            'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/flac',
            'video/mp4', 'video/mov', 'video/webm', 'video/quicktime',
            'application/octet-stream', 'text/*', 'image/*'
          ],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB (Supabase free tier limit)
        });
        
        if (error) {
          console.error('Bucket creation error:', error);
          // Don't crash - return error gracefully
          return { data: null, error: { message: `Bucket creation failed: ${error.message}` } };
        }
        
        console.log(`Storage bucket '${bucket}' created successfully`);
        
        // Wait a moment for the bucket to be fully available
        await new Promise(resolve => setTimeout(resolve, 2000));
        bucketExists = true;
      } catch (bucketError: any) {
        console.error('Bucket creation exception:', bucketError);
        // Don't crash - return error gracefully
        return { data: null, error: { message: `Bucket creation failed: ${bucketError.message}` } };
      }
    } else {
      console.log(`Storage bucket '${bucket}' already exists`);
    }

    // If bucket creation failed, don't proceed with upload
    if (!bucketExists) {
      return { data: null, error: { message: 'Storage bucket not available' } };
    }

    // Now try to upload the file
    const uploadOptions: any = {
      upsert: options?.upsert || false,
      metadata: options?.metadata
    };
    
    // Set content type if provided
    if (options?.contentType) {
      uploadOptions.contentType = options.contentType;
    }
    
    console.log(`Uploading file to bucket '${bucket}'...`);
    const result = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, uploadOptions);
    
    if (result.error) {
      console.error('Upload error:', result.error);
    } else {
      console.log('File uploaded successfully');
    }
    
    return result;
  } catch (error: any) {
    console.error('File upload error:', error);
    // Don't crash - return error gracefully
    return { data: null, error: { message: `Upload failed: ${error.message || error}` } };
  }
}

// REMOVED: uploadFileFallback function - no more fallbacks, show real errors

export const downloadFile = async (
  bucket: 'audio-files' | 'documents' | 'exports',
  filePath: string
) => {
  return await supabaseAdmin.storage
    .from(bucket)
    .download(filePath)
}

export const getFileUrl = (
  bucket: 'audio-files' | 'documents' | 'exports',
  filePath: string
) => {
  return supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath)
}

export const deleteFile = async (
  bucket: 'audio-files' | 'documents' | 'exports',
  filePath: string
) => {
  return await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath])
}

// Database types will be generated later
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          firm_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          firm_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          firm_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          user_id: string
          title: string
          case_type: string | null
          court_level: string | null
          case_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          case_type?: string | null
          court_level?: string | null
          case_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          case_type?: string | null
          court_level?: string | null
          case_status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 