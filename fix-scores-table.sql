-- Fix the scores table to auto-generate UUIDs
-- Run this in Supabase SQL Editor

-- Drop the existing table (WARNING: This will delete all data!)
DROP TABLE IF EXISTS scores CASCADE;

-- Recreate the table with proper UUID generation
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT NOT NULL,
  judge TEXT NOT NULL,
  section TEXT NOT NULL,
  scores JSONB NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_scores_participant_id ON scores(participant_id);
CREATE INDEX idx_scores_judge ON scores(judge);
CREATE INDEX idx_scores_section ON scores(section);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);

-- Disable Row Level Security for now (easier for testing)
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;

-- Add a comment
COMMENT ON TABLE scores IS 'Stores judging scores for ICCIET 2025 conference participants';
