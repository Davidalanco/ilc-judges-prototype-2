# AI Brief Builder URL Structure

## Overview

The AI Brief Builder now uses a comprehensive URL-based routing system that allows for deep linking, bookmarking, and sharing of specific cases and sections.

## URL Patterns

### Main Brief Builder
- **URL**: `/ai-brief`
- **Purpose**: Case management dashboard
- **Features**: 
  - List all cases
  - Create new cases
  - Delete cases
  - Navigate to specific cases

### Case Overview
- **URL**: `/ai-brief/[caseId]`
- **Purpose**: Case-level view with section navigation
- **Features**:
  - Case information display
  - Section navigation sidebar
  - Quality scores and coherence analysis
  - Export functionality

### Section Editor
- **URL**: `/ai-brief/[caseId]/[sectionId]`
- **Purpose**: Individual section editing interface
- **Features**:
  - Section-specific content editing
  - AI generation with research
  - Manual editing capabilities
  - Section guidance sidebar
  - Real-time quality scoring

## URL Examples

```
/ai-brief                                    # Main dashboard
/ai-brief/case-1234567890                    # Case overview
/ai-brief/case-1234567890/interest-of-amicus # Interest of Amicus section
/ai-brief/case-1234567890/summary-of-argument # Summary of Argument section
/ai-brief/case-1234567890/conclusion         # Conclusion section
```

## Section IDs

The following section IDs are available for URL routing:

- `interest-of-amicus` - Interest of Amicus Curiae
- `summary-of-argument` - Summary of Argument
- `argument` - Main Argument
- `conclusion` - Conclusion
- `table-of-contents` - Table of Contents
- `statement-of-interest` - Statement of Interest
- `statement-of-facts` - Statement of Facts
- `question-presented` - Question Presented
- `argument-summary` - Argument Summary

## Features

### Deep Linking
- Each case and section has its own unique URL
- URLs can be bookmarked and shared
- Browser back/forward navigation works seamlessly

### State Persistence
- Case data is stored in localStorage with case-specific keys
- Section content is automatically saved as you type
- AI instructions are preserved per section

### Navigation
- Breadcrumb navigation between case and sections
- Sidebar navigation for quick section switching
- Direct URL access to any section

### URL Parameters
- `?section=sectionId` - Navigate to specific section (legacy support)
- Future parameters can be added for additional functionality

## Implementation Details

### File Structure
```
app/ai-brief/
├── page.tsx                    # Main dashboard
├── [caseId]/
│   ├── page.tsx               # Case overview
│   └── [sectionId]/
│       └── page.tsx           # Section editor
└── redirect.tsx               # Legacy URL support
```

### State Management
- Case data: `localStorage.getItem('brief-cases')`
- Individual case data: `localStorage.getItem('brief-case-{caseId}')`
- Section content: Managed by AmicusBriefBuilder class

### Router Integration
- Uses Next.js `useRouter` and `useSearchParams`
- Automatic redirects for invalid URLs
- Backward compatibility with old URL structure

## Benefits

1. **Professional UX**: Each section feels like a separate page
2. **Shareability**: Users can share specific sections with colleagues
3. **Bookmarking**: Important sections can be bookmarked
4. **SEO Friendly**: Each section has its own URL
5. **State Management**: URL reflects current state
6. **Navigation**: Browser controls work as expected
7. **Deep Linking**: Direct access to any part of the brief

## Migration

The new URL structure is backward compatible:
- Old URLs with `?section=` parameter are automatically redirected
- Existing case data is preserved
- No data loss during migration

## Future Enhancements

- URL parameters for AI generation state
- Collaborative editing with URL-based sharing
- Version control with URL-based versioning
- Export functionality with URL-based parameters
