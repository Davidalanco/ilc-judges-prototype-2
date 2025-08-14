import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for database operations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Type-safe database utility functions based on the real schema
export const db = {
  // Users
  async createUser(userData: {
    email: string;
    name?: string;
    role?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name || null,
        role: userData.role || 'user',
        credits: 0
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

  async updateUserCredits(id: string, credits: number) {
    // Use DECIMAL(10,8) precision for credits as defined in schema
    const { data, error } = await supabase
      .from('users')
      .update({ credits })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cases
  async createCase(caseData: {
    user_id: string;
    title: string;
    case_name?: string;
    case_type?: string;
    constitutional_question?: string;
    client_type?: string;
    jurisdiction?: string;
    penalties?: string;
    precedent_target?: string;
  }) {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        user_id: caseData.user_id,
        title: caseData.title, // Required field
        case_name: caseData.case_name || null,
        case_type: caseData.case_type || null,
        constitutional_question: caseData.constitutional_question || null,
        client_type: caseData.client_type || null,
        jurisdiction: caseData.jurisdiction || null,
        penalties: caseData.penalties || null,
        precedent_target: caseData.precedent_target || null,
        status: 'draft',
        current_step: 1
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
        users!inner(name, email)
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

  async updateCase(id: string, updates: Partial<Database['public']['Tables']['cases']['Update']>) {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Attorney Conversations
  async createConversation(conversationData: {
    case_id: string;
    user_id?: string;
    file_name: string;
    file_size: number;
    file_type: string;
    s3_key?: string;
    s3_url: string;
    duration_seconds?: number;
  }) {
    const { data, error } = await supabase
      .from('attorney_conversations')
      .insert({
        case_id: conversationData.case_id,
        user_id: conversationData.user_id || null,
        file_name: conversationData.file_name,
        file_size: conversationData.file_size,
        file_type: conversationData.file_type,
        s3_key: conversationData.s3_key || null,
        s3_url: conversationData.s3_url,
        duration_seconds: conversationData.duration_seconds || null,
        upload_status: 'completed',
        transcription_status: 'pending',
        status: 'uploaded'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConversation(id: string, updates: Partial<Database['public']['Tables']['attorney_conversations']['Update']>) {
    // Handle transcript field mapping for backwards compatibility
    if ('transcript' in updates && updates.transcript) {
      updates.transcription_text = updates.transcript;
      updates.transcription_status = 'completed';
    }
    
    const { data, error } = await supabase
      .from('attorney_conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getConversationById(id: string) {
    const { data, error } = await supabase
      .from('attorney_conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
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
      .order('justice_name');
    
    if (error) throw error;
    return data;
  },

  async getJusticeProfile(justiceName: string) {
    const { data, error } = await supabase
      .from('justice_profiles')
      .select('*')
      .eq('justice_name', justiceName)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createJusticeProfile(profileData: Database['public']['Tables']['justice_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('justice_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateJusticeProfile(id: string, updates: Partial<Database['public']['Tables']['justice_profiles']['Update']>) {
    const { data, error } = await supabase
      .from('justice_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Justice Case Analysis
  async createJusticeCaseAnalysis(analysisData: Database['public']['Tables']['justice_case_analysis']['Insert']) {
    const { data, error } = await supabase
      .from('justice_case_analysis')
      .insert(analysisData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getJusticeCaseAnalysis(caseId: string) {
    const { data, error } = await supabase
      .from('justice_case_analysis')
      .select(`
        *,
        justice_profiles!inner(justice_name, core_values, ideology_scores)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateJusticeCaseAnalysis(id: string, updates: Partial<Database['public']['Tables']['justice_case_analysis']['Update']>) {
    const { data, error } = await supabase
      .from('justice_case_analysis')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Claude Justice Analysis (using research_results table)
  async saveClaudeJusticeAnalysis(caseId: string, justiceAnalysis: any) {
    // Check if there's already a justice analysis for this case
    const { data: existing, error: fetchError } = await supabase
      .from('research_results')
      .select('id')
      .eq('case_id', caseId)
      .eq('result_type', 'justice_analysis')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const analysisData = {
      results: justiceAnalysis,
      search_query: `Justice analysis for case ${caseId}`,
      result_type: 'justice_analysis'
    };

    if (existing && existing.length > 0) {
      // Update existing analysis
      const { data, error } = await supabase
        .from('research_results')
        .update(analysisData)
        .eq('id', existing[0].id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new analysis
      const { data, error } = await supabase
        .from('research_results')
        .insert({
          case_id: caseId,
          ...analysisData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async getClaudeJusticeAnalysis(caseId: string) {
    const { data, error } = await supabase
      .from('research_results')
      .select('*')
      .eq('case_id', caseId)
      .eq('result_type', 'justice_analysis')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0].results;
    }
    
    return null;
  },

  // Brief Section Chats
  async addBriefSectionChat(chatData: Database['public']['Tables']['brief_section_chats']['Insert']) {
    const { data, error } = await supabase
      .from('brief_section_chats')
      .insert(chatData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBriefSectionChats(caseId: string, sectionId?: string) {
    let query = supabase
      .from('brief_section_chats')
      .select('*')
      .eq('case_id', caseId);
    
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Briefs
  async createBrief(briefData: Database['public']['Tables']['briefs']['Insert']) {
    const { data, error } = await supabase
      .from('briefs')
      .insert(briefData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBriefsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('case_id', caseId)
      .order('version', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getBriefById(id: string) {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async updateBrief(id: string, updates: Partial<Database['public']['Tables']['briefs']['Update']>) {
    const { data, error } = await supabase
      .from('briefs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // File Uploads
  async createFileUpload(uploadData: Database['public']['Tables']['file_uploads']['Insert']) {
    const { data, error } = await supabase
      .from('file_uploads')
      .insert(uploadData)
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

  async getFileUploadsByUser(userId: string) {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Research Sessions
  async createResearchSession(sessionData: Database['public']['Tables']['research_sessions']['Insert']) {
    const { data, error } = await supabase
      .from('research_sessions')
      .insert({
        ...sessionData,
        status: sessionData.status || 'active'
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

  async updateResearchSession(id: string, updates: Partial<Database['public']['Tables']['research_sessions']['Update']>) {
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
  async createLegalDocument(documentData: Database['public']['Tables']['legal_documents']['Insert']) {
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
    
    if (error && error.code !== 'PGRST116') throw error;
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

  async updateLegalDocument(id: string, updates: Partial<Database['public']['Tables']['legal_documents']['Update']>) {
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
  async createDocumentSummary(summaryData: Database['public']['Tables']['document_summaries']['Insert']) {
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
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateDocumentSummary(id: string, updates: Partial<Database['public']['Tables']['document_summaries']['Update']>) {
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
  async createResearchNote(noteData: Database['public']['Tables']['research_notes']['Insert']) {
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

  async updateResearchNote(id: string, updates: Partial<Database['public']['Tables']['research_notes']['Update']>) {
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
  async createSavedSearch(searchData: Database['public']['Tables']['saved_searches']['Insert']) {
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

  async updateSavedSearch(id: string, updates: Partial<Database['public']['Tables']['saved_searches']['Update']>) {
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
  async createCitationRelationship(relationshipData: Database['public']['Tables']['citation_relationships']['Insert']) {
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
  },

  // Research Results
  async createResearchResult(resultData: Database['public']['Tables']['research_results']['Insert']) {
    const { data, error } = await supabase
      .from('research_results')
      .insert(resultData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getResearchResultsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('research_results')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Research Templates
  async createResearchTemplate(templateData: Database['public']['Tables']['research_templates']['Insert']) {
    const { data, error } = await supabase
      .from('research_templates')
      .insert(templateData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getResearchTemplates(isPublic?: boolean) {
    let query = supabase
      .from('research_templates')
      .select('*');
    
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic);
    }
    
    const { data, error } = await query
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateResearchTemplate(id: string, updates: Partial<Database['public']['Tables']['research_templates']['Update']>) {
    const { data, error } = await supabase
      .from('research_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Brief Generation Jobs (8-Wave Pipeline)
  async createBriefGenerationJob(jobData: {
    case_id: string;
    config?: any;
  }) {
    const { data, error } = await supabase
      .from('brief_generation_jobs')
      .insert({
        case_id: jobData.case_id,
        config: jobData.config || {},
        wave_status: {
          1: 'queued', 2: 'queued', 3: 'queued', 4: 'queued',
          5: 'queued', 6: 'queued', 7: 'queued', 8: 'queued'
        },
        wave_logs: {},
        wave_artifacts: {},
        wave_timestamps: {}
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBriefGenerationJob(jobId: string) {
    const { data, error } = await supabase
      .from('brief_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getBriefGenerationJobsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('brief_generation_jobs')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateBriefGenerationJob(jobId: string, updates: any) {
    const { data, error } = await supabase
      .from('brief_generation_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBriefGenerationJobWave(jobId: string, waveNumber: number, waveData: {
    status?: string;
    logs?: any;
    artifacts?: any;
    timestamp?: string;
  }) {
    // Get current job data
    const job = await this.getBriefGenerationJob(jobId);
    if (!job) throw new Error('Job not found');

    // Update wave-specific data
    const updatedWaveStatus = { ...job.wave_status, [waveNumber]: waveData.status || job.wave_status[waveNumber] };
    const updatedWaveLogs = { ...job.wave_logs, [waveNumber]: waveData.logs || job.wave_logs[waveNumber] };
    const updatedWaveArtifacts = { ...job.wave_artifacts, [waveNumber]: waveData.artifacts || job.wave_artifacts[waveNumber] };
    const updatedWaveTimestamps = { ...job.wave_timestamps, [waveNumber]: waveData.timestamp || job.wave_timestamps[waveNumber] };

    const { data, error } = await supabase
      .from('brief_generation_jobs')
      .update({
        current_wave: waveNumber,
        wave_status: updatedWaveStatus,
        wave_logs: updatedWaveLogs,
        wave_artifacts: updatedWaveArtifacts,
        wave_timestamps: updatedWaveTimestamps
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Wave Execution Logs
  async createWaveLog(logData: {
    job_id: string;
    wave_number: number;
    wave_name: string;
    log_level?: string;
    message: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase
      .from('wave_execution_logs')
      .insert({
        job_id: logData.job_id,
        wave_number: logData.wave_number,
        wave_name: logData.wave_name,
        log_level: logData.log_level || 'info',
        message: logData.message,
        metadata: logData.metadata || {}
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWaveLogsByJob(jobId: string) {
    const { data, error } = await supabase
      .from('wave_execution_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getWaveLogsByWave(jobId: string, waveNumber: number) {
    const { data, error } = await supabase
      .from('wave_execution_logs')
      .select('*')
      .eq('job_id', jobId)
      .eq('wave_number', waveNumber)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// Export the Supabase client for direct access if needed
export { supabase };