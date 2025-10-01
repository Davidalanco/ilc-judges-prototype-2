export interface AmicusBriefSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'header' | 'summary' | 'argument' | 'conclusion' | 'citation' | 'table_of_authorities';
  required: boolean;
  placeholder: string;
  aiPrompt?: string;
  wordCount?: number;
  lastModified?: Date;
}

export interface AmicusBriefTemplate {
  id: string;
  name: string;
  description: string;
  sections: AmicusBriefSection[];
  basedOn: string;
  successRate?: string;
}

// Enhanced template based on GPT-5 Supreme Court-grade specifications
export const SUPREME_COURT_AMICUS_TEMPLATE: AmicusBriefTemplate = {
  id: 'supreme-court-template',
  name: 'Supreme Court-Grade Amicus Brief Template',
  description: 'Based on GPT-5 analysis of successful Supreme Court amicus briefs with enhanced compliance and quality standards',
  basedOn: 'GPT-5 Analysis of Multiple Successful SCOTUS Amicus Briefs',
  successRate: 'Supreme Court Grade',
  sections: [
    {
      id: 'interest-of-amicus',
      title: 'Interest of Amicus Curiae',
      content: '',
      order: 1,
      type: 'summary',
      required: true,
      placeholder: `INTEREST OF AMICUS CURIAE

[Amicus Name] is [one-paragraph identity statement explaining who the amicus is and their expertise].

[One-to-two paragraphs of concrete experience or data demonstrating the amicus's unique perspective and expertise in the relevant area].

[One paragraph linking that experience to the specific question presented, showing how the issue concretely affects the amicus or its constituents].

[If applicable, mention related litigation, industry role, or empirical perspective that provides unique value beyond the parties' briefs].`,
      aiPrompt: 'Write 3-5 paragraphs establishing (a) who the amicus is, (b) why its perspective is uniquely valuable in this case, and (c) how the issue concretely affects the amicus or its constituents. Avoid repeating party arguments; emphasize distinctive expertise, data, or litigation experience. Tone: formal, restrained, specific.'
    },
    {
      id: 'argument-i',
      title: 'Argument I: [Narrative → Generalization]',
      content: '',
      order: 2,
      type: 'argument',
      required: true,
      placeholder: `ARGUMENT I
[LONG, PERSUASIVE HEADING THAT TELLS THE STORY]

[Micro narrative: Begin with a concise, chronological narrative showing an accommodation path that worked and was later withdrawn due to non-legal pressures; then show consequences to livelihood]

[Zoom out: 3-5 compact cross-tradition examples (e.g., scheduling, grooming, attire) to demonstrate breadth and neutrality concerns across different faiths/contexts]

[Name the mechanism succinctly (e.g., "modified heckler's veto," "misfit atextual test")]

[Each exemplar should have one authoritative citation with a 10-20 word parenthetical stating the proposition]`,
      aiPrompt: 'Begin with a concise, chronological narrative showing an accommodation path that worked and was later withdrawn due to non-legal pressures; then generalize across at least three faiths/contexts to demonstrate systemic harm. Name the mechanism succinctly. Each exemplar should have one authoritative citation with a 10-20 word parenthetical stating the proposition.'
    },
    {
      id: 'argument-ii',
      title: 'Argument II: [Textual Reset]',
      content: '',
      order: 3,
      type: 'argument',
      required: true,
      placeholder: `ARGUMENT II
[LONG, PERSUASIVE HEADING THAT ANCHORS IN ENACTED TEXT]

[Quote the statute first; bold or offset critical terms]

[Define those terms from authoritative dictionaries; reconcile with statutory structure]

[Demonstrate mismatch with the criticized precedent's test]

[Comparative statutes (e.g., ADA/USERRA/PWFA) to show Congress's consistent "undue hardship" usage and to cabin employer burden analysis]

[Show outcome flip under the correct standard with a short, analytic walkthrough]`,
      aiPrompt: 'Quote the governing statutory text; define the key terms using authoritative dictionaries; show how the criticized precedent\'s test conflicts with ordinary meaning and statutory structure. Use comparative statutes to cabin "undue hardship." Conclude with a short demonstration of how the correct standard changes outcomes. Keep quotes short with pinpoints.'
    },
    {
      id: 'argument-iii',
      title: 'Argument III: [Stare Decisis Analysis]',
      content: '',
      order: 4,
      type: 'argument',
      required: true,
      placeholder: `ARGUMENT III
[LONG, PERSUASIVE HEADING THAT ADDRESSES STARE DECISIS]

[March the stare decisis factors (error, reasoning gap, erosion, unworkability, reliance)]

[Address First Amendment/Establishment concerns under current doctrine and historical practice]

[Use authorities across ideological lines to demonstrate consensus on the error]

[End with a clean articulation of the corrected rule]`,
      aiPrompt: 'March the stare decisis factors (error, reasoning gap, erosion, unworkability, reliance). Address First Amendment/Establishment concerns under current doctrine and historical practice. Use authorities across ideological lines to demonstrate consensus on the error. End with a clean articulation of the corrected rule.'
    },
    {
      id: 'summary-of-argument',
      title: 'Summary of the Argument',
      content: '',
      order: 5,
      type: 'summary',
      required: true,
      placeholder: `SUMMARY OF THE ARGUMENT

[Paragraph 1: Frame the doctrinal problem - identify the specific legal error or atextual standard that is distorting outcomes]

[Paragraph 2: Show concrete consequences with one vivid, fact-specific vignette that demonstrates the human impact]

[Paragraph 3: Return to statutory text and ordinary meaning - show how the correct interpretation should work]

[Paragraph 4: Explain why stare decisis permits correction - address the factors that justify overruling or narrowing the problematic precedent]

[Paragraph 5: State the precise remedy in one crisp sentence - what exactly should the Court do]`,
      aiPrompt: 'In 4-6 short paragraphs, (1) identify the doctrinal error distorting outcomes, (2) show concrete consequences with one vivid, fact-specific vignette, (3) return to statutory text and ordinary meaning, (4) explain why stare decisis permits correction, and (5) state the precise remedy. Avoid block quotes. Every paragraph must advance the requested remedy.'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: '',
      order: 6,
      type: 'conclusion',
      required: true,
      placeholder: `CONCLUSION

For the foregoing reasons, amicus curiae respectfully requests that this Court [precise remedy - affirm/reverse/overrule/clarify test].

[One paragraph restating the precise remedy in one crisp sentence. No new citations.]`,
      aiPrompt: 'Restate the precise remedy in one crisp paragraph. No new citations.'
    },
    {
      id: 'rule-37-disclosure',
      title: 'Rule 37.6 Disclosure',
      content: '',
      order: 7,
      type: 'summary',
      required: true,
      placeholder: `RULE 37.6 DISCLOSURE

No party's counsel authored this brief in whole or in part, and no party or party's counsel contributed money that was intended to fund preparing or submitting this brief. No person other than amicus curiae, its members, or its counsel contributed money that was intended to fund preparing or submitting this brief.`,
      aiPrompt: 'Generate a proper Rule 37.6 disclosure statement following Supreme Court requirements for authorship and funding disclosure'
    },
    {
      id: 'cover-page',
      title: 'Cover/Capture Page',
      content: '',
      order: 8,
      type: 'header',
      required: true,
      placeholder: `IN THE SUPREME COURT OF THE UNITED STATES

No. [Docket Number]

[Case Name]
v.
[Respondent Name]

On Writ of Certiorari to the United States Court of Appeals for the [Circuit]

BRIEF OF [AMICUS CURIAE NAME] AS AMICUS CURIAE IN SUPPORT OF [PETITIONER/RESPONDENT]

[Attorney Name], Counsel of Record
[Law Firm Name]
[Address]
[Email] | [Phone]

Attorney for Amicus Curiae`,
      aiPrompt: 'Generate a professional cover page following Supreme Court Rule 37 requirements with proper docket formatting, counsel of record designation, and complete contact information'
    },
    {
      id: 'table-of-contents',
      title: 'Table of Contents',
      content: '',
      order: 9,
      type: 'table_of_authorities',
      required: true,
      placeholder: `TABLE OF CONTENTS

Page

INTEREST OF AMICUS CURIAE .................................. [Page]

ARGUMENT .................................................. [Page]

I. [Long, persuasive heading for Part I] ................. [Page]

II. [Long, persuasive heading for Part II] ............... [Page]

III. [Long, persuasive heading for Part III] ............. [Page]

SUMMARY OF THE ARGUMENT ................................... [Page]

CONCLUSION ................................................ [Page]`,
      aiPrompt: 'Create a table of contents with long, persuasive headings that tell the story when read alone, following Supreme Court formatting standards'
    },
    {
      id: 'table-of-authorities',
      title: 'Table of Authorities',
      content: '',
      order: 10,
      type: 'table_of_authorities',
      required: true,
      placeholder: `TABLE OF AUTHORITIES

CASES

[Case Name v. Case Name, 000 U.S. 000, 000 (Year) ................ [Page]
[Case Name v. Case Name, 000 F.3d 000, 000 (Year) ................. [Page]

STATUTES

42 U.S.C. § 2000e(j) ............................................. [Page]
[Other statutes with pinpoints] .................................. [Page]

OTHER AUTHORITIES

[Secondary sources, regulations, etc.] ........................... [Page]`,
      aiPrompt: 'Create a comprehensive table of authorities with proper Bluebook formatting, pinpoints, and categorization (Cases, Statutes, Other)'
    },
    {
      id: 'signature-and-date',
      title: 'Signature & Date',
      content: '',
      order: 11,
      type: 'citation',
      required: true,
      placeholder: `Respectfully submitted,

[Attorney Name], Counsel of Record
[Law Firm Name]
[Address]
[Email] | [Phone]

[Date]`,
      aiPrompt: 'Generate proper signature block with counsel of record designation and date following Supreme Court requirements'
    }
  ]
};

