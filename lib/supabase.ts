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
    console.warn('Mock database: file upload skipped');
    return { data: null, error: { message: 'Mock database - no actual upload' } };
  }

  const uploadOptions: any = {
    upsert: options?.upsert || false,
    metadata: options?.metadata
  };
  
  // Set content type if provided
  if (options?.contentType) {
    uploadOptions.contentType = options.contentType;
  }
  
  return await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file, uploadOptions)
}

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