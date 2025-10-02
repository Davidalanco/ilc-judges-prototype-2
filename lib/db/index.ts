import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Create a fresh Supabase client instance for each operation to avoid schema cache issues
function createFreshSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

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
    // Use raw SQL query to bypass schema cache issues completely
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('cases')
      .insert({
        user_id: caseData.user_id,
        title: caseData.case_name,
        case_name: caseData.case_name,
        case_type: caseData.case_type || null,
        court_level: caseData.court_level || null,
        constitutional_question: caseData.constitutional_question || null,
        client_type: caseData.client_type || null,
        jurisdiction: caseData.jurisdiction || null,
        penalties: caseData.penalties || null,
        precedent_target: caseData.precedent_target || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ createCase error:', error);
      throw error;
    }
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
    // Create a fresh client instance to avoid schema cache issues
    const supabase = createFreshSupabaseClient();
    
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
    try {
      // Use actual database schema field names
      const insertData: any = {
        case_id: conversationData.case_id,
        user_id: conversationData.user_id || null, // This field exists but can be null
        file_name: conversationData.file_name,
        file_size: conversationData.file_size,
        file_type: conversationData.file_type,
        s3_url: conversationData.s3_url,
        upload_status: 'completed',
        transcription_status: 'pending'
      };
      
      // Add duration_seconds if provided (field exists in schema)
      if (conversationData.duration_seconds) {
        insertData.duration_seconds = conversationData.duration_seconds;
      }
      
      console.log('💾 Creating conversation with data:', JSON.stringify(insertData, null, 2));
      
      const supabase = createFreshSupabaseClient();
      const { data, error } = await supabase
        .from('attorney_conversations')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }
      
      console.log('✅ Conversation created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in createConversation:', error);
      throw error;
    }
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
    try {
      // Use actual database schema field names
      const dbUpdates: any = {};
      
      // Update transcript in transcription_text field
      if (updates.transcript) {
        dbUpdates.transcription_text = updates.transcript;
        dbUpdates.transcription_status = 'completed';
      }
      
      // Update individual fields that exist in schema
      if (updates.transcript_quality !== undefined) {
        dbUpdates.transcript_quality = updates.transcript_quality;
      }
      
      // Note: speaker_count, speakers, and status columns don't exist in the schema
      // These will be stored in the analysis_result JSONB field instead
      
      // Get existing analysis_result to merge with new data
      const supabase = createFreshSupabaseClient();
      const { data: existingRecord, error: selectError } = await supabase
        .from('attorney_conversations')
        .select('analysis_result')
        .eq('id', id)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error fetching existing record:', selectError);
        throw selectError;
      }
      
      // Start with existing analysis_result or empty object
      const analysisResult: any = existingRecord?.analysis_result || {};
      
      if (updates.analysis) {
        // Merge existing analysis data
        Object.assign(analysisResult, updates.analysis);
      }
      
      if (updates.key_issues) {
        analysisResult.key_topics = updates.key_issues;
      }
      
      // Store speaker data in analysis_result since speaker_count and speakers columns don't exist
      if (updates.speaker_count !== undefined) {
        analysisResult.speaker_count = updates.speaker_count;
      }
      
      if (updates.speakers) {
        analysisResult.speakers = updates.speakers;
      }
      
      if (updates.status) {
        analysisResult.status = updates.status;
      }
      
      // Always set analysis_result to preserve existing data
      dbUpdates.analysis_result = analysisResult;
      
      console.log('🔄 Updating conversation with data:', JSON.stringify(dbUpdates, null, 2));
      
      const { data, error } = await supabase
        .from('attorney_conversations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }
      
      console.log('✅ Conversation updated successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in updateConversation:', error);
      throw error;
    }
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

  // Save complete Claude justice analysis
  async saveClaudeJusticeAnalysis(caseId: string, analysisData: any) {
    try {
      console.log(`💾 Saving Claude justice analysis for case: ${caseId}`);
      
      // First, delete any existing analysis for this case
      await supabase
        .from('justice_case_analysis')
        .delete()
        .eq('case_id', caseId);

      // Process each justice and save individually
      const justiceRecords = [];
      
      // Handle both conservative and liberal justices arrays
      const allJustices = [
        ...(analysisData.conservativeJustices || []),
        ...(analysisData.liberalJustices || []),
        ...(analysisData.swingJustices || []),
        ...(analysisData.justices || []) // fallback for different structure
      ];

      for (const justice of allJustices) {
        const record = {
          case_id: caseId,
          justice_name: justice.name,
          alignment_score: justice.alignment / 100, // Convert to decimal
          key_factors: justice.keyFactors || [],
          strategy: justice.strategy || '',
          confidence_level: justice.confidence || '',
          risk_level: justice.riskLevel || '',
          case_specific_analysis: justice.caseSpecificAnalysis || '',
          historical_votes: justice.historicalVotes || [],
          analysis_data: justice // Store complete object as JSONB
        };
        justiceRecords.push(record);
      }

      // Insert all justice records
      const { data, error } = await supabase
        .from('justice_case_analysis')
        .insert(justiceRecords)
        .select();

      if (error) throw error;

      // Also save the overall strategy if provided
      if (analysisData.overallStrategy) {
        await supabase
          .from('cases')
          .update({
            overall_strategy: analysisData.overallStrategy,
            updated_at: new Date().toISOString()
          })
          .eq('id', caseId);
      }

      console.log(`✅ Saved ${justiceRecords.length} justice analyses for case ${caseId}`);
      return data;
    } catch (error) {
      console.error('❌ Error saving Claude justice analysis:', error);
      throw error;
    }
  },

  async getClaudeJusticeAnalysis(caseId: string) {
    try {
      const { data, error } = await supabase
        .from('justice_case_analysis')
        .select('*')
        .eq('case_id', caseId)
        .order('alignment_score', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return null;
      }

      // Reconstruct the analysis format
      const justices = data.map(record => ({
        name: record.justice_name,
        alignment: record.alignment_score * 100, // Convert back to percentage
        keyFactors: record.key_factors,
        strategy: record.strategy,
        confidence: record.confidence_level,
        riskLevel: record.risk_level,
        caseSpecificAnalysis: record.case_specific_analysis,
        historicalVotes: record.historical_votes
      }));

      return {
        justices,
        analysisDate: data[0].created_at
      };
    } catch (error) {
      console.error('❌ Error retrieving Claude justice analysis:', error);
      throw error;
    }
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

  async getLegalDocumentById(documentId: string) {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
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

// Export the fresh client function for direct access if needed
export { createFreshSupabaseClient };