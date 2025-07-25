// Professional Legal Database APIs
// Integrates with LexisNexis and Westlaw for enterprise-grade legal research

interface LegalSearchConfig {
  provider: 'lexisnexis' | 'westlaw' | 'courtlistener';
  query: string;
  jurisdiction?: string;
  courtLevel?: 'supreme' | 'appellate' | 'district' | 'all';
  dateRange?: {
    from?: string;
    to?: string;
  };
  documentTypes?: ('opinions' | 'briefs' | 'motions' | 'transcripts')[];
  maxResults?: number;
}

interface ProfessionalCaseDocument {
  id: string;
  provider: 'lexisnexis' | 'westlaw' | 'courtlistener';
  title: string;
  citation: string;
  court: string;
  judges: string[];
  date: string;
  docketNumber: string;
  documentType: 'opinion' | 'dissent' | 'concurrence' | 'brief' | 'motion' | 'transcript';
  party?: 'petitioner' | 'respondent' | 'amicus';
  pageCount: number;
  fullTextUrl: string;
  summaryUrl?: string;
  citedCases: string[];
  citingCases: string[];
  keyTopics: string[];
  headnotes?: string[];
  shepardSignal?: 'positive' | 'negative' | 'warning' | 'neutral'; // Westlaw/Lexis authority checking
  hasFullText: boolean;
  downloadUrl: string;
  confidence: number; // Relevance score 0-1
}

interface CitationAnalysis {
  originalCitation: string;
  parsedComponents: {
    caseName: string;
    volume: string;
    reporter: string;
    page: string;
    year?: string;
    court?: string;
    pinpoint?: string;
  };
  isValid: boolean;
  alternativeFormats: string[];
  parallelCitations: string[];
}

class LexisNexisAPI {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.apiKey = process.env.LEXISNEXIS_API_KEY || '';
    this.clientId = process.env.LEXISNEXIS_CLIENT_ID || '';
    this.clientSecret = process.env.LEXISNEXIS_CLIENT_SECRET || '';
    this.baseUrl = process.env.LEXISNEXIS_BASE_URL || 'https://api.lexisnexis.com';
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`LexisNexis authentication failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
    
    return this.accessToken;
  }

  async searchCases(config: LegalSearchConfig): Promise<ProfessionalCaseDocument[]> {
    const token = await this.authenticate();
    
    // LexisNexis Advanced Search API
    const searchParams = {
      query: this.buildLexisQuery(config),
      sources: this.getLexisSources(config),
      jurisdiction: config.jurisdiction,
      dateRange: config.dateRange,
      maxResults: config.maxResults || 50,
    };

    const response = await fetch(`${this.baseUrl}/search/v1/cases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`LexisNexis search failed: ${response.status}`);
    }

    const data = await response.json();
    return this.transformLexisResults(data.results);
  }

  private buildLexisQuery(config: LegalSearchConfig): string {
    // Transform user query into LexisNexis Advanced Query syntax
    let query = config.query;
    
    // Add court level filtering
    if (config.courtLevel === 'supreme') {
      query += ' AND court(supreme)';
    } else if (config.courtLevel === 'appellate') {
      query += ' AND court(appellate OR circuit)';
    }

    return query;
  }

  private getLexisSources(config: LegalSearchConfig): string[] {
    // Map to LexisNexis source IDs
    const sources = [];
    
    if (config.documentTypes?.includes('opinions')) {
      sources.push('CASES', 'FEDCAS', 'STATES');
    }
    if (config.documentTypes?.includes('briefs')) {
      sources.push('BRIEFS', 'LEGBRF');
    }
    
    return sources.length > 0 ? sources : ['CASES', 'FEDCAS'];
  }

  private transformLexisResults(results: any[]): ProfessionalCaseDocument[] {
    return results.map(result => ({
      id: `lexis-${result.documentId}`,
      provider: 'lexisnexis' as const,
      title: result.caseTitle || result.title,
      citation: result.citation,
      court: result.court,
      judges: result.judges || [],
      date: result.decisionDate,
      docketNumber: result.docketNumber,
      documentType: this.mapLexisDocType(result.documentType),
      pageCount: result.pageCount || 0,
      fullTextUrl: result.fullTextUrl,
      citedCases: result.citedCases || [],
      citingCases: result.citingCases || [],
      keyTopics: result.headnotes?.map((h: any) => h.topic) || [],
      headnotes: result.headnotes?.map((h: any) => h.text) || [],
      shepardSignal: result.shepardSignal,
      hasFullText: !!result.fullTextUrl,
      downloadUrl: result.downloadUrl,
      confidence: result.relevanceScore || 0.8,
    }));
  }

  private mapLexisDocType(lexisType: string): ProfessionalCaseDocument['documentType'] {
    const mapping: Record<string, ProfessionalCaseDocument['documentType']> = {
      'OPINION': 'opinion',
      'DISSENT': 'dissent', 
      'CONCURRENCE': 'concurrence',
      'BRIEF': 'brief',
      'MOTION': 'motion',
      'TRANSCRIPT': 'transcript',
    };
    return mapping[lexisType] || 'opinion';
  }
}