export interface BriefCoherenceContext {
  caseName: string;
  legalIssue: string;
  courtLevel: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  keyPrecedents: string[];
  constitutionalQuestions: string[];
  overallTheme: string;
}

export interface SectionEdit {
  sectionId: string;
  content: string;
  timestamp: Date;
  changes: string[];
}

export interface BriefCoherenceAnalysis {
  overallCoherence: number; // 0-100
  sectionConnections: Array<{
    from: string;
    to: string;
    strength: number;
    issues: string[];
  }>;
  recommendations: string[];
  missingElements: string[];
  strengths: string[];
}

// GPT-5 Quality Rubric System
export interface QualityRubric {
  uniqueValue: number; // 0-5: Does Interest show non-duplicative expertise?
  headingPersuasion: number; // 0-5: If you read only the headings, do you understand and feel the argument?
  textFirstLegality: number; // 0-5: Does Argument II lead with enacted text and ordinary meaning before cases?
  evidenceFit: number; // 0-5: Are cites matched to propositions with correct pinpoints and tight parentheticals?
  stareDecisisRigor: number; // 0-5: Are all factors addressed with relevant, modern authorities?
  clarityEconomy: number; // 0-5: Short, idea-dense paragraphs; no fluff
  compliance: number; // 0-5: Rule 37 disclosure present; Bluebook consistency; TOA/TOC accurate
  counterArguments: number; // 0-5: Strong opposing points addressed head-on
  overallScore: number; // Average of all scores
  needsRevision: boolean; // Any criterion ≤2 triggers revise loop
}

