import { NextRequest, NextResponse } from 'next/server';
import { claudeClient } from '@/lib/ai/claude';

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

export async function POST(request: NextRequest) {
  try {
    const { 
      selectedText, 
      changeRequest, 
      sectionId, 
      sectionTitle, 
      startIndex, 
      endIndex, 
      currentContent 
    } = await request.json();

    if (!selectedText || !changeRequest) {
      return NextResponse.json({ 
        error: 'Selected text and change request are required' 
      }, { status: 400 });
    }

    console.log('🔍 Analyzing content changes for:', selectedText);
    console.log('📝 Change request:', changeRequest);
    console.log('📍 Section:', sectionTitle);

    // Get all sections from localStorage (this would ideally come from a database)
    // For now, we'll simulate getting all sections
    const allSections = await getAllSections();
    
    // Find similar content across all sections
    const similarContent = await findSimilarContent(
      selectedText, 
      allSections, 
      sectionId
    );

    // Generate proposed changes
    const proposedChanges = await generateProposedChanges(
      selectedText,
      changeRequest,
      similarContent,
      currentContent,
      sectionId,
      sectionTitle
    );

    console.log(`✅ Found ${similarContent.length} similar content matches`);
    console.log(`✅ Generated ${proposedChanges.length} proposed changes`);

    return NextResponse.json({
      success: true,
      similarContent,
      proposedChanges,
      analysis: {
        originalText: selectedText,
        changeRequest,
        sectionsAnalyzed: allSections.length,
        matchesFound: similarContent.length,
        changesProposed: proposedChanges.length
      }
    });

  } catch (error) {
    console.error('❌ Error analyzing content changes:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze content changes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get all sections from the brief builder (this would ideally be from a database)
async function getAllSections() {
  try {
    // In a real implementation, you would:
    // 1. Get the case ID from the request
    // 2. Query the database for all sections of that case
    // 3. Return the actual section data
    
    // For now, we'll simulate getting sections from localStorage
    // This is a temporary solution until we have proper database integration
    
    console.log('📋 Getting all sections for content analysis...');
    
    // Mock data that represents typical brief sections
    // In production, this would come from your database
    const mockSections = [
      {
        id: 'question-presented',
        title: 'Question Presented',
        content: 'This is a sample question presented section with some legal content that might be similar to other sections.',
        type: 'question'
      },
      {
        id: 'summary-of-argument',
        title: 'Summary of Argument',
        content: 'This is a summary section that contains arguments and legal reasoning that could be similar to other parts of the brief.',
        type: 'summary'
      },
      {
        id: 'argument1',
        title: 'First Argument',
        content: 'This is the first main argument section with detailed legal analysis and citations.',
        type: 'argument'
      },
      {
        id: 'argument2',
        title: 'Second Argument',
        content: 'This is the second main argument section with additional legal reasoning and case law.',
        type: 'argument'
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        content: 'This is the conclusion section that summarizes the main points and requests relief.',
        type: 'conclusion'
      }
    ];
    
    console.log(`✅ Retrieved ${mockSections.length} sections for analysis`);
    return mockSections;
    
  } catch (error) {
    console.error('❌ Error getting sections:', error);
    return [];
  }
}

// Find similar content across sections using AI
async function findSimilarContent(
  selectedText: string, 
  allSections: any[], 
  currentSectionId: string
): Promise<SimilarContent[]> {
  try {
    const systemPrompt = `You are an expert legal document analyzer. Your task is to find text in legal briefs that is semantically similar to a given text selection.

Given a selected text and a list of sections, identify content that:
1. Uses similar legal concepts or terminology
2. Makes similar arguments or points
3. Has similar structure or phrasing
4. References similar case law or precedents

For each match, provide:
- The section ID and title
- The similar text (exact quote)
- A similarity score (0-1)
- Context about why it's similar

Be thorough but precise. Only include content that is genuinely similar, not just containing a few common words.`;

    const userPrompt = `Selected text: "${selectedText}"

Sections to analyze:
${allSections
  .filter(s => s.id !== currentSectionId)
  .map(s => `Section: ${s.title} (${s.id})
Content: ${s.content.substring(0, 1000)}...`)
  .join('\n\n')}

Find similar content and return as JSON array with: sectionId, sectionTitle, text, startIndex, endIndex, similarity, context`;

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const similarContent = JSON.parse(jsonMatch[0]);
      return similarContent.map((item: any, index: number) => ({
        ...item,
        id: `similar-${index}`,
        startIndex: item.startIndex || 0,
        endIndex: item.endIndex || item.text.length,
        similarity: item.similarity || 0.5
      }));
    }

    return [];

  } catch (error) {
    console.error('Error finding similar content:', error);
    return [];
  }
}

// Generate proposed changes using AI
async function generateProposedChanges(
  selectedText: string,
  changeRequest: string,
  similarContent: SimilarContent[],
  currentContent: string,
  currentSectionId: string,
  currentSectionTitle: string
): Promise<ProposedChange[]> {
  try {
    const systemPrompt = `You are an expert legal editor. Your task is to propose specific text changes based on a user's change request.

Given:
- Original selected text
- User's change request
- Similar content found in other sections

Generate specific, actionable changes that:
1. Address the user's change request
2. Apply consistently across similar content
3. Maintain legal accuracy and proper formatting
4. Preserve the original meaning while improving it

For each change, provide:
- The exact original text
- The exact new text
- A clear reason for the change
- A confidence score (0-1)

Be precise and conservative. Only propose changes that clearly improve the text.`;

    const userPrompt = `Original selected text: "${selectedText}"
Change request: "${changeRequest}"

Similar content found:
${similarContent.map(item => `
Section: ${item.sectionTitle}
Text: "${item.text}"
Similarity: ${item.similarity}
Context: ${item.context}
`).join('\n')}

Current section content (for context):
${currentContent.substring(0, 2000)}...

Generate proposed changes as JSON array with: id, originalText, newText, sectionId, sectionTitle, startIndex, endIndex, reason, confidence`;

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const proposedChanges = JSON.parse(jsonMatch[0]);
      return proposedChanges.map((change: any, index: number) => ({
        ...change,
        id: `change-${Date.now()}-${index}`,
        sectionId: change.sectionId || currentSectionId,
        sectionTitle: change.sectionTitle || currentSectionTitle,
        startIndex: change.startIndex || 0,
        endIndex: change.endIndex || change.originalText.length,
        confidence: change.confidence || 0.8
      }));
    }

    return [];

  } catch (error) {
    console.error('Error generating proposed changes:', error);
    return [];
  }
}
