# Supreme Legal AI Prototype

A Next.js prototype demonstrating an AI-powered tool for constitutional litigation that transforms attorney strategy discussions into winning Supreme Court briefs.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## 📱 Features Demonstrated

### 🎨 **Prototype Reference** (`/prototype`)
- **VISUAL GUIDE**: Complete target design and functionality
- All 11 workflow steps with detailed mock data
- Justice analysis cards with alignment scores
- Brief sections with AI chat interfaces
- **Use this as design reference for all development!**

### 1. **Landing Page** (`/`)
- Professional homepage with value proposition
- Drag-and-drop file upload for attorney discussions
- Case details form (name, type, deadline)
- 4-step process visualization

### 2. **Real Workflow** (`/workflow`)
- Working implementation connecting to real APIs
- Currently showing mock data (Week 2: connect to backend)
- Reference `/prototype` for target design

### 3. **AI Analysis Results** (`/analysis/[caseId]`)
- Mock AI analysis of uploaded strategy session
- Key legal issues identification with confidence scores
- Justice-specific persuasion strategies and alignment scores
- Strategic recommendations and risk factors
- Progress indicator showing workflow steps

## 🎯 User Flow

1. **Upload**: Attorney uploads strategy discussion (audio/video/text)
2. **Analysis**: AI processes and extracts key insights
3. **Review**: Attorney reviews AI-generated analysis and strategies
4. **Next Steps**: Ready to proceed to argument framing and brief writing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel

## 🗄️ Database Management

This project uses **Supabase** as the backend database and authentication system. For AI assistants working on this project:

### Supabase CLI Workflow
- **Live Database Updates**: We work directly with the live Supabase database
- **No Docker Required**: Local development uses remote database connections
- **Migration Management**: Use Supabase CLI for schema changes

### Key Commands for AI Assistance
```bash
# Check authentication status
supabase projects list

# Generate TypeScript types from live database
supabase gen types typescript --project-id tisesclnhbhwqmvacskn

# View migration status
supabase migration list

# Pull current schema from live database
supabase db pull --schema public
```

### Database Philosophy
- **Direct Live Updates**: Schema changes are applied directly to production
- **Type Safety**: Auto-generate TypeScript types from live schema
- **Simplified Workflow**: No local Docker containers or shadow databases needed
- **Real-time Development**: Changes reflect immediately across all environments

### For AI Assistants
When making database-related changes:
1. Use the live Supabase database (connection details in `.env.local`)
2. Generate fresh TypeScript types after schema changes
3. Test directly against the live database
4. No need to start local Supabase instances or Docker containers

## 📁 Project Structure

```
supreme-legal-ai/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── analysis/
│       └── [caseId]/
│           └── page.tsx      # Analysis results page
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 Design System

- **Colors**: Professional blue palette (#1a1a2e, #0f4c75, #3282b8)
- **Typography**: Inter font family for clean, legal-appropriate text
- **Components**: Reusable UI elements with consistent styling

## 🔄 Current Status

This prototype has been **successfully tested with real attorney transcripts**. The AI analysis now processes actual legal strategy discussions and generates sophisticated constitutional litigation strategy.

### ✅ Real Case Analysis Demonstrated
**Case Processed**: Miller v. New York State Department of Health (Amish vaccination case)
- **File**: 17-minute attorney strategy discussion transcript
- **AI Extraction**: 4 distinct legal issues with confidence levels (92%, 88%, 85%, 78%)
- **Justice Analysis**: Individual Supreme Court justice profiles with alignment percentages
- **Strategic Output**: 5 targeted recommendations, 3 risk factors, 3 opposition arguments

See `REAL_CASE_ANALYSIS.md` for complete analysis results.

### Ready for Integration
- Real AI processing ✅ (demonstrated with actual case)
- File upload to S3
- Database storage (Neon PostgreSQL)
- Authentication system

## 📝 Next Steps

1. **Real AI Integration**: Connect to actual AI APIs for processing
2. **Brief Editor**: Add the AI-powered brief writing interface
3. **Opposition Intelligence**: Implement counter-argument prediction
4. **Justice Profiling**: Add deep judicial psychology analysis
5. **Database**: Store cases, analysis, and user data

## 🚀 Deployment

Ready to deploy to Vercel:

```bash
vercel --prod
```

## 📧 Contact

Built for constitutional litigation transformation. Ready to process real attorney discussions and generate actual Supreme Court brief strategies. 