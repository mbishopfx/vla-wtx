-- Competitor Analyses Table Enhancement
-- Add missing columns for better tracking and analytics

-- Add token usage tracking
ALTER TABLE competitor_analyses 
ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0;

-- Add model information
ALTER TABLE competitor_analyses 
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50) DEFAULT 'gpt-4o';

-- Add analysis duration tracking  
ALTER TABLE competitor_analyses 
ADD COLUMN IF NOT EXISTS analysis_duration_ms INTEGER DEFAULT 0;

-- Add updated_at timestamp
ALTER TABLE competitor_analyses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_competitor_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_competitor_analyses_updated_at_trigger ON competitor_analyses;

-- Create new trigger
CREATE TRIGGER update_competitor_analyses_updated_at_trigger
    BEFORE UPDATE ON competitor_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_competitor_analyses_updated_at();

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_token_count 
ON competitor_analyses(token_count);

CREATE INDEX IF NOT EXISTS idx_competitor_analyses_model_used 
ON competitor_analyses(model_used);

CREATE INDEX IF NOT EXISTS idx_competitor_analyses_updated_at 
ON competitor_analyses(updated_at);

-- Add comments for documentation
COMMENT ON COLUMN competitor_analyses.token_count IS 'Number of tokens used by the AI model for this analysis';
COMMENT ON COLUMN competitor_analyses.model_used IS 'AI model used for this analysis (e.g., gpt-4o)';
COMMENT ON COLUMN competitor_analyses.analysis_duration_ms IS 'Time taken to complete the analysis in milliseconds';
COMMENT ON COLUMN competitor_analyses.updated_at IS 'Timestamp when the record was last updated';

-- Disable RLS for now (since no user authentication in this app)
ALTER TABLE competitor_analyses DISABLE ROW LEVEL SECURITY; 