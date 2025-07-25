-- Supreme Legal AI Database Schema
-- Neon PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  firm_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'attorney',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cases table for storing case information
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_name VARCHAR(255) NOT NULL,
  case_type VARCHAR(100),
  court_level VARCHAR(100),
  constitutional_question TEXT,
  client_type VARCHAR(100),
  jurisdiction VARCHAR(100),
  penalties TEXT,
  precedent_target VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attorney conversations (audio uploads and transcripts)
CREATE TABLE attorney_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(100),
  duration_seconds INTEGER,
  s3_url TEXT,
  transcript TEXT,
  transcript_quality DECIMAL(5,2),
  speaker_count INTEGER,
  speakers JSONB,
  analysis JSONB,
  key_issues JSONB,
  status VARCHAR(50) DEFAULT 'uploaded',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Justice profiles and analysis
CREATE TABLE justice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  justice_name VARCHAR(100) UNIQUE NOT NULL,
  ideology_scores JSONB,
  writing_patterns JSONB,
  key_citations JSONB,
  core_values JSONB,
  persuasion_points JSONB,
  avoid_triggers JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Justice case analysis (case-specific justice analysis)
CREATE TABLE justice_case_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  justice_name VARCHAR(100),
  alignment_score INTEGER,
  key_factors JSONB,
  strategy JSONB,
  confidence_level VARCHAR(50),
  persuasion_entry_points JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brief sections and content
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  sections JSONB,
  custom_sections JSONB,
  content TEXT,
  persuasion_scores JSONB,
  word_count INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Research results and precedents
CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  search_query TEXT,
  result_type VARCHAR(100), -- 'precedent', 'historical', 'citation'
  results JSONB,
  relevance_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat interactions for brief sections
CREATE TABLE brief_section_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  section_id VARCHAR(100),
  role VARCHAR(20), -- 'user' or 'assistant'
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- File uploads tracking
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(100),
  s3_key TEXT,
  s3_url TEXT,
  upload_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_conversations_case_id ON attorney_conversations(case_id);
CREATE INDEX idx_briefs_case_id ON briefs(case_id);
CREATE INDEX idx_research_case_id ON research_results(case_id);
CREATE INDEX idx_chats_case_section ON brief_section_chats(case_id, section_id);
CREATE INDEX idx_uploads_user_id ON file_uploads(user_id);

-- Insert default justice profiles
INSERT INTO justice_profiles (justice_name, ideology_scores, core_values, persuasion_points, avoid_triggers) VALUES
('Thomas', '{"conservative": 95, "originalist": 98, "textualist": 95}', '["Constitutional Text", "Original Meaning", "Individual Liberty", "Limited Government"]', '["Historical Analysis", "Founding Era Evidence", "Textual Interpretation"]', '["Living Constitution", "Judicial Activism", "Broad Federal Power"]'),
('Alito', '{"conservative": 90, "traditionalist": 85, "religious_liberty": 95}', '["Religious Freedom", "Traditional Values", "Law and Order", "Judicial Restraint"]', '["Religious Liberty", "Historical Tradition", "Clear Legal Rules"]', '["Anti-Religious Hostility", "Moral Relativism", "Judicial Overreach"]'),
('Gorsuch', '{"conservative": 85, "textualist": 92, "libertarian": 75}', '["Individual Rights", "Constitutional Text", "Separation of Powers", "Federalism"]', '["Textual Analysis", "Individual Liberty", "Government Overreach"]', '["Administrative Deference", "Vague Standards", "Government Coercion"]'),
('Barrett', '{"conservative": 80, "originalist": 85, "institutionalist": 70}', '["Judicial Restraint", "Institutional Integrity", "Legal Craft", "Precedent"]', '["Careful Legal Analysis", "Institutional Concerns", "Narrow Rulings"]', '["Radical Change", "Political Perception", "Rushed Decisions"]'),
('Kavanaugh', '{"conservative": 75, "institutionalist": 85, "precedent_focused": 80}', '["Institutional Stability", "Incremental Change", "Precedent", "Compromise"]', '["Institutional Concerns", "Gradual Evolution", "Consensus Building"]', '["Dramatic Overruling", "Political Controversy", "Instability"]'),
('Roberts', '{"conservative": 70, "institutionalist": 95, "minimalist": 90}', '["Institutional Legitimacy", "Judicial Restraint", "Consensus", "Stability"]', '["Narrow Rulings", "Institutional Protection", "Bipartisan Appeal"]', '["5-4 Decisions", "Political Backlash", "Court Legitimacy Threats"]'),
('Kagan', '{"liberal": 85, "pragmatist": 80, "institutionalist": 75}', '["Pragmatic Solutions", "Government Function", "Individual Rights", "Democratic Process"]', '["Practical Consequences", "Democratic Values", "Government Effectiveness"]', '["Formalistic Rules", "Government Dysfunction", "Minority Oppression"]'),
('Sotomayor', '{"liberal": 90, "empathy_focused": 85, "rights_oriented": 90}', '["Individual Rights", "Social Justice", "Lived Experience", "Equality"]', '["Human Impact", "Civil Rights", "Vulnerable Populations"]', '["Formalism Over Humanity", "Historical Injustice", "Cold Legalism"]'),
('Jackson', '{"liberal": 85, "methodology_focused": 75, "rights_oriented": 85}', '["Equal Justice", "Methodological Rigor", "Civil Rights", "Democratic Participation"]', '["Rigorous Analysis", "Equal Protection", "Historical Context"]', '["Rushed Analysis", "Discrimination", "Unequal Treatment"]');

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON attorney_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 