// Planning Schema for Structured Brief Development
export interface BriefPlan {
  caption: {
    docket: string;
    case_title: string;
    court_below: string;
    party_supported: string;
  };
  angle_memo: string; // One paragraph on unique value
  authority_grid: Array<{
    proposition: string;
    authority: {
      type: 'statute' | 'case' | 'secondary';
      cite: string;
      pinpoint: string;
    };
    parenthetical: string;
  }>;
  headings: {
    I: string; // Long persuasive heading for Part I
    II: string; // Long persuasive heading for Part II (text first)
    III: string; // Long persuasive heading for Part III (stare decisis)
  };
  counter_args: Array<{
    objection: string;
    rebuttal_authority: {
      cite: string;
      pinpoint: string;
    };
    response_theory: string;
  }>;
  remedy: string; // Exact action requested
}

// Section-specific guidance from GPT-5 guide
export interface SectionGuidance {
  purpose: string;
  psychology: string; // What psychological effect this section should have
  contentMoves: string[];
  checklist: string[];
  pitfalls: string[];
  aiPrompt: string;
  qualityCriteria: string[];
}

// Section-specific guidance from GPT-5 guide
export const SECTION_GUIDANCE: Record<string, SectionGuidance> = {
  'interest-of-amicus': {
    purpose: 'Establish unique expertise, stake, and perspective not duplicated by parties',
    psychology: 'Ethos - establish credibility and unique value',
    contentMoves: [
      'One-paragraph identity statement',
      'One-to-two paragraphs of concrete experience or data',
      'One paragraph linking experience to the question presented',
      'Mention related litigation, industry role, or empirical perspective if applicable'
    ],
    checklist: [
      'Clear statement of who the amicus is',
      'Concrete experience or data demonstrating expertise',
      'Direct link to how the issue affects the amicus',
      'Avoids repeating party arguments',
      'Emphasizes distinctive expertise, data, or litigation experience'
    ],
    pitfalls: [
      'Vague "we care about the law" statements',
      'Duplicating party arguments',
      'Lack of concrete, specific examples'
    ],
    aiPrompt: 'Write 3-5 paragraphs establishing (a) who the amicus is, (b) why its perspective is uniquely valuable in this case, and (c) how the issue concretely affects the amicus or its constituents. Avoid repeating party arguments; emphasize distinctive expertise, data, or litigation experience. Tone: formal, restrained, specific.',
    qualityCriteria: ['Unique expertise demonstrated', 'Concrete examples provided', 'Clear connection to case', 'No party argument duplication']
  },
  'summary-of-argument': {
    purpose: 'Give the Justices the ending first; preview the logical arc',
    psychology: 'Primacy framing - establish the conclusion upfront',
    contentMoves: [
      'Frame the doctrinal problem (e.g., atextual standard distorting outcomes)',
      'Show human and systemic consequences with a concrete vignette',
      'Return to statutory text/structure',
      'Stare decisis factors permitting correction',
      'Requested remedy in one crisp sentence'
    ],
    checklist: [
      '4-6 short paragraphs',
      'Identifies doctrinal error',
      'Includes concrete vignette',
      'Returns to statutory text',
      'Explains stare decisis factors',
      'States precise remedy',
      'Avoids block quotes'
    ],
    pitfalls: [
      'Citations overload',
      'Hedging language',
      'Too much detail',
      'Missing concrete examples'
    ],
    aiPrompt: 'In 4-6 short paragraphs, (1) identify the doctrinal error distorting outcomes, (2) show concrete consequences with one vivid, fact-specific vignette, (3) return to statutory text and ordinary meaning, (4) explain why stare decisis permits correction, and (5) state the precise remedy. Avoid block quotes. Every paragraph must advance the requested remedy.',
    qualityCriteria: ['Clear doctrinal error identified', 'Concrete vignette included', 'Statutory text referenced', 'Stare decisis factors addressed', 'Precise remedy stated']
  },
  'argument-i': {
    purpose: 'Start with concrete, sympathetic fact pattern; then show pattern-level harm',
    psychology: 'Pathos→logos bridge - emotional connection leading to logical analysis',
    contentMoves: [
      'Micro narrative: request → accommodation granted → it worked → withdrawn due to pressure',
      'Zoom out: 3-5 compact cross-tradition examples',
      'Name the mechanism succinctly',
      'Each exemplar with authoritative citation and parenthetical'
    ],
    checklist: [
      'Concise chronological narrative',
      'Shows accommodation that worked then was withdrawn',
      '3-5 cross-tradition examples',
      'Mechanism clearly named',
      'Authoritative citations with parentheticals',
      'Demonstrates systemic harm'
    ],
    pitfalls: [
      'Over-long story',
      'Moralizing tone',
      'Thin support for generalization',
      'Missing cross-tradition examples'
    ],
    aiPrompt: 'Begin with a concise, chronological narrative showing an accommodation path that worked and was later withdrawn due to non-legal pressures; then generalize across at least three faiths/contexts to demonstrate systemic harm. Name the mechanism succinctly. Each exemplar should have one authoritative citation with a 10-20 word parenthetical stating the proposition.',
    qualityCriteria: ['Compelling narrative', 'Cross-tradition examples', 'Clear mechanism identified', 'Strong citations with parentheticals', 'Systemic harm demonstrated']
  },
  'argument-ii': {
    purpose: 'Anchor in enacted text; show how erroneous judicial gloss departs from ordinary meaning',
    psychology: 'Logos supremacy - legal reasoning based on text',
    contentMoves: [
      'Quote the statute first; bold or offset critical terms',
      'Define terms from authoritative dictionaries',
      'Demonstrate mismatch with criticized precedent',
      'Comparative statutes to show consistent usage',
      'Show outcome flip under correct standard'
    ],
    checklist: [
      'Statute quoted first',
      'Terms defined from authoritative sources',
      'Mismatch with precedent demonstrated',
      'Comparative statutes included',
      'Outcome flip shown',
      'Short quotes with pinpoints'
    ],
    pitfalls: [
      'Leading with cases before text',
      'Definitional cherry-picking',
      'Ignoring statutory structure',
      'Over-quoting'
    ],
    aiPrompt: 'Quote the governing statutory text; define the key terms using authoritative dictionaries; show how the criticized precedent\'s test conflicts with ordinary meaning and statutory structure. Use comparative statutes to cabin "undue hardship." Conclude with a short demonstration of how the correct standard changes outcomes. Keep quotes short with pinpoints.',
    qualityCriteria: ['Text-first approach', 'Authoritative definitions', 'Clear precedent mismatch', 'Comparative analysis', 'Outcome demonstration']
  },
  'argument-iii': {
    purpose: 'Walk the factors that justify overruling or narrowing',
    psychology: 'Permission to correct - justify why change is appropriate',
    contentMoves: [
      'Use clean five-factor grid for stare decisis',
      'Address First Amendment/Establishment concerns',
      'Reconcile with remedial comparators',
      'Use authorities across ideological lines'
    ],
    checklist: [
      'All five stare decisis factors addressed',
      'First Amendment concerns addressed',
      'Historical practice considered',
      'Authorities across ideological lines',
      'Clean articulation of corrected rule'
    ],
    pitfalls: [
      'Hand-waving "it\'s wrong"',
      'Ignoring reliance interests',
      'Failing to address counter-arguments',
      'Missing ideological diversity in authorities'
    ],
    aiPrompt: 'March the stare decisis factors (error, reasoning gap, erosion, unworkability, reliance). Address First Amendment/Establishment concerns under current doctrine and historical practice. Use authorities across ideological lines to demonstrate consensus on the error. End with a clean articulation of the corrected rule.',
    qualityCriteria: ['All stare decisis factors addressed', 'First Amendment concerns handled', 'Ideological diversity in authorities', 'Counter-arguments addressed', 'Clear corrected rule articulated']
  }
};

