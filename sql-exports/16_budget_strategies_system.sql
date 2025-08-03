-- ============================================================================
-- 💰 BUDGET STRATEGIES SYSTEM
-- ============================================================================
-- Comprehensive budget optimization system for Google Ads campaigns
-- Stores budget configurations, AI-generated strategies, and optimization results

-- ============================================================================
-- 📊 Budget Strategies Table
-- ============================================================================
CREATE TABLE budget_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- Made optional for Nissan campaigns
    
    -- Basic Configuration
    strategy_name VARCHAR(255) NOT NULL,
    total_budget DECIMAL(10,2) NOT NULL, -- Total budget amount
    time_frame INTEGER NOT NULL, -- Time frame in months
    time_frame_unit VARCHAR(20) DEFAULT 'months' CHECK (time_frame_unit IN ('weeks', 'months', 'quarters')),
    
    -- Campaign Type & Goals
    campaign_type VARCHAR(50) DEFAULT 'search' CHECK (campaign_type IN ('search', 'display', 'shopping', 'video', 'performance_max', 'app', 'local')),
    primary_goal VARCHAR(50) DEFAULT 'conversions' CHECK (primary_goal IN ('traffic', 'conversions', 'brand_awareness', 'sales', 'leads', 'app_installs')),
    target_audience VARCHAR(100),
    geographic_targeting TEXT[],
    
    -- Budget Distribution Settings
    daily_budget DECIMAL(8,2),
    weekly_budget DECIMAL(10,2),
    monthly_budget DECIMAL(10,2),
    
    -- Bidding Strategy Configuration
    bidding_strategy VARCHAR(50) DEFAULT 'maximize_conversions' CHECK (bidding_strategy IN (
        'manual_cpc', 'enhanced_cpc', 'maximize_clicks', 'maximize_conversions', 
        'maximize_conversion_value', 'target_cpa', 'target_roas', 'target_impression_share'
    )),
    target_cpa DECIMAL(8,2), -- Target Cost Per Acquisition
    target_roas DECIMAL(5,2), -- Target Return On Ad Spend
    max_cpc DECIMAL(6,2), -- Maximum Cost Per Click
    
    -- Advanced Settings
    ad_scheduling JSONB, -- Time-based budget adjustments
    device_bid_adjustments JSONB, -- Desktop, mobile, tablet adjustments
    location_bid_adjustments JSONB, -- Geographic bid modifications
    audience_bid_adjustments JSONB, -- Audience targeting adjustments
    
    -- Keyword & Ad Group Configuration
    keyword_research_focus TEXT[],
    negative_keywords TEXT[],
    ad_group_structure JSONB,
    match_types TEXT[] DEFAULT ARRAY['exact', 'phrase', 'broad'],
    
    -- Landing Page & Creative
    landing_page_urls TEXT[],
    ad_copy_themes TEXT[],
    call_to_actions TEXT[],
    
    -- Competition & Market
    competitor_analysis JSONB,
    seasonal_adjustments JSONB,
    market_trends JSONB,
    
    -- Budget Allocation Strategy
    search_budget_percentage DECIMAL(5,2) DEFAULT 60.00,
    display_budget_percentage DECIMAL(5,2) DEFAULT 20.00,
    shopping_budget_percentage DECIMAL(5,2) DEFAULT 15.00,
    video_budget_percentage DECIMAL(5,2) DEFAULT 5.00,
    
    -- Performance Expectations
    expected_impressions INTEGER,
    expected_clicks INTEGER,
    expected_conversions INTEGER,
    expected_ctr DECIMAL(5,2), -- Click Through Rate
    expected_conversion_rate DECIMAL(5,2),
    
    -- AI-Generated Strategy
    ai_strategy_analysis JSONB, -- Complete AI analysis and recommendations
    optimization_recommendations TEXT[],
    risk_assessment JSONB,
    success_probability DECIMAL(5,2), -- AI confidence score (0-100)
    
    -- Budget Breakdown
    setup_costs DECIMAL(8,2) DEFAULT 0,
    management_fees DECIMAL(8,2) DEFAULT 0,
    tool_costs DECIMAL(8,2) DEFAULT 0,
    contingency_budget DECIMAL(8,2) DEFAULT 0,
    
    -- Implementation Details
    campaign_structure JSONB, -- Detailed campaign hierarchy
    ad_extensions_config JSONB, -- Sitelinks, callouts, structured snippets
    tracking_setup JSONB, -- Conversion tracking, UTM parameters
    
    -- Timeline & Phases
    launch_phases JSONB, -- Phased rollout strategy
    optimization_schedule JSONB, -- When to make adjustments
    reporting_schedule VARCHAR(50) DEFAULT 'weekly',
    
    -- Metadata & Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- AI Processing
    ai_processing_status VARCHAR(20) DEFAULT 'pending' CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
    ai_processing_started_at TIMESTAMPTZ,
    ai_processing_completed_at TIMESTAMPTZ,
    ai_processing_duration_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_optimized_at TIMESTAMPTZ
);

