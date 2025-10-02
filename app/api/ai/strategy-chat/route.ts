import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      chatHistory, 
      caseContext,
      selectedDocuments,
      historicalResearch,
      justiceAnalysis,
      caseInformation 
    } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🧠 Strategy chat request:', {
      messageLength: message.length,
      historyLength: chatHistory?.length || 0,
      hasDocuments: !!(selectedDocuments?.length),
      hasHistoricalResearch: !!historicalResearch,
      hasJusticeAnalysis: !!justiceAnalysis,
      hasCaseInfo: !!caseInformation
    });

    // Build comprehensive context for constitutional strategy discussion
    let fullContext = `You are a renowned constitutional law expert and Supreme Court strategist with deep expertise in religious liberty, constitutional interpretation, and Supreme Court advocacy. You help attorneys develop winning legal strategies by thinking creatively about constitutional arguments.

CURRENT CASE CONTEXT:
`;

    // Add case information
    if (caseInformation) {
      fullContext += `
CASE DETAILS:
- Case: ${caseInformation.caseName || caseInformation.case_name || 'Constitutional Challenge'}
- Court: ${caseInformation.courtLevel || caseInformation.court_level || 'Federal Court'}
- Constitutional Question: ${caseInformation.constitutionalQuestion || caseInformation.constitutional_question || 'Constitutional interpretation required'}
- Legal Issues: ${caseInformation.legalIssues || caseInformation.legal_issues || 'Constitutional analysis needed'}
- Penalties/Stakes: ${caseInformation.penalties || 'Significant constitutional implications'}
- Target Precedent: ${caseInformation.targetPrecedent || caseInformation.precedent_target || 'Establishing new precedent'}
`;
    }

    // Add selected legal documents context
    if (selectedDocuments && selectedDocuments.length > 0) {
      fullContext += `
LEGAL RESEARCH DOCUMENTS (${selectedDocuments.length} documents):
`;
      selectedDocuments.slice(0, 10).forEach((doc: any, index: number) => {
        fullContext += `
${index + 1}. ${doc.title || doc.case_title}
   Court: ${doc.court || 'Unknown Court'}
   Citation: ${doc.citation || 'No citation'}
   Key Content: ${(doc.content || doc.full_text || '').substring(0, 500)}...
   Relevance: ${doc.relevance_score || 'High'}
`;
      });
      if (selectedDocuments.length > 10) {
        fullContext += `\n... and ${selectedDocuments.length - 10} additional legal documents available for reference.`;
      }
    }

    // Add historical research context
    if (historicalResearch) {
      fullContext += `
HISTORICAL CONSTITUTIONAL RESEARCH:
`;
      if (historicalResearch.foundingDocuments) {
        fullContext += `
FOUNDING DOCUMENTS (${historicalResearch.foundingDocuments.length}):
`;
        historicalResearch.foundingDocuments.slice(0, 5).forEach((doc: any, index: number) => {
          fullContext += `${index + 1}. ${doc.title} - ${doc.significance}
   Key Quote: "${doc.keyQuote}"
   Strategic Value: ${doc.psychologicalAppeal}
`;
        });
      }

      if (historicalResearch.historicalCases) {
        fullContext += `
HISTORICAL PRECEDENTS (${historicalResearch.historicalCases.length}):
`;
        historicalResearch.historicalCases.slice(0, 5).forEach((doc: any, index: number) => {
          fullContext += `${index + 1}. ${doc.title} - ${doc.significance}
   Key Holding: "${doc.keyQuote}"
   Strategic Value: ${doc.psychologicalAppeal}
`;
        });
      }

      if (historicalResearch.colonialExamples) {
        fullContext += `
COLONIAL/HISTORICAL EXAMPLES (${historicalResearch.colonialExamples.length}):
`;
        historicalResearch.colonialExamples.slice(0, 5).forEach((doc: any, index: number) => {
          fullContext += `${index + 1}. ${doc.title} - ${doc.significance}
   Historical Context: "${doc.keyQuote}"
   Strategic Value: ${doc.psychologicalAppeal}
`;
        });
      }
    }

    // Add Justice Analysis
    if (justiceAnalysis) {
      fullContext += `
SUPREME COURT JUSTICE ANALYSIS:
`;
      if (justiceAnalysis.justices) {
        justiceAnalysis.justices.slice(0, 9).forEach((justice: any) => {
          fullContext += `
${justice.name}:
- Judicial Philosophy: ${justice.philosophy || 'Constitutional approach'}
- Key Values: ${justice.coreValues?.join(', ') || 'Constitutional principles'}
- Persuasion Strategy: ${justice.persuasionStrategy || 'Constitutional argumentation'}
- Likely Position: ${justice.likelyPosition || 'Constitutional analysis needed'}
`;
        });
      }
    }

    fullContext += `

STRATEGY CHAT INSTRUCTIONS:
You are now in a strategic brainstorming session. The attorney will share their current strategy or ask for constitutional law insights. Your role is to:

1. ANALYZE their strategy through a constitutional law lens
2. SUGGEST creative, out-of-the-box constitutional arguments
3. IDENTIFY overlooked constitutional principles or precedents
4. PROPOSE alternative legal theories or approaches
5. HIGHLIGHT potential weaknesses and how to address them
6. RECOMMEND tactical considerations for Supreme Court advocacy

Focus on constitutional law expertise, creative legal thinking, and strategic Supreme Court advocacy. Consider:
- Religious Liberty & Free Exercise doctrine
- Establishment Clause jurisprudence  
- Due Process and Equal Protection angles
- Federalism and separation of powers
- Historical constitutional interpretation
- Originalist vs. Living Constitution approaches
- Justice-specific persuasion strategies

Be insightful, creative, and practical. Think like a seasoned Supreme Court advocate.`;

    // Build conversation history for Claude
    const messages = [];
    
    // Add chat history if provided
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: `${fullContext}\n\nUSER'S STRATEGY QUESTION:\n${message}`
    });

    console.log('🤖 Sending strategy chat to Claude with context...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7, // Slightly higher for creative strategy suggestions
      messages: messages
    });

    console.log('✅ Strategy chat response received from Claude');

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      success: true,
      response: content.text,
      contextUsed: {
        caseInformation: !!caseInformation,
        documentsCount: selectedDocuments?.length || 0,
        historicalResearch: !!historicalResearch,
        justiceAnalysis: !!justiceAnalysis
      }
    });

  } catch (error) {
    console.error('Strategy chat error:', error);
    
    let errorMessage = 'Failed to process strategy chat';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'AI service request timeout';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
