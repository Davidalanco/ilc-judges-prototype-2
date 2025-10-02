# AI Brief Builder URL Structure Diagram

```
🏛️ AI Brief Builder URL Architecture

┌─────────────────────────────────────────────────────────────────┐
│                        /ai-brief                               │
│                    (Main Dashboard)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • List all cases                                       │   │
│  │ • Create new case                                      │   │
│  │ • Delete cases                                         │   │
│  │ • Navigate to cases                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 /ai-brief/[caseId]                              │
│                  (Case Overview)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Case information display                             │   │
│  │ • Section navigation sidebar                          │   │
│  │ • Quality scores & coherence analysis                 │   │
│  │ • Export functionality                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            /ai-brief/[caseId]/[sectionId]                      │
│              (Section Editor)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Section-specific content editing                     │   │
│  │ • AI generation with research                          │   │
│  │ • Manual editing capabilities                          │   │
│  │ • Section guidance sidebar                             │   │
│  │ • Real-time quality scoring                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

📋 Available Section IDs:
├── interest-of-amicus      (Interest of Amicus Curiae)
├── summary-of-argument     (Summary of Argument)
├── argument               (Main Argument)
├── conclusion             (Conclusion)
├── table-of-contents      (Table of Contents)
├── statement-of-interest  (Statement of Interest)
├── statement-of-facts     (Statement of Facts)
├── question-presented     (Question Presented)
└── argument-summary       (Argument Summary)

🔗 Example URLs:
/ai-brief
/ai-brief/case-1234567890
/ai-brief/case-1234567890/interest-of-amicus
/ai-brief/case-1234567890/summary-of-argument
/ai-brief/case-1234567890/conclusion

💾 Data Storage:
├── localStorage['brief-cases']           (List of all cases)
├── localStorage['brief-case-{caseId}']   (Individual case data)
└── AmicusBriefBuilder class              (Section content & state)

🎯 Benefits:
├── Deep linking to specific sections
├── Bookmarkable URLs
├── Shareable section links
├── Browser back/forward navigation
├── SEO-friendly URLs
├── Professional user experience
├── State persistence via URL
└── Collaborative editing support
```

## Navigation Flow

```
User Journey:
1. /ai-brief → See all cases
2. Click "New Case" → Create case → Redirect to /ai-brief/[caseId]
3. /ai-brief/[caseId] → See case overview with section list
4. Click section → Navigate to /ai-brief/[caseId]/[sectionId]
5. /ai-brief/[caseId]/[sectionId] → Edit specific section
6. Use sidebar to switch between sections
7. Use breadcrumbs to navigate back to case or main dashboard
```

## URL State Management

```
URL Structure:
/ai-brief/[caseId]/[sectionId]?param=value

Parameters:
- caseId: Unique identifier for the case
- sectionId: Specific section being edited
- ?section= (legacy): Backward compatibility

State Persistence:
- Case data: localStorage with case-specific keys
- Section content: Managed by AmicusBriefBuilder
- URL state: Managed by Next.js router
- Navigation state: Browser history API
```
