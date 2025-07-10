# Supreme Legal AI - Technical Implementation Plan

*Building the prototype with Next.js, Vercel, Neon, S3, and AI APIs*

---

## 🏗️ Tech Stack Overview

```
Frontend:       Next.js 14+ (App Router)
Backend:        Next.js API Routes + Node.js
Database:       Neon (PostgreSQL)
File Storage:   AWS S3
AI APIs:        OpenAI GPT-4, Claude, Whisper
Deployment:     Vercel
Auth:           NextAuth.js
UI:             Tailwind CSS + shadcn/ui
```

---

## 📊 Database Schema (Neon PostgreSQL)

```sql
-- Core Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  firm_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  case_name VARCHAR(255),
  case_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attorney_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  s3_url TEXT,
  transcript TEXT,
  analysis JSONB,
  key_issues JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE justice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  justice_name VARCHAR(100),
  ideology_scores JSONB,
  writing_patterns JSONB,
  key_citations JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  version INTEGER DEFAULT 1,
  content JSONB,
  persuasion_scores JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  search_query TEXT,
  results JSONB,
  relevance_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Project Structure

```
supreme-legal-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── cases/
│   │   │   ├── [caseId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── brief/
│   │   │   │   ├── research/
│   │   │   │   └── analysis/
│   │   └── upload/
│   ├── api/
│   │   ├── auth/
│   │   ├── ai/
│   │   │   ├── analyze-conversation/
│   │   │   ├── generate-brief/
│   │   │   ├── justice-analysis/
│   │   │   └── research/
│   │   ├── upload/
│   │   └── cases/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── upload/
│   │   ├── FileDropzone.tsx
│   │   └── TranscriptProcessor.tsx
│   ├── analysis/
│   │   ├── JusticeProfile.tsx
│   │   ├── PersuasionMeter.tsx
│   │   └── ArgumentFramer.tsx
│   ├── brief/
│   │   ├── BriefEditor.tsx
│   │   ├── AIEnhancer.tsx
│   │   └── OppositionPredictor.tsx
│   └── research/
│       ├── CaseFinder.tsx
│       └── PrecedentAnalyzer.tsx
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── claude.ts
│   │   └── prompts.ts
│   ├── db/
│   │   └── neon.ts
│   ├── storage/
│   │   └── s3.ts
│   └── utils/
└── types/
```

---

## 🔧 Key Implementation Files

### 1. File Upload Handler (`app/api/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { sql } from '@vercel/postgres';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Upload to S3
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `conversations/${Date.now()}-${file.name}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  // Create case and conversation record
  const { rows: [newCase] } = await sql`
    INSERT INTO cases (user_id, case_name, status)
    VALUES (${session.user.id}, ${formData.get('caseName')}, 'analyzing')
    RETURNING id
  `;

  const { rows: [conversation] } = await sql`
    INSERT INTO attorney_conversations (case_id, s3_url)
    VALUES (${newCase.id}, ${`s3://${process.env.S3_BUCKET}/${key}`})
    RETURNING id
  `;

  // Trigger async processing
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ai/analyze-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: conversation.id }),
  });

  return NextResponse.json({ 
    caseId: newCase.id,
    conversationId: conversation.id,
    status: 'processing' 
  });
}
```

### 2. AI Conversation Analyzer (`app/api/ai/analyze-conversation/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sql } from '@vercel/postgres';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: NextRequest) {
  const { conversationId } = await request.json();

  // Get conversation from DB
  const { rows: [conversation] } = await sql`
    SELECT * FROM attorney_conversations WHERE id = ${conversationId}
  `;

  // Get file from S3 and transcribe if needed
  const transcript = await getTranscript(conversation.s3_url);

  // Analyze with GPT-4
  const analysis = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a legal analysis AI. Analyze this attorney conversation and extract:
        1. Key legal issues and claims
        2. Case strategy and goals
        3. Potential challenges
        4. Target justices based on issues
        5. Recommended approach
        
        Return as structured JSON.`
      },
      {
        role: "user",
        content: transcript
      }
    ],
    response_format: { type: "json_object" }
  });

  const analysisData = JSON.parse(analysis.choices[0].message.content!);

  // Update database
  await sql`
    UPDATE attorney_conversations
    SET 
      transcript = ${transcript},
      analysis = ${JSON.stringify(analysisData)},
      key_issues = ${JSON.stringify(analysisData.keyIssues)}
    WHERE id = ${conversationId}
  `;

  // Update case status
  await sql`
    UPDATE cases
    SET status = 'ready'
    WHERE id = ${conversation.case_id}
  `;

  return NextResponse.json({ 
    status: 'complete',
    analysis: analysisData 
  });
}
```

### 3. Justice Profile Component (`components/analysis/JusticeProfile.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface JusticeProfileProps {
  justiceName: string;
  caseId: string;
}

