// CourtListener API integration for case document discovery
// Free legal database provided by the Free Law Project

/**
 * REQUIRED DOCUMENT TYPES FOR COMPLETE LEGAL RESEARCH
 * 
 * MUST HAVE (Essential for Supreme Court brief writing):
 * 1. APPENDIX / RECORD - SUPER IMPORTANT
 *    - Contains the factual record from lower courts
 *    - Essential for understanding case facts and procedural history
 *    - Critical for Supreme Court briefs
 * 
 * 2. OPINION
 *    - Main court decision/ruling
 *    - Primary legal analysis and holding
 * 
 * 3. DISSENT  
 *    - Dissenting opinions from judges
 *    - Alternative legal analysis and reasoning
 *    - Often provides strong counter-arguments
 * 
 * 4. BRIEFS
 *    - Petitioner briefs (party appealing)
 *    - Respondent briefs (party defending)
 *    - Amicus briefs (third parties)
 *    - Essential for understanding legal arguments
 * 
 * CURRENT LIMITATION:
 * - CourtListener primarily has court opinions (decisions/dissents)
 * - Limited briefs (mostly Supreme Court level)
 * - NO appendix/record access (this is in PACER)
 * - NO party briefs for most cases
 * 
 * SOLUTION NEEDED:
 * - Integrate PACER API for complete case files
 * - Add Westlaw/LexisNexis for comprehensive brief access
 * - Ensure appendix/record retrieval capability
 */

/**
 * HISTORICAL CONTEXT RESEARCH - UI/UX REQUIREMENTS
 * 
 * DOCUMENT INTERACTION FEATURES:
 * 
 * 1. "HOW THIS IS RELEVANT TO OUR CASE" BUTTON
 *    - Each document needs relevance analysis button
 *    - AI-powered explanation of document's significance
 *    - Shows specific connections to current case facts/issues
 *    - Highlights key precedents, distinguishing factors, etc.
 * 
 * 2. DOCUMENT SUMMARY & FULL TEXT ACCESS
 *    - "View Summary" button - AI-generated executive summary
 *    - "View Full Text" button - complete document content
 *    - Progressive disclosure: Summary → Key Excerpts → Full Text
 *    - Search within document functionality
 * 
 * DOCUMENT CATEGORIES:
 * 
 * Standard Categories:
 * - Circuit Court Decisions (1)
 * - Dissenting Opinions (1) 
 * - Case Records/Appendix (1)
 * - Petitioner Briefs (1)
 * - Respondent Briefs (1)
 * - Amicus Briefs (3+)
 * 
 * 3. "OTHER" CATEGORY - EXPANDED RESEARCH
 *    - Congressional Records (bill debates, committee hearings)
 *    - Legislative History documents
 *    - Law Review Articles
 *    - Historical Court Documents
 *    - Administrative Regulations/Rulings
 *    - International/Comparative Law Sources
 * 
 * 4. DEEP RESEARCH SECTION (Bottom of page)
 *    - "Do Deep Research" expandable section
 *    - Advanced search filters:
 *      * Time period (decades, specific years)
 *      * Document type (congressional, academic, international)
 *      * Jurisdiction (federal, state, international)
 *      * Legal topic/subject matter
 *    - "Find More Documents" with AI-powered discovery
 *    - Related case suggestions
 *    - Historical precedent chains
 * 
 * UI COMPONENTS NEEDED:
 * - Document cards with action buttons
 * - Relevance analysis modal/panel
 * - Document viewer with summary/full text toggle
 * - Expandable "Other" and "Deep Research" sections
 * - Advanced search interface
 * - AI-powered document relationship mapping
 */

