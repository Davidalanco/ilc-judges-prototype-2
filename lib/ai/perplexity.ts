import { claude } from './claude';

export interface PerplexityResearchResult {
  query: string;
  research: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  timestamp: Date;
}

export class PerplexityResearch {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Perplexity API key not found. Research capabilities will be limited.');
    }
  }

  async research(query: string, context?: string): Promise<PerplexityResearchResult> {
    if (!this.apiKey) {
      // Fallback to Claude for research if Perplexity is not available
      return this.fallbackResearch(query, context);
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are a legal research assistant. Provide comprehensive, accurate research on legal topics. Focus on:
              - Recent case law and precedents
              - Statutory analysis and interpretation
              - Regulatory guidance and agency interpretations
              - Academic commentary and analysis
              - Practical implications and real-world applications
              
              Always cite sources with URLs when available. Be specific and detailed in your analysis.`
            },
            {
              role: 'user',
              content: `Research: ${query}${context ? `\n\nContext: ${context}` : ''}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ['law', 'legal', 'court', 'supreme', 'federal', 'statute', 'regulation'],
          search_recency_filter: 'month'
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const citations = data.citations || [];

      return {
        query,
        research: content,
        sources: citations.map((citation: any) => ({
          title: citation.title || 'Source',
          url: citation.url || '',
          snippet: citation.snippet || ''
        })),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Perplexity research error:', error);
      return this.fallbackResearch(query, context);
    }
  }

  private async fallbackResearch(query: string, context?: string): Promise<PerplexityResearchResult> {
    // Use Claude as fallback for research
    const researchPrompt = `Conduct comprehensive legal research on: ${query}

${context ? `Context: ${context}` : ''}

Provide detailed analysis including:
1. Relevant case law and precedents
2. Statutory analysis and interpretation
3. Regulatory guidance
4. Academic commentary
5. Practical implications

Be specific and cite sources where possible.`;

    const research = await claude.generateText([
      { role: 'user', content: researchPrompt }
    ]);

    return {
      query,
      research,
      sources: [{
        title: 'Claude Research Analysis',
        url: '',
        snippet: research.substring(0, 200) + '...'
      }],
      timestamp: new Date()
    };
  }

  async researchForSection(sectionType: string, userInstructions: string, caseContext: string): Promise<PerplexityResearchResult> {
    const researchQueries = this.generateResearchQueries(sectionType, userInstructions, caseContext);
    
    // Research each query and combine results
    const researchPromises = researchQueries.map(query => this.research(query, caseContext));
    const results = await Promise.all(researchPromises);
    
    // Combine all research into a comprehensive result
    const combinedResearch = results.map(r => r.research).join('\n\n');
    const allSources = results.flatMap(r => r.sources);
    
    return {
      query: `Research for ${sectionType}: ${userInstructions}`,
      research: combinedResearch,
      sources: allSources,
      timestamp: new Date()
    };
  }

  private generateResearchQueries(sectionType: string, userInstructions: string, caseContext: string): string[] {
    const baseQueries = [];
    
    // Extract key legal terms from case context
    const legalTerms = this.extractLegalTerms(caseContext);
    
    // Generate queries based on section type
    switch (sectionType) {
      case 'argument':
        baseQueries.push(
          `Supreme Court precedents on ${legalTerms.join(' ')}`,
          `Textual analysis of relevant statutes`,
          `Recent circuit court decisions on similar issues`,
          `Academic commentary on ${legalTerms.join(' ')}`
        );
        break;
      case 'summary':
        baseQueries.push(
          `Doctrinal analysis of ${legalTerms.join(' ')}`,
          `Recent Supreme Court trends in similar cases`,
          `Practical implications of current legal standards`
        );
        break;
      case 'conclusion':
        baseQueries.push(
          `Supreme Court remedy standards`,
          `Recent similar case outcomes`,
          `Legal precedent for requested relief`
        );
        break;
      default:
        baseQueries.push(
          `Legal research on ${legalTerms.join(' ')}`,
          `Recent developments in relevant law`
        );
    }
    
    // Add user-specific research queries
    if (userInstructions) {
      const instructionQueries = this.extractResearchQueriesFromInstructions(userInstructions);
      baseQueries.push(...instructionQueries);
    }
    
    return baseQueries;
  }

  private extractLegalTerms(caseContext: string): string[] {
    const legalTerms = [];
    const context = caseContext.toLowerCase();
    
    // Common legal terms to look for
    const termPatterns = [
      /title vii/gi,
      /religious accommodation/gi,
      /undue hardship/gi,
      /reasonable accommodation/gi,
      /supreme court/gi,
      /constitutional/gi,
      /statutory/gi,
      /precedent/gi,
      /stare decisis/gi
    ];
    
    termPatterns.forEach(pattern => {
      const matches = caseContext.match(pattern);
      if (matches) {
        legalTerms.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    return [...new Set(legalTerms)]; // Remove duplicates
  }

  private extractResearchQueriesFromInstructions(instructions: string): string[] {
    const queries = [];
    const instruction = instructions.toLowerCase();
    
    // Look for specific research requests
    if (instruction.includes('research')) {
      const researchMatch = instruction.match(/research\s+([^.]+)/i);
      if (researchMatch) {
        queries.push(researchMatch[1].trim());
      }
    }
    
    if (instruction.includes('recent')) {
      queries.push('Recent developments in relevant legal area');
    }
    
    if (instruction.includes('precedent')) {
      queries.push('Relevant legal precedents and case law');
    }
    
    if (instruction.includes('statute') || instruction.includes('statutory')) {
      queries.push('Statutory analysis and interpretation');
    }
    
    if (instruction.includes('regulation') || instruction.includes('regulatory')) {
      queries.push('Regulatory guidance and agency interpretations');
    }
    
    return queries;
  }
}

export const perplexityResearch = new PerplexityResearch();
