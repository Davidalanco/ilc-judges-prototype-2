# Supabase Setup Guide

## Current Issue
Your Supabase project URL `tisesclnhbhwqmvacskn.supabase.co` is no longer valid (DNS resolution fails). This is causing the "Failed to store case and transcription" error.

## Quick Fix Options

### Option 1: Create New Supabase Project (Recommended)

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in or create account
   - Click "New Project"

2. **Create Project**
   - Choose organization
   - Enter project name: `ilc-judges-prototype-2`
   - Choose region (closest to you)
   - Set database password
   - Click "Create new project"

3. **Get Connection Details**
   - Go to Project Settings → API
   - Copy these values:
     - Project URL
     - Project API Key (anon public)
     - Service role key

4. **Update Environment Variables**
   Replace in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="your-new-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-new-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-new-service-role-key"
   ```

5. **Set Up Database Schema**
   - Go to Supabase Dashboard → SQL Editor
   - Run the migration files from `supabase/migrations/`
   - Start with `20250812133014_add_missing_columns.sql`

### Option 2: Use Local Supabase (Advanced)

1. **Install Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Install and start Docker Desktop

2. **Start Local Supabase**
   ```bash
   supabase start
   ```

3. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
   ```

## Testing the Fix

After updating your environment variables:

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test the Transcription Feature**
   - Go to the AI Brief Builder
   - Try pasting a transcription
   - Check if the error is resolved

## Database Schema

The application expects these tables:
- `users`
- `cases`
- `attorney_conversations`
- `justice_profiles`
- `justice_case_analysis`

Make sure to run the migration files in order to set up the schema.

## Troubleshooting

- **DNS Resolution**: If you get "Unknown host" errors, the Supabase URL is invalid
- **Connection Refused**: Check if the Supabase service is running
- **Authentication Errors**: Verify your API keys are correct
- **Schema Errors**: Make sure all required tables exist

## Next Steps

1. Choose Option 1 (recommended for quick fix)
2. Update your `.env.local` file
3. Test the application
4. Consider setting up local development with Docker later