/**
 * CONSTITUTIONAL HYPOTHETICALS: PARALLEL SCENARIOS - REQUIREMENTS
 * 
 * PURPOSE: Think like a constitutional lawyer - understand precedent patterns,
 * analogies, and factual distinctions that shape constitutional interpretation
 * 
 * CORE FEATURES:
 * 
 * 1. PARALLEL SCENARIO ANALYSIS
 *    - AI identifies factually similar cases across different constitutional contexts
 *    - Shows how courts handle analogous situations in different amendments/areas
 *    - Highlights pattern recognition across constitutional doctrine
 *    - "What if" scenario generation based on factual variations
 * 
 * 2. DEEP DIVE CAPABILITIES
 *    - "Dig Deeper" button for each hypothetical scenario
 *    - Source tracing: "Where does this story come from?"
 *    - Full case context and factual background
 *    - Judicial reasoning chains and precedent evolution
 * 
 * 3. CONSTITUTIONAL LAWYER THINKING TOOLS
 *    - Factual pattern matching across constitutional areas
 *    - Analogical reasoning development
 *    - Distinguishing factor analysis
 *    - Precedent strength assessment
 *    - Constitutional test/standard application
 * 
 * SCENARIO TYPES TO GENERATE:
 * 
 * A. FACTUAL ANALOGIES
 *    - Similar fact patterns in different constitutional contexts
 *    - Cross-amendment parallels (1st/4th/14th Amendment overlaps)
 *    - Technology evolution cases (old precedents, new contexts)
 * 
 * B. DOCTRINAL PARALLELS
 *    - How different constitutional tests handle similar issues
 *    - Strict scrutiny vs. intermediate scrutiny applications
 *    - Balancing tests across different rights
 * 
 * C. HISTORICAL PROGRESSIONS
 *    - How constitutional interpretation evolved on similar issues
 *    - Court's changing approach to analogous problems
 *    - Overruled precedents and their modern implications
 * 
 * USER INTERACTION FEATURES:
 * 
 * 1. "DIG DEEPER" FUNCTIONALITY
 *    - Click any hypothetical to see source cases
 *    - Full text access to foundational decisions
 *    - Factual timeline and procedural history
 *    - Judicial panel composition and voting patterns
 * 
 * 2. "UNDERSTAND THE SOURCE" ANALYSIS
 *    - Case origin and procedural posture
 *    - Lower court decisions and appeals process
 *    - Advocacy strategies and brief arguments
 *    - Amicus participation and influence
 * 
 * 3. CONSTITUTIONAL REASONING CHAIN
 *    - Step-by-step judicial analysis
 *    - Constitutional text interpretation
 *    - Precedent citation and application
 *    - Policy considerations and limiting principles
 * 
 * AI ANALYSIS COMPONENTS:
 * - Factual pattern recognition
 * - Constitutional doctrine mapping
 * - Precedent strength scoring
 * - Analogical reasoning assistance
 * - Distinguishing factor identification
 * - Hypothetical scenario generation
 * 
 * UI COMPONENTS NEEDED:
 * - Interactive scenario cards with expansion
 * - Source case modal/viewer
 * - Constitutional reasoning flowcharts
 * - Factual comparison matrices
 * - Precedent timeline visualizations
 * - "Dig Deeper" progressive disclosure interface
 */

/**
 * ADDITIONAL ANGLES TO EXPLORE - POST-TRANSCRIPTION ANALYSIS
 * 
 * PURPOSE: After transcription analysis, suggest strategic legal angles and 
 * allow lawyers to add their own research directions for comprehensive case preparation
 * 
 * TRIGGER: Appears after transcription is complete and initial analysis is done
 * 
 * CORE FEATURES:
 * 
 * 1. AI-RECOMMENDED ANGLES
 *    - Analyze transcription content for potential legal issues
 *    - Identify constitutional questions raised during oral argument
 *    - Suggest parallel cases and precedents to research
 *    - Recommend procedural and jurisdictional angles
 *    - Flag potential weakness/strength areas for exploration
 * 
 * 2. USER-DEFINED CUSTOM ANGLES
 *    - Input field for lawyer to add their own research angles
 *    - Custom angle categories and tagging
 *    - Ability to modify/edit AI suggestions
 *    - Save and organize personal research directions
 * 
 * ANGLE CATEGORIES TO GENERATE:
 * 
 * A. CONSTITUTIONAL ANGLES
 *    - Due Process implications
 *    - Equal Protection arguments
 *    - First Amendment considerations
 *    - Commerce Clause issues
 *    - Federalism questions
 * 
 * B. PROCEDURAL ANGLES
 *    - Standing and justiciability
 *    - Mootness and ripeness
 *    - Cert petition strategies
 *    - Circuit split analysis
 *    - Harmless error analysis
 * 
 * C. FACTUAL DEVELOPMENT ANGLES
 *    - Record gaps to explore
 *    - Additional discovery needs
 *    - Expert witness considerations
 *    - Empirical research opportunities
 *    - Legislative history gaps
 * 
 * D. STRATEGIC ANGLES
 *    - Amicus brief opportunities
 *    - Public policy arguments
 *    - Originalism vs. living constitution approaches
 *    - Judicial minimalism vs. broad ruling implications
 *    - Coalition building possibilities
 * 
 * USER INTERACTION FEATURES:
 * 
 * 1. ANGLE RECOMMENDATION DISPLAY
 *    - Cards showing each recommended angle
 *    - Confidence score for AI recommendations
 *    - "Why this matters" explanation for each angle
 *    - Priority ranking (high/medium/low importance)
 * 
 * 2. CUSTOM ANGLE INPUT
 *    - Text input for user-defined angles
 *    - Category dropdown (Constitutional, Procedural, Factual, Strategic, Other)
 *    - Priority level setting
 *    - Notes/description field
 *    - Research status tracking (Not Started, In Progress, Complete)
 * 
 * 3. ANGLE MANAGEMENT
 *    - Accept/reject AI recommendations
 *    - Edit and refine suggested angles
 *    - Combine related angles
 *    - Archive completed research
 *    - Export angle list for team collaboration
 * 
 * 4. RESEARCH INTEGRATION
 *    - Each angle links to research tools
 *    - Auto-generate search queries for legal databases
 *    - Track research progress per angle
 *    - Attach findings and documents to angles
 *    - Generate research assignments for team members
 * 
 * AI ANALYSIS COMPONENTS:
 * - Transcription content analysis
 * - Legal issue spotting
 * - Precedent gap identification
 * - Argument strength assessment
 * - Strategic opportunity recognition
 * - Research priority scoring
 * 
 * UI COMPONENTS NEEDED:
 * - Angle recommendation cards with accept/reject
 * - Custom angle input form
 * - Angle management dashboard
 * - Priority and category filtering
 * - Research progress tracking
 * - Team collaboration features
 * - Integration with legal research tools
 */