export class AmicusBriefBuilder {
  private template: AmicusBriefTemplate;
  private coherenceContext: BriefCoherenceContext;
  private editHistory: SectionEdit[] = [];

  constructor(template: AmicusBriefTemplate, coherenceContext: BriefCoherenceContext) {
    this.template = template;
    this.coherenceContext = coherenceContext;
  }

  // Update a section while maintaining coherence
  updateSection(sectionId: string, content: string): void {
    const section = this.template.sections.find(s => s.id === sectionId);
    if (!section) {
      throw new Error(`Section ${sectionId} not found`);
    }

    const oldContent = section.content;
    section.content = content;
    section.lastModified = new Date();

    // Track changes
    this.editHistory.push({
      sectionId,
      content,
      timestamp: new Date(),
      changes: this.detectChanges(oldContent, content)
    });

    // Update word count
    section.wordCount = this.countWords(content);
  }

  // Get all sections in order
  getSections(): AmicusBriefSection[] {
    return [...this.template.sections].sort((a, b) => a.order - b.order);
  }

  // Get a specific section
  getSection(sectionId: string): AmicusBriefSection | undefined {
    return this.template.sections.find(s => s.id === sectionId);
  }

  // Generate AI prompt for a section
  generateAIPrompt(sectionId: string, additionalContext?: string): string {
    const section = this.getSection(sectionId);
    if (!section || !section.aiPrompt) {
      return '';
    }

    const context = this.buildCoherenceContext();
    const relatedSections = this.getRelatedSections(sectionId);

    return `${section.aiPrompt}

CONTEXT:
Case: ${this.coherenceContext.caseName}
Legal Issue: ${this.coherenceContext.legalIssue}
Court: ${this.coherenceContext.courtLevel}
Overall Theme: ${this.coherenceContext.overallTheme}

RELATED SECTIONS:
${relatedSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

Please write content that maintains coherence with the overall brief while developing this specific section.`;
  }

