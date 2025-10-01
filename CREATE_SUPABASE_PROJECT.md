# Create New Supabase Project - Step by Step

## Step 1: Create Supabase Account & Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com
   - Sign in or create a free account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Project Name: `ilc-judges-prototype-2`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your location
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll see a progress indicator

## Step 2: Get Connection Details

Once your project is ready:

1. **Go to Project Settings**
   - Click the gear icon (⚙️) in the sidebar
   - Go to "API" section

2. **Copy These Values:**
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Public Key**: `eyJ...` (long string starting with eyJ)
   - **Service Role Key**: `eyJ...` (different long string, also starts with eyJ)

## Step 3: Update Environment Variables

Replace the values in your `.env.local` file:

```bash
# Replace these lines:
NEXT_PUBLIC_SUPABASE_URL="https://your-new-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-new-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-new-service-role-key"
```

## Step 4: Set Up Database Schema

1. **Go to SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in sidebar
   - Click "New query"

2. **Run This Schema Setup:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    firm_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    case_name VARCHAR(255),
    case_type VARCHAR(100),
    court_level VARCHAR(100),
    constitutional_question TEXT,
    client_type VARCHAR(100),
    jurisdiction VARCHAR(100),
    penalties TEXT,
    precedent_target VARCHAR(255),
    case_status VARCHAR(50) DEFAULT 'draft',
    status VARCHAR(50) DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    description TEXT,
    legal_issues TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attorney conversations (uploaded audio files)
CREATE TABLE attorney_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    s3_key VARCHAR(500),
    s3_url TEXT,
    upload_status VARCHAR(50) DEFAULT 'pending',
    transcription_text TEXT,
    transcription_status VARCHAR(50) DEFAULT 'pending',
    analysis_result JSONB,
    duration_seconds INTEGER,
    transcript TEXT,
    transcript_quality DECIMAL(5,2),
    speaker_count INTEGER,
    speakers JSONB,
    analysis JSONB,
    key_issues JSONB,
    status VARCHAR(50) DEFAULT 'uploaded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Justice profiles (pre-loaded data)
CREATE TABLE justice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    ideology_score DECIMAL(3,2),
    writing_style JSONB,
    key_precedents JSONB,
    voting_patterns JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Justice case analysis
CREATE TABLE justice_case_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    justice_name VARCHAR(100),
    alignment_score DECIMAL(5,2),
    key_factors JSONB,
    strategy TEXT,
    confidence_level VARCHAR(50),
    risk_level VARCHAR(50),
    case_specific_analysis TEXT,
    historical_votes JSONB,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_attorney_conversations_case_id ON attorney_conversations(case_id);
CREATE INDEX idx_attorney_conversations_user_id ON attorney_conversations(user_id);
CREATE INDEX idx_justice_case_analysis_case_id ON justice_case_analysis(case_id);
```

3. **Click "Run" to execute the schema**

## Step 5: Test the Connection

After updating your `.env.local` file:

1. **Restart your development server**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Test the API**
   - Go to your application
   - Try pasting a transcription
   - Check if the error is resolved

## Verification

You should see:
- ✅ No more "Failed to store case and transcription" errors
- ✅ Real database records being created
- ✅ No more mock data warnings

## Need Help?

If you encounter issues:
1. Double-check the environment variables are correct
2. Ensure the database schema was created successfully
3. Check the Supabase dashboard for any error logs
4. Verify your project is active and not paused

---

**Ready to proceed?** Follow these steps and let me know when you've completed them!

