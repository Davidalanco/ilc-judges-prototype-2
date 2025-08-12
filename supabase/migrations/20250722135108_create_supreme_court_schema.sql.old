-- Supreme Court Brief Workflow - Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    firm_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    case_type VARCHAR(100),
    court_level VARCHAR(100),
    case_status VARCHAR(50) DEFAULT 'draft',
    description TEXT,
    legal_issues TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attorney conversations (uploaded audio files)
CREATE TABLE attorney_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    s3_key VARCHAR(500),
    s3_url TEXT,
    upload_status VARCHAR(50) DEFAULT 'pending',
    transcription_text TEXT,
    transcription_status VARCHAR(50) DEFAULT 'pending',
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Justice profiles (pre-loaded data)
CREATE TABLE justice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    ideology_score DECIMAL(3,2),
    judicial_philosophy TEXT,
    key_opinions TEXT[],
    voting_patterns JSONB,
    psychological_profile JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Justice case analysis (AI analysis of how each justice might respond)
CREATE TABLE justice_case_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    justice_id UUID REFERENCES justice_profiles(id) ON DELETE CASCADE,
    alignment_score DECIMAL(3,2),
    persuasion_strategy TEXT,
    key_concerns TEXT[],
    recommended_arguments TEXT[],
    analysis_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Briefs (generated legal briefs)
CREATE TABLE briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    brief_type VARCHAR(100) DEFAULT 'petitioner',
    sections JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    word_count INTEGER,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research results (AI-found precedents and cases)
CREATE TABLE research_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    research_type VARCHAR(100),
    source_citation TEXT,
    relevance_score DECIMAL(3,2),
    key_quotes TEXT[],
    analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brief section chats (AI assistance for specific brief sections)
CREATE TABLE brief_section_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id VARCHAR(100),
    message_type VARCHAR(50), -- 'user' or 'ai'
    message_content TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads (general file storage tracking)
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    s3_key VARCHAR(500),
    s3_url TEXT,
    upload_status VARCHAR(50) DEFAULT 'completed',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_attorney_conversations_case_id ON attorney_conversations(case_id);
CREATE INDEX idx_attorney_conversations_user_id ON attorney_conversations(user_id);
CREATE INDEX idx_justice_case_analysis_case_id ON justice_case_analysis(case_id);
CREATE INDEX idx_justice_case_analysis_justice_id ON justice_case_analysis(justice_id);
CREATE INDEX idx_briefs_case_id ON briefs(case_id);
CREATE INDEX idx_briefs_user_id ON briefs(user_id);
CREATE INDEX idx_research_results_case_id ON research_results(case_id);
CREATE INDEX idx_research_results_brief_id ON research_results(brief_id);
CREATE INDEX idx_brief_section_chats_brief_id ON brief_section_chats(brief_id);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attorney_conversations_updated_at BEFORE UPDATE ON attorney_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_justice_profiles_updated_at BEFORE UPDATE ON justice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_justice_case_analysis_updated_at BEFORE UPDATE ON justice_case_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_results_updated_at BEFORE UPDATE ON research_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample justice profiles
INSERT INTO justice_profiles (name, position, ideology_score, judicial_philosophy, key_opinions, voting_patterns, psychological_profile) VALUES
('John Roberts', 'Chief Justice', 0.25, 'Institutionalist conservative who values court legitimacy and incremental change', 
 ARRAY['National Federation of Independent Business v. Sebelius', 'Department of Homeland Security v. Regents of the University of California'],
 '{"conservative_votes": 0.68, "liberal_votes": 0.32, "swing_tendency": 0.15}'::jsonb,
 '{"decision_style": "cautious", "primary_concerns": ["institutional_legitimacy", "judicial_restraint"], "persuasion_factors": ["precedent", "narrow_rulings", "avoiding_political_appearance"]}'::jsonb),

('Clarence Thomas', 'Associate Justice', 0.85, 'Originalist conservative focused on text and original meaning', 
 ARRAY['District of Columbia v. Heller', 'McDonald v. Chicago'],
 '{"conservative_votes": 0.89, "liberal_votes": 0.11, "swing_tendency": 0.02}'::jsonb,
 '{"decision_style": "principled", "primary_concerns": ["originalism", "constitutional_text"], "persuasion_factors": ["historical_evidence", "founding_era_understanding", "textual_analysis"]}'::jsonb),

