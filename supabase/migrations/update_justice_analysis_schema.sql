-- Update justice_case_analysis table to support Claude analysis format
-- Run this in Supabase SQL Editor to update the table structure

-- Add new columns to justice_case_analysis table
ALTER TABLE justice_case_analysis 
ADD COLUMN IF NOT EXISTS justice_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS key_factors TEXT[],
ADD COLUMN IF NOT EXISTS strategy TEXT,
ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS case_specific_analysis TEXT,
ADD COLUMN IF NOT EXISTS historical_votes TEXT[],
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Make justice_id nullable since we're storing justice_name directly
ALTER TABLE justice_case_analysis 
ALTER COLUMN justice_id DROP NOT NULL;

-- Add index on justice_name for better performance
CREATE INDEX IF NOT EXISTS idx_justice_case_analysis_justice_name ON justice_case_analysis(justice_name);

-- Add index on case_id and justice_name combination
CREATE INDEX IF NOT EXISTS idx_justice_case_analysis_case_justice ON justice_case_analysis(case_id, justice_name);

-- Add overall_strategy column to cases table
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS overall_strategy JSONB;

-- Update the updated_at trigger for justice_case_analysis if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_justice_case_analysis_updated_at'
    ) THEN
        CREATE TRIGGER update_justice_case_analysis_updated_at 
        BEFORE UPDATE ON justice_case_analysis 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
