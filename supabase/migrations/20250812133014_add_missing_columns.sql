-- Database Migration: Add Missing Columns to Match schema.sql
-- This migration adds columns that are missing from the current database

-- Add missing columns to CASES table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS case_name VARCHAR(255);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS constitutional_question TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_type VARCHAR(100);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS penalties TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS precedent_target VARCHAR(255);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

-- Add missing columns to ATTORNEY_CONVERSATIONS table
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS transcript_quality DECIMAL(5,2);
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS speaker_count INTEGER;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS speakers JSONB;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS analysis JSONB;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS key_issues JSONB;
ALTER TABLE attorney_conversations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'uploaded';
