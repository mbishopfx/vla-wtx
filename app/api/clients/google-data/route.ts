import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ClientTokens {
  google_oauth_access_token: string
  google_oauth_refresh_token?: string
  google_oauth_expires_at: string
  google_analytics_property_id?: string
  google_ads_customer_id?: string
  google_search_console_domain?: string
}

// Function to refresh access token if expired
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const data = await response.json()
  return data.access_token
}

// Function to get valid access token (refresh if needed)
async function getValidAccessToken(clientId: string): Promise<string> {
  const { data: client, error } = await supabase
    .from('clients')
    .select('google_oauth_access_token, google_oauth_refresh_token, google_oauth_expires_at')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    throw new Error('Client not found or not connected to Google')
  }

  const expiresAt = new Date(client.google_oauth_expires_at)
  const now = new Date()

  // If token is still valid, return it
  if (expiresAt > now) {
    return client.google_oauth_access_token
  }

  // Token expired, refresh it
  if (!client.google_oauth_refresh_token) {
    throw new Error('No refresh token available. Client needs to reconnect.')
  }

  const newAccessToken = await refreshAccessToken(client.google_oauth_refresh_token)
  
  // Update the database with new token
  const newExpiresAt = new Date(Date.now() + (3600 * 1000)) // 1 hour from now
  await supabase
    .from('clients')
    .update({
      google_oauth_access_token: newAccessToken,
      google_oauth_expires_at: newExpiresAt.toISOString(),
      google_apis_last_sync: new Date().toISOString()
    })
    .eq('id', clientId)

  return newAccessToken
}

// Function to fetch Google Analytics data
async function fetchAnalyticsData(accessToken: string, propertyId: string) {
  try {
    // Get basic metrics for last 30 days
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'date' }]
      })
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Analytics data:', error)
  }
  return null
}

// Function to fetch Google Ads data
async function fetchAdsData(accessToken: string, customerId: string) {
  try {
    // Remove dashes from customer ID if present
    const cleanCustomerId = customerId.replace(/-/g, '')
    
    const response = await fetch(`https://googleads.googleapis.com/v14/customers/${cleanCustomerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
      },
      body: JSON.stringify({
        query: `
          SELECT 
            campaign.id,
            campaign.name,
            campaign.status,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr,
            segments.date
          FROM campaign 
          WHERE segments.date DURING LAST_30_DAYS
          ORDER BY segments.date DESC
        `
      })
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Ads data:', error)
  }
  return null
}

// Function to fetch Search Console data
async function fetchSearchConsoleData(accessToken: string, siteUrl: string) {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date', 'query'],
        rowLimit: 100
      })
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Search Console data:', error)
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const service = searchParams.get('service') // 'analytics', 'ads', 'searchConsole', or 'all'

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId parameter' },
        { status: 400 }
      )
    }

    // Get client's Google API configuration
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        google_analytics_property_id,
        google_ads_customer_id,
        google_search_console_domain,
        google_oauth_access_token,
        google_oauth_refresh_token,
        google_oauth_expires_at,
        google_apis_connected_at
      `)
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!client.google_oauth_access_token) {
      return NextResponse.json(
        { error: 'Client not connected to Google APIs. Please complete OAuth flow first.' },
        { status: 401 }
      )
    }

    // Get valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(clientId)

    // Fetch requested data
    const results: any = {
      clientId,
      connectedAt: client.google_apis_connected_at,
      services: {}
    }

    if (service === 'analytics' || service === 'all') {
      if (client.google_analytics_property_id) {
        results.services.analytics = await fetchAnalyticsData(
          accessToken, 
          client.google_analytics_property_id
        )
      }
    }

    if (service === 'ads' || service === 'all') {
      if (client.google_ads_customer_id) {
        results.services.ads = await fetchAdsData(
          accessToken,
          client.google_ads_customer_id
        )
      }
    }

    if (service === 'searchConsole' || service === 'all') {
      if (client.google_search_console_domain) {
        results.services.searchConsole = await fetchSearchConsoleData(
          accessToken,
          client.google_search_console_domain
        )
      }
    }

    // Update last sync timestamp
    await supabase
      .from('clients')
      .update({ google_apis_last_sync: new Date().toISOString() })
      .eq('id', clientId)

    return NextResponse.json({
      success: true,
      data: results,
      availableServices: {
        analytics: !!client.google_analytics_property_id,
        ads: !!client.google_ads_customer_id,
        searchConsole: !!client.google_search_console_domain
      }
    })

  } catch (error) {
    console.error('Error fetching Google data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Google data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, googleAnalyticsPropertyId, googleAdsCustomerId, googleSearchConsoleDomain } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId' },
        { status: 400 }
      )
    }

    // Update client with their Google service IDs
    const updateData: any = {}
    
    if (googleAnalyticsPropertyId) {
      updateData.google_analytics_property_id = googleAnalyticsPropertyId
    }
    if (googleAdsCustomerId) {
      updateData.google_ads_customer_id = googleAdsCustomerId
    }
    if (googleSearchConsoleDomain) {
      updateData.google_search_console_domain = googleSearchConsoleDomain
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update client Google service IDs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Google service IDs updated successfully'
    })

  } catch (error) {
    console.error('Error updating Google service IDs:', error)
    return NextResponse.json(
      { error: 'Failed to update Google service IDs' },
      { status: 500 }
    )
  }
} 