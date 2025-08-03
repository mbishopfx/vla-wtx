-- VLA Analyses Storage System
-- This table stores analysis results for comparison and tracking purposes

-- ============================================================================
-- VLA ANALYSES TABLE
-- ============================================================================

CREATE TABLE vla_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Session Information
    session_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Key Performance Metrics (for easy querying and comparison)
    total_impressions BIGINT DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    average_ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate as percentage
    average_cpc DECIMAL(6,2) DEFAULT 0, -- Cost per click in dollars
    average_cpa DECIMAL(8,2) DEFAULT 0, -- Cost per acquisition in dollars
    
    -- Full Analysis Data (JSON fields for complete analysis storage)
    analytics_data JSONB, -- Complete analytics data from the analysis
    ai_insights JSONB,    -- AI-generated insights and recommendations
    dealership_context JSONB, -- Dealership-specific context used in analysis
    
    -- Analysis Metadata
    files_processed INTEGER DEFAULT 0,
    analysis_type TEXT DEFAULT 'google_ads_campaign',
    
    -- Performance Score (calculated field for easy comparison)
    performance_score DECIMAL(5,1) GENERATED ALWAYS AS (
        CASE 
            WHEN average_ctr > 0 AND average_cpa > 0 
            THEN (average_ctr * 10) + (100 - LEAST(average_cpa, 100))
            ELSE 0 
        END
    ) STORED,
    
    -- Status and Tags
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    notes TEXT, -- Optional notes about the analysis
    
    -- User/Client Information (for multi-tenant usage)
    user_id UUID, -- If you implement user authentication
    client_name TEXT, -- Client/dealership name
    
    -- Indexing for better performance
    CONSTRAINT valid_metrics CHECK (
        total_impressions >= 0 AND 
        total_clicks >= 0 AND 
        total_cost >= 0 AND
        average_ctr >= 0 AND
        average_cpc >= 0 AND
        average_cpa >= 0
    )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for date-based queries
CREATE INDEX idx_vla_analyses_created_at ON vla_analyses(created_at DESC);

-- Index for performance comparisons
CREATE INDEX idx_vla_analyses_performance ON vla_analyses(performance_score DESC, average_ctr DESC);

-- Index for client-based queries
CREATE INDEX idx_vla_analyses_client ON vla_analyses(client_name, created_at DESC);

-- Index for session lookups
CREATE INDEX idx_vla_analyses_session ON vla_analyses(session_id);

-- Index for status filtering
CREATE INDEX idx_vla_analyses_status ON vla_analyses(status) WHERE status = 'active';

-- Composite index for analytics queries
CREATE INDEX idx_vla_analyses_analytics ON vla_analyses(client_name, status, created_at DESC) 
WHERE status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE vla_analyses ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to see their own analyses
-- (Modify based on your authentication setup)
CREATE POLICY "Users can view their own analyses" ON vla_analyses
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own analyses
CREATE POLICY "Users can insert their own analyses" ON vla_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own analyses
CREATE POLICY "Users can update their own analyses" ON vla_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for authenticated users to delete their own analyses
CREATE POLICY "Users can delete their own analyses" ON vla_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_vla_analyses_updated_at 
    BEFORE UPDATE ON vla_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USEFUL VIEWS FOR ANALYTICS
-- ============================================================================

-- View for performance comparison dashboard
CREATE VIEW vla_analyses_summary AS
SELECT 
    id,
    session_name,
    client_name,
    created_at,
    total_impressions,
    total_clicks,
    total_cost,
    average_ctr,
    average_cpc,
    average_cpa,
    performance_score,
    RANK() OVER (PARTITION BY client_name ORDER BY performance_score DESC) as performance_rank,
    LAG(average_ctr) OVER (PARTITION BY client_name ORDER BY created_at) as previous_ctr,
    LAG(average_cpa) OVER (PARTITION BY client_name ORDER BY created_at) as previous_cpa
FROM vla_analyses 
WHERE status = 'active'
ORDER BY created_at DESC;

-- View for monthly performance trends
CREATE VIEW vla_monthly_trends AS
SELECT 
    client_name,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as analyses_count,
    AVG(average_ctr) as avg_ctr,
    AVG(average_cpc) as avg_cpc,
    AVG(average_cpa) as avg_cpa,
    AVG(performance_score) as avg_performance_score,
    SUM(total_impressions) as total_impressions,
    SUM(total_clicks) as total_clicks,
    SUM(total_cost) as total_cost
FROM vla_analyses 
WHERE status = 'active'
GROUP BY client_name, DATE_TRUNC('month', created_at)
ORDER BY client_name, month DESC;

-- ============================================================================
-- SAMPLE QUERIES FOR COMMON USE CASES
-- ============================================================================

-- Get top performing analyses for a client
/*
SELECT * FROM vla_analyses_summary 
WHERE client_name = 'VLA Client' 
AND performance_rank <= 5;
*/

-- Compare current vs previous analysis performance
/*
SELECT 
    session_name,
    average_ctr,
    previous_ctr,
    (average_ctr - previous_ctr) as ctr_change,
    average_cpa,
    previous_cpa,
    (average_cpa - previous_cpa) as cpa_change
FROM vla_analyses_summary 
WHERE client_name = 'VLA Client' 
AND previous_ctr IS NOT NULL
ORDER BY created_at DESC;
*/

-- Export data for Excel analysis
/*
SELECT 
    session_name,
    TO_CHAR(created_at, 'YYYY-MM-DD') as date,
    total_impressions,
    total_clicks,
    total_cost,
    average_ctr,
    average_cpc,
    average_cpa,
    performance_score
FROM vla_analyses 
WHERE client_name = 'VLA Client' 
AND status = 'active'
ORDER BY created_at DESC;
*/

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

/*
1. Replace the RLS policies with your actual authentication logic
2. Set up the user_id field to match your user authentication system
3. Consider adding more specific indexes based on your query patterns
4. The performance_score is calculated automatically but you can adjust the formula
5. Use the JSONB fields (analytics_data, ai_insights) to store complete analysis results
6. The views provide pre-calculated analytics for dashboard display
7. Consider partitioning the table by client_name or date if you expect large volumes
*/ 