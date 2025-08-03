import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

interface VehicleData {
  title: string
  id: string
  price: string
  condition: string
  availability: string
  brand: string
  color: string
  days_on_lot: number
  dealer_name: string
  description: string
  drivetrain: string
  engine: string
  image_link: string
  mileage_value: number
  model: string
  msrp: string
  product_type: string
  transmission: string
  trim: string
  vin: string
  year: number
  latitude: number
  longitude: number
  link: string
}

function parseTSVData(tsvContent: string): VehicleData[] {
  const lines = tsvContent.split('\n')
  const headers = lines[0].split('\t')
  
  const vehicles: VehicleData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split('\t')
    if (values.length < headers.length) continue
    
    try {
      const vehicle: any = {}
      headers.forEach((header, index) => {
        vehicle[header] = values[index] || ''
      })
      
      // Parse numeric values
      const priceMatch = vehicle.price?.match(/[\d.]+/)
      const msrpMatch = vehicle.msrp?.match(/[\d.]+/)
      
      const vehicleData: VehicleData = {
        title: vehicle.title || '',
        id: vehicle.id || vehicle.vin || `vehicle-${i}`,
        price: priceMatch ? priceMatch[0] : '0',
        condition: vehicle.condition || 'unknown',
        availability: vehicle.availability || 'unknown',
        brand: vehicle.brand || '',
        color: vehicle.color || '',
        days_on_lot: parseInt(vehicle['days on lot']) || 0,
        dealer_name: vehicle['dealer name'] || '',
        description: vehicle.description || '',
        drivetrain: vehicle.drivetrain || '',
        engine: vehicle.engine || '',
        image_link: vehicle['image link'] || '',
        mileage_value: parseInt(vehicle['mileage.value']) || 0,
        model: vehicle.model || '',
        msrp: msrpMatch ? msrpMatch[0] : '0',
        product_type: vehicle['product type'] || '',
        transmission: vehicle.transmission || '',
        trim: vehicle.trim || '',
        vin: vehicle.vin || '',
        year: parseInt(vehicle.year) || new Date().getFullYear(),
        latitude: parseFloat(vehicle.latitude) || 0,
        longitude: parseFloat(vehicle.longitude) || 0,
        link: vehicle.link || ''
      }
      
      vehicles.push(vehicleData)
    } catch (error) {
      console.error(`Error parsing line ${i}:`, error)
    }
  }
  
  return vehicles
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, tsvContent } = body
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    // If no TSV content provided, read from the file
    let content = tsvContent
    if (!content) {
      try {
        const filePath = path.join(process.cwd(), 'products_2025-08-03_01:35:31.tsv')
        content = fs.readFileSync(filePath, 'utf-8')
      } catch (error) {
        return NextResponse.json(
          { error: 'TSV file not found. Please provide tsvContent in request body.' },
          { status: 400 }
        )
      }
    }
    
    // Parse the TSV data
    const vehicles = parseTSVData(content)
    
    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: 'No valid vehicle data found in TSV' },
        { status: 400 }
      )
    }
    
    // Check if vehicles table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === '42P01') {
      return NextResponse.json({
        error: 'Vehicles table does not exist. Please create it first.',
        sql: `
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  external_id VARCHAR(100),
  vin VARCHAR(17),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),
  price DECIMAL(12,2) DEFAULT 0,
  msrp DECIMAL(12,2) DEFAULT 0,
  condition VARCHAR(50) DEFAULT 'unknown',
  availability VARCHAR(50) DEFAULT 'unknown',
  color VARCHAR(100),
  mileage INTEGER DEFAULT 0,
  drivetrain VARCHAR(50),
  transmission VARCHAR(50),
  engine VARCHAR(200),
  product_type VARCHAR(100),
  dealer_name VARCHAR(255),
  days_on_lot INTEGER DEFAULT 0,
  image_url TEXT,
  listing_url TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
      }, { status: 400 })
    }
    
    // Clear existing vehicles for this client
    await supabase
      .from('vehicles')
      .delete()
      .eq('client_id', clientId)
    
    // Prepare vehicle data for insertion
    const vehicleInserts = vehicles.map(vehicle => ({
      client_id: clientId,
      title: vehicle.title,
      external_id: vehicle.id,
      price: parseFloat(vehicle.price) || 0,
      condition: vehicle.condition,
      availability: vehicle.availability,
      brand: vehicle.brand,
      color: vehicle.color,
      days_on_lot: vehicle.days_on_lot,
      dealer_name: vehicle.dealer_name,
      description: vehicle.description,
      drivetrain: vehicle.drivetrain,
      engine: vehicle.engine,
      image_url: vehicle.image_link,
      mileage: vehicle.mileage_value,
      model: vehicle.model,
      msrp: parseFloat(vehicle.msrp) || 0,
      product_type: vehicle.product_type,
      transmission: vehicle.transmission,
      trim: vehicle.trim,
      vin: vehicle.vin,
      year: vehicle.year,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      listing_url: vehicle.link,
      is_active: vehicle.availability === 'in stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    // Insert vehicles in batches
    const batchSize = 100
    let insertedCount = 0
    
    for (let i = 0; i < vehicleInserts.length; i += batchSize) {
      const batch = vehicleInserts.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert(batch)
        .select('id')
      
      if (error) {
        console.error('Error inserting batch:', error)
        // Continue with next batch
      } else {
        insertedCount += data?.length || 0
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount} vehicles`,
      totalProcessed: vehicles.length,
      insertedCount
    })
    
  } catch (error) {
    console.error('Error importing vehicles:', error)
    return NextResponse.json(
      { error: 'Internal server error during vehicle import' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }
    
    // Group vehicles by category for analysis
    const analysis = {
      total: vehicles?.length || 0,
      byBrand: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      byCondition: {} as Record<string, number>,
      byPriceRange: {
        'under_25k': 0,
        '25k_50k': 0,
        '50k_75k': 0,
        'over_75k': 0
      },
      avgDaysOnLot: 0,
      avgPrice: 0
    }
    
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach((vehicle: any) => {
        // By brand
        analysis.byBrand[vehicle.brand] = (analysis.byBrand[vehicle.brand] || 0) + 1
        
        // By year
        analysis.byYear[vehicle.year] = (analysis.byYear[vehicle.year] || 0) + 1
        
        // By condition
        analysis.byCondition[vehicle.condition] = (analysis.byCondition[vehicle.condition] || 0) + 1
        
        // By price range
        const price = vehicle.price || 0
        if (price < 25000) analysis.byPriceRange.under_25k++
        else if (price < 50000) analysis.byPriceRange['25k_50k']++
        else if (price < 75000) analysis.byPriceRange['50k_75k']++
        else analysis.byPriceRange.over_75k++
      })
      
      // Calculate averages
      const totalDays = vehicles.reduce((sum: number, v: any) => sum + (v.days_on_lot || 0), 0)
      const totalPrice = vehicles.reduce((sum: number, v: any) => sum + (v.price || 0), 0)
      
      analysis.avgDaysOnLot = Math.round(totalDays / vehicles.length)
      analysis.avgPrice = Math.round(totalPrice / vehicles.length)
    }
    
    return NextResponse.json({
      success: true,
      vehicles: vehicles || [],
      analysis
    })
    
  } catch (error) {
    console.error('Error in vehicles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 