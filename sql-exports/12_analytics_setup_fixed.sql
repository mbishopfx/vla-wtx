-- ================================
-- 📊 COMPLETE ANALYTICS SETUP (CONFLICT FIXED)
-- ================================
-- Adds all missing columns to clients table and sets up analytics system
-- Run this in Supabase SQL Editor

-- ================================
-- 🔧 ADD MISSING COLUMNS TO CLIENTS TABLE
-- ================================

-- Add Google API integration columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_analytics_property_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_ads_conversion_tracking_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_search_console_domain VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_access_token TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_refresh_token TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_scope TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_apis_connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_apis_last_sync TIMESTAMP WITH TIME ZONE;

-- Add unique constraint on website_url if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clients_website_url_unique'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_website_url_unique UNIQUE (website_url);
    END IF;
END $$;

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
    processed BOOLEAN DEFAULT false
);

-- Create indexes for client_analytics_events
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_client_id ON client_analytics_events(client_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_event_name ON client_analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_timestamp ON client_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_session_id ON client_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_user_id ON client_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_page_path ON client_analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_client_analytics_events_traffic_source ON client_analytics_events(traffic_source);

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
    UNIQUE(client_id, date, hour)
);

-- Create indexes for client_analytics_summary
CREATE INDEX IF NOT EXISTS idx_client_analytics_summary_client_id ON client_analytics_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_summary_date ON client_analytics_summary(date);
CREATE INDEX IF NOT EXISTS idx_client_analytics_summary_client_date ON client_analytics_summary(client_id, date);

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for client_analytics_goals
CREATE INDEX IF NOT EXISTS idx_client_analytics_goals_client_id ON client_analytics_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_goals_type ON client_analytics_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_client_analytics_goals_event ON client_analytics_goals(trigger_event);

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
    UNIQUE(client_id, date, device_category, operating_system, browser)
);

-- Create indexes for client_analytics_devices
CREATE INDEX IF NOT EXISTS idx_client_analytics_devices_client_id ON client_analytics_devices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_devices_date ON client_analytics_devices(date);
CREATE INDEX IF NOT EXISTS idx_client_analytics_devices_category ON client_analytics_devices(device_category);

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
    UNIQUE(client_id, date, country_code, region, city)
);

-- Create indexes for client_analytics_geography
CREATE INDEX IF NOT EXISTS idx_client_analytics_geography_client_id ON client_analytics_geography(client_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_geography_date ON client_analytics_geography(date);
CREATE INDEX IF NOT EXISTS idx_client_analytics_geography_country ON client_analytics_geography(country_code);
CREATE INDEX IF NOT EXISTS idx_client_analytics_geography_location ON client_analytics_geography(latitude, longitude);

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
    UNIQUE(client_id, vehicle_id, date)
);

-- Create indexes for client_vehicle_analytics
CREATE INDEX IF NOT EXISTS idx_client_vehicle_analytics_client_id ON client_vehicle_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_vehicle_analytics_vehicle_id ON client_vehicle_analytics(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_client_vehicle_analytics_date ON client_vehicle_analytics(date);
CREATE INDEX IF NOT EXISTS idx_client_vehicle_analytics_make_model ON client_vehicle_analytics(make, model);

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
-- 🏢 NISSAN CLIENT SETUP (Fixed Conflict)
-- ================================

-- Insert Nissan client (using WHERE NOT EXISTS to avoid conflicts)
INSERT INTO clients (
    id,
    company_name,
    business_type,
    contact_email,
    contact_phone,
    website_url,
    address,
    city,
    state,
    zip_code,
    google_analytics_property_id,
    google_ads_customer_id,
    google_ads_conversion_tracking_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'Nissan of Wichita Falls',
    'dealership',
    'info@nissanofwichitafalls.com',
    '(940) 723-3656',
    'https://www.nissanofwichitafalls.com',
    '4500 Kemp Boulevard',
    'Wichita Falls',
    'TX',
    '76308',
    '376755287', -- Real GA4 Property ID
    '789-139-9350', -- Real Google Ads Customer ID
    'AW-696993687', -- Real conversion tracking ID
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com'
);

-- Update existing Nissan client if it already exists
UPDATE clients SET
    google_analytics_property_id = '376755287',
    google_ads_customer_id = '789-139-9350',
    google_ads_conversion_tracking_id = 'AW-696993687',
    updated_at = NOW()
WHERE website_url = 'https://www.nissanofwichitafalls.com';

-- Set up initial analytics goals for Nissan (using WHERE NOT EXISTS)
INSERT INTO client_analytics_goals (
    client_id,
    goal_name,
    goal_type,
    goal_description,
    trigger_event,
    goal_value,
    is_active
)
SELECT 
    (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com'),
    'Vehicle Inquiry',
    'conversion',
    'Customer submitted inquiry about a specific vehicle',
    'lead_generation',
    500.00,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM client_analytics_goals 
    WHERE client_id = (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com')
    AND goal_name = 'Vehicle Inquiry'
);

INSERT INTO client_analytics_goals (
    client_id,
    goal_name,
    goal_type,
    goal_description,
    trigger_event,
    goal_value,
    is_active
)
SELECT 
    (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com'),
    'Test Drive Request',
    'conversion', 
    'Customer requested a test drive',
    'test_drive_request',
    1000.00,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM client_analytics_goals 
    WHERE client_id = (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com')
    AND goal_name = 'Test Drive Request'
);

INSERT INTO client_analytics_goals (
    client_id,
    goal_name,
    goal_type,
    goal_description,
    trigger_event,
    goal_value,
    is_active
)
SELECT 
    (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com'),
    'Phone Call',
    'engagement',
    'Customer called the dealership',
    'phone_call',
    250.00,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM client_analytics_goals 
    WHERE client_id = (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com')
    AND goal_name = 'Phone Call'
);

INSERT INTO client_analytics_goals (
    client_id,
    goal_name,
    goal_type,
    goal_description,
    trigger_event,
    goal_value,
    is_active
)
SELECT 
    (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com'),
    'Vehicle Detail View',
    'engagement',
    'Customer viewed vehicle details page',
    'vehicle_view',
    50.00,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM client_analytics_goals 
    WHERE client_id = (SELECT id FROM clients WHERE website_url = 'https://www.nissanofwichitafalls.com')
    AND goal_name = 'Vehicle Detail View'
);

-- ================================
-- 📝 SUCCESS MESSAGE
-- ================================
DO $$
BEGIN
    RAISE NOTICE '🎉 COMPLETE ANALYTICS SYSTEM INSTALLED!';
    RAISE NOTICE '══════════════════════════════════════════';
    RAISE NOTICE '📊 Analytics Tables: 6 tables created';
    RAISE NOTICE '🏢 Client: Nissan of Wichita Falls added';
    RAISE NOTICE '🎯 GA4 Property: 376755287';
    RAISE NOTICE '💰 Google Ads: 789-139-9350';
    RAISE NOTICE '🔄 Conversion Tag: AW-696993687';
    RAISE NOTICE '📋 Goals: 4 conversion goals set up';
    RAISE NOTICE '══════════════════════════════════════════';
    RAISE NOTICE '🚀 READY TO TRACK ANALYTICS!';
    RAISE NOTICE '📱 Next: Add tracking script to website';
    RAISE NOTICE '🧪 Test: Visit /dashboard/analytics/test';
END $$; 