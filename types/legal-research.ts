// TypeScript types for Legal Research system

export interface ResearchSession {
  id: string;
  case_id: string;
  user_id: string;
  session_name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  research_session_id: string;
  case_id: string;
  
  // Document identification
  external_id?: string;
  source_system: 'courtlistener' | 'westlaw' | 'lexisnexis' | 'pacer';
  document_type: 'decision' | 'dissent' | 'concurrence' | 'brief_petitioner' | 'brief_respondent' | 'brief_amicus' | 'record';
  
  // Citation information
  citation: string;
  case_title: string;
  court?: string;
  docket_number?: string;
  decision_date?: string;
  
  // Document content
  page_count?: number;
  has_plain_text: boolean;
  download_url?: string;
  local_file_path?: string;
  
  // Metadata
  authors?: string[];
  parties?: {
    plaintiff?: string;
    defendant?: string;
    petitioner?: string;
    respondent?: string;
  };
  legal_issues?: string[];
  
  // Research context
  search_query?: string;
  relevance_score?: number;
  is_selected: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface DocumentSummary {
  id: string;
  document_id: string;
  
  // Summary metadata
  summary_type: 'quick' | 'detailed' | 'precedent_analysis';
  ai_model?: string;
  
  // Structured summary data
  key_points?: string[];
  legal_standard?: string;
  disposition?: string;
  notable_quotes?: string[];
  cited_cases?: string[];
  
  // Analysis results
  holding?: string;
  reasoning?: string;
  precedent_value?: string;
  
  // AI-generated content
  ai_summary?: string;
  confidence_score?: number;
  
  created_at: string;
  updated_at: string;
}

export interface CitationRelationship {
  id: string;
  citing_document_id: string;
  cited_document_id: string;
  
  // Relationship details
  relationship_type: 'cited_positively' | 'cited_negatively' | 'distinguished' | 'overruled';
  context?: string;
  page_number?: number;
  
  created_at: string;
}

export interface ResearchNote {
  id: string;
  user_id: string;
  case_id: string;
  document_id?: string;
  research_session_id: string;
  
  // Note content
  note_type: 'general' | 'strategy' | 'argument' | 'precedent_analysis';
  title?: string;
  content: string;
  tags?: string[];
  
  // References
  page_references?: string[];
  quote_text?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  case_id?: string;
  
  // Search details
  search_name: string;
  search_query: string;
  search_parameters?: {
    court_filters?: string[];
    date_range?: {
      from?: string;
      to?: string;
    };
    document_types?: string[];
    jurisdiction?: string[];
  };
  
  // Metadata
  last_run_at?: string;
  results_count: number;
  is_favorite: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface ResearchTemplate {
  id: string;
  created_by?: string;
  
  // Template details
  template_name: string;
  description?: string;
  case_type?: string;
  
  // Research workflow
  search_queries?: string[];
  document_types?: string[];
  analysis_steps?: string[];
  
  // Sharing and usage
  is_public: boolean;
  usage_count: number;
  
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface CitationSearchRequest {
  citation: string;
  search_parameters?: {
    include_related?: boolean;
    max_results?: number;
    court_filters?: string[];
    date_range?: {
      from?: string;
      to?: string;
    };
  };
}

export interface CitationSearchResponse {
  success: boolean;
  session_id: string;
  documents: LegalDocument[];
  total_results: number;
  search_query: string;
  providers: string[];
  error?: string;
}

export interface DocumentSummarizationRequest {
  document_id: string;
  summary_type: 'quick' | 'detailed' | 'precedent_analysis';
  context?: {
    case_context?: string;
    specific_questions?: string[];
  };
}

export interface DocumentSummarizationResponse {
  success: boolean;
  summary: DocumentSummary;
  error?: string;
}

export interface BulkOperationRequest {
  operation: 'select' | 'summarize' | 'analyze_precedent';
  document_ids: string[];
  parameters?: any;
}

export interface BulkOperationResponse {
  success: boolean;
  results: {
    document_id: string;
    success: boolean;
    data?: any;
    error?: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Frontend Component Props
export interface LegalResearchProps {
  caseId: string;
  initialSessionId?: string;
  onDocumentsSelected?: (documents: LegalDocument[]) => void;
  onSummariesGenerated?: (summaries: DocumentSummary[]) => void;
}

export interface ResearchWorkspaceProps {
  caseId: string;
  userId: string;
}

export interface DocumentViewerProps {
  document: LegalDocument;
  summary?: DocumentSummary;
  onSummaryRequest?: (documentId: string, summaryType: string) => void;
  onNoteCreate?: (note: Omit<ResearchNote, 'id' | 'created_at' | 'updated_at'>) => void;
}

// Search and Filter types
export interface SearchFilter {
  courts?: string[];
  document_types?: string[];
  date_range?: {
    from?: Date;
    to?: Date;
  };
  relevance_threshold?: number;
  has_plain_text?: boolean;
}

export interface SearchSuggestion {
  type: 'citation' | 'case_name' | 'judge' | 'concept';
  value: string;
  description?: string;
  relevance_score?: number;
}

// Research Analytics
export interface ResearchAnalytics {
  session_id: string;
  documents_found: number;
  documents_selected: number;
  summaries_generated: number;
  research_time_minutes: number;
  top_sources: Array<{
    source: string;
    count: number;
  }>;
  key_cases_identified: string[];
  precedent_strength: {
    strong: number;
    moderate: number;
    weak: number;
  };
}