  // Analyze coherence across the entire brief
  analyzeCoherence(): BriefCoherenceAnalysis {
    const sections = this.getSections();
    const sectionConnections: BriefCoherenceAnalysis['sectionConnections'] = [];
    const recommendations: string[] = [];
    const missingElements: string[] = [];
    const strengths: string[] = [];

    // Check for required sections
    const requiredSections = sections.filter(s => s.required);
    requiredSections.forEach(section => {
      if (!section.content || section.content.trim().length < 100) {
        missingElements.push(`${section.title} is incomplete or missing`);
      }
    });

    // Analyze connections between sections
    for (let i = 0; i < sections.length - 1; i++) {
      const currentSection = sections[i];
      const nextSection = sections[i + 1];

      if (currentSection.content && nextSection.content) {
        const connectionStrength = this.calculateConnectionStrength(
          currentSection.content,
          nextSection.content
        );

        if (connectionStrength < 0.3) {
          recommendations.push(
            `Strengthen connection between "${currentSection.title}" and "${nextSection.title}"`
          );
        }

        sectionConnections.push({
          from: currentSection.title,
          to: nextSection.title,
          strength: connectionStrength,
          issues: connectionStrength < 0.3 ? ['Weak transition', 'Unclear connection'] : []
        });
      }
    }

    // Identify strengths
    const completedSections = sections.filter(s => s.content && s.content.length > 200);
    if (completedSections.length >= 6) {
      strengths.push('Comprehensive coverage of key issues');
    }

    const argumentSections = sections.filter(s => s.type === 'argument' && s.content);
    if (argumentSections.length >= 2) {
      strengths.push('Multiple well-developed arguments');
    }

    // Calculate overall coherence
    const overallCoherence = this.calculateOverallCoherence(sections, sectionConnections);

    return {
      overallCoherence,
      sectionConnections,
      recommendations,
      missingElements,
      strengths
    };
  }

