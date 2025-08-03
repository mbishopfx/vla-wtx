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

export async function GET(request: NextRequest) {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      clients: clients || []
    })

  } catch (error) {
    console.error('Error in clients API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name,
      business_type = 'dealership',
      contact_email,
      contact_phone,
      website_url,
      address,
      city,
      state,
      zip_code,
      google_analytics_property_id,
      google_ads_customer_id
    } = body

    // Validate required fields
    if (!company_name || !website_url) {
      return NextResponse.json(
        { error: 'Company name and website URL are required' },
        { status: 400 }
      )
    }

    // Check if client already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('website_url', website_url)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Client with this website URL already exists' },
        { status: 409 }
      )
    }

    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
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
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: newClient
    })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: updatedClient
    })

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 