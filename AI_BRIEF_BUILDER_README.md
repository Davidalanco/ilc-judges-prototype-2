# 🏛️ AI Amicus Brief Builder

## Overview

The AI Amicus Brief Builder is a sophisticated system that creates professional amicus curiae briefs for Supreme Court cases using a template based on successful briefs. The system allows for independent editing of sections while maintaining document coherence through AI analysis.

## Key Features

### ✅ Modular Template System
- **Based on Winning Brief**: Template derived from John Kluge v. Department of Health and Human Services (successful Supreme Court amicus brief)
- **Independent Sections**: Each section can be edited separately while maintaining overall coherence
- **AI-Powered Generation**: Claude AI generates content for each section with context awareness
- **Real-time Coherence Analysis**: System monitors document flow and suggests improvements

### 📋 Template Sections

1. **Cover Page** - Case title, court, docket number, amicus information
2. **Table of Authorities** - Comprehensive list of cited cases, statutes, regulations
3. **Summary of the Argument** - Concise summary of main legal arguments (2-3 pages)
4. **Statement of Interest** - Explanation of amicus curiae's legitimate interest
5. **Argument I** - Primary legal argument with case law analysis
6. **Argument II** - Secondary legal argument (optional)
7. **Argument III** - Policy considerations (optional)
8. **Conclusion** - Strong conclusion with specific relief requests
9. **Certificate of Service** - Proper service documentation

### 🤖 AI Coherence System

The system maintains document coherence through:

- **Context Awareness**: Each section generation includes full case context
- **Cross-Section Analysis**: AI analyzes connections between sections
- **Coherence Scoring**: Real-time coherence score (0-100%)
- **Recommendations**: AI suggests improvements for better flow
- **Missing Elements Detection**: Identifies incomplete or missing sections

### 🎯 Smart Features

- **Case Information Setup**: Comprehensive form for case details, parties, precedents
- **AI Content Generation**: Professional legal writing for each section
- **Real-time Editing**: Live updates with word count and modification tracking
- **Export Functionality**: Generate complete brief as text document
- **Section Navigation**: Easy switching between sections with progress tracking

## Technical Architecture

### Core Components

1. **AmicusBriefTemplate** (`lib/amicus-brief-template.ts`)
   - Template definition based on successful brief structure
   - Coherence analysis algorithms
   - Section management and editing

2. **AmicusBriefBuilder Class**
   - Manages section updates and coherence
   - Generates AI prompts with context
   - Exports complete briefs

3. **AI Brief Builder UI** (`app/ai-brief/page.tsx`)
   - Main interface for brief creation
   - Section navigation and editing
   - Coherence monitoring dashboard

4. **Case Information Input** (`app/components/BriefCaseInformationInput.tsx`)
   - Comprehensive case setup form
   - Precedent and question management
   - Validation and completion tracking

5. **AI Generation API** (`app/api/ai/generate-brief-section/route.ts`)
   - Claude AI integration for section generation
   - Context-aware content creation
   - Professional legal writing standards

### AI Integration

- **Claude 3.5 Sonnet**: Primary AI model for content generation
- **Specialized Prompts**: Tailored prompts for each section type
- **Legal Writing Standards**: Professional Supreme Court brief formatting
- **Context Preservation**: Full case context maintained across sections

## Usage Workflow

### 1. Case Setup
```
1. Navigate to /ai-brief
2. Fill in case information:
   - Case name and court level
   - Primary legal issue
   - Parties (petitioner/respondent)
   - Key precedents
   - Constitutional questions
   - Overall theme
```

### 2. Brief Generation
```
1. System initializes template with case context
2. Navigate through sections using sidebar
3. Use "AI Generate" button for each section
4. Edit generated content as needed
5. Monitor coherence score and recommendations
```

### 3. Finalization
```
1. Complete all required sections
2. Review coherence analysis
3. Make final edits based on recommendations
4. Export complete brief
```

## Coherence Analysis

The system analyzes brief coherence through:

### Connection Strength Analysis
- **Legal Term Overlap**: Shared legal terminology between sections
- **Argument Flow**: Logical progression of arguments
- **Citation Consistency**: Proper case law references throughout

### Completion Tracking
- **Required Sections**: Ensures all mandatory sections are complete
- **Content Quality**: Minimum word counts and content depth
- **Structure Validation**: Proper section ordering and hierarchy

### Recommendations Engine
- **Weak Transitions**: Identifies poorly connected sections
- **Missing Elements**: Flags incomplete or missing content
- **Strength Identification**: Highlights well-developed sections

## Success Metrics

Based on the winning John Kluge brief template:

- **Structure**: 9 well-defined sections with clear hierarchy
- **Coherence**: Strong thematic consistency throughout
- **Legal Standards**: Proper citation format and legal language
- **Persuasion**: Compelling arguments with clear reasoning
- **Completeness**: Comprehensive coverage of legal issues

## Future Enhancements

### Planned Features
- **Multiple Templates**: Additional templates based on other successful briefs
- **Collaborative Editing**: Multi-user editing capabilities
- **Citation Database**: Integrated legal citation management
- **Style Consistency**: Advanced formatting and style checking
- **Peer Review**: Built-in review and feedback system

### AI Improvements
- **Advanced Coherence**: More sophisticated connection analysis
- **Legal Research**: Integrated case law research capabilities
- **Style Optimization**: Enhanced legal writing style suggestions
- **Argument Strength**: AI-powered argument quality assessment

## Technical Requirements

- **Node.js 18+**: Runtime environment
- **Next.js 14**: React framework
- **Claude AI**: Content generation
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Styling and responsive design

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   # Add to .env.local
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access AI Brief Builder**
   ```
   http://localhost:4000/ai-brief
   ```

## Contributing

The AI Brief Builder is designed for legal professionals and developers. Contributions are welcome in:

- **Template Development**: Additional successful brief templates
- **AI Prompt Engineering**: Enhanced generation prompts
- **Coherence Algorithms**: Improved analysis methods
- **UI/UX Improvements**: Better user experience
- **Legal Research Integration**: Enhanced citation management

---

*Built with ❤️ for the legal community - Empowering attorneys with AI-powered brief writing tools.*