-- ============================================================================
-- 📈 Budget Performance Tracking
-- ============================================================================
CREATE TABLE budget_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES budget_strategies(id) ON DELETE CASCADE,
    
    -- Performance Period
    date DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- Spend Metrics
    actual_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
    budgeted_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
    spend_variance DECIMAL(10,2) GENERATED ALWAYS AS (actual_spend - budgeted_spend) STORED,
    spend_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN budgeted_spend > 0 
        THEN (actual_spend / budgeted_spend) * 100 
        ELSE 0 END
    ) STORED,
    
    -- Performance Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    
    -- Calculated KPIs
    ctr DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN impressions > 0 
        THEN (clicks::DECIMAL / impressions) * 100 
        ELSE 0 END
    ) STORED,
    
    cpc DECIMAL(6,2) GENERATED ALWAYS AS (
        CASE WHEN clicks > 0 
        THEN actual_spend / clicks 
        ELSE 0 END
    ) STORED,
    
    cpa DECIMAL(8,2) GENERATED ALWAYS AS (
        CASE WHEN conversions > 0 
        THEN actual_spend / conversions 
        ELSE 0 END
    ) STORED,
    
    roas DECIMAL(6,2) GENERATED ALWAYS AS (
        CASE WHEN actual_spend > 0 
        THEN conversion_value / actual_spend 
        ELSE 0 END
    ) STORED,
    
    -- Goals Achievement
    goal_achievement_score DECIMAL(5,2), -- Percentage of goals met
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 🎯 Budget Optimizations Log
-- ============================================================================
CREATE TABLE budget_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES budget_strategies(id) ON DELETE CASCADE,
    
    -- Optimization Details
    optimization_type VARCHAR(50) NOT NULL, -- 'budget_reallocation', 'bid_adjustment', 'keyword_optimization', etc.
    optimization_reason TEXT NOT NULL,
    
    -- Changes Made
    previous_settings JSONB,
    new_settings JSONB,
    expected_impact JSONB,
    
    -- Implementation
    implementation_status VARCHAR(20) DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'implemented', 'failed', 'reverted')),
    implementation_date TIMESTAMPTZ,
    
    -- Results Tracking
    performance_impact JSONB, -- Measured results after implementation
    roi_impact DECIMAL(8,2), -- Financial impact
    
    -- AI Confidence
    ai_confidence_score DECIMAL(5,2), -- 0-100
    automation_level VARCHAR(20) DEFAULT 'manual' CHECK (automation_level IN ('manual', 'semi_automated', 'fully_automated')),
    
    -- Metadata
    created_by VARCHAR(100) DEFAULT 'AI_OPTIMIZER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT
);

-- ============================================================================
-- 📊 Create Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_budget_strategies_client_id ON budget_strategies(client_id);
CREATE INDEX IF NOT EXISTS idx_budget_strategies_status ON budget_strategies(status);
CREATE INDEX IF NOT EXISTS idx_budget_strategies_created_at ON budget_strategies(created_at);
CREATE INDEX IF NOT EXISTS idx_budget_strategies_total_budget ON budget_strategies(total_budget);

CREATE INDEX IF NOT EXISTS idx_budget_performance_strategy_id ON budget_performance(strategy_id);
CREATE INDEX IF NOT EXISTS idx_budget_performance_date ON budget_performance(date);
CREATE INDEX IF NOT EXISTS idx_budget_performance_period_type ON budget_performance(period_type);

