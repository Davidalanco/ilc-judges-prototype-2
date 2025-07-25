import { sql } from '@vercel/postgres';

// Database connection wrapper with error handling
export async function query(text: string, params?: any[]) {
  try {
    if (params) {
      return await sql.query(text, params);
    }
    return await sql.query(text);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Convenience function for single queries
export async function queryOne(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

// Export the sql template literal for complex queries
export { sql } from '@vercel/postgres';

// Database utility functions
export const db = {
  // Users
  async createUser(userData: {
    email: string;
    name?: string;
    firm_name?: string;
    role?: string;
  }) {
    const { rows } = await sql`
      INSERT INTO users (email, name, firm_name, role)
      VALUES (${userData.email}, ${userData.name || null}, ${userData.firm_name || null}, ${userData.role || 'attorney'})
      RETURNING *
    `;
    return rows[0];
  },

  async getUserByEmail(email: string) {
    const { rows } = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return rows[0] || null;
  },

  async getUserById(id: string) {
    const { rows } = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return rows[0] || null;
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
    const { rows } = await sql`
      INSERT INTO cases (
        user_id, case_name, case_type, court_level, 
        constitutional_question, client_type, jurisdiction, 
        penalties, precedent_target
      )
      VALUES (
        ${caseData.user_id}, ${caseData.case_name}, ${caseData.case_type || null},
        ${caseData.court_level || null}, ${caseData.constitutional_question || null},
        ${caseData.client_type || null}, ${caseData.jurisdiction || null},
        ${caseData.penalties || null}, ${caseData.precedent_target || null}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async getCaseById(id: string) {
    const { rows } = await sql`
      SELECT c.*, u.name as user_name, u.firm_name
      FROM cases c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${id}
    `;
    return rows[0] || null;
  },

  async getCasesByUserId(userId: string) {
    const { rows } = await sql`
      SELECT * FROM cases 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return rows;
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
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updates);
    
    const { rows } = await sql.query(
      `UPDATE cases SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },

  // Attorney Conversations
  async createConversation(conversationData: {
    case_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    s3_url: string;
    duration_seconds?: number;
  }) {
    const { rows } = await sql`
      INSERT INTO attorney_conversations (
        case_id, file_name, file_size, file_type, s3_url, duration_seconds
      )
      VALUES (
        ${conversationData.case_id}, ${conversationData.file_name},
        ${conversationData.file_size}, ${conversationData.file_type},
        ${conversationData.s3_url}, ${conversationData.duration_seconds || null}
      )
      RETURNING *
    `;
    return rows[0];
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
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updates);
    
    const { rows } = await sql.query(
      `UPDATE attorney_conversations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },

  async getConversationsByCase(caseId: string) {
    const { rows } = await sql`
      SELECT * FROM attorney_conversations 
      WHERE case_id = ${caseId}
      ORDER BY created_at DESC
    `;
    return rows;
  },

  // Justice Profiles
  async getJusticeProfiles() {
    const { rows } = await sql`
      SELECT * FROM justice_profiles
      ORDER BY justice_name
    `;
    return rows;
  },

  async getJusticeProfile(justiceName: string) {
    const { rows } = await sql`
      SELECT * FROM justice_profiles
      WHERE justice_name = ${justiceName}
    `;
    return rows[0] || null;
  },

  // Justice Case Analysis
  async createJusticeCaseAnalysis(analysisData: {
    case_id: string;
    justice_name: string;
    alignment_score: number;
    key_factors: any;
    strategy: any;
    confidence_level: string;
    persuasion_entry_points: any;
  }) {
    const { rows } = await sql`
      INSERT INTO justice_case_analysis (
        case_id, justice_name, alignment_score, key_factors,
        strategy, confidence_level, persuasion_entry_points
      )
      VALUES (
        ${analysisData.case_id}, ${analysisData.justice_name},
        ${analysisData.alignment_score}, ${JSON.stringify(analysisData.key_factors)},
        ${JSON.stringify(analysisData.strategy)}, ${analysisData.confidence_level},
        ${JSON.stringify(analysisData.persuasion_entry_points)}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async getJusticeCaseAnalysis(caseId: string) {
    const { rows } = await sql`
      SELECT * FROM justice_case_analysis
      WHERE case_id = ${caseId}
      ORDER BY justice_name
    `;
    return rows;
  },

  // Brief Section Chats
  async addBriefSectionChat(chatData: {
    case_id: string;
    section_id: string;
    role: 'user' | 'assistant';
    content: string;
  }) {
    const { rows } = await sql`
      INSERT INTO brief_section_chats (case_id, section_id, role, content)
      VALUES (${chatData.case_id}, ${chatData.section_id}, ${chatData.role}, ${chatData.content})
      RETURNING *
    `;
    return rows[0];
  },

  async getBriefSectionChats(caseId: string, sectionId?: string) {
    if (sectionId) {
      const { rows } = await sql`
        SELECT * FROM brief_section_chats
        WHERE case_id = ${caseId} AND section_id = ${sectionId}
        ORDER BY created_at ASC
      `;
      return rows;
    } else {
      const { rows } = await sql`
        SELECT * FROM brief_section_chats
        WHERE case_id = ${caseId}
        ORDER BY created_at ASC
      `;
      return rows;
    }
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
    const { rows } = await sql`
      INSERT INTO file_uploads (user_id, file_name, file_size, file_type, s3_key, s3_url)
      VALUES (${uploadData.user_id}, ${uploadData.file_name}, ${uploadData.file_size}, 
              ${uploadData.file_type}, ${uploadData.s3_key}, ${uploadData.s3_url})
      RETURNING *
    `;
    return rows[0];
  },

  async updateFileUploadStatus(id: string, status: string) {
    const { rows } = await sql`
      UPDATE file_uploads 
      SET upload_status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  // Add query method directly to db object for backward compatibility
  query
}; 