class WestlawAPI {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WESTLAW_API_KEY || '';
    this.clientId = process.env.WESTLAW_CLIENT_ID || '';
    this.clientSecret = process.env.WESTLAW_CLIENT_SECRET || '';
    this.baseUrl = process.env.WESTLAW_BASE_URL || 'https://api.westlaw.com';
  }

  async searchCases(config: LegalSearchConfig): Promise<ProfessionalCaseDocument[]> {
    // Westlaw Edge API implementation
    const searchParams = {
      query: this.buildWestlawQuery(config),
      databases: this.getWestlawDatabases(config),
      jurisdiction: config.jurisdiction,
      maxResults: config.maxResults || 50,
    };

    const response = await fetch(`${this.baseUrl}/edge/v1/cases/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`Westlaw search failed: ${response.status}`);
    }

    const data = await response.json();
    return this.transformWestlawResults(data.results);
  }

  private buildWestlawQuery(config: LegalSearchConfig): string {
    // Transform to Westlaw Terms & Connectors syntax
    let query = config.query;
    
    if (config.courtLevel === 'supreme') {
      query += ' & CO(SUPREME)';
    }
    
    return query;
  }

  private getWestlawDatabases(config: LegalSearchConfig): string[] {
    // Westlaw database identifiers
    const databases = [];
    
    if (config.courtLevel === 'supreme') {
      databases.push('SCT', 'SCT-OLD'); // Supreme Court
    } else {
      databases.push('ALLCASES', 'FED'); // All cases, Federal
    }
    
    return databases;
  }

  private transformWestlawResults(results: any[]): ProfessionalCaseDocument[] {
    return results.map(result => ({
      id: `westlaw-${result.documentId}`,
      provider: 'westlaw' as const,
      title: result.title,
      citation: result.citation,
      court: result.court,
      judges: result.judges || [],
      date: result.date,
      docketNumber: result.docketNumber,
      documentType: this.mapWestlawDocType(result.docType),
      pageCount: result.pageCount || 0,
      fullTextUrl: result.fullTextUrl,
      citedCases: result.citedReferences || [],
      citingCases: result.citingReferences || [],
      keyTopics: result.topics || [],
      headnotes: result.headnotes || [],
      shepardSignal: result.keyCiteSignal,
      hasFullText: !!result.fullTextUrl,
      downloadUrl: result.pdfUrl,
      confidence: result.relevanceScore || 0.8,
    }));
  }

  private mapWestlawDocType(westlawType: string): ProfessionalCaseDocument['documentType'] {
    // Map Westlaw document types
    const mapping: Record<string, ProfessionalCaseDocument['documentType']> = {
      'CASE': 'opinion',
      'BRIEF': 'brief',
      'MOTION': 'motion',
      'TRANSCRIPT': 'transcript',
    };
    return mapping[westlawType] || 'opinion';
  }
}

// Unified Professional Legal Search
export class ProfessionalLegalSearch {
  private lexis: LexisNexisAPI;
  private westlaw: WestlawAPI;

  constructor() {
    this.lexis = new LexisNexisAPI();
    this.westlaw = new WestlawAPI();
  }

  async searchByCitation(citation: string): Promise<{
    documents: ProfessionalCaseDocument[];
    citationAnalysis: CitationAnalysis;
    totalResults: number;
    providers: string[];
  }> {
    console.log(`Starting professional citation search for: "${citation}"`);

    const citationAnalysis = this.parseCitation(citation);
    
    if (!citationAnalysis.isValid) {
      throw new Error(`Invalid citation format: ${citation}`);
    }

    const searchConfig: LegalSearchConfig = {
      provider: 'lexisnexis', // Will try both
      query: citation,
      courtLevel: this.detectCourtLevel(citationAnalysis),
      documentTypes: ['opinions', 'briefs'],
      maxResults: 25,
    };

    // Search both Lexis and Westlaw in parallel for comprehensive results
    const [lexisResults, westlawResults] = await Promise.allSettled([
      this.searchWithProvider('lexisnexis', searchConfig),
      this.searchWithProvider('westlaw', searchConfig),
    ]);

    const allDocuments: ProfessionalCaseDocument[] = [];
    const providers: string[] = [];

    if (lexisResults.status === 'fulfilled') {
      allDocuments.push(...lexisResults.value);
      providers.push('LexisNexis');
    }

    if (westlawResults.status === 'fulfilled') {
      allDocuments.push(...westlawResults.value);
      providers.push('Westlaw');
    }

    // Deduplicate and rank by relevance
    const deduplicatedDocs = this.deduplicateDocuments(allDocuments);
    const rankedDocs = this.rankByRelevance(deduplicatedDocs, citation);

    return {
      documents: rankedDocs,
      citationAnalysis,
      totalResults: rankedDocs.length,
      providers,
    };
  }

  private async searchWithProvider(provider: 'lexisnexis' | 'westlaw', config: LegalSearchConfig): Promise<ProfessionalCaseDocument[]> {
    if (provider === 'lexisnexis') {
      return await this.lexis.searchCases(config);
    } else {
      return await this.westlaw.searchCases(config);
    }
  }

  private parseCitation(citation: string): CitationAnalysis {
    // Enhanced citation parsing for professional legal citations
    const citationPatterns = [
      // Supreme Court: Name, Volume U.S. Page (Year)
      /^(.+?),\s*(\d+)\s+U\.S\.\s+(\d+)\s*(?:\((\d{4})\))?/,
      // Federal: Name, Volume F.3d Page (Circuit Year)
      /^(.+?),\s*(\d+)\s+F\.3d\s+(\d+)\s*(?:\(.*?(\d{4})\))?/,
      // Federal 2d: Name, Volume F.2d Page
      /^(.+?),\s*(\d+)\s+F\.2d\s+(\d+)/,
      // State courts and other patterns...
    ];

    for (const pattern of citationPatterns) {
      const match = citation.match(pattern);
      if (match) {
        return {
          originalCitation: citation,
          parsedComponents: {
            caseName: match[1].trim(),
            volume: match[2],
            reporter: this.extractReporter(citation),
            page: match[3],
            year: match[4],
            court: this.detectCourt(citation),
          },
          isValid: true,
          alternativeFormats: this.generateAlternativeFormats(match),
          parallelCitations: [], // Could be populated from API responses
        };
      }
    }

    return {
      originalCitation: citation,
      parsedComponents: {
        caseName: '',
        volume: '',
        reporter: '',
        page: '',
      },
      isValid: false,
      alternativeFormats: [],
      parallelCitations: [],
    };
  }

  private extractReporter(citation: string): string {
    const reporters = ['U.S.', 'F.3d', 'F.2d', 'F.', 'S.Ct.', 'L.Ed.'];
    for (const reporter of reporters) {
      if (citation.includes(reporter)) {
        return reporter;
      }
    }
    return '';
  }

  private detectCourt(citation: string): string {
    if (citation.includes('U.S.')) return 'Supreme Court';
    if (citation.includes('F.3d') || citation.includes('F.2d')) return 'Federal Appellate';
    return '';
  }

  private detectCourtLevel(analysis: CitationAnalysis): LegalSearchConfig['courtLevel'] {
    const reporter = analysis.parsedComponents.reporter;
    if (reporter === 'U.S.' || reporter === 'S.Ct.') return 'supreme';
    if (reporter.startsWith('F.')) return 'appellate';
    return 'all';
  }

  private generateAlternativeFormats(match: RegExpMatchArray): string[] {
    // Generate parallel citations and alternative formats
    return [];
  }

  private deduplicateDocuments(docs: ProfessionalCaseDocument[]): ProfessionalCaseDocument[] {
    const seen = new Set<string>();
    return docs.filter(doc => {
      const key = `${doc.citation}-${doc.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private rankByRelevance(docs: ProfessionalCaseDocument[], originalQuery: string): ProfessionalCaseDocument[] {
    return docs.sort((a, b) => {
      // Prioritize exact citation matches
      if (a.citation.includes(originalQuery) && !b.citation.includes(originalQuery)) return -1;
      if (!a.citation.includes(originalQuery) && b.citation.includes(originalQuery)) return 1;
      
      // Then by provider reliability (Lexis/Westlaw over free sources)
      const providerScore = (doc: ProfessionalCaseDocument) => {
        if (doc.provider === 'lexisnexis' || doc.provider === 'westlaw') return 2;
        return 1;
      };
      
      if (providerScore(a) !== providerScore(b)) {
        return providerScore(b) - providerScore(a);
      }
      
      // Finally by confidence score
      return b.confidence - a.confidence;
    });
  }

  // Professional document text retrieval
  async getFullDocumentText(document: ProfessionalCaseDocument): Promise<{
    fullText: string;
    metadata: any;
    citationContext: string[];
  }> {
    if (document.provider === 'lexisnexis') {
      return this.getLexisFullText(document);
    } else if (document.provider === 'westlaw') {
      return this.getWestlawFullText(document);
    }
    
    throw new Error(`Unsupported provider: ${document.provider}`);
  }

  private async getLexisFullText(document: ProfessionalCaseDocument): Promise<any> {
    // Implement Lexis full-text retrieval
    const token = await this.lexis['authenticate']();
    
    const response = await fetch(document.fullTextUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve document: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      fullText: data.fullText,
      metadata: data.metadata,
      citationContext: data.citedCases || [],
    };
  }

  private async getWestlawFullText(document: ProfessionalCaseDocument): Promise<any> {
    // Implement Westlaw full-text retrieval
    const response = await fetch(document.fullTextUrl, {
      headers: {
        'Authorization': `Bearer ${this.westlaw['apiKey']}`,
      },
    });

    const data = await response.json();
    
    return {
      fullText: data.text,
      metadata: data.metadata,
      citationContext: data.citations || [],
    };
  }
}

export { ProfessionalCaseDocument, CitationAnalysis, LegalSearchConfig }; 