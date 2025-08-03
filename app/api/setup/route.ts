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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'full_setup' } = body
    
    let results = {
      clientCreated: false,
      vehiclesImported: false,
      clientId: '',
      vehicleCount: 0,
      errors: [] as string[]
    }
    
    // Step 1: Create Nissan of Wichita Falls client
    try {
      // Check if client already exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('website_url', 'https://www.nissanofwichitafalls.com')
        .single()
      
      if (existingClient) {
        results.clientId = existingClient.id
        results.clientCreated = false // Already existed
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            company_name: 'Nissan of Wichita Falls',
            business_type: 'dealership',
            contact_email: 'info@nissanofwichitafalls.com',
            contact_phone: '(940) 691-6888',
            website_url: 'https://www.nissanofwichitafalls.com',
            address: '4000 Kell Blvd.',
            city: 'Wichita Falls',
            state: 'TX',
            zip_code: '76309',
            google_analytics_property_id: '376755287',
            google_ads_customer_id: '789-139-9350',
            is_active: true
          })
          .select('id')
          .single()
        
        if (clientError) {
          results.errors.push(`Client creation error: ${clientError.message}`)
        } else {
          results.clientId = newClient.id
          results.clientCreated = true
        }
      }
    } catch (error) {
      results.errors.push(`Client setup error: ${error}`)
    }
    
    // Step 2: Import vehicle data if we have a client ID
    if (results.clientId && action === 'full_setup') {
      try {
        // Read the TSV file
        const filePath = path.join(process.cwd(), 'products_2025-08-03_01:35:31.tsv')
        
        if (fs.existsSync(filePath)) {
          const tsvContent = fs.readFileSync(filePath, 'utf-8')
          
          // Call the vehicle import API internally
          const importResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/vehicles/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: results.clientId,
              tsvContent
            })
          })
          
          if (importResponse.ok) {
            const importData = await importResponse.json()
            results.vehiclesImported = true
            results.vehicleCount = importData.insertedCount || 0
          } else {
            const errorText = await importResponse.text()
            results.errors.push(`Vehicle import error: ${errorText}`)
          }
        } else {
          results.errors.push('TSV file not found at expected location')
        }
      } catch (error) {
        results.errors.push(`Vehicle import error: ${error}`)
      }
    }
    
    return NextResponse.json({
      success: results.errors.length === 0,
      message: `Setup completed. Client ${results.clientCreated ? 'created' : 'already exists'}. ${results.vehiclesImported ? `${results.vehicleCount} vehicles imported.` : 'No vehicles imported.'}`,
      results
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error during setup' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get setup status
    const { data: clients } = await supabase
      .from('clients')
      .select('id, company_name, website_url')
      .eq('is_active', true)
    
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, client_id')
      .eq('is_active', true)
    
    const setupStatus = {
      clientsCount: clients?.length || 0,
      vehiclesCount: vehicles?.length || 0,
      clients: clients || [],
      isSetupComplete: (clients?.length || 0) > 0 && (vehicles?.length || 0) > 0
    }
    
    return NextResponse.json({
      success: true,
      setupStatus
    })
    
  } catch (error) {
    console.error('Error checking setup status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 