export function JusticeProfile({ justiceName, caseId }: JusticeProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJusticeProfile();
  }, [justiceName, caseId]);

  const fetchJusticeProfile = async () => {
    const res = await fetch(`/api/ai/justice-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ justiceName, caseId }),
    });
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  };

  if (loading) return <div>Analyzing {justiceName}...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{justiceName} - Persuasion Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Core Values (Ranked)</h4>
          {profile.coreValues.map((value: any, i: number) => (
            <div key={i} className="flex items-center justify-between mb-1">
              <span>{i + 1}. {value.name}</span>
              <Progress value={value.score} className="w-32" />
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Persuasion Entry Points</h4>
          <div className="space-y-1">
            {profile.entryPoints.map((point: string, i: number) => (
              <Badge key={i} variant="secondary" className="mr-2">
                {point}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Avoid These Triggers</h4>
          <div className="space-y-1">
            {profile.avoidTriggers.map((trigger: string, i: number) => (
              <Badge key={i} variant="destructive" className="mr-2">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">💡 AI Suggestion</h4>
          <p className="text-sm">{profile.aiSuggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Brief Editor with AI Enhancement (`components/brief/BriefEditor.tsx`)

```typescript
'use client';

import { useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersuasionMeter } from './PersuasionMeter';
import { AIEnhancer } from './AIEnhancer';

export function BriefEditor({ caseId, initialContent }: any) {
  const [content, setContent] = useState(initialContent || '');
  const [selectedText, setSelectedText] = useState('');
  const [persuasionScores, setPersuasionScores] = useState({});

  const analyzePersuasion = useCallback(async (text: string) => {
    const res = await fetch('/api/ai/analyze-persuasion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, caseId }),
    });
    const scores = await res.json();
    setPersuasionScores(scores);
  }, [caseId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setContent(value);
      // Debounced analysis
      analyzePersuasion(value);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <Card className="h-full">
          <Editor
            height="80vh"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontSize: 16,
            }}
          />
        </Card>
      </div>
      
      <div className="space-y-4">
        <PersuasionMeter scores={persuasionScores} />
        <AIEnhancer 
          selectedText={selectedText}
          onEnhance={(enhanced) => {
            setContent(content.replace(selectedText, enhanced));
          }}
        />
      </div>
    </div>
  );
}
```

### 5. Environment Variables (`.env.local`)

```bash
# Database
DATABASE_URL=postgresql://user:pass@neon.tech/dbname
POSTGRES_URL=$DATABASE_URL

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=supreme-legal-ai

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up database
npm run db:migrate

# Seed justice profiles
npm run db:seed

# Run development server
npm run dev

# Deploy to Vercel
vercel --prod
```

---

## 🔌 Key AI Integration Points

### 1. **Conversation Analysis**
- Whisper API for audio transcription
- GPT-4 for extracting legal issues and strategy

### 2. **Justice Profiling**
- Claude for deep analysis of judicial opinions
- Custom embeddings for pattern matching

### 3. **Brief Generation**
- GPT-4 for initial drafting
- Claude for style matching to successful briefs

### 4. **Research**
- Embeddings for semantic case search
- GPT-4 for relevance scoring

### 5. **Persuasion Analysis**
- Custom fine-tuned model for justice-specific scoring
- Real-time feedback loop

---

## 📈 Performance Optimizations

1. **Edge Functions** for real-time AI responses
2. **Background Jobs** for heavy processing (Vercel Cron)
3. **Caching** with Redis for justice profiles
4. **CDN** for static assets and UI components
5. **Streaming** for long AI responses

---

## 🔐 Security Considerations

1. **Row-Level Security** in Neon for multi-tenant data
2. **Encrypted S3 Storage** for sensitive documents
3. **API Rate Limiting** to prevent abuse
4. **Input Sanitization** for all user content
5. **Audit Logging** for compliance

This implementation provides a solid foundation for building the Supreme Legal AI prototype with your existing tech stack! 