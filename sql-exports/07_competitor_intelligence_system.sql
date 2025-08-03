-- =====================================================
-- VLA Dashboard - Competitor Intelligence System
-- =====================================================

-- Create necessary base tables first
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Will reference auth.users eventually
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100), -- 'dealership', 'online_platform', 'dealer_group'
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(255),
    
    -- Business Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Subscription & Status
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(255),
    business_type VARCHAR(50) NOT NULL, -- 'local', 'online', 'franchise', 'dealer_group'
    
    -- Google Business Information (for local competitors)
    google_place_id VARCHAR(255) UNIQUE,
    google_business_name VARCHAR(255),
    google_rating DECIMAL(2,1),
    google_review_count INTEGER,
    google_photos_count INTEGER,
    
    -- Location Data
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_from_client DECIMAL(8, 2), -- in miles
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Business Details
    year_established INTEGER,
    employee_count_range VARCHAR(50), -- '1-10', '11-50', '51-200', etc.
    estimated_annual_revenue BIGINT,
    
    -- Discovery Method
    discovered_via VARCHAR(50) NOT NULL, -- 'google_api', 'manual_entry', 'imported'
    discovery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status and Tracking
    is_active BOOLEAN DEFAULT true,
    monitoring_enabled BOOLEAN DEFAULT true,
    priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    threat_level VARCHAR(20) DEFAULT 'medium',
    
    -- Analysis Metadata
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    analysis_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor business categories
CREATE TABLE competitor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL, -- 'Used Car Dealer', 'New Car Dealer', 'Auto Repair', etc.
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor brands/makes they sell
CREATE TABLE competitor_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    brand_name VARCHAR(100) NOT NULL, -- 'BMW', 'Toyota', 'Ford', etc.
    is_primary_brand BOOLEAN DEFAULT false,
    estimated_inventory_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor online presence and digital footprint
CREATE TABLE competitor_digital_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    
    -- Social Media
    facebook_url VARCHAR(255),
    facebook_followers INTEGER,
    instagram_url VARCHAR(255),
    instagram_followers INTEGER,
    youtube_url VARCHAR(255),
    youtube_subscribers INTEGER,
    linkedin_url VARCHAR(255),
    linkedin_followers INTEGER,
    
    -- SEO Metrics
    domain_authority INTEGER,
    estimated_monthly_traffic BIGINT,
    top_keywords TEXT[], -- Array of top ranking keywords
    backlink_count INTEGER,
    
    -- Advertising Presence
    running_google_ads BOOLEAN DEFAULT false,
    running_facebook_ads BOOLEAN DEFAULT false,
    estimated_ad_spend_monthly DECIMAL(10, 2),
    
    -- Technology Stack
    cms_platform VARCHAR(100),
    ecommerce_platform VARCHAR(100),
    analytics_tools TEXT[],
    
    -- Last updated
    last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor pricing and inventory data