import { ParsedCitation, CitationSearchQuery } from './citation-parser';

const COURTLISTENER_BASE_URL = 'https://www.courtlistener.com/api/rest/v3';

export interface CourtListenerOpinion {
  id: number;
  resource_uri: string;
  absolute_url: string;
  cluster: number;
  date_created: string;
  date_modified: string;
  type: 'combined' | 'lead' | 'concurring' | 'dissenting' | 'addendum';
  sha1: string;
  page_count: number;
  download_url: string;
  local_path: string;
  plain_text: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_with_citations: string;
  extracted_by_ocr: boolean;
  author: number;
  per_curiam: boolean;
  joined_by: number[];
}

export interface CourtListenerCluster {
  id: number;
  resource_uri: string;
  absolute_url: string;
  panel: number[];
  non_participating_judges: number[];
  date_created: string;
  date_modified: string;
  date_filed: string;
  date_filed_is_approximate: boolean;
  slug: string;
  case_name_short: string;
  case_name: string;
  case_name_full: string;
  federal_cite_one: string;
  federal_cite_two: string;
  federal_cite_three: string;
  state_cite_one: string;
  state_cite_two: string;
  state_cite_three: string;
  neutral_cite: string;
  scdb_id: string;
  scdb_decision_direction: number;
  scdb_votes_majority: number;
  scdb_votes_minority: number;
  source: string;
  procedural_history: string;
  attorneys: string;
  nature_of_suit: string;
  posture: string;
  syllabus: string;
  headnotes: string;
  summary: string;
  disposition: string;
  history: string;
  other_dates: string;
  cross_reference: string;
  correction: string;
  citation_count: number;
  precedential_status: string;
  date_blocked: string;
  blocked: boolean;
  docket: number;
  sub_opinions: (CourtListenerOpinion | string)[];
  citations: any[];
  opinions: number[];
}

export interface CourtListenerDocket {
  id: number;
  resource_uri: string;
  absolute_url: string;
  court: number;
  appeal_from: number;
  appeal_from_str: string;
  originating_court_information: string;
  date_created: string;
  date_modified: string;
  date_cert_granted: string;
  date_cert_denied: string;
  date_argued: string;
  date_reargued: string;
  date_reargument_denied: string;
  date_filed: string;
  date_terminated: string;
  date_last_filing: string;
  case_name_short: string;
  case_name: string;
  case_name_full: string;
  slug: string;
  docket_number: string;
  docket_number_core: string;
  pacer_case_id: string;
  cause: string;
  nature_of_suit: string;
  jury_demand: string;
  jurisdiction_type: string;
  appellate_fee_status: string;
  appellate_case_type_information: string;
  mdl_status: string;
  filepath_local: string;
  filepath_ia: string;
  filepath_ia_json: string;
  view_count: number;
  date_blocked: string;
  blocked: boolean;
  appeal_from_id: string;
  assigned_to: number;
  assigned_to_str: string;
  referred_to: number;
  referred_to_str: string;
  panel: number[];
  tags: any[];
  parties: any[];
  clusters: number[];
  audio_files: number[];
  docket_entries: any[];
}