  // Export the complete brief as a single document
  exportBrief(): string {
    const sections = this.getSections();
    let brief = '';

    sections.forEach(section => {
      if (section.content) {
        brief += `\n\n${section.title.toUpperCase()}\n`;
        brief += '='.repeat(section.title.length) + '\n\n';
        brief += section.content + '\n';
      }
    });

    return brief.trim();
  }

  // Get section-specific guidance from GPT-5 guide
  getSectionGuidance(sectionId: string): SectionGuidance | null {
    return SECTION_GUIDANCE[sectionId] || null;
  }

  // Generate enhanced AI prompt using GPT-5 methodology
  generateEnhancedAIPrompt(sectionId: string, userInstructions?: string, additionalContext?: string): string {
    const section = this.getSection(sectionId);
    const guidance = this.getSectionGuidance(sectionId);
    
    if (!section || !guidance) {
      return this.generateAIPrompt(sectionId, additionalContext);
    }

    const context = this.buildCoherenceContext();
    const relatedSections = this.getRelatedSections(sectionId);

    let prompt = `${guidance.aiPrompt}

CONTEXT:
Case: ${this.coherenceContext.caseName}
Legal Issue: ${this.coherenceContext.legalIssue}
Court: ${this.coherenceContext.courtLevel}
Overall Theme: ${this.coherenceContext.overallTheme}

SECTION PURPOSE: ${guidance.purpose}
PSYCHOLOGICAL EFFECT: ${guidance.psychology}

CONTENT MOVES REQUIRED:
${guidance.contentMoves.map(move => `• ${move}`).join('\n')}

QUALITY CHECKLIST:
${guidance.checklist.map(item => `✓ ${item}`).join('\n')}

COMMON PITFALLS TO AVOID:
${guidance.pitfalls.map(pitfall => `⚠ ${pitfall}`).join('\n')}

RELATED SECTIONS:
${relatedSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}`;

    // Add user instructions if provided
    if (userInstructions && userInstructions.trim()) {
      prompt += `\n\nUSER INSTRUCTIONS:
${userInstructions}

Follow these specific instructions while maintaining Supreme Court standards and the template guidance above.`;
    }

    if (additionalContext) {
      prompt += `\n\nADDITIONAL CONTEXT: ${additionalContext}`;
    }

    prompt += `\n\nPlease write content that follows the GPT-5 Supreme Court-grade methodology while maintaining coherence with the overall brief.`;

    return prompt;
  }

  // Analyze quality using GPT-5 rubric
  analyzeQuality(): QualityRubric {
    const sections = this.getSections();
    
    // Analyze each criterion
    const uniqueValue = this.scoreUniqueValue(sections);
    const headingPersuasion = this.scoreHeadingPersuasion(sections);
    const textFirstLegality = this.scoreTextFirstLegality(sections);
    const evidenceFit = this.scoreEvidenceFit(sections);
    const stareDecisisRigor = this.scoreStareDecisisRigor(sections);
    const clarityEconomy = this.scoreClarityEconomy(sections);
    const compliance = this.scoreCompliance(sections);
    const counterArguments = this.scoreCounterArguments(sections);

    const scores = [uniqueValue, headingPersuasion, textFirstLegality, evidenceFit, 
                   stareDecisisRigor, clarityEconomy, compliance, counterArguments];
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const needsRevision = scores.some(score => score <= 2);

    return {
      uniqueValue,
      headingPersuasion,
      textFirstLegality,
      evidenceFit,
      stareDecisisRigor,
      clarityEconomy,
      compliance,
      counterArguments,
      overallScore: Math.round(overallScore * 10) / 10,
      needsRevision
    };
  }

