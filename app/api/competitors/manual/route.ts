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

interface ManualCompetitorRequest {
  clientId: string
  name: string
  websiteUrl?: string
  businessType: 'online' | 'franchise' | 'dealer_group' | 'local'
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  priorityLevel?: 'low' | 'medium' | 'high' | 'critical'
  threatLevel?: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  estimatedAnnualRevenue?: number
  employeeCountRange?: string
  yearEstablished?: number
  brands?: string[]
  categories?: string[]
}

// Function to get website information using basic web scraping
async function getWebsiteInfo(websiteUrl: string) {
  try {
    // Simple fetch to check if website is accessible
    const response = await fetch(websiteUrl, {
      method: 'HEAD'
    })
    
    return {
      isAccessible: response.ok,
      statusCode: response.status,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      isAccessible: false,
      statusCode: 0,
      lastChecked: new Date().toISOString(),
      error: 'Failed to access website'
    }
  }
}

// Function to geocode address for manual entries with addresses
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return { lat: location.lat, lng: location.lng }
    }
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ManualCompetitorRequest = await request.json()
    const {
      clientId,
      name,
      websiteUrl,
      businessType,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      priorityLevel = 'medium',
      threatLevel = 'medium',
      description,
      estimatedAnnualRevenue,
      employeeCountRange,
      yearEstablished,
      brands = [],
      categories = []
    } = body

    // Validate required fields
    if (!clientId || !name || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, name, and businessType' },
        { status: 400 }
      )
    }

    // Check if competitor already exists for this client
    const { data: existingCompetitor } = await supabase
      .from('competitors')
      .select('id')
      .eq('name', name)
      .eq('client_id', clientId)
      .single()

    if (existingCompetitor) {
      return NextResponse.json(
        { error: 'Competitor with this name already exists for this client' },
        { status: 409 }
      )
    }

    // Get website information if URL provided
    let websiteInfo = null
    if (websiteUrl) {
      websiteInfo = await getWebsiteInfo(websiteUrl)
    }

    // Geocode address if provided
    let coordinates = null
    if (address) {
      coordinates = await geocodeAddress(address)
    }

    // Insert competitor into database
    const competitorData = {
      client_id: clientId,
      name,
      website_url: websiteUrl || null,
      business_type: businessType,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      phone: phone || null,
      email: email || null,
      latitude: coordinates?.lat || null,
      longitude: coordinates?.lng || null,
      priority_level: priorityLevel,
      threat_level: threatLevel,
      discovered_via: 'manual_entry',
      estimated_annual_revenue: estimatedAnnualRevenue || null,
      employee_count_range: employeeCountRange || null,
      year_established: yearEstablished || null
    }

    const { data: newCompetitor, error: competitorError } = await supabase
      .from('competitors')
      .insert(competitorData)
      .select()
      .single()

    if (competitorError) {
      console.error('Error inserting competitor:', competitorError)
      return NextResponse.json(
        { error: 'Failed to create competitor' },
        { status: 500 }
      )
    }

    // Insert competitor brands if provided
    if (brands.length > 0 && newCompetitor) {
      const brandData = brands.map((brand, index) => ({
        competitor_id: newCompetitor.id,
        brand_name: brand,
        is_primary_brand: index === 0 // First brand is primary
      }))

      const { error: brandsError } = await supabase
        .from('competitor_brands')
        .insert(brandData)

      if (brandsError) {
        console.error('Error inserting competitor brands:', brandsError)
      }
    }

    // Insert competitor categories if provided
    if (categories.length > 0 && newCompetitor) {
      const categoryData = categories.map((category, index) => ({
        competitor_id: newCompetitor.id,
        category_name: category,
        is_primary: index === 0 // First category is primary
      }))

      const { error: categoriesError } = await supabase
        .from('competitor_categories')
        .insert(categoryData)

      if (categoriesError) {
        console.error('Error inserting competitor categories:', categoriesError)
      }
    }

    // Create digital presence record if website provided
    if (websiteUrl && newCompetitor) {
      const { error: digitalPresenceError } = await supabase
        .from('competitor_digital_presence')
        .insert({
          competitor_id: newCompetitor.id,
          // Will be populated later by scraping
          last_scraped_at: new Date().toISOString()
        })

      if (digitalPresenceError) {
        console.error('Error creating digital presence record:', digitalPresenceError)
      }
    }

    return NextResponse.json({
      success: true,
      competitor: newCompetitor,
      websiteInfo,
      coordinates,
      metadata: {
        brandsAdded: brands.length,
        categoriesAdded: categories.length,
        hasLocation: !!coordinates,
        hasWebsite: !!websiteUrl
      }
    })

  } catch (error) {
    console.error('Error in manual competitor creation:', error)
    return NextResponse.json(
      { error: 'Internal server error during competitor creation' },
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
        { error: 'Missing clientId parameter' },
        { status: 400 }
      )
    }

    // Get all competitors for this client
    const { data: competitors, error } = await supabase
      .from('competitors')
      .select(`
        *,
        competitor_brands (
          brand_name,
          is_primary_brand
        ),
        competitor_categories (
          category_name,
          is_primary
        ),
        competitor_digital_presence (
          domain_authority,
          estimated_monthly_traffic,
          running_google_ads,
          running_facebook_ads
        )
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching competitors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch competitors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      competitors: competitors || [],
      total: competitors?.length || 0
    })

  } catch (error) {
    console.error('Error in competitor retrieval:', error)
    return NextResponse.json(
      { error: 'Internal server error during competitor retrieval' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { competitorId, ...updateData } = body

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Missing competitorId' },
        { status: 400 }
      )
    }

    // Update competitor
    const { data: updatedCompetitor, error } = await supabase
      .from('competitors')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', competitorId)
      .select()
      .single()

    if (error) {
      console.error('Error updating competitor:', error)
      return NextResponse.json(
        { error: 'Failed to update competitor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      competitor: updatedCompetitor
    })

  } catch (error) {
    console.error('Error in competitor update:', error)
    return NextResponse.json(
      { error: 'Internal server error during competitor update' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitorId')

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Missing competitorId parameter' },
        { status: 400 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('competitors')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', competitorId)

    if (error) {
      console.error('Error deleting competitor:', error)
      return NextResponse.json(
        { error: 'Failed to delete competitor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Competitor deactivated successfully'
    })

  } catch (error) {
    console.error('Error in competitor deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error during competitor deletion' },
      { status: 500 }
    )
  }
} 