CREATE TABLE competitor_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    
    -- Vehicle Information
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    vehicle_trim VARCHAR(100),
    mileage INTEGER,
    
    -- Pricing Data
    listed_price DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    price_reduction DECIMAL(10, 2),
    days_on_lot INTEGER,
    
    -- Competitive Intelligence
    price_vs_market VARCHAR(20), -- 'below', 'at', 'above'
    market_competitiveness_score INTEGER, -- 1-100
    
    -- Data Source
    scraped_from_url VARCHAR(500),
    listing_id VARCHAR(100),
    
    -- Timestamps
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    listing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CrewAI analysis results
CREATE TABLE competitor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Analysis Details
    analysis_type VARCHAR(50) NOT NULL, -- 'swot', 'pricing', 'digital_presence', 'market_position'
    analysis_title VARCHAR(255) NOT NULL,
    analysis_prompt TEXT NOT NULL,
    
    -- CrewAI Agent Information
    agent_type VARCHAR(100) NOT NULL, -- 'competitive_strategist', 'market_analyst', 'pricing_expert'
    agent_role VARCHAR(255),
    crew_id VARCHAR(100),
    
    -- Results
    analysis_result JSONB NOT NULL, -- Full analysis results in JSON format
    key_findings TEXT[],
    strategic_recommendations TEXT[],
    action_items TEXT[],
    
    -- Scoring
    threat_assessment INTEGER, -- 1-100
    opportunity_score INTEGER, -- 1-100
    competitive_advantage_areas TEXT[],
    competitive_disadvantage_areas TEXT[],
    
    -- Metadata
    confidence_score INTEGER, -- 1-100, how confident the AI is in the analysis
    data_quality_score INTEGER, -- 1-100, quality of input data
    analysis_duration_seconds INTEGER,
    
    -- Status and Sharing
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    is_shared_with_client BOOLEAN DEFAULT false,
    priority_level VARCHAR(20) DEFAULT 'medium',
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic action plans derived from competitor analysis
CREATE TABLE competitor_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES competitor_analyses(id) ON DELETE CASCADE,
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan_title VARCHAR(255) NOT NULL,
    plan_description TEXT,
    strategic_objective VARCHAR(255),
    
    -- Implementation Details
    action_steps JSONB NOT NULL, -- Array of action steps with details
    estimated_impact VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    implementation_timeline VARCHAR(50), -- 'immediate', 'short_term', 'medium_term', 'long_term'
    required_resources TEXT[],
    estimated_cost_range VARCHAR(50),
    
    -- Success Metrics
    success_metrics JSONB,
    kpi_targets JSONB,
    measurement_frequency VARCHAR(20),
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'in_progress', 'completed', 'cancelled'
    assigned_to VARCHAR(255),
    due_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    
    -- Results
    actual_results JSONB,
    roi_achieved DECIMAL(10, 2),
    lessons_learned TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Competitor monitoring alerts and notifications
CREATE TABLE competitor_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL, -- 'price_change', 'new_listing', 'review_spike', 'ad_campaign'
    alert_title VARCHAR(255) NOT NULL,
    alert_description TEXT,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Trigger Conditions
    trigger_condition JSONB, -- The condition that triggered this alert
    previous_value VARCHAR(255),
    current_value VARCHAR(255),
    percentage_change DECIMAL(8, 2),
    
    -- Action Required
    requires_immediate_action BOOLEAN DEFAULT false,
    suggested_actions TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Geographic market analysis
CREATE TABLE market_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Geographic Scope
    analysis_name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(50),
    radius_miles INTEGER DEFAULT 25,
    
    -- Market Data
    total_competitors_found INTEGER,
    market_density VARCHAR(20), -- 'low', 'medium', 'high', 'saturated'
    market_size_estimate BIGINT,
    average_competitor_rating DECIMAL(3, 2),
    
    -- Competitive Landscape
    top_competitor_id UUID REFERENCES competitors(id),
    market_leader_analysis JSONB,
    market_gaps_identified TEXT[],
    opportunities TEXT[],
    threats TEXT[],
    
    -- CrewAI Analysis
    ai_market_summary TEXT,
    strategic_recommendations JSONB,
    
    -- Data Sources
    data_sources TEXT[], -- 'google_places', 'google_ads', 'web_scraping'
    data_quality_score INTEGER,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Clients table indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_business_type ON clients(business_type);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- Competitors table indexes
CREATE INDEX idx_competitors_client_id ON competitors(client_id);
CREATE INDEX idx_competitors_zip_code ON competitors(zip_code);
CREATE INDEX idx_competitors_google_place_id ON competitors(google_place_id);
CREATE INDEX idx_competitors_business_type ON competitors(business_type);
CREATE INDEX idx_competitors_is_active ON competitors(is_active);
CREATE INDEX idx_competitors_priority_level ON competitors(priority_level);
CREATE INDEX idx_competitors_location ON competitors(latitude, longitude);
CREATE INDEX idx_competitors_discovery_date ON competitors(discovery_date);

-- Analysis table indexes
CREATE INDEX idx_competitor_analyses_competitor_id ON competitor_analyses(competitor_id);
CREATE INDEX idx_competitor_analyses_client_id ON competitor_analyses(client_id);
CREATE INDEX idx_competitor_analyses_analysis_type ON competitor_analyses(analysis_type);
CREATE INDEX idx_competitor_analyses_created_at ON competitor_analyses(created_at);
CREATE INDEX idx_competitor_analyses_status ON competitor_analyses(status);