  // Individual scoring methods for each rubric criterion
  private scoreUniqueValue(sections: AmicusBriefSection[]): number {
    const interestSection = sections.find(s => s.id === 'interest-of-amicus');
    if (!interestSection?.content) return 0;

    const content = interestSection.content.toLowerCase();
    let score = 0;

    // Check for unique expertise indicators
    if (content.includes('expertise') || content.includes('experience') || content.includes('data')) score += 1;
    if (content.includes('unique') || content.includes('distinctive') || content.includes('specialized')) score += 1;
    if (content.includes('concrete') || content.includes('specific') || content.includes('empirical')) score += 1;
    if (content.includes('litigation') || content.includes('industry') || content.includes('professional')) score += 1;
    if (!content.includes('party') && !content.includes('petitioner') && !content.includes('respondent')) score += 1;

    return Math.min(score, 5);
  }

  private scoreHeadingPersuasion(sections: AmicusBriefSection[]): number {
    const argumentSections = sections.filter(s => s.type === 'argument' && s.content);
    if (argumentSections.length === 0) return 0;

    let score = 0;
    argumentSections.forEach(section => {
      const title = section.title.toLowerCase();
      // Check for persuasive elements in headings
      if (title.length > 20) score += 1; // Long headings
      if (title.includes('requires') || title.includes('conflicts') || title.includes('demonstrates')) score += 1;
      if (title.includes('text') || title.includes('statute') || title.includes('precedent')) score += 1;
    });

    return Math.min(score / argumentSections.length, 5);
  }

  private scoreTextFirstLegality(sections: AmicusBriefSection[]): number {
    const argumentII = sections.find(s => s.id === 'argument-ii');
    if (!argumentII?.content) return 0;

    const content = argumentII.content.toLowerCase();
    let score = 0;

    // Check for text-first approach
    if (content.includes('statute') || content.includes('u.s.c.') || content.includes('section')) score += 1;
    if (content.includes('ordinary meaning') || content.includes('dictionary') || content.includes('black\'s')) score += 1;
    if (content.includes('text') && content.includes('first')) score += 1;
    if (content.includes('comparative') || content.includes('parallel')) score += 1;
    if (content.includes('outcome') && content.includes('flip')) score += 1;

    return Math.min(score, 5);
  }

  private scoreEvidenceFit(sections: AmicusBriefSection[]): number {
    const allContent = sections.map(s => s.content).join(' ').toLowerCase();
    let score = 0;

    // Check for proper citation patterns
    if (allContent.includes('(holding') || allContent.includes('(rejecting') || allContent.includes('(recognizing')) score += 1;
    if (allContent.includes('at ') && allContent.match(/\d+/g)?.length > 5) score += 1; // Pinpoints
    if (allContent.includes('v.') && allContent.includes('u.s.')) score += 1; // Case citations
    if (allContent.includes('parenthetical') || allContent.includes('explaining')) score += 1;
    if (allContent.match(/\(\d+\)/g)?.length > 3) score += 1; // Multiple pinpoints

    return Math.min(score, 5);
  }

  private scoreStareDecisisRigor(sections: AmicusBriefSection[]): number {
    const argumentIII = sections.find(s => s.id === 'argument-iii');
    if (!argumentIII?.content) return 0;

    const content = argumentIII.content.toLowerCase();
    let score = 0;

    // Check for stare decisis factors
    if (content.includes('stare decisis') || content.includes('precedent')) score += 1;
    if (content.includes('error') || content.includes('reasoning')) score += 1;
    if (content.includes('erosion') || content.includes('unworkable')) score += 1;
    if (content.includes('reliance') || content.includes('interest')) score += 1;
    if (content.includes('first amendment') || content.includes('establishment')) score += 1;

    return Math.min(score, 5);
  }

  private scoreClarityEconomy(sections: AmicusBriefSection[]): number {
    const allContent = sections.map(s => s.content).join(' ');
    const words = allContent.split(/\s+/).length;
    const sentences = allContent.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    let score = 0;
    if (avgWordsPerSentence < 25) score += 1; // Short sentences
    if (avgWordsPerSentence < 20) score += 1;
    if (avgWordsPerSentence < 15) score += 1;
    if (!allContent.includes('very') && !allContent.includes('clearly') && !allContent.includes('obviously')) score += 1; // No intensifiers
    if (allContent.includes('this court') && !allContent.includes('the supreme court')) score += 1; // Proper pronoun usage

    return Math.min(score, 5);
  }

  private scoreCompliance(sections: AmicusBriefSection[]): number {
    let score = 0;
    
    // Check for Rule 37.6 disclosure
    const rule37Section = sections.find(s => s.id === 'rule-37-disclosure');
    if (rule37Section?.content && rule37Section.content.length > 50) score += 1;

    // Check for proper formatting
    const allContent = sections.map(s => s.content).join(' ');
    if (allContent.includes('this court')) score += 1;
    if (allContent.includes('counsel of record')) score += 1;
    if (allContent.includes('respectfully submitted')) score += 1;

    // Check for Bluebook compliance indicators
    if (allContent.match(/\d+ U\.S\. \d+/g)?.length > 0) score += 1; // Proper case citations
    if (allContent.match(/\d+ U\.S\.C\. § \d+/g)?.length > 0) score += 1; // Proper statute citations

    return Math.min(score, 5);
  }

  private scoreCounterArguments(sections: AmicusBriefSection[]): number {
    const allContent = sections.map(s => s.content).join(' ').toLowerCase();
    let score = 0;

    // Check for counter-argument addressing
    if (allContent.includes('however') || allContent.includes('nevertheless')) score += 1;
    if (allContent.includes('contrary') || allContent.includes('opposing')) score += 1;
    if (allContent.includes('respondent argues') || allContent.includes('petitioner claims')) score += 1;
    if (allContent.includes('but') && allContent.includes('authority')) score += 1;
    if (allContent.includes('rebut') || allContent.includes('refute')) score += 1;

    return Math.min(score, 5);
  }

  // Helper methods
  public buildCoherenceContext(): string {
    return `
Case: ${this.coherenceContext.caseName}
Legal Issue: ${this.coherenceContext.legalIssue}
Court: ${this.coherenceContext.courtLevel}
Petitioner: ${this.coherenceContext.parties.petitioner}
Respondent: ${this.coherenceContext.parties.respondent}
Key Precedents: ${this.coherenceContext.keyPrecedents.join(', ')}
Constitutional Questions: ${this.coherenceContext.constitutionalQuestions.join(', ')}
Overall Theme: ${this.coherenceContext.overallTheme}
    `.trim();
  }

  private getRelatedSections(sectionId: string): AmicusBriefSection[] {
    const section = this.getSection(sectionId);
    if (!section) return [];

    const currentIndex = this.template.sections.findIndex(s => s.id === sectionId);
    const related = [];

    // Include previous and next sections
    if (currentIndex > 0) {
      related.push(this.template.sections[currentIndex - 1]);
    }
    if (currentIndex < this.template.sections.length - 1) {
      related.push(this.template.sections[currentIndex + 1]);
    }

    return related;
  }

  private detectChanges(oldContent: string, newContent: string): string[] {
    const changes: string[] = [];
    
    if (oldContent.length !== newContent.length) {
      changes.push(`Content length changed from ${oldContent.length} to ${newContent.length} characters`);
    }

    // Simple word-based change detection
    const oldWords = oldContent.split(' ');
    const newWords = newContent.split(' ');
    
    if (Math.abs(oldWords.length - newWords.length) > 10) {
      changes.push(`Word count changed significantly`);
    }

    return changes;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateConnectionStrength(content1: string, content2: string): number {
    // Simple similarity calculation based on shared legal terms
    const legalTerms = [
      'court', 'case', 'law', 'legal', 'statute', 'constitution', 'precedent',
      'argument', 'issue', 'question', 'right', 'liberty', 'freedom',
      'petitioner', 'respondent', 'plaintiff', 'defendant'
    ];

    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);

    const sharedLegalTerms = legalTerms.filter(term => 
      words1.includes(term) && words2.includes(term)
    ).length;

    return Math.min(sharedLegalTerms / legalTerms.length, 1);
  }

  private calculateOverallCoherence(
    sections: AmicusBriefSection[],
    connections: BriefCoherenceAnalysis['sectionConnections']
  ): number {
    if (sections.length === 0) return 0;

    const completedSections = sections.filter(s => s.content && s.content.length > 100).length;
    const completionRate = completedSections / sections.length;

    const averageConnectionStrength = connections.length > 0 
      ? connections.reduce((sum, conn) => sum + conn.strength, 0) / connections.length
      : 0;

    return Math.round((completionRate * 0.6 + averageConnectionStrength * 0.4) * 100);
  }
}
