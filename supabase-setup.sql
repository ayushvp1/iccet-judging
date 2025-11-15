-- Create the scores table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT NOT NULL,
  judge TEXT NOT NULL,
  section TEXT NOT NULL,
  scores JSONB NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_scores_participant_id ON scores(participant_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge);
CREATE INDEX IF NOT EXISTS idx_scores_section ON scores(section);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on scores" ON scores;

-- Create a policy to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on scores" ON scores
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Optional: Add a comment to the table
COMMENT ON TABLE scores IS 'Stores judging scores for ICCIET 2025 conference participants';