('Samuel Alito', 'Associate Justice', 0.78, 'Conservative focused on law enforcement and executive power', 
 ARRAY['Burwell v. Hobby Lobby Stores', 'Murphy v. National Collegiate Athletic Association'],
 '{"conservative_votes": 0.82, "liberal_votes": 0.18, "swing_tendency": 0.05}'::jsonb,
 '{"decision_style": "methodical", "primary_concerns": ["law_enforcement", "executive_authority"], "persuasion_factors": ["prosecutorial_experience", "practical_consequences", "government_interests"]}'::jsonb),

('Neil Gorsuch', 'Associate Justice', 0.72, 'Textualist conservative with libertarian tendencies', 
 ARRAY['Carpenter v. United States', 'Bostock v. Clayton County'],
 '{"conservative_votes": 0.76, "liberal_votes": 0.24, "swing_tendency": 0.12}'::jsonb,
 '{"decision_style": "analytical", "primary_concerns": ["textual_interpretation", "individual_rights"], "persuasion_factors": ["linguistic_analysis", "statutory_structure", "constitutional_limits"]}'::jsonb),

('Brett Kavanaugh', 'Associate Justice', 0.65, 'Pragmatic conservative with institutional focus', 
 ARRAY['Apple Inc. v. Pepper', 'Tennessee Wine and Spirits Retailers Association v. Thomas'],
 '{"conservative_votes": 0.71, "liberal_votes": 0.29, "swing_tendency": 0.18}'::jsonb,
 '{"decision_style": "balanced", "primary_concerns": ["precedent", "workability"], "persuasion_factors": ["practical_effects", "incremental_change", "compromise_solutions"]}'::jsonb),

('Amy Coney Barrett', 'Associate Justice', 0.70, 'Originalist conservative with textualist approach', 
 ARRAY['Students for Fair Admissions v. Harvard', 'Moore v. Harper'],
 '{"conservative_votes": 0.75, "liberal_votes": 0.25, "swing_tendency": 0.08}'::jsonb,
 '{"decision_style": "scholarly", "primary_concerns": ["original_meaning", "judicial_restraint"], "persuasion_factors": ["academic_rigor", "constitutional_structure", "limiting_principles"]}'::jsonb),

('Sonia Sotomayor', 'Associate Justice', -0.65, 'Progressive focused on practical justice and empathy', 
 ARRAY['Schuette v. Coalition to Defend Affirmative Action', 'Utah v. Strieff'],
 '{"conservative_votes": 0.21, "liberal_votes": 0.79, "swing_tendency": 0.03}'::jsonb,
 '{"decision_style": "empathetic", "primary_concerns": ["social_justice", "minority_rights"], "persuasion_factors": ["real_world_impact", "vulnerable_populations", "equality_principles"]}'::jsonb),

('Elena Kagan', 'Associate Justice', -0.55, 'Pragmatic liberal with strategic thinking', 
 ARRAY['Arizona Legislature v. Arizona Independent Redistricting Commission', 'Kimble v. Marvel Entertainment'],
 '{"conservative_votes": 0.25, "liberal_votes": 0.75, "swing_tendency": 0.08}'::jsonb,
 '{"decision_style": "strategic", "primary_concerns": ["democratic_process", "institutional_effectiveness"], "persuasion_factors": ["systemic_consequences", "democratic_values", "functional_government"]}'::jsonb),

('Ketanji Brown Jackson', 'Associate Justice', -0.70, 'Progressive with criminal justice reform focus', 
 ARRAY['Moore v. Harper', 'Students for Fair Admissions v. Harvard'],
 '{"conservative_votes": 0.15, "liberal_votes": 0.85, "swing_tendency": 0.05}'::jsonb,
 '{"decision_style": "methodical", "primary_concerns": ["criminal_justice_reform", "civil_rights"], "persuasion_factors": ["sentencing_experience", "procedural_fairness", "equal_protection"]}'::jsonb);

-- Enable Row Level Security (RLS) for user data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_section_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create cases" ON cases FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid()::text = user_id::text);

-- Similar policies for other user-owned tables
CREATE POLICY "Users can view own conversations" ON attorney_conversations FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create conversations" ON attorney_conversations FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own conversations" ON attorney_conversations FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own briefs" ON briefs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create briefs" ON briefs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own briefs" ON briefs FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Justice profiles are publicly readable
CREATE POLICY "Justice profiles are public" ON justice_profiles FOR SELECT USING (true);
CREATE POLICY "Justice analysis is viewable by case owner" ON justice_case_analysis FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = justice_case_analysis.case_id AND cases.user_id::text = auth.uid()::text)
); 