# Legal AI Brief Writer - Setup Guide

This guide will help you set up and configure the Supreme Court Brief Writing Tool with all required services and API keys.

## 🔧 Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier available)
- An OpenAI account with API access
- An ElevenLabs account (for advanced transcription)
- **NEW: Legal research API access**

## 📋 Step-by-Step Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd ilc-judges-prototype-2
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env.local
```

### 3. **🔥 CRITICAL: Legal Research API Setup**

For the citation research system to work, you need these legal database API credentials:

#### **3.1 CourtListener API Token (FREE)**

1. **Visit**: https://www.courtlistener.com/
2. **Create Account**: Click "Sign Up" → Create free account
3. **Get API Token**: 
   - Log in to your account
   - Go to "Profile" → "API"
   - Create new API token
   - Copy the token value

4. **Add to `.env.local`**:
   ```
   COURTLISTENER_API_TOKEN=your-courtlistener-api-token-here
   ```

#### **3.2 PACER Account (Optional - Enhanced Access)**

PACER provides access to federal court records. While CourtListener has much of this data for free, a PACER account enables direct federal court access.

1. **Visit**: https://pacer.uscourts.gov/register-account/pacer-case-search-only
2. **Register**: Create "Case Search Only" account (free option available)
3. **Get Credentials**: Save your username and password

4. **Add to `.env.local`**:
   ```
   PACER_USERNAME=your-pacer-username
   PACER_PASSWORD=your-pacer-password
   ```

**Note**: PACER has usage fees for document downloads, but the search API is free for basic usage.

### 4. Other Required APIs

#### Supabase Database
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy URL and anon key to `.env.local`

#### OpenAI API  
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env.local`: `OPENAI_API_KEY=your-key`

#### ElevenLabs API
1. Get API key from https://elevenlabs.io
2. Add to `.env.local`: `ELEVENLABS_API_KEY=your-key`

### 5. Database Setup

Run the database migrations:
```bash
npm run db:setup
```

### 6. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Testing Legal Research APIs

To test if your legal research setup is working:

1. **Visit**: http://localhost:3000/workflow
2. **Go to Step 2**: "Case Information Input"  
3. **Scroll down**: Find "Legal Citation Research" section
4. **Enter citation**: `"Miller v. McDonald, 944 F.3d 1050"`
5. **Click "Find Documents"**

**Expected Result**: Should find and display federal court documents instead of showing 403 errors.

## 🚨 Troubleshooting Legal Research APIs

### Issue: 403 Forbidden Errors
- **Check**: CourtListener API token is correct
- **Verify**: Token has proper permissions
- **Test**: Visit CourtListener website manually with same account

### Issue: No Results Found
- **Verify**: Citation format is correct (include case name, volume, reporter, page)
- **Try**: Different citation formats
- **Check**: Case actually exists in database

### Issue: Rate Limiting (429 errors)
- **Wait**: APIs have rate limits, wait a few minutes
- **Check**: You're not making too many requests too quickly
- **Upgrade**: Consider premium API access for higher limits

## 🎯 Legal Research System Features

With proper API setup, you get:

✅ **Real Citation Search** - Find actual federal court documents
✅ **Document Classification** - Automatic categorization (decisions, dissents, briefs)  
✅ **AI Document Analysis** - Summarization of retrieved legal documents
✅ **Multi-Source Research** - CourtListener + PACER integration
✅ **No Mock Data** - All results from real legal databases

## 🔒 Security Notes

- Never commit `.env.local` to git
- API tokens are sensitive - treat like passwords
- PACER credentials should be secure
- Consider using separate API keys for development vs production

## 📞 Support

If you encounter issues:
1. Check this setup guide first
2. Verify all environment variables are set correctly  
3. Test each API individually
4. Check the console logs for specific error messages

---

**🎯 Goal**: After completing this setup, the legal citation research system should work with real data from federal court databases, enabling powerful AI-driven legal research capabilities.

## Original Setup Instructions

### Database Setup

We use Supabase as our primary database and storage solution.

1. **Create Supabase Account**
   - Visit https://supabase.com and create a free account
   - Create a new project

2. **Get Database Credentials**
   - Go to Project Settings → API
   - Copy the Project URL and Project API Key (anon/public)
   - Copy the service role key (for server-side operations)

3. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Set Up Database Schema**
   - Go to Supabase Dashboard → SQL Editor
   - Run the schema from `lib/db/schema.sql`

### AI Services Setup

#### OpenAI API
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to environment variables:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   ```

#### ElevenLabs API (for transcription)
1. Visit https://elevenlabs.io
2. Create account and get API key
3. Add to environment variables:
   ```bash
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   ```

### Authentication Setup

We use NextAuth.js for authentication with Supabase as the session store.

1. **Generate NextAuth Secret**
   ```bash
   NEXTAUTH_SECRET=your-random-secret-string
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Google OAuth (Optional)**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### File Storage Setup

Supabase Storage is configured for handling audio files and document uploads.

**Storage Buckets:**
- `audio-files`: For uploaded audio transcriptions
- `case-documents`: For legal documents and briefs
- `exports`: For generated PDF exports

### Environment Variables Summary

Create a `.env.local` file with these variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Legal Research APIs
COURTLISTENER_API_TOKEN=your-courtlistener-api-token
PACER_USERNAME=your-pacer-username  
PACER_PASSWORD=your-pacer-password

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
NEXT_PUBLIC_URL=http://localhost:3000
```

## Running the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Main app: http://localhost:3000
   - Workflow: http://localhost:3000/workflow
   - Prototype: http://localhost:3000/prototype

## Verification

To verify everything is working:

1. **Database**: Check Supabase dashboard for successful connections
2. **AI**: Upload an audio file and verify transcription works
3. **Legal Research**: Test citation search in the workflow
4. **Authentication**: Try logging in (if OAuth configured)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials are correct
   - Check that RLS policies are properly configured

2. **AI API Errors**
   - Verify API keys are valid and have sufficient credits
   - Check rate limits and usage quotas

3. **Storage Issues**
   - Ensure Supabase storage buckets are created
   - Verify storage policies allow uploads

4. **Build Errors**
   - Run `npm run build` to check for TypeScript errors
   - Verify all environment variables are set

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the server logs in the terminal
3. Verify all environment variables are correctly set
4. Test individual components in isolation 