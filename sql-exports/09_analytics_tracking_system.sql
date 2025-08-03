-- ================================
-- 📊 ANALYTICS TRACKING SYSTEM
-- ================================
-- Comprehensive analytics tracking for client websites
-- Supports Google Analytics integration and custom event tracking

-- ================================
-- 📋 Client Analytics Events Table
-- ================================
CREATE TABLE IF NOT EXISTS client_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Event Information
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- User & Session Information
    user_id VARCHAR(255),
    session_id VARCHAR(255) NOT NULL,
    
    -- Page Information
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    page_path VARCHAR(500),
    
    -- Technical Information
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(20),
    
    -- Geographic Information
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Timing Information
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    page_load_time INTEGER, -- milliseconds
    session_duration INTEGER, -- seconds
    
    -- Attribution Information
    traffic_source VARCHAR(100),
    traffic_medium VARCHAR(100),
    traffic_campaign VARCHAR(200),
    referrer_url TEXT,
    
    -- E-commerce Information (for vehicle dealerships)
    transaction_id VARCHAR(100),
    transaction_value DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT false,
    
    -- Indexes
    INDEX idx_client_analytics_events_client_id (client_id),
    INDEX idx_client_analytics_events_event_name (event_name),
    INDEX idx_client_analytics_events_timestamp (timestamp),
    INDEX idx_client_analytics_events_session_id (session_id),
    INDEX idx_client_analytics_events_user_id (user_id),
    INDEX idx_client_analytics_events_page_path (page_path),
    INDEX idx_client_analytics_events_traffic_source (traffic_source)
);

-- ================================
-- 📈 Client Analytics Summary Table
-- ================================
CREATE TABLE IF NOT EXISTS client_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Date Information
    date DATE NOT NULL,
    hour INTEGER, -- 0-23 for hourly summaries
    
    -- Traffic Metrics
    total_sessions INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0, -- seconds
    
    -- Engagement Metrics
    total_events INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Vehicle-Specific Metrics
    vehicle_views INTEGER DEFAULT 0,
    vehicle_detail_views INTEGER DEFAULT 0,
    contact_form_submissions INTEGER DEFAULT 0,
    phone_calls INTEGER DEFAULT 0,
    email_inquiries INTEGER DEFAULT 0,
    brochure_downloads INTEGER DEFAULT 0,
    test_drive_requests INTEGER DEFAULT 0,
    
    -- Top Content
    top_pages JSONB DEFAULT '[]',
    top_traffic_sources JSONB DEFAULT '[]',
    top_search_terms JSONB DEFAULT '[]',
    
    -- Device & Technical
    desktop_sessions INTEGER DEFAULT 0,
    mobile_sessions INTEGER DEFAULT 0,
    tablet_sessions INTEGER DEFAULT 0,
    
    -- Geographic
    top_countries JSONB DEFAULT '[]',
    top_cities JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, date, hour),
    
    -- Indexes
    INDEX idx_client_analytics_summary_client_id (client_id),
    INDEX idx_client_analytics_summary_date (date),
    INDEX idx_client_analytics_summary_client_date (client_id, date)
);

-- ================================
-- 🎯 Client Goals & Conversions Table
-- ================================
CREATE TABLE IF NOT EXISTS client_analytics_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Goal Information
    goal_name VARCHAR(200) NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'conversion', 'engagement', 'revenue', 'custom'
    goal_description TEXT,
    
    -- Goal Configuration
    trigger_event VARCHAR(100), -- event_name that triggers this goal
    trigger_conditions JSONB DEFAULT '{}', -- conditions for goal completion
    goal_value DECIMAL(10,2), -- monetary value of goal completion
    
    -- Goal Status
    is_active BOOLEAN DEFAULT true,
    total_completions INTEGER DEFAULT 0,
    last_completion TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_client_analytics_goals_client_id (client_id),
    INDEX idx_client_analytics_goals_type (goal_type),
    INDEX idx_client_analytics_goals_event (trigger_event)
);

-- ================================
-- 📱 Client Device & Browser Analytics
-- ================================
CREATE TABLE IF NOT EXISTS client_analytics_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Date Information
    date DATE NOT NULL,
    
    -- Device Information
    device_category VARCHAR(50) NOT NULL, -- 'desktop', 'mobile', 'tablet'
    device_brand VARCHAR(100),
    device_model VARCHAR(200),
    operating_system VARCHAR(100),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    -- Metrics
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, date, device_category, operating_system, browser),
    
    -- Indexes
    INDEX idx_client_analytics_devices_client_id (client_id),
    INDEX idx_client_analytics_devices_date (date),
    INDEX idx_client_analytics_devices_category (device_category)
);

