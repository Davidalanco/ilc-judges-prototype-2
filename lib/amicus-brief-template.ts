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

// Template based on the successful John Kluge amicus brief
export const SUCCESSFUL_AMICUS_TEMPLATE: AmicusBriefTemplate = {
  id: 'kluge-template',
  name: 'Winning Amicus Brief Template',
  description: 'Based on John Kluge v. Department of Health and Human Services - successful Supreme Court amicus brief',
  basedOn: 'John Kluge v. Department of Health and Human Services (2023)',
  successRate: 'Supreme Court Victory',
  sections: [
    {
      id: 'cover-page',
      title: 'Cover Page',
      content: '',
      order: 1,
      type: 'header',
      required: true,
      placeholder: `IN THE SUPREME COURT OF THE UNITED STATES

[Case Name]
v.
[Respondent Name]

On Writ of Certiorari to the United States Court of Appeals for the [Circuit]

BRIEF OF [AMICUS CURIAE NAME] AS AMICUS CURIAE IN SUPPORT OF [PETITIONER/RESPONDENT]

[Attorney Name]
[Law Firm Name]
[Address]
[Phone Number]
[Email]

Attorney for Amicus Curiae`,
      aiPrompt: 'Generate a professional cover page with case information, court details, and amicus curiae credentials'
    },
    {
      id: 'table-of-authorities',
      title: 'Table of Authorities',
      content: '',
      order: 2,
      type: 'table_of_authorities',
      required: true,
      placeholder: 'List all cases, statutes, regulations, and other authorities cited...',
      aiPrompt: 'Create a comprehensive table of authorities organized by category (Cases, Statutes, Regulations, Other)'
    },
    {
      id: 'summary-of-argument',
      title: 'Summary of the Argument',
      content: '',
      order: 3,
      type: 'summary',
      required: true,
      placeholder: `This amicus brief addresses [constitutional question] and argues that [main legal position].

The primary legal arguments are:

1. [First Argument]: [Brief explanation of first legal argument with key precedent]

2. [Second Argument]: [Brief explanation of second legal argument with supporting case law]

3. [Third Argument]: [Brief explanation of third legal argument addressing broader implications]

The Court should [specific relief requested] because [conclusion tying all arguments together].

This case presents an opportunity to [broader significance] and ensure that [constitutional principle] is properly protected.`,
      aiPrompt: 'Write a compelling summary that distills the key legal arguments into clear, persuasive points'
    },
    {
      id: 'statement-of-interest',
      title: 'Statement of Interest',
      content: '',
      order: 4,
      type: 'summary',
      required: true,
      placeholder: 'Explain why your organization has a legitimate interest in this case...',
      aiPrompt: 'Draft a statement explaining the amicus curiae\'s unique perspective and interest in the case'
    },
    {
      id: 'argument-i',
      title: 'Argument I: [Primary Legal Issue]',
      content: '',
      order: 5,
      type: 'argument',
      required: true,
      placeholder: `ARGUMENT I
[PRIMARY LEGAL ISSUE HEADING]

[Opening paragraph establishing the legal framework and stating the main argument]

A. [Sub-argument A with case law support]

[Detailed analysis of relevant precedent, such as Case Name v. Case Name, Citation (Year)]

B. [Sub-argument B with statutory analysis]

[Analysis of relevant statutes and their application to the facts]

C. [Sub-argument C with constitutional analysis]

[Constitutional analysis addressing the broader implications]

[Concluding paragraph tying together the sub-arguments and connecting to the overall brief]`,
      aiPrompt: 'Develop the primary legal argument with comprehensive case law analysis and statutory interpretation'
    },
    {
      id: 'argument-ii',
      title: 'Argument II: [Secondary Legal Issue]',
      content: '',
      order: 6,
      type: 'argument',
      required: false,
      placeholder: 'Develop your secondary legal argument...',
      aiPrompt: 'Develop a secondary legal argument that supports and strengthens the primary argument'
    },
    {
      id: 'argument-iii',
      title: 'Argument III: [Policy Considerations]',
      content: '',
      order: 7,
      type: 'argument',
      required: false,
      placeholder: 'Address broader policy implications and societal impact...',
      aiPrompt: 'Develop policy arguments that demonstrate the broader implications of the court\'s decision'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: '',
      order: 8,
      type: 'conclusion',
      required: true,
      placeholder: `CONCLUSION

For the foregoing reasons, amicus curiae respectfully requests that this Court [specific relief requested].

The arguments presented in this brief demonstrate that [summary of main legal points]. The Court's decision in this case will have significant implications for [broader context and importance].

[Constitutional principle] requires that [legal conclusion]. This case presents an opportunity for the Court to [broader significance and impact].

Amicus curiae urges the Court to [specific action requested] and [broader principle to be established].

Respectfully submitted,

[Attorney Name]
[Law Firm Name]
[Date]`,
      aiPrompt: 'Write a powerful conclusion that synthesizes all arguments and requests specific relief from the court'
    },
    {
      id: 'certificate-of-service',
      title: 'Certificate of Service',
      content: '',
      order: 9,
      type: 'citation',
      required: true,
      placeholder: 'Certificate of service to all parties...',
      aiPrompt: 'Generate a proper certificate of service for the amicus brief'
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
