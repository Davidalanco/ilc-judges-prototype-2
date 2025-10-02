import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateText } from '@/lib/ai/openai';
import { generateWithGemini } from '@/lib/ai/gemini';
import { db } from '@/lib/db';
import '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, contextData, briefStructure } = await request.json();

    if (!contextData || !briefStructure) {
      return NextResponse.json({ 
        error: 'Context data and brief structure are required' 
      }, { status: 400 });
    }

    console.log('🤖 Generating brief content for case:', caseId);
    console.log('📋 Context includes:', {
      caseInfo: !!contextData.caseInformation,
      documents: contextData.selectedDocuments?.length || 0,
      summaries: contextData.documentSummaries?.length || 0,
      justiceAnalysis: !!contextData.justiceAnalysis,
      historicalResearch: !!contextData.historicalResearch,
      exampleBrief: !!contextData.exampleBrief,
      exampleBriefContent: contextData.exampleBrief?.content?.length || 0,
      exampleBriefSections: contextData.exampleBrief?.structure?.length || 0,
      strategyChatMessages: contextData.strategyChatHistory?.length || 0
    });

    // Detailed per-source logging to verify end-to-end context wiring
    console.log('🔎 Case Information snapshot:', {
      caseName: contextData.caseInformation?.caseName || contextData.caseInformation?.case_name,
      courtLevel: contextData.caseInformation?.courtLevel || contextData.caseInformation?.court_level,
      hasTranscript: !!(contextData.caseInformation?.transcript || contextData.caseInformation?.transcription),
      transcriptLength: (contextData.caseInformation?.transcript || contextData.caseInformation?.transcription || '').length
    });

    // Log selected documents with type and identifiers
    try {
      const docLog = (contextData.selectedDocuments || []).slice(0, 10).map((d: any, i: number) => ({
        idx: i + 1,
        id: d.id,
        title: d.title,
        type: d.type,
        citation: d.citation,
        relevance: d.relevance,
        fileName: d.fileName,
        source: d.source,
        hasContent: !!d.content,
        contentChars: (d.content || '').length
      }));
      console.log('📄 Selected documents (first 10):', docLog);
    } catch {}
    
    if (contextData.exampleBrief) {
      console.log('📄 Example brief details:', {
        fileName: contextData.exampleBrief.fileName,
        contentLength: contextData.exampleBrief.content?.length || 0,
        sectionsFound: contextData.exampleBrief.structure?.length || 0,
        hasStructure: !!contextData.exampleBrief.structure,
        hasContent: !!(contextData.exampleBrief.content && contextData.exampleBrief.content.length > 100)
      });
    }

    // Enhanced logging for data completeness
    console.log('📋 Detailed context analysis:', {
      transcriptionIncluded: !!(contextData.caseInformation?.transcript || contextData.caseInformation?.transcription),
      transcriptionLength: (contextData.caseInformation?.transcript || contextData.caseInformation?.transcription || '').length,
      selectedDocuments: contextData.selectedDocuments?.length || 0,
      documentsWithContent: contextData.selectedDocuments?.filter((doc: any) => doc.content && doc.content.length > 100).length || 0,
      documentSummariesCount: contextData.documentSummaries?.length || 0,
      justiceAnalysisIncluded: !!contextData.justiceAnalysis,
      historicalResearch: {
        hasData: !!contextData.historicalResearch,
        foundingDocs: contextData.historicalResearch?.foundingDocuments?.length || 0,
        historicalCases: contextData.historicalResearch?.historicalCases?.length || 0,
        colonialExamples: contextData.historicalResearch?.colonialExamples?.length || 0
      },
      strategyChatHistory: {
        hasChat: !!(contextData.strategyChatHistory && contextData.strategyChatHistory.length > 0),
        messageCount: contextData.strategyChatHistory?.length || 0,
        userMessages: contextData.strategyChatHistory?.filter((msg: any) => msg.role === 'user').length || 0,
        expertResponses: contextData.strategyChatHistory?.filter((msg: any) => msg.role === 'assistant').length || 0
      }
    });

    // Justice targeting snapshot
    if (contextData.justiceAnalysis) {
      console.log('🎯 Justice targeting snapshot:', {
        keys: Object.keys(contextData.justiceAnalysis || {}),
      });
    }

    // Build comprehensive context for AI generation - PRIORITIZED ORDER
    let promptContext = `CASE INFORMATION:
Case Name: ${contextData.caseInformation?.caseName || contextData.caseInformation?.case_name || 'Unknown Case'}
Court Level: ${contextData.caseInformation?.courtLevel || contextData.caseInformation?.court_level || 'Unknown Court'}
Constitutional Question: ${contextData.caseInformation?.constitutionalQuestion || contextData.caseInformation?.constitutional_question || 'Constitutional analysis required'}
Client Position: Amicus Curiae (Friend of the Court)
Brief Type: Amicus Brief supporting the position that protects constitutional rights

=== HIGHEST PRIORITY GUIDANCE ===`;

    // PRIORITY #0: Approved Brief Outline - MUST FOLLOW EXACTLY
    if (contextData.approvedOutline) {
      promptContext += `

🏆 PRIORITY #0: APPROVED BRIEF OUTLINE - MANDATORY STRUCTURE
This is the APPROVED outline that must be followed EXACTLY. Every section, argument, and point listed here MUST be included in the brief.

APPROVED OUTLINE TO FOLLOW:
${contextData.approvedOutline}

🚨 CRITICAL: This outline was generated based on your strategy discussion and has been specifically approved. You MUST follow this exact structure and include all points, arguments, and evidence specified. This takes absolute precedence over everything else.`;
    }

    // PRIORITY #1: Strategy chat history - MOST IMPORTANT
    if (contextData.strategyChatHistory && contextData.strategyChatHistory.length > 0) {
      promptContext += `

🎯 PRIORITY #1: EXPERT CONSTITUTIONAL STRATEGY DISCUSSION
This is the MOST IMPORTANT guidance for writing this brief. This contains refined constitutional analysis, creative legal strategies, and expert recommendations specifically developed for this case.

STRATEGY CHAT CONVERSATION:`;
      
      contextData.strategyChatHistory.forEach((message: any, index: number) => {
        const role = message.role === 'user' ? 'ATTORNEY' : 'CONSTITUTIONAL EXPERT';
        promptContext += `\n\n--- ${role} ---\n${message.content}`;
      });
      
      promptContext += `

⚠️ CRITICAL: The above strategy discussion is your PRIMARY guidance. Every argument, approach, and constitutional theory discussed here should be prominently featured in the brief. This expert analysis takes precedence over all other materials.`;
    }

    // PRIORITY #2: Initial attorney strategy discussion - SECOND MOST IMPORTANT  
    if (contextData.caseInformation?.transcript || contextData.caseInformation?.transcription) {
      promptContext += `

📋 PRIORITY #2: INITIAL ATTORNEY STRATEGY DISCUSSION
This contains the foundational strategic thinking and case approach that started this process.

ORIGINAL ATTORNEY DISCUSSION:
${contextData.caseInformation.transcript || contextData.caseInformation.transcription}

⚠️ IMPORTANT: This initial discussion provides key strategic direction and should be heavily weighted in your brief writing, second only to the expert strategy chat above.`;
    }

    promptContext += `

=== SUPPORTING RESEARCH MATERIALS ===
The following materials provide supporting evidence and context for the strategic approaches outlined above:`;

    // Add selected documents (include full content for Gemini large context)
    if (contextData.selectedDocuments && contextData.selectedDocuments.length > 0) {
      promptContext += `\n\nRELEVANT LEGAL DOCUMENTS:`;
      contextData.selectedDocuments.forEach((doc: any, index: number) => {
        promptContext += `\n\n--- Document ${index + 1}: ${doc.title} (${doc.type || 'document'}) ---`;
        if (doc.citation) {
          promptContext += `\nCitation: ${doc.citation}`;
        }
        if (doc.fileName) {
          promptContext += `\nFile: ${doc.fileName}`;
        }
        if (doc.source) {
          promptContext += `\nSource: ${doc.source}${doc.url ? ` (${doc.url})` : ''}`;
        }
        if (doc.content) {
          promptContext += `\n\n${doc.content}`;
        }
      });
    }

    // Add document summaries
    if (contextData.documentSummaries && contextData.documentSummaries.length > 0) {
      promptContext += `\n\nAI-GENERATED DOCUMENT SUMMARIES:`;
      contextData.documentSummaries.forEach((summary: string, index: number) => {
        promptContext += `\n\n--- Summary ${index + 1} ---\n${summary}`;
      });
    }

    // Add justice analysis with explicit tailoring instructions
    if (contextData.justiceAnalysis) {
      promptContext += `\n\nJUSTICE TARGETING ANALYSIS (USE THIS TO TAILOR TONE, PRECEDENTS, AND FRAME):
${JSON.stringify(contextData.justiceAnalysis, null, 2)}

MANDATE: Use the above judicial philosophies and persuasion levers to:
- Select precedents and quotes that resonate with each justice's jurisprudential approach
- Adjust framing (textualism/originalism/pragmatism) accordingly
- Sequence arguments in an order most persuasive to the median justice`;
    }

    // Add historical research
    if (contextData.historicalResearch) {
      promptContext += `\n\nHISTORICAL RESEARCH FINDINGS:`;
      
      if (contextData.historicalResearch.foundingDocuments) {
        promptContext += `\n\nFounding Documents:`;
        contextData.historicalResearch.foundingDocuments.forEach((doc: any) => {
          promptContext += `\n\n--- ${doc.title} ---`;
          promptContext += `\nSignificance: ${doc.significance}`;
          if (doc.keyQuote) {
            promptContext += `\nKey Quote: "${doc.keyQuote}"`;
          }
          if (doc.strategicAppeal) {
            promptContext += `\nStrategic Appeal: ${doc.strategicAppeal}`;
          }
        });
      }
      
      if (contextData.historicalResearch.historicalCases) {
        promptContext += `\n\nHistorical Precedents:`;
        contextData.historicalResearch.historicalCases.forEach((case_: any) => {
          promptContext += `\n\n--- ${case_.title} ---`;
          promptContext += `\nSignificance: ${case_.significance}`;
          if (case_.keyQuote) {
            promptContext += `\nKey Quote: "${case_.keyQuote}"`;
          }
          if (case_.caseContext) {
            promptContext += `\nContext: ${case_.caseContext}`;
          }
          if (case_.strategicAppeal) {
            promptContext += `\nStrategic Appeal: ${case_.strategicAppeal}`;
          }
        });
      }
      
      if (contextData.historicalResearch.colonialExamples) {
        promptContext += `\n\nColonial & Historical Examples:`;
        contextData.historicalResearch.colonialExamples.forEach((example: any) => {
          promptContext += `\n\n--- ${example.title} ---`;
          promptContext += `\nSignificance: ${example.significance}`;
          if (example.keyQuote) {
            promptContext += `\nKey Quote: "${example.keyQuote}"`;
          }
          if (example.historicalContext) {
            promptContext += `\nHistorical Context: ${example.historicalContext}`;
          }
          if (example.strategicAppeal) {
            promptContext += `\nStrategic Appeal: ${example.strategicAppeal}`;
          }
        });
      }
    }



    // Add example brief structure and content if available
    if (contextData.exampleBrief) {
      promptContext += `\n\nREFERENCE BRIEF TO FOLLOW FOR STRUCTURE AND STYLE:`;
      
      if (contextData.exampleBrief.structure && contextData.exampleBrief.structure.length > 0) {
        promptContext += `\n\nEXAMPLE BRIEF STRUCTURE:`;
        contextData.exampleBrief.structure.forEach((section: any) => {
          promptContext += `\n- ${section.title} (${section.type})`;
          if (section.content && section.content.length > 100) {
            // Include a sample of the content to show style and approach
            const contentSample = section.content.substring(0, 500) + (section.content.length > 500 ? '...' : '');
            promptContext += `\n  Sample content: "${contentSample}"`;
          }
        });
      }
      
      if (contextData.exampleBrief.content && contextData.exampleBrief.content.length > 0) {
        promptContext += `\n\nEXAMPLE BRIEF FULL CONTENT (for style and structure reference):\n${contextData.exampleBrief.content}`;
      }
      
      promptContext += `\n\nIMPORTANT: Use the above reference brief as a model for:
- Writing style and tone
- Section organization and flow
- Argument structure and approach  
- Legal citation patterns
- Professional formatting conventions
- Level of detail and analysis depth`;
    }

    // Generate content for each section
    const generatedSections = [];

    for (const section of briefStructure) {
      console.log(`📝 Generating content for section: ${section.title}`);

      const sectionPrompt = `You are a Supreme Court advocate writing a tactical litigation weapon, not an academic paper. You are NOT a law professor explaining concepts - you are a litigator fighting to win a specific case. Every sentence must serve a strategic purpose to persuade specific justices to rule in your favor.

${promptContext}

SECTION TO WRITE: ${section.title}
SECTION TYPE: ${section.type}

🎯 SUPREME COURT LITIGATION WEAPON REQUIREMENTS:
You are writing a brief designed to WIN, not to educate. This is advocacy, not scholarship. Every word must advance your legal argument toward victory.

MANDATORY TACTICAL REQUIREMENTS:
• DENSE CITATIONS: Multiple pinpoint citations per paragraph like the Fulton brief - "Id. at 1468", "See id. at 641"
• DIRECT QUOTES AS WEAPONS: Use exact quotes from cases to lock in legal precedents that support your argument
• FACTUAL PRECISION: Concrete examples with specific dates, names, and legal consequences - not abstract theories
• MULTI-LAYERED ATTACKS: Build sophisticated arguments that connect multiple precedents to demolish opposing positions
• STRATEGIC CITATIONS: Every cite must serve a tactical purpose - either building your argument or destroying theirs
• ANTICIPATE AND DESTROY: Preemptively attack the strongest counterarguments with precise legal authority

IMPORTANT: Since the specific amicus party organization name was not provided, use placeholder text like "[AMICUS ORGANIZATION NAME]" that the user can easily find and replace with the actual organization name.

INSTRUCTIONS (IN ORDER OF PRIORITY):
1. 🏆 ABSOLUTE PRIORITY: Follow the APPROVED BRIEF OUTLINE exactly - include every section, argument, and point specified
2. 🎯 HIGHEST PRIORITY: Incorporate and implement ALL strategies, arguments, and constitutional theories from the EXPERT CONSTITUTIONAL STRATEGY DISCUSSION above
3. 📋 SECOND PRIORITY: Build upon the foundational strategic direction from the INITIAL ATTORNEY STRATEGY DISCUSSION
4. 📖 THIRD PRIORITY: Follow the uploaded reference brief's style, tone, and approach for structure and formatting

FULTON BRIEF TACTICAL STANDARDS - MATCH EXACTLY:
5. 🎯 FULTON-LEVEL CITATIONS: Copy the exact citation density and precision:
   - Full Bluebook format: "Employment Division v. Smith, 494 U.S. 872 (1990)"
   - Pinpoint pages: "See id. at 1468", "Id. at 641"  
   - Cross-references: "See, e.g., id. at 896 (O'Connor, J., concurring)"
   - Multiple authorities per paragraph like Fulton brief
   - Exact statutory citations with section numbers

6. 🔥 TACTICAL HISTORICAL WEAPONS: Use history to destroy opposing arguments:
   - Exact quotes with full attribution: "Resolution of July 18, 1775, reprinted in 2 Journals of the Continental Congress, 1774-1789, at 187, 189 (W. Ford ed. 1905)"
   - Concrete examples that prove your legal point
   - Historical precedents that directly support your constitutional interpretation
   - Specific dates and participants that lock in your argument
   - Counter-historical evidence that demolishes opposing views

7. ⚖️ TACTICAL LEGAL PRECISION: Build arguments that win cases:
   - Connect precedents to create unassailable legal logic
   - Use case law to trap opponents in their own precedents
   - Demonstrate why your interpretation compels the Court's ruling
   - Preemptively destroy counterarguments with superior authority
   - Build multi-layered legal reasoning that leads inevitably to your conclusion

8. 📋 FACTUAL SPECIFICITY: Ground every argument in concrete facts:
   - Use real case studies and examples from the provided research materials
   - Reference specific statutory language and regulatory text
   - Include actual legislative history and committee reports
   - Cite real-world consequences and practical applications
   - Provide concrete examples of how legal principles operate

9. 🔗 LEGAL CITATION FORMAT: Follow proper Bluebook citation format exactly as shown in reference brief
10. 📖 SUBSTANTIVE DEPTH: Match the analytical rigor and detail level of the reference brief
11. 🎯 AVOID VAGUE STATEMENTS: Never use general phrases like "courts have held" without specific citations
12. 📚 USE PROVIDED RESEARCH: Heavily incorporate the historical research findings, legal documents, and case law from the context materials
13. 🏛️ CONSTITUTIONAL GROUNDING: Root every constitutional argument in specific text, historical understanding, and judicial interpretation
14. 📝 PRACTICAL APPLICATION: Show how legal principles apply to the specific facts of this case
15. 🔍 PRECISION: Use exact legal terminology and avoid general or abstract statements
16. 📄 Use clear placeholder text like "[AMICUS ORGANIZATION NAME]" for missing information

⚠️ CRITICAL REMINDER: The expert strategy discussion contains the most refined constitutional analysis for this specific case. Every creative argument, constitutional theory, and strategic approach mentioned in that discussion must be prominently featured in this section.

🏆 SUPREME COURT BRIEF STANDARD: This brief must meet the same citation density and analytical rigor as successful Supreme Court briefs. Every paragraph should contain multiple specific legal citations, concrete examples, and detailed analysis. Avoid all general statements - every legal assertion must be backed by specific authority with precise citations.

📚 CITATION DENSITY REQUIREMENT: Like the reference brief, aim for multiple specific citations per paragraph. For example, when discussing historical examples, include exact dates, specific congressional records, precise statutory citations, and detailed case facts - never just general references to "historical precedent" or "court decisions."

⚖️ CONSTITUTIONAL LAW EXPERTISE REQUIRED:
• Quote specific language from Supreme Court opinions with exact page citations
• Reference specific constitutional text with historical interpretation
• Cite specific congressional debates, committee reports, and legislative history
• Include direct quotes from founding fathers with exact source citations
• Reference specific historical events with dates, participants, and documentary evidence
• Analyze competing constitutional theories with sophisticated legal reasoning
• Address circuit splits and conflicting interpretations with precise case analysis
• Demonstrate mastery of constitutional doctrine evolution across decades
• Use exact statutory language and regulatory text with specific code citations
• Include relevant law review articles and constitutional scholarship with full citations

🥊 TACTICAL ADVOCACY - NOT ACADEMIC WRITING:
• Start with YOUR WINNING LEGAL STANDARD, then build the argument around it
• Use precedents as weapons - show why they COMPEL your result
• Attack opposing arguments before they can gain footing
• Every paragraph must advance toward your inevitable legal victory
• Quote exact language that locks the Court into ruling for you
• Build legal traps that make ruling against you legally impossible
• Connect all authority to show why your interpretation is the ONLY constitutional one

${section.type === 'statement_of_interest' ? `
For the Statement of Interest:
- MIRROR the structure and approach used in the reference brief's Statement of Interest section
- Use "[AMICUS ORGANIZATION NAME]" as placeholder for the organization filing the brief
- Follow the same pattern for establishing standing and credibility as shown in the reference
- Match the length, tone, and level of detail from the reference brief
- Use similar language patterns and professional conventions from the reference
- Adapt the reference brief's successful credibility-building techniques to your organization
` : ''}

${section.type === 'question_presented' ? `
For the Question Presented:
- FOLLOW the exact format and style used in the reference brief's Question Presented
- Mirror the reference brief's approach to framing constitutional questions
- Use similar language patterns and precision level as the reference
- Match the reference brief's structure and legal phrasing conventions
` : ''}

${section.type === 'summary_of_argument' ? `
For the Summary of Argument:
- REPLICATE the organizational structure from the reference brief's Summary of Argument
- Use the same numbering system (Roman numerals, letters, etc.) as the reference
- Match the length and detail level shown in the reference brief
- Adopt the same persuasive techniques and argument previewing style from the reference
` : ''}

${section.type === 'argument' ? `
For Argument sections:
- EMULATE the argument structure and development style from the reference brief
- Use the same heading format and organizational patterns as the reference
- Match the citation style, case analysis depth, and reasoning flow from the reference
- Adopt the reference brief's approach to constitutional interpretation and precedent usage
- Mirror the reference brief's techniques for addressing counterarguments
` : ''}

${section.type === 'conclusion' ? `
For the Conclusion:
- MIRROR the structure and approach of the reference brief's Conclusion
- Use similar language patterns and professional formality as the reference
- Match the length and level of summary detail from the reference brief
- Adopt the same style for requesting relief as shown in the reference
` : ''}

🚨 FINAL MANDATE: You are writing a LITIGATION WEAPON, not a law review article. Every sentence must be designed to WIN THE CASE. Stop explaining concepts and START ATTACKING. Use the law as a sword to destroy opposing arguments and build an unassailable fortress around your position.

🏆 SUPREME COURT EXEMPLAR - MATCH THIS EXACT STYLE AND CITATION DENSITY:
You must write with the same sophistication as this actual Supreme Court amicus brief from Fulton v. City of Philadelphia:

EXEMPLAR OPENING: "Many view their favored policy preferences as uniquely enlightened and any claim of conscientious objection as mere manipulation or, worse, weaponization of religion. Our founders had a different view. Madison understood religious objectors to be caught, by no fault of their own, between the claims of competing sovereigns — the state and, as he described it, the "Universal Sovereign." James Madison, Memorial and Remonstrance against Religious Assessments (1785), reprinted in 8 THE PAPERS OF JAMES MADISON, 10 March 1784-28 March 1786, 295-306 (Robert A. Rutland and William M.E. Rachal eds., Univ. of Chicago Press 1973), ¶ 1."

EXEMPLAR ANALYSIS: "Early in our history, most colonial governments gave no quarter to dissenting religious conduct. As a result, religious minorities faced many difficulties, often involving conscientious objection to military service and the taking of oaths. See Michael W. McConnell, The Origins and Historical Understanding of Free Exercise of Religion, 103 HARV. L. REV. 1409, 1466 (May 1990). Conscientious objectors to military service, such as Quakers and Mennonites, were punished on account of their refusal to bear arms. See id. at 1468."

EXEMPLAR DIRECT QUOTES: "Resolution of July 18, 1775, reprinted in 2 Journals of the Continental Congress, 1774-1789, at 187, 189 (W. Ford ed. 1905 & photo, reprint 1968): 'As there are some people, who, from religious principles, cannot bear arms in any case, this Congress intend no violence to their consciences, but earnestly recommend it to them, to contribute liberally in this time of universal calamity, to the relief of their distressed brethren in the several colonies...'"

EXEMPLAR CASE ANALYSIS: "Just four years after this Court in Minersville School Dist. Bd. of Ed. v. Gobitis, 310 U.S. 586, 594-95 (1940), allowed Jehovah's Witnesses to be punished for refusing to salute the flag in school, the case was effectively overruled in W. Va. State Bd. of Educ. v. Barnette, 319 U.S. 624 (1943). Barnette described the danger of uniformity: '[a]s governmental pressure toward unity becomes greater, so strife becomes more bitter as to whose unity it shall be. . . . Compulsory unification of opinion achieves only the unanimity of the graveyard.' Id. at 641."

EXEMPLAR STATUTORY PRECISION: "Pennsylvania, one of the seven states that expressly protects non-profits, for instance, does not permit a claim under the Pennsylvania Religious Freedom Protection Act by a for-profit corporation. But it is no more acceptable for the government to infringe on the religious exercise of a business owner in the way that she runs her business (such as a religious newspaper or periodical) than to infringe on that same business owner's free speech rights. Cf. Burwell v. Hobby Lobby Stores, Inc., 573 U.S. 682, 707 (2014)."

🥊 REQUIRED FULTON-LEVEL TACTICAL PRECISION:
• ATTACK WITH QUOTES: Use exact constitutional and case language as weapons that force your conclusion
• CITATION DENSITY: Multiple pinpoint cites per paragraph like Fulton: "See id. at 1468", "Id. at 641"
• CONCRETE FACTUAL AMMUNITION: Specific dates, names, and circumstances that prove your point
• TACTICAL PRECEDENT CONNECTIONS: Link cases to create unbreakable legal logic chains
• DESTROY COUNTERARGUMENTS: Preemptively demolish opposing positions with superior authority
• FACTUAL PRECISION: Real examples that make your constitutional interpretation the only viable one
• BUILD LEGAL INEVITABILITY: Create arguments where ruling against you becomes legally impossible

🎯 STOP BEING ACADEMIC - START BEING TACTICAL:
Don't explain what the law means - USE the law to WIN. Every citation must serve your argument. Every historical example must prove your point. Every precedent must lead inevitably to your victory.

Write only the content for this section. Do not include section headers or metadata. Write as a Supreme Court advocate whose career depends on WINNING this argument.`;

      try {
        // Always use Gemini 2.5 for large-context legal drafting
        console.log(`📊 Section "${section.title}" - Forcing Gemini 2.5 Flash with full-context prompt`);
        const sectionContent = await generateWithGemini(sectionPrompt);
        
        // Calculate a mock persuasion score based on content quality indicators
        const persuasionScore = calculatePersuasionScore(sectionContent, contextData.justiceAnalysis);
        
        generatedSections.push({
          id: section.id,
          title: section.title,
          content: sectionContent,
          type: section.type,
          order: section.order,
          persuasionScore
        });

        console.log(`✅ Generated ${sectionContent.length} characters for ${section.title}`);

      } catch (error) {
        console.error(`❌ Failed to generate content for ${section.title}:`, error);
        
        // Provide fallback content
        generatedSections.push({
          id: section.id,
          title: section.title,
          content: generateFallbackContent(section.type, contextData.caseInformation),
          type: section.type,
          order: section.order,
          persuasionScore: 60
        });
      }
    }

    // Create or update brief record in database
    let briefId;
    try {
      const briefData = {
        case_id: caseId,
        sections: JSON.stringify(generatedSections),
        content: generatedSections.map(s => s.content).join('\n\n'),
        status: 'draft',
        version: 1,
        word_count: generatedSections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0),
        persuasion_scores: JSON.stringify({
          overall: Math.round(generatedSections.reduce((sum, s) => sum + s.persuasionScore, 0) / generatedSections.length),
          sections: generatedSections.reduce((acc, s) => ({...acc, [s.id]: s.persuasionScore}), {})
        })
      };

      const savedBrief = await db.createBrief(briefData);
      briefId = savedBrief.id;
      
      console.log(`💾 Brief saved to database with ID: ${briefId}`);

    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue without database save
    }

    return NextResponse.json({
      success: true,
      message: 'Brief content generated successfully',
      briefId,
      sections: generatedSections,
      metadata: {
        totalWordCount: generatedSections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0),
        overallPersuasionScore: Math.round(generatedSections.reduce((sum, s) => sum + s.persuasionScore, 0) / generatedSections.length),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief content' },
      { status: 500 }
    );
  }
}