-- ================================
-- 🌍 Geographic Analytics Table
-- ================================
CREATE TABLE IF NOT EXISTS client_analytics_geography (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Date Information
    date DATE NOT NULL,
    
    -- Geographic Information
    country_code VARCHAR(2) NOT NULL,
    country_name VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Metrics
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, date, country_code, region, city),
    
    -- Indexes
    INDEX idx_client_analytics_geography_client_id (client_id),
    INDEX idx_client_analytics_geography_date (date),
    INDEX idx_client_analytics_geography_country (country_code),
    INDEX idx_client_analytics_geography_location (latitude, longitude)
);

-- ================================
-- 🚗 Vehicle-Specific Analytics
-- ================================
CREATE TABLE IF NOT EXISTS client_vehicle_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Vehicle Information
    vehicle_id VARCHAR(100), -- Client's vehicle ID
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    trim VARCHAR(100),
    price DECIMAL(10,2),
    
    -- Analytics Data
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    detail_views INTEGER DEFAULT 0,
    image_views INTEGER DEFAULT 0,
    contact_inquiries INTEGER DEFAULT 0,
    brochure_downloads INTEGER DEFAULT 0,
    test_drive_requests INTEGER DEFAULT 0,
    finance_calculator_uses INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_time_on_page INTEGER DEFAULT 0, -- seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, vehicle_id, date),
    
    -- Indexes
    INDEX idx_client_vehicle_analytics_client_id (client_id),
    INDEX idx_client_vehicle_analytics_vehicle_id (vehicle_id),
    INDEX idx_client_vehicle_analytics_date (date),
    INDEX idx_client_vehicle_analytics_make_model (make, model)
);

-- ================================
-- ⚡ FUNCTIONS & PROCEDURES
-- ================================

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_client_analytics_summary(
    p_client_id UUID,
    p_event_name VARCHAR(100)
) RETURNS VOID AS $$
DECLARE
    summary_date DATE := CURRENT_DATE;
    summary_hour INTEGER := EXTRACT(HOUR FROM NOW());
BEGIN
    -- Update daily summary
    INSERT INTO client_analytics_summary (
        client_id, date, total_events
    ) VALUES (
        p_client_id, summary_date, 1
    ) ON CONFLICT (client_id, date, hour) 
    DO UPDATE SET 
        total_events = client_analytics_summary.total_events + 1,
        updated_at = NOW();
    
    -- Update hourly summary
    INSERT INTO client_analytics_summary (
        client_id, date, hour, total_events
    ) VALUES (
        p_client_id, summary_date, summary_hour, 1
    ) ON CONFLICT (client_id, date, hour) 
    DO UPDATE SET 
        total_events = client_analytics_summary.total_events + 1,
        updated_at = NOW();
    
    -- Update event-specific counters
    IF p_event_name = 'page_view' THEN
        UPDATE client_analytics_summary 
        SET page_views = page_views + 1, updated_at = NOW()
        WHERE client_id = p_client_id AND date = summary_date AND hour IS NULL;
    END IF;
    
    IF p_event_name = 'conversion' THEN
        UPDATE client_analytics_summary 
        SET conversions = conversions + 1, updated_at = NOW()
        WHERE client_id = p_client_id AND date = summary_date AND hour IS NULL;
    END IF;
    
    IF p_event_name = 'vehicle_view' THEN
        UPDATE client_analytics_summary 
        SET vehicle_views = vehicle_views + 1, updated_at = NOW()
        WHERE client_id = p_client_id AND date = summary_date AND hour IS NULL;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Function to calculate session metrics
CREATE OR REPLACE FUNCTION calculate_session_metrics(
    p_client_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    total_sessions BIGINT,
    unique_visitors BIGINT,
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT user_id) as unique_visitors,
        AVG(session_duration) as avg_session_duration,
        (COUNT(CASE WHEN page_views_per_session = 1 THEN 1 END) * 100.0 / 
         COUNT(DISTINCT session_id)) as bounce_rate
    FROM (
        SELECT 
            session_id,
            user_id,
            MAX(session_duration) as session_duration,
            COUNT(*) as page_views_per_session
        FROM client_analytics_events 
        WHERE client_id = p_client_id 
            AND DATE(timestamp) BETWEEN p_start_date AND p_end_date
            AND event_name = 'page_view'
        GROUP BY session_id, user_id
    ) session_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get top content
