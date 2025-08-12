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
  }
};

// Export the Supabase client for direct access if needed
export { supabase };