-- Pricing table indexes
CREATE INDEX idx_competitor_pricing_competitor_id ON competitor_pricing(competitor_id);
CREATE INDEX idx_competitor_pricing_vehicle ON competitor_pricing(vehicle_make, vehicle_model, vehicle_year);
CREATE INDEX idx_competitor_pricing_scraped_at ON competitor_pricing(scraped_at);

-- Alerts table indexes
CREATE INDEX idx_competitor_alerts_competitor_id ON competitor_alerts(competitor_id);
CREATE INDEX idx_competitor_alerts_client_id ON competitor_alerts(client_id);
CREATE INDEX idx_competitor_alerts_status ON competitor_alerts(status);
CREATE INDEX idx_competitor_alerts_severity ON competitor_alerts(severity);

-- =====================================================
-- FUNCTIONS and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_digital_presence_updated_at BEFORE UPDATE ON competitor_digital_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_action_plans_updated_at BEFORE UPDATE ON competitor_action_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, 
    lon1 DECIMAL, 
    lat2 DECIMAL, 
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
    r DECIMAL := 3959; -- Earth's radius in miles
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
    c := 2 * ASIN(SQRT(a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get competitors within radius
CREATE OR REPLACE FUNCTION get_competitors_within_radius(
    client_lat DECIMAL,
    client_lon DECIMAL,
    radius_miles INTEGER DEFAULT 25,
    client_uuid UUID DEFAULT NULL
) RETURNS TABLE (
    competitor_id UUID,
    competitor_name VARCHAR(255),
    distance_miles DECIMAL,
    google_rating DECIMAL,
    business_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        calculate_distance(client_lat, client_lon, c.latitude, c.longitude) as distance,
        c.google_rating,
        c.business_type
    FROM competitors c
    WHERE 
        c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (client_uuid IS NULL OR c.client_id = client_uuid)
        AND c.is_active = true
        AND calculate_distance(client_lat, client_lon, c.latitude, c.longitude) <= radius_miles
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS) - Optional, comment out if using simple setup
-- =====================================================

/*
-- Enable RLS on all tables (uncomment if using auth.users)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_digital_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own client's data)
CREATE POLICY "Users can view own client competitors" ON competitors FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can insert own client competitors" ON competitors FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can update own client competitors" ON competitors FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));

CREATE POLICY "Users can view own competitor analyses" ON competitor_analyses FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can insert own competitor analyses" ON competitor_analyses FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
*/

-- =====================================================
-- Sample Data for Testing
-- =====================================================

-- Insert sample client data
INSERT INTO clients (company_name, business_type, contact_email, city, state, zip_code, latitude, longitude)
VALUES 
    ('Demo Auto Dealership', 'dealership', 'demo@autodealership.com', 'Beverly Hills', 'CA', '90210', 34.0736, -118.4004),
    ('Test Car Sales', 'dealership', 'test@carsales.com', 'Los Angeles', 'CA', '90028', 34.0928, -118.3287);

-- Insert sample competitor data
INSERT INTO competitors (client_id, name, business_type, website_url, address, city, state, zip_code, latitude, longitude, google_rating, google_review_count, discovered_via, priority_level)
VALUES 
    ((SELECT id FROM clients LIMIT 1), 'Premium Auto Group', 'local', 'https://premiumautogroup.com', '123 Main St', 'Beverly Hills', 'CA', '90210', 34.0736, -118.4004, 4.5, 234, 'google_api', 'high'),
    ((SELECT id FROM clients LIMIT 1), 'Cars.com', 'online', 'https://cars.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'manual_entry', 'critical'),
    ((SELECT id FROM clients LIMIT 1), 'AutoNation Ford', 'franchise', 'https://autonationford.com', '456 Car Blvd', 'Los Angeles', 'CA', '90028', 34.0928, -118.3287, 4.2, 567, 'google_api', 'medium'); 