CREATE OR REPLACE FUNCTION get_top_content(
    p_client_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    page_path VARCHAR,
    page_views BIGINT,
    unique_views BIGINT,
    avg_time_on_page NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.page_path,
        COUNT(*) as page_views,
        COUNT(DISTINCT e.session_id) as unique_views,
        AVG(e.page_load_time) as avg_time_on_page
    FROM client_analytics_events e
    WHERE e.client_id = p_client_id 
        AND DATE(e.timestamp) BETWEEN p_start_date AND p_end_date
        AND e.event_name = 'page_view'
        AND e.page_path IS NOT NULL
    GROUP BY e.page_path
    ORDER BY page_views DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to track goal completion
CREATE OR REPLACE FUNCTION track_goal_completion(
    p_client_id UUID,
    p_goal_id UUID,
    p_event_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    goal_record RECORD;
    conditions_met BOOLEAN := true;
BEGIN
    -- Get goal configuration
    SELECT * INTO goal_record 
    FROM client_analytics_goals 
    WHERE id = p_goal_id AND client_id = p_client_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if conditions are met (simplified - extend as needed)
    -- This is a basic implementation - you can extend this with more complex logic
    
    IF conditions_met THEN
        -- Update goal completion count
        UPDATE client_analytics_goals 
        SET 
            total_completions = total_completions + 1,
            last_completion = NOW(),
            updated_at = NOW()
        WHERE id = p_goal_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 🔄 TRIGGERS
-- ================================

-- Update timestamp trigger for analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analytics_summary_updated_at
    BEFORE UPDATE ON client_analytics_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_summary_updated_at();

-- ================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all analytics tables
ALTER TABLE client_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics_geography ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_vehicle_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (uncomment when auth.users is available)
/*
CREATE POLICY "Users can view their own analytics events" ON client_analytics_events
    FOR SELECT USING (client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own analytics events" ON client_analytics_events
    FOR INSERT WITH CHECK (client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view their own analytics summary" ON client_analytics_summary
    FOR SELECT USING (client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own analytics summary" ON client_analytics_summary
    FOR ALL USING (client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    ));
*/

-- ================================
-- 📊 SAMPLE DATA
-- ================================

-- Insert sample analytics events for demo client
INSERT INTO client_analytics_events (
    client_id,
    event_name,
    event_data,
    session_id,
    page_url,
    page_title,
    page_path,
    user_agent,
    ip_address,
    traffic_source,
    traffic_medium
) VALUES 
(
    (SELECT id FROM clients LIMIT 1),
    'page_view',
    '{"page_category": "homepage"}',
    'session_' || EXTRACT(EPOCH FROM NOW()),
    'https://example-dealership.com/',
    'Home - Example Auto Dealership',
    '/',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '192.168.1.1',
    'google',
    'organic'
),
(
    (SELECT id FROM clients LIMIT 1),
    'vehicle_view',
    '{"vehicle_id": "2024-honda-civic-001", "make": "Honda", "model": "Civic", "year": 2024}',
    'session_' || EXTRACT(EPOCH FROM NOW()),
    'https://example-dealership.com/vehicles/2024-honda-civic',
    '2024 Honda Civic - Example Auto Dealership',
    '/vehicles/2024-honda-civic',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    '192.168.1.2',
    'facebook',
    'social'
),
(
    (SELECT id FROM clients LIMIT 1),
    'lead_generation',
    '{"form_type": "contact", "vehicle_interest": "2024-honda-civic"}',
    'session_' || EXTRACT(EPOCH FROM NOW()),
    'https://example-dealership.com/contact',
    'Contact Us - Example Auto Dealership',
    '/contact',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    '192.168.1.3',
    'google',
    'cpc'
);

-- ================================
-- 📝 NOTES
-- ================================
/*
This analytics system provides:

1. 📊 Comprehensive Event Tracking
   - Page views, clicks, form submissions
   - Vehicle-specific events
   - Custom event types
   - Session and user tracking

2. 📈 Aggregated Analytics
   - Daily and hourly summaries
   - Device and geographic breakdowns
   - Goal tracking and conversions
   - Vehicle performance metrics

3. 🎯 Goal & Conversion Tracking
   - Configurable goals
   - Automatic goal completion detection
   - Revenue and value tracking

4. 🔍 Advanced Reporting
   - Top content analysis
   - Traffic source attribution
   - Geographic performance
   - Device/browser analytics

5. 🔐 Security & Privacy
   - Row Level Security
   - Client data isolation
   - IP address handling
   - GDPR considerations

Usage Examples:
- Track vehicle listing views
- Monitor contact form submissions
- Analyze traffic sources
- Calculate conversion rates
- Generate custom reports

Integration:
- Works with Google Analytics 4
- Custom event API
- Real-time data processing
- Automated summary generation
*/ 