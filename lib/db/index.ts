import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for database operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database utility functions
export const db = {
  // Users
  async createUser(userData: {
    email: string;
    name?: string;
    firm_name?: string;
    role?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name || null,
        firm_name: userData.firm_name || null
        // Note: role field doesn't exist in current schema
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Cases
  async createCase(caseData: {
    user_id: string;
    case_name: string;
    case_type?: string;
    court_level?: string;
    constitutional_question?: string;
    client_type?: string;
    jurisdiction?: string;
    penalties?: string;
    precedent_target?: string;
  }) {
    // Use actual database schema field names
    const { data, error } = await supabase
      .from('cases')
      .insert({
        user_id: caseData.user_id,
        title: caseData.case_name, // Use title field (NOT NULL)
        case_name: caseData.case_name, // Also populate case_name field
        case_type: caseData.case_type || null,
        court_level: caseData.court_level || null,
        constitutional_question: caseData.constitutional_question || null, // This field exists
        client_type: caseData.client_type || null, // This field exists
        jurisdiction: caseData.jurisdiction || null, // This field exists
        penalties: caseData.penalties || null, // This field exists
        precedent_target: caseData.precedent_target || null, // This field exists
        case_status: 'draft', // Use case_status field
        status: 'draft' // Also populate status field
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCaseById(id: string) {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        users!inner(name, firm_name)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getCasesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateCase(id: string, updates: Partial<{
    case_name: string;
    case_type: string;
    court_level: string;
    constitutional_question: string;
    client_type: string;
    jurisdiction: string;
    penalties: string;
    precedent_target: string;
    status: string;
    current_step: number;
  }>) {
    const { data, error } = await supabase
      .from('cases')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Attorney Conversations
  async createConversation(conversationData: {
    case_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    s3_url: string;
    duration_seconds?: number;
    user_id?: string;
  }) {
    // Use actual database schema field names
    const insertData: any = {
      case_id: conversationData.case_id,
      user_id: conversationData.user_id || null, // This field exists but can be null
      file_name: conversationData.file_name,
      file_size: conversationData.file_size,
      file_type: conversationData.file_type,
      s3_url: conversationData.s3_url,
      upload_status: 'completed',
      transcription_status: 'pending',
      status: 'uploaded' // This field exists
    };
    
    // Add duration_seconds if provided (field exists in schema)
    if (conversationData.duration_seconds) {
      insertData.duration_seconds = conversationData.duration_seconds;
    }
    
    const { data, error } = await supabase
      .from('attorney_conversations')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConversation(id: string, updates: Partial<{
    transcript: string;
    transcript_quality: number;
    speaker_count: number;
    speakers: any;
    analysis: any;
    key_issues: any;
    status: string;
  }>) {
    // Use actual database schema field names
    const dbUpdates: any = {};
    
    // Update transcript in both fields (transcript and transcription_text exist)
    if (updates.transcript) {
      dbUpdates.transcript = updates.transcript;
      dbUpdates.transcription_text = updates.transcript;
      dbUpdates.transcription_status = 'completed';
    }
    
    // Update individual fields that exist in schema
    if (updates.transcript_quality !== undefined) {
      dbUpdates.transcript_quality = updates.transcript_quality;
    }
    
    if (updates.speaker_count !== undefined) {
      dbUpdates.speaker_count = updates.speaker_count;
    }
    
    if (updates.speakers) {
      dbUpdates.speakers = updates.speakers;
    }
    
    if (updates.status) {
      dbUpdates.status = updates.status;
    }
    
    // Get existing analysis_result to merge with new data
    const { data: existingRecord } = await supabase
      .from('attorney_conversations')
      .select('analysis_result')
      .eq('id', id)
      .single();
    
    // Start with existing analysis_result or empty object
    const analysisResult: any = existingRecord?.analysis_result || {};
    
    if (updates.analysis) {
      // Merge existing analysis data
      Object.assign(analysisResult, updates.analysis);
    }
    
    if (updates.key_issues) {
      analysisResult.key_topics = updates.key_issues;
    }
    
    // Always set analysis_result to preserve existing data
    dbUpdates.analysis_result = analysisResult;
    
    const { data, error } = await supabase
      .from('attorney_conversations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getConversationsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('attorney_conversations')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Justice Profiles
  async getJusticeProfiles() {
    const { data, error } = await supabase
      .from('justice_profiles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getJusticeProfile(justiceName: string) {
    const { data, error } = await supabase
      .from('justice_profiles')
      .select('*')
      .eq('name', justiceName)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Justice Case Analysis
  async createJusticeCaseAnalysis(analysisData: {
    case_id: string;
    justice_id: string;
    alignment_score: number;
    key_factors: any;
    strategy: any;
    confidence_level: string;
    persuasion_entry_points: any;
  }) {
    const { data, error } = await supabase
      .from('justice_case_analysis')
      .insert({
        case_id: analysisData.case_id,
        justice_id: analysisData.justice_id,
        alignment_score: analysisData.alignment_score,
        key_factors: analysisData.key_factors,
        strategy: analysisData.strategy,
        confidence_level: analysisData.confidence_level,
        persuasion_entry_points: analysisData.persuasion_entry_points
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getJusticeCaseAnalysis(caseId: string) {
    const { data, error } = await supabase
      .from('justice_case_analysis')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Brief Section Chats
  async addBriefSectionChat(chatData: {
    brief_id: string;
    user_id: string;
    section_id: string;
    message_type: 'user' | 'assistant';
    message_content: string;
  }) {
    const { data, error } = await supabase
      .from('brief_section_chats')
      .insert({
        brief_id: chatData.brief_id,
        user_id: chatData.user_id,
        section_id: chatData.section_id,
        message_type: chatData.message_type,
        message_content: chatData.message_content
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBriefSectionChats(briefId: string, sectionId?: string) {
    let query = supabase
      .from('brief_section_chats')
      .select('*')
      .eq('brief_id', briefId);
    
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // File Uploads
  async createFileUpload(uploadData: {
    user_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    s3_key: string;
    s3_url: string;
  }) {
    const { data, error } = await supabase
      .from('file_uploads')
      .insert({
        user_id: uploadData.user_id,
        file_name: uploadData.file_name,
        file_size: uploadData.file_size,
        file_type: uploadData.file_type,
        s3_key: uploadData.s3_key,
        s3_url: uploadData.s3_url
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateFileUploadStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('file_uploads')
      .update({ upload_status: status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Legal Research Functions
  
  // Research Sessions
  async createResearchSession(sessionData: {
    case_id: string;
    user_id: string;
    session_name?: string;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('research_sessions')
      .insert({
        case_id: sessionData.case_id,
        user_id: sessionData.user_id,
        session_name: sessionData.session_name || `Research Session ${new Date().toLocaleDateString()}`,
        description: sessionData.description || null,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getResearchSessionsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateResearchSession(id: string, updates: Partial<{
    session_name: string;
    description: string;
    status: string;
  }>) {
    const { data, error } = await supabase
      .from('research_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Legal Documents
  async createLegalDocument(documentData: {
    research_session_id: string;
    case_id: string;
    external_id?: string;
    source_system: string;
    document_type: string;
    citation: string;
    case_title: string;
    court?: string;
    docket_number?: string;
    decision_date?: string;
    page_count?: number;
    has_plain_text?: boolean;
    download_url?: string;
    authors?: string[];
    parties?: any;
    legal_issues?: string[];
    search_query?: string;
    relevance_score?: number;
  }) {
    const { data, error } = await supabase
      .from('legal_documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLegalDocumentsBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('research_session_id', sessionId)
      .order('relevance_score', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getLegalDocumentsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('case_id', caseId)
      .order('relevance_score', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateLegalDocument(id: string, updates: Partial<{
    relevance_score: number;
    is_selected: boolean;
    local_file_path: string;
    has_plain_text: boolean;
  }>) {
    const { data, error } = await supabase
      .from('legal_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async bulkUpdateDocumentSelection(documentIds: string[], isSelected: boolean) {
    const { data, error } = await supabase
      .from('legal_documents')
      .update({ is_selected: isSelected })
      .in('id', documentIds)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Document Summaries
  async createDocumentSummary(summaryData: {
    document_id: string;
    summary_type: string;
    ai_model?: string;
    key_points?: string[];
    legal_standard?: string;
    disposition?: string;
    notable_quotes?: string[];
    cited_cases?: string[];
    holding?: string;
    reasoning?: string;
    precedent_value?: string;
    ai_summary?: string;
    confidence_score?: number;
  }) {
    const { data, error } = await supabase
      .from('document_summaries')
      .insert(summaryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getDocumentSummary(documentId: string, summaryType: string = 'detailed') {
    const { data, error } = await supabase
      .from('document_summaries')
      .select('*')
      .eq('document_id', documentId)
      .eq('summary_type', summaryType)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  },

  async updateDocumentSummary(id: string, updates: Partial<{
    key_points: string[];
    legal_standard: string;
    disposition: string;
    notable_quotes: string[];
    cited_cases: string[];
    holding: string;
    reasoning: string;
    precedent_value: string;
    ai_summary: string;
    confidence_score: number;
  }>) {
    const { data, error } = await supabase
      .from('document_summaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Research Notes
  async createResearchNote(noteData: {
    user_id: string;
    case_id: string;
    document_id?: string;
    research_session_id: string;
    note_type: string;
    title?: string;
    content: string;
    tags?: string[];
    page_references?: string[];
    quote_text?: string;
  }) {
    const { data, error } = await supabase
      .from('research_notes')
      .insert(noteData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getResearchNotesByCase(caseId: string) {
    const { data, error } = await supabase
      .from('research_notes')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateResearchNote(id: string, updates: Partial<{
    title: string;
    content: string;
    tags: string[];
    page_references: string[];
    quote_text: string;
  }>) {
    const { data, error } = await supabase
      .from('research_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Saved Searches
  async createSavedSearch(searchData: {
    user_id: string;
    case_id?: string;
    search_name: string;
    search_query: string;
    search_parameters?: any;
    is_favorite?: boolean;
  }) {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert(searchData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSavedSearchesByUser(userId: string) {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateSavedSearch(id: string, updates: Partial<{
    search_name: string;
    search_query: string;
    search_parameters: any;
    last_run_at: string;
    results_count: number;
    is_favorite: boolean;
  }>) {
    const { data, error } = await supabase
      .from('saved_searches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Citation Relationships
  async createCitationRelationship(relationshipData: {
    citing_document_id: string;
    cited_document_id: string;
    relationship_type: string;
    context?: string;
    page_number?: number;
  }) {
    const { data, error } = await supabase
      .from('citation_relationships')
      .insert(relationshipData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCitationRelationships(documentId: string) {
    const { data, error } = await supabase
      .from('citation_relationships')
      .select(`
        *,
        citing_document:legal_documents!citing_document_id(*),
        cited_document:legal_documents!cited_document_id(*)
      `)
      .or(`citing_document_id.eq.${documentId},cited_document_id.eq.${documentId}`);
    
    if (error) throw error;
    return data;
  }
};

// Export the Supabase client for direct access if needed
export { supabase };