export interface CaseDocument {
  id: string;
  type: 'decision' | 'dissent' | 'concurrence' | 'record' | 'brief_petitioner' | 'brief_respondent' | 'brief_amicus';
  title: string;
  court: string;
  docketNumber: string;
  date: string;
  pageCount: number;
  source: 'courtlistener';
  downloadUrl: string;
  plainText?: string;
  authors?: string[];
  isSelected: boolean;
  cluster?: CourtListenerCluster;
  opinion?: CourtListenerOpinion;
}

export interface SearchResults {
  documents: CaseDocument[];
  totalFound: number;
  searchQueries: CitationSearchQuery[];
  errors: string[];
}

class CourtListenerAPI {
  private baseUrl = COURTLISTENER_BASE_URL;
  private lastRequestTime = 0;
  private minInterval = 1000; // 1 second between requests
  private retryAttempts = 3;
  private apiToken = process.env.COURTLISTENER_API_TOKEN;

  private async makeRequest(url: string, attempt = 1): Promise<Response> {
    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    const headers: Record<string, string> = {
      'User-Agent': 'Legal Research Tool/1.0 (Educational Use)',
      'Accept': 'application/json',
    };

    // Add authentication header with API token
    if (this.apiToken) {
      headers['Authorization'] = `Token ${this.apiToken}`;
    }

    const response = await fetch(url, { headers });

    // Handle rate limiting with exponential backoff
    if (response.status === 429 || response.status === 403) {
      if (attempt <= this.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${this.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, attempt + 1);
      } else {
        throw new Error(`CourtListener API error: ${response.status} - Rate limited after ${this.retryAttempts} attempts`);
      }
    }

    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status}`);
    }

    return response;
  }

  // Search for opinions/clusters by citation
  async searchOpinions(query: CitationSearchQuery, limit = 20): Promise<CourtListenerCluster[]> {
    const params = new URLSearchParams();
    
    if (query.caseName) {
      params.append('case_name', query.caseName);
    }
    
    if (query.citation) {
      // Try multiple citation fields
      params.append('citation', query.citation);
    }
    
    if (query.federal_cite_one) {
      params.append('federal_cite_one', query.federal_cite_one);
    }
    
    if (query.court) {
      params.append('court', query.court);
    }
    
    if (query.yearStart && query.yearEnd) {
      params.append('date_filed__gte', `${query.yearStart}-01-01`);
      params.append('date_filed__lte', `${query.yearEnd}-12-31`);
    }
    
    params.append('limit', limit.toString());
    params.append('format', 'json');

    try {
      const response = await this.makeRequest(`${this.baseUrl}/clusters/?${params.toString()}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('CourtListener search error:', error);
      throw error;
    }
  }

  // Get detailed cluster information with opinions
  async getClusterDetails(clusterId: number): Promise<CourtListenerCluster | null> {
    try {
      const response = await fetch(`${this.baseUrl}/clusters/${clusterId}/?format=json`);
      
      if (!response.ok) {
        throw new Error(`CourtListener API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CourtListener cluster details error:', error);
      return null;
    }
  }

  // Get opinion text content
  async getOpinionText(opinionId: number): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/opinions/${opinionId}/?format=json`);
      
      if (!response.ok) {
        throw new Error(`CourtListener API error: ${response.status}`);
      }
      
      const opinion = await response.json();
      return opinion.plain_text || opinion.html || '';
    } catch (error) {
      console.error('CourtListener opinion text error:', error);
      return '';
    }
  }

  // Convert CourtListener data to our CaseDocument format
  private clusterToDocuments(cluster: CourtListenerCluster): CaseDocument[] {
    const documents: CaseDocument[] = [];
    
    // Handle the case where sub_opinions contains URL strings instead of objects
    if (cluster.sub_opinions && cluster.sub_opinions.length > 0) {
      cluster.sub_opinions.forEach((opinionRef, index) => {
        // Extract opinion ID from URL string
        let opinionId: string | number = 'unknown';
        if (typeof opinionRef === 'string' && opinionRef.includes('/opinions/')) {
          const match = opinionRef.match(/\/opinions\/(\d+)\//);
          if (match) {
            opinionId = parseInt(match[1]);
          }
        } else if (typeof opinionRef === 'object' && opinionRef.id) {
          opinionId = opinionRef.id;
        }

        documents.push({
          id: `cl-${cluster.id}-${opinionId}`,
          type: 'decision', // Default type, will be updated when we fetch full opinion
          title: `${cluster.case_name_short || cluster.case_name || 'Untitled Case'} - Opinion`,
          court: this.extractCourtName(cluster),
          docketNumber: cluster.slug || `cluster-${cluster.id}`,
          date: cluster.date_filed,
          pageCount: 0, // Will be updated when we fetch full opinion
          source: 'courtlistener',
          downloadUrl: '',
          plainText: '',
          authors: [],
          isSelected: false,
          cluster,
          opinion: typeof opinionRef === 'object' ? opinionRef : undefined
        });
      });
    } else if (cluster.opinions && cluster.opinions.length > 0) {
      // Handle older format where opinions are IDs
      cluster.opinions.forEach((opinionId) => {
        documents.push({
          id: `cl-${cluster.id}-${opinionId}`,
          type: 'decision',
          title: `${cluster.case_name_short || cluster.case_name || 'Untitled Case'} - Opinion`,
          court: this.extractCourtName(cluster),
          docketNumber: cluster.slug || `cluster-${cluster.id}`,
          date: cluster.date_filed,
          pageCount: 0,
          source: 'courtlistener',
          downloadUrl: '',
          plainText: '',
          authors: [],
          isSelected: false,
          cluster,
          opinion: undefined
        });
      });
    } else {
      // Create a document even if no opinions are available
      documents.push({
        id: `cl-${cluster.id}-cluster`,
        type: 'decision',
        title: `${cluster.case_name_short || cluster.case_name || 'Untitled Case'} - Case Record`,
        court: this.extractCourtName(cluster),
        docketNumber: cluster.slug || `cluster-${cluster.id}`,
        date: cluster.date_filed,
        pageCount: 0,
        source: 'courtlistener',
        downloadUrl: '',
        plainText: cluster.summary || cluster.syllabus || '',
        authors: [],
        isSelected: false,
        cluster,
        opinion: undefined
      });
    }

    return documents;
  }

  private formatOpinionType(type: string): string {
    switch (type) {
      case 'lead':
      case 'combined':
        return 'Majority Opinion';
      case 'dissenting':
        return 'Dissenting Opinion';
      case 'concurring':
        return 'Concurring Opinion';
      case 'addendum':
        return 'Addendum';
      default:
        return 'Opinion';
    }
  }

  private extractCourtName(cluster: CourtListenerCluster): string {
    // Try to extract court information from various fields
    if (cluster.federal_cite_one && cluster.federal_cite_one.includes('F.3d')) {
      return 'U.S. Court of Appeals';
    } else if (cluster.federal_cite_one && cluster.federal_cite_one.includes('F.Supp')) {
      return 'U.S. District Court';
    } else if (cluster.federal_cite_one && cluster.federal_cite_one.includes('U.S.')) {
      return 'U.S. Supreme Court';
    } else if (cluster.federal_cite_one) {
      return 'Federal Court';
    } else if (cluster.state_cite_one) {
      return 'State Court';
    } else {
      return 'Court';
    }
  }

  private getMockResults(query: CitationSearchQuery): CourtListenerCluster[] {
    // Return mock data when API is unavailable
    if (query.caseName?.toLowerCase().includes('miller') && query.caseName?.toLowerCase().includes('mcdonald')) {
      return [{
        id: 1,
        resource_uri: '/api/rest/v3/clusters/1/',
        absolute_url: 'https://www.courtlistener.com/opinion/1/mock/',
        panel: [],
        non_participating_judges: [],
        date_created: '2023-01-01T00:00:00Z',
        date_modified: '2023-01-01T00:00:00Z',
        date_filed: '2020-03-15',
        date_filed_is_approximate: false,
        slug: 'miller-v-mcdonald-demo',
        case_name_short: 'Miller v. McDonald',
        case_name: 'Miller v. McDonald',
        case_name_full: 'Miller v. McDonald',
        federal_cite_one: '944 F.3d 1050',
        federal_cite_two: '',
        federal_cite_three: '',
        state_cite_one: '',
        state_cite_two: '',
        state_cite_three: '',
        // Add other required properties with default values
        neutral_cite: '',
        scdb_id: '',
        scdb_decision_direction: 0,
        scdb_votes_majority: 0,
        scdb_votes_minority: 0,
        source: 'C',
        procedural_history: '',
        attorneys: '',
        nature_of_suit: '',
        posture: '',
        syllabus: '',
        headnotes: '',
        summary: '',
        disposition: '',
        history: '',
        other_dates: '',
        cross_reference: '',
        correction: '',
        citation_count: 0,
        precedential_status: 'Published',
        date_blocked: '',
        blocked: false,
        sub_opinions: [],
        docket: 1,
        opinions: [1],
        citations: []
      }];
    }
    
    return [];
  }
}

// Main search function
export async function searchCaseDocuments(citation: ParsedCitation): Promise<SearchResults> {
  const api = new CourtListenerAPI();
  const documents: CaseDocument[] = [];
  const errors: string[] = [];
  let totalFound = 0;

  console.log(`Searching CourtListener for: "${citation.fullCitation}"`);

  // Generate multiple search strategies - try different approaches
  const searchQueries = [
    // 1. Try exact citation first (most specific)
    ...(citation.isValid ? [{ citation: `${citation.volume} ${citation.reporter} ${citation.page}` }] : []),
    // 2. Try federal_cite_one field specifically  
    ...(citation.isValid ? [{ federal_cite_one: `${citation.volume} ${citation.reporter} ${citation.page}` }] : []),
    // 3. Try broader citation search with different formats
    ...(citation.isValid ? [{ citation: `${citation.volume} ${citation.reporter.replace('.', '')} ${citation.page}` }] : []),
    // 4. Try case name only (will get more results)
    { caseName: citation.caseName }
  ];

  for (const query of searchQueries) {
    try {
      console.log(`Trying search strategy: ${JSON.stringify(query)}`);
      const clusters = await api.searchOpinions(query, 20);
      
      console.log(`Raw API returned ${clusters.length} clusters`);
      
      // For case name searches, try to find the best matches by looking at available data
      for (const cluster of clusters) {
        // Get detailed cluster information if needed
        let detailedCluster = cluster;
        if (!cluster.sub_opinions || cluster.sub_opinions.length === 0) {
          console.log(`Fetching detailed cluster info for ID: ${cluster.id}`);
          const detailed = await api.getClusterDetails(cluster.id);
          if (detailed) {
            detailedCluster = detailed;
          }
        }
        
        const clusterDocs = api['clusterToDocuments'](detailedCluster);
        documents.push(...clusterDocs);
      }
      
      totalFound += clusters.length;
      
      // If we found results with citation search, prioritize those
      if (clusters.length > 0 && (query.citation || query.federal_cite_one)) {
        console.log(`Found ${clusters.length} results with citation search - stopping here`);
        break;
      }
      
      // For case name searches, limit to reasonable number
      if (clusters.length > 0 && query.caseName && !query.citation) {
        console.log(`Found ${clusters.length} results with case name search`);
        break;
      }
      
    } catch (error) {
      console.error(`Search strategy failed:`, error);
      errors.push(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // If still no results, try a very broad search
  if (documents.length === 0 && citation.caseName) {
    console.log(`No results found, trying broad search for: ${citation.caseName.split(' ')[0]}`);
    try {
      const firstWord = citation.caseName.split(' ')[0];
      const broadClusters = await api.searchOpinions({ caseName: firstWord }, 10);
      
      for (const cluster of broadClusters) {
        const clusterDocs = api['clusterToDocuments'](cluster);
        documents.push(...clusterDocs);
      }
      
      totalFound += broadClusters.length;
      
      if (broadClusters.length > 0) {
        errors.push(`No exact matches found for "${citation.fullCitation}". Showing cases containing "${firstWord}".`);
      }
    } catch (error) {
      console.error('Broad search failed:', error);
    }
  }

  // If still no results, show helpful message
  if (documents.length === 0) {
    errors.push(`No results found for "${citation.fullCitation}". This case may not be in CourtListener's database.`);
  }

  console.log(`Final result: ${documents.length} documents from ${totalFound} clusters`);

  return {
    documents: documents.slice(0, 20), // Limit results
    totalFound,
    searchQueries,
    errors
  };
}



// Get full text content for selected documents
export async function getDocumentContent(document: CaseDocument): Promise<string> {
  if (document.plainText) {
    return document.plainText;
  }

  if (document.opinion) {
    const api = new CourtListenerAPI();
    return await api.getOpinionText(document.opinion.id);
  }

  return '';
}

// Get related documents (dissents, concurrences) for a case
export async function getRelatedDocuments(clusterId: number): Promise<CaseDocument[]> {
  const api = new CourtListenerAPI();
  const cluster = await api.getClusterDetails(clusterId);
  
  if (!cluster) {
    return [];
  }

  return api['clusterToDocuments'](cluster);
} 