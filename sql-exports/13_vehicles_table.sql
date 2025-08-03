-- ================================
-- 🚗 VEHICLES TABLE SCHEMA
-- ================================
-- Creates table for storing vehicle inventory data from TSV imports
-- Run this in Supabase SQL Editor

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic vehicle information
    title VARCHAR(500) NOT NULL,
    external_id VARCHAR(100), -- ID from external system
    vin VARCHAR(17),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    trim VARCHAR(100),
    
    -- Pricing information
    price DECIMAL(12,2) DEFAULT 0,
    msrp DECIMAL(12,2) DEFAULT 0,
    
    -- Vehicle details
    condition VARCHAR(50) DEFAULT 'unknown', -- 'new', 'used', 'certified'
    availability VARCHAR(50) DEFAULT 'unknown', -- 'in stock', 'sold', 'pending'
    color VARCHAR(100),
    mileage INTEGER DEFAULT 0,
    drivetrain VARCHAR(50), -- 'FWD', 'RWD', 'AWD', '4WD'
    transmission VARCHAR(50), -- 'AUTOMATIC', 'MANUAL', 'CVT'
    engine VARCHAR(200),
    product_type VARCHAR(100), -- 'SEDAN', 'SUV', 'TRUCK', etc.
    
    -- Dealer information
    dealer_name VARCHAR(255),
    days_on_lot INTEGER DEFAULT 0,
    
    -- Media and links
    image_url TEXT,
    listing_url TEXT,
    description TEXT,
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_condition ON vehicles(condition);
CREATE INDEX IF NOT EXISTS idx_vehicles_availability ON vehicles(availability);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_external_id ON vehicles(external_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicles_updated_at();

-- RLS (Row Level Security) - vehicles are accessible based on client association
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy for selecting vehicles
CREATE POLICY "Users can view vehicles for their clients" ON vehicles
    FOR SELECT USING (true); -- For now, allow all reads

-- Policy for inserting vehicles
CREATE POLICY "Users can insert vehicles for their clients" ON vehicles
    FOR INSERT WITH CHECK (true); -- For now, allow all inserts

-- Policy for updating vehicles
CREATE POLICY "Users can update vehicles for their clients" ON vehicles
    FOR UPDATE USING (true); -- For now, allow all updates

-- Policy for deleting vehicles
CREATE POLICY "Users can delete vehicles for their clients" ON vehicles
    FOR DELETE USING (true); -- For now, allow all deletes

-- Function to create vehicles table if not exists (for dynamic creation)
CREATE OR REPLACE FUNCTION create_vehicles_table_if_not_exists()
RETURNS VOID AS $$
BEGIN
    -- This function is called from the API but the table is already created above
    -- Just return success
    RETURN;
END;
$$ LANGUAGE plpgsql; 