// Helper function to calculate persuasion score
function calculatePersuasionScore(content: string, justiceAnalysis: any): number {
  let score = 70; // Base score

  // Check for constitutional language
  const constitutionalTerms = ['constitution', 'amendment', 'framers', 'founding', 'precedent', 'stare decisis'];
  const constitutionalMatches = constitutionalTerms.filter(term => 
    content.toLowerCase().includes(term)
  ).length;
  score += constitutionalMatches * 2;

  // Check for case citations (simplified)
  const citationPattern = /\b\w+\s+v\.\s+\w+/g;
  const citations = content.match(citationPattern) || [];
  score += Math.min(citations.length * 3, 15);

  // Check for justice-specific language if available
  if (justiceAnalysis) {
    const conservativeTerms = ['originalism', 'textualism', 'traditional', 'founding era'];
    const conservativeMatches = conservativeTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    score += conservativeMatches * 2;
  }

  // Ensure score is within bounds
  return Math.min(Math.max(score, 40), 95);
}

// Helper function to generate fallback content
function generateFallbackContent(sectionType: string, caseInfo: any): string {
  const caseName = caseInfo?.caseName || caseInfo?.case_name || 'this case';
  const constitutionalQuestion = caseInfo?.constitutionalQuestion || caseInfo?.constitutional_question || 'the constitutional question presented';

  switch (sectionType) {
    case 'statement_of_interest':
      return `[AMICUS ORGANIZATION NAME] respectfully submits this brief as amicus curiae in support of [Petitioner/Respondent]. [AMICUS ORGANIZATION NAME] has a substantial interest in ${constitutionalQuestion.toLowerCase()} and brings unique expertise to assist this Court in resolving the important constitutional questions presented in ${caseName}.`;
    
    case 'question_presented':
      return constitutionalQuestion.endsWith('?') ? constitutionalQuestion : `${constitutionalQuestion}?`;
    
    case 'summary_of_argument':
      return `This Court should [grant/reverse] because: I. The constitutional principles at stake require protection of fundamental rights. II. The lower court's decision conflicts with established precedent. III. The broader implications of this case demand careful consideration of constitutional principles.`;
    
    case 'argument':
      return `The constitutional analysis in ${caseName} requires careful examination of both text and precedent. This Court has consistently held that constitutional rights deserve robust protection, particularly when fundamental principles are at stake. The arguments presented here demonstrate why [POSITION ON CONSTITUTIONAL QUESTION] is both constitutionally required and consistent with this Court's precedents.`;
    
    case 'conclusion':
      return `For the foregoing reasons, [AMICUS ORGANIZATION NAME] respectfully urges this Court to [grant the petition/reverse the judgment below]. The constitutional principles at stake require this Court's intervention to ensure that fundamental rights receive the protection they deserve under our constitutional system.`;
    
    default:
      return `Content for this section will be generated based on the specific constitutional arguments and legal analysis relevant to ${caseName}.`;
  }
}
