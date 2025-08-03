import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Create vehicles table if it doesn't exist
    const vehiclesTableSQL = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        
        -- Basic vehicle information
        title VARCHAR(500) NOT NULL,
        external_id VARCHAR(100),
        vin VARCHAR(17),
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        trim VARCHAR(100),
        
        -- Pricing information
        price DECIMAL(12,2) DEFAULT 0,
        msrp DECIMAL(12,2) DEFAULT 0,
        
        -- Vehicle details
        condition VARCHAR(50) DEFAULT 'unknown',
        availability VARCHAR(50) DEFAULT 'unknown',
        color VARCHAR(100),
        mileage INTEGER DEFAULT 0,
        drivetrain VARCHAR(50),
        transmission VARCHAR(50),
        engine VARCHAR(200),
        product_type VARCHAR(100),
        
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
    `

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: vehiclesTableSQL })
    
    if (tableError) {
      console.error('Error creating vehicles table:', tableError)
      // Try alternative approach
      const { error } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, we need to create it through the dashboard
        return NextResponse.json({
          success: false,
          error: 'Vehicles table needs to be created. Please run the SQL setup script in Supabase dashboard.',
          sql: vehiclesTableSQL
        })
      }
    }

    // Create indexes if they don't exist
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
      CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
      CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
      CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
      CREATE INDEX IF NOT EXISTS idx_vehicles_condition ON vehicles(condition);
      CREATE INDEX IF NOT EXISTS idx_vehicles_availability ON vehicles(availability);
      CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
      CREATE INDEX IF NOT EXISTS idx_vehicles_external_id ON vehicles(external_id);
      CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
    `

    await supabase.rpc('exec_sql', { sql: indexSQL })

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if vehicles table exists
    const { data, error } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1)

    const vehiclesTableExists = !error || error.code !== '42P01'

    // Check if clients table exists
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1)

    const clientsTableExists = !clientsError || clientsError.code !== '42P01'

    return NextResponse.json({
      success: true,
      tables: {
        clients: clientsTableExists,
        vehicles: vehiclesTableExists
      }
    })

  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { error: 'Database check failed' },
      { status: 500 }
    )
  }
} 