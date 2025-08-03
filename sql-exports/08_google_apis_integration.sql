-- =====================================================
-- VLA Dashboard - Google APIs Integration Schema
-- =====================================================

-- Add Google API integration columns to existing clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_analytics_property_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_search_console_domain VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_access_token TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_refresh_token TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_oauth_scope TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_apis_connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_apis_last_sync TIMESTAMP WITH TIME ZONE;

-- Temporary table to store Google services data during OAuth setup
CREATE TABLE IF NOT EXISTS client_google_services_temp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    services_data JSONB NOT NULL, -- Stores available accounts/properties from Google APIs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour') -- Auto-cleanup after 1 hour
);

-- Table to store client Google API usage and quotas
CREATE TABLE IF NOT EXISTS client_google_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    api_service VARCHAR(50) NOT NULL, -- 'analytics', 'ads', 'search_console'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    requests_made INTEGER DEFAULT 0,
    quota_limit INTEGER,
    quota_used INTEGER DEFAULT 0,
    last_request_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries per client/service/date
    UNIQUE(client_id, api_service, date)
);

-- Table to store real client performance data from Google APIs
CREATE TABLE IF NOT EXISTS client_performance_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Data source and timing
    data_source VARCHAR(50) NOT NULL, -- 'google_analytics', 'google_ads', 'search_console'
    data_type VARCHAR(50) NOT NULL, -- 'traffic', 'conversions', 'campaigns', 'keywords'
    date_collected DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Raw data from Google APIs
    raw_data JSONB NOT NULL,
    
    -- Processed metrics (for faster querying)
    metrics JSONB,
    
    -- Quality and validation
    data_quality_score INTEGER DEFAULT 100, -- 1-100
    is_validated BOOLEAN DEFAULT false,
    validation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate data
    UNIQUE(client_id, data_source, data_type, date_collected)
);

-- Table to track client data sync status and errors
CREATE TABLE IF NOT EXISTS client_data_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Sync details
    sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'manual'
    api_services TEXT[] NOT NULL, -- ['analytics', 'ads', 'search_console']
    
    -- Results
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Error tracking
    errors JSONB, -- Array of error objects
    warnings JSONB, -- Array of warning objects
    
    -- Metadata
    triggered_by VARCHAR(50), -- 'cron', 'manual', 'webhook'
    sync_version VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Clients table Google API indexes
CREATE INDEX IF NOT EXISTS idx_clients_google_analytics_property_id ON clients(google_analytics_property_id);
CREATE INDEX IF NOT EXISTS idx_clients_google_ads_customer_id ON clients(google_ads_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_google_oauth_expires_at ON clients(google_oauth_expires_at);
CREATE INDEX IF NOT EXISTS idx_clients_google_apis_connected_at ON clients(google_apis_connected_at);

-- Temporary services table indexes
CREATE INDEX IF NOT EXISTS idx_client_google_services_temp_client_id ON client_google_services_temp(client_id);
CREATE INDEX IF NOT EXISTS idx_client_google_services_temp_expires_at ON client_google_services_temp(expires_at);

-- API usage table indexes
CREATE INDEX IF NOT EXISTS idx_client_google_api_usage_client_id ON client_google_api_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_client_google_api_usage_api_service ON client_google_api_usage(api_service);
CREATE INDEX IF NOT EXISTS idx_client_google_api_usage_date ON client_google_api_usage(date);

-- Performance data table indexes
CREATE INDEX IF NOT EXISTS idx_client_performance_data_client_id ON client_performance_data(client_id);
CREATE INDEX IF NOT EXISTS idx_client_performance_data_source ON client_performance_data(data_source);
CREATE INDEX IF NOT EXISTS idx_client_performance_data_type ON client_performance_data(data_type);
CREATE INDEX IF NOT EXISTS idx_client_performance_data_date ON client_performance_data(date_collected);
CREATE INDEX IF NOT EXISTS idx_client_performance_data_period ON client_performance_data(period_start, period_end);

-- Sync logs table indexes
CREATE INDEX IF NOT EXISTS idx_client_data_sync_logs_client_id ON client_data_sync_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_data_sync_logs_status ON client_data_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_client_data_sync_logs_started_at ON client_data_sync_logs(started_at);

-- =====================================================
-- FUNCTIONS and Triggers
-- =====================================================

-- Function to cleanup expired temporary services data
CREATE OR REPLACE FUNCTION cleanup_expired_google_services_temp()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM client_google_services_temp 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to track API usage
CREATE OR REPLACE FUNCTION track_google_api_usage(
    p_client_id UUID,
    p_api_service VARCHAR(50),
    p_requests_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    INSERT INTO client_google_api_usage (
        client_id,
        api_service,
        date,
        requests_made,
        last_request_at
    ) VALUES (
        p_client_id,
        p_api_service,
        CURRENT_DATE,
        p_requests_count,
        NOW()
    )
    ON CONFLICT (client_id, api_service, date)
    DO UPDATE SET
        requests_made = client_google_api_usage.requests_made + p_requests_count,
        last_request_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get client's Google API connection status
CREATE OR REPLACE FUNCTION get_client_google_connection_status(p_client_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    client_data RECORD;
BEGIN
    SELECT 
        google_analytics_property_id,
        google_ads_customer_id,
        google_search_console_domain,
        google_oauth_access_token,
        google_oauth_expires_at,
        google_apis_connected_at,
        google_apis_last_sync
    INTO client_data
    FROM clients 
    WHERE id = p_client_id;
    
    result := jsonb_build_object(
        'isConnected', client_data.google_oauth_access_token IS NOT NULL,
        'connectedAt', client_data.google_apis_connected_at,
        'lastSync', client_data.google_apis_last_sync,
        'tokenExpired', client_data.google_oauth_expires_at < NOW(),
        'services', jsonb_build_object(
            'analytics', client_data.google_analytics_property_id IS NOT NULL,
            'ads', client_data.google_ads_customer_id IS NOT NULL,
            'searchConsole', client_data.google_search_console_domain IS NOT NULL
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_client_performance_data_updated_at 
    BEFORE UPDATE ON client_performance_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) - Optional
-- =====================================================

/*
-- Enable RLS on new tables (uncomment if using auth.users)
ALTER TABLE client_google_services_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_google_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_data_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Users can view own client Google services temp" ON client_google_services_temp FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can view own client API usage" ON client_google_api_usage FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can view own client performance data" ON client_performance_data FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
CREATE POLICY "Users can view own client sync logs" ON client_data_sync_logs FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_id));
*/

-- =====================================================
-- Sample Usage Examples
-- =====================================================

-- Check connection status for a client
-- SELECT get_client_google_connection_status('client-uuid-here');

-- Track API usage
-- SELECT track_google_api_usage('client-uuid-here', 'analytics', 5);

-- Cleanup expired temp data
-- SELECT cleanup_expired_google_services_temp(); 