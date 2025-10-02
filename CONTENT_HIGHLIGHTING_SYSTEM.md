# Content Highlighting System

## Overview

The Content Highlighting System is an AI-powered feature that allows users to highlight text in their legal briefs, request changes, and have the AI automatically find and update similar content across all sections. This ensures consistency and coherence throughout the entire document.

## Key Features

### 🎯 Text Selection & Highlighting
- **Visual Selection**: Users can highlight any text in the content area
- **Smart Detection**: Automatic detection of text selection with context
- **Visual Feedback**: Highlighted text is visually marked for reference

### 🤖 AI-Powered Analysis
- **Similar Content Detection**: AI finds semantically similar content across all sections
- **Change Request Processing**: Natural language processing of user change requests
- **Intelligent Matching**: Uses Claude AI to understand context and similarity

### 📝 Proposed Changes
- **Specific Text Changes**: AI generates exact before/after text changes
- **Confidence Scoring**: Each proposed change includes a confidence score
- **Reasoning**: Clear explanations for why each change is suggested

### ✅ User Confirmation
- **Review Interface**: Users can review all proposed changes before applying
- **Selective Application**: Users can choose which changes to apply
- **Batch Operations**: Apply all changes at once or individually

## Architecture

### Components

#### ContentHighlighter.tsx
The main React component that handles:
- Text selection and highlighting
- Change request input
- Modal display for confirmation
- Integration with the section editor

#### API Endpoint: `/api/ai/analyze-content-changes`
Handles:
- Similar content detection across sections
- AI-powered change proposal generation
- Integration with Claude AI for analysis

### Data Flow

1. **User Action**: User highlights text and provides change request
2. **Analysis**: AI analyzes the selected text and finds similar content
3. **Generation**: AI generates specific proposed changes
4. **Review**: User reviews all proposed changes in a modal
5. **Application**: User confirms and changes are applied across all sections

## Usage

### Enabling Highlighting Mode

1. Navigate to any section in the AI Brief Builder
2. Click the "📝 Regular Edit" button to toggle to "✏️ Highlighting Mode"
3. The content area will now support text selection and highlighting

### Making Changes

1. **Select Text**: Highlight the text you want to change
2. **Describe Change**: In the popup, describe what you want changed
3. **Review Results**: AI will find similar content and propose changes
4. **Confirm Changes**: Review and confirm the proposed changes
5. **Apply**: Changes are applied across all similar content

### Example Change Requests

- "Make this more persuasive"
- "Add more legal citations"
- "Simplify this language"
- "Make this more formal"
- "Add specific examples"
- "Strengthen this argument"

## Technical Implementation

### State Management

```typescript
interface HighlightedText {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  changeRequest: string;
  context: string;
  timestamp: Date;
}

interface SimilarContent {
  sectionId: string;
  sectionTitle: string;
  text: string;
  startIndex: number;
  endIndex: number;
  similarity: number;
  context: string;
}

interface ProposedChange {
  id: string;
  originalText: string;
  newText: string;
  sectionId: string;
  sectionTitle: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  confidence: number;
}
```

### API Integration

The system uses Claude AI for:
- **Similarity Analysis**: Finding semantically similar content
- **Change Generation**: Creating specific text changes
- **Context Understanding**: Understanding legal terminology and structure

### Debugging & Logging

The system includes comprehensive logging:
- Console logs for all major operations
- Debug panel showing similar content and proposed changes
- Network request logging for API calls
- Visual status indicators

## Testing

### Automated Testing

Run the test script to verify functionality:

```bash
node test-highlighting-system.js
```

This will:
- Launch a browser instance
- Navigate to the AI Brief Builder
- Enable highlighting mode
- Simulate text selection
- Test the change request workflow
- Capture screenshots of the process

### Manual Testing

1. Start the development server: `npm run dev`
2. Navigate to `/ai-brief/[caseId]/[sectionId]`
3. Enable highlighting mode
4. Select text and provide change requests
5. Review the AI analysis and proposed changes

## Configuration

### AI Model Settings

The system uses Claude 3.5 Sonnet with:
- **Temperature**: 0.1 for similarity analysis, 0.2 for change generation
- **Max Tokens**: 4000 for comprehensive analysis
- **System Prompts**: Specialized for legal document analysis

### Performance Considerations

- **Caching**: Similar content analysis is cached to avoid repeated API calls
- **Batch Processing**: Multiple changes are processed together
- **Debouncing**: Text selection events are debounced to prevent excessive API calls

## Future Enhancements

### Planned Features

1. **Database Integration**: Replace mock data with real database queries
2. **Version Control**: Track changes and allow rollback
3. **Collaborative Editing**: Multiple users can review and approve changes
4. **Advanced Analytics**: Track change patterns and effectiveness
5. **Custom Rules**: User-defined rules for automatic changes

### Technical Improvements

1. **Real-time Updates**: WebSocket integration for live collaboration
2. **Offline Support**: Local storage for offline editing
3. **Performance Optimization**: Lazy loading and virtual scrolling
4. **Accessibility**: Screen reader support and keyboard navigation

## Troubleshooting

### Common Issues

1. **Text Not Selecting**: Ensure highlighting mode is enabled
2. **API Errors**: Check console for network errors and API responses
3. **Modal Not Appearing**: Verify text selection and change request input
4. **Changes Not Applying**: Check for JavaScript errors in console

### Debug Information

The system provides detailed debug information:
- Console logs for all operations
- Debug panel showing system status
- Network request logging
- Error handling and reporting

## Support

For issues or questions:
1. Check the console logs for error messages
2. Review the debug panel for system status
3. Verify API endpoints are responding correctly
4. Check network connectivity and API keys

## License

This feature is part of the ILC Judges Prototype and follows the same licensing terms.