CREATE INDEX IF NOT EXISTS idx_budget_optimizations_strategy_id ON budget_optimizations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_budget_optimizations_type ON budget_optimizations(optimization_type);
CREATE INDEX IF NOT EXISTS idx_budget_optimizations_created_at ON budget_optimizations(created_at);

-- ============================================================================
-- 🔄 Update Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_strategies_updated_at 
    BEFORE UPDATE ON budget_strategies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_performance_updated_at 
    BEFORE UPDATE ON budget_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 📋 Row Level Security (RLS)
-- ============================================================================
ALTER TABLE budget_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_optimizations ENABLE ROW LEVEL SECURITY;

-- Policies for budget_strategies (allow access for Nissan campaigns without client_id)
CREATE POLICY "Users can view budget strategies" ON budget_strategies
    FOR SELECT USING (
        client_id IS NULL OR 
        client_id IN (
            SELECT id FROM clients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert budget strategies" ON budget_strategies
    FOR INSERT WITH CHECK (
        client_id IS NULL OR 
        client_id IN (
            SELECT id FROM clients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update budget strategies" ON budget_strategies
    FOR UPDATE USING (
        client_id IS NULL OR 
        client_id IN (
            SELECT id FROM clients 
            WHERE user_id = auth.uid()
        )
    );

-- Policies for budget_performance (allow access for Nissan campaigns)
CREATE POLICY "Users can view budget performance" ON budget_performance
    FOR SELECT USING (
        strategy_id IN (
            SELECT bs.id FROM budget_strategies bs
            LEFT JOIN clients c ON bs.client_id = c.id
            WHERE bs.client_id IS NULL OR c.user_id = auth.uid()
        )
    );

-- Policies for budget_optimizations (allow access for Nissan campaigns)
CREATE POLICY "Users can view budget optimizations" ON budget_optimizations
    FOR SELECT USING (
        strategy_id IN (
            SELECT bs.id FROM budget_strategies bs
            LEFT JOIN clients c ON bs.client_id = c.id
            WHERE bs.client_id IS NULL OR c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 💡 Sample Templates for Quick Start
-- ============================================================================
-- Note: These INSERT statements are commented out as they require actual client IDs
-- To use these templates:
-- 1. Replace 'YOUR_CLIENT_ID_HERE' with actual client UUIDs from your clients table
-- 2. Uncomment the INSERT statements below
-- 3. Run the SQL

/*
INSERT INTO budget_strategies (
    client_id, strategy_name, total_budget, time_frame, campaign_type, primary_goal,
    bidding_strategy, target_cpa, ai_strategy_analysis, optimization_recommendations,
    status
) VALUES 
-- Replace 'YOUR_CLIENT_ID_HERE' with actual client IDs from your clients table
('YOUR_CLIENT_ID_HERE', 'Small Dealership Starter', 5000.00, 3, 'search', 'leads', 
 'target_cpa', 50.00, 
 '{"analysis": "Starter budget optimized for lead generation with conservative CPA targeting"}',
 ARRAY['Start with exact match keywords', 'Focus on local targeting', 'Implement call extensions'],
 'draft'),

('YOUR_CLIENT_ID_HERE', 'Medium Dealership Growth', 15000.00, 6, 'performance_max', 'sales',
 'maximize_conversion_value', NULL,
 '{"analysis": "Growth-focused strategy leveraging Performance Max for maximum reach"}', 
 ARRAY['Diversify ad formats', 'Implement audience layering', 'Use smart bidding optimization'],
 'draft'),

('YOUR_CLIENT_ID_HERE', 'Large Dealership Enterprise', 50000.00, 12, 'search', 'conversions',
 'target_roas', NULL,
 '{"analysis": "Enterprise-level strategy with multi-campaign approach and advanced optimization"}',
 ARRAY['Implement advanced audience strategies', 'Use multiple campaign types', 'Focus on lifetime value optimization'],
 'draft');
*/

-- Success message
SELECT 'Budget Strategies System successfully created! 🎉' as message; 