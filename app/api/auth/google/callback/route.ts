import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  
  const tokenUrl = 'https://oauth2.googleapis.com/token'
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return response.json()
}

async function getAnalyticsAccounts(accessToken: string) {
  try {
    const response = await fetch('https://analyticsadmin.googleapis.com/v1beta/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Analytics accounts:', error)
  }
  return null
}

async function getGoogleAdsAccounts(accessToken: string) {
  try {
    // Note: This requires a developer token and proper Google Ads API setup
    const response = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
      }
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Google Ads accounts:', error)
  }
  return null
}

async function getSearchConsoleProperties(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.ok) {
      return response.json()
    }
  } catch (error) {
    console.error('Error fetching Search Console properties:', error)
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This contains the client ID
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_${error}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_oauth_params`
      )
    }

    const clientId = state

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Get user information
    const userInfo = await getUserInfo(tokens.access_token)
    
    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

    // Get available Google services data
    const [analyticsData, adsData, searchConsoleData] = await Promise.all([
      getAnalyticsAccounts(tokens.access_token),
      getGoogleAdsAccounts(tokens.access_token),
      getSearchConsoleProperties(tokens.access_token)
    ])

    // Update client record with OAuth tokens and available services
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        google_oauth_access_token: tokens.access_token,
        google_oauth_refresh_token: tokens.refresh_token || null,
        google_oauth_expires_at: expiresAt.toISOString(),
        google_oauth_scope: tokens.scope,
        google_apis_connected_at: new Date().toISOString(),
        google_apis_last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating client with OAuth tokens:', updateError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=database_update_failed`
      )
    }

    // Create a success response with available services information
    const servicesInfo = {
      analytics: analyticsData?.accounts?.length > 0,
      ads: adsData?.resourceNames?.length > 0,
      searchConsole: searchConsoleData?.siteEntry?.length > 0,
      userEmail: userInfo.email,
      userName: userInfo.name
    }

    // Store services information in a temporary table or session for the setup process
    const { error: servicesError } = await supabase
      .from('client_google_services_temp')
      .upsert({
        client_id: clientId,
        services_data: {
          analytics: analyticsData,
          ads: adsData,
          searchConsole: searchConsoleData,
          userInfo: userInfo
        },
        created_at: new Date().toISOString()
      })

    // Redirect to setup page where client can configure their specific IDs
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/setup/google`)
    redirectUrl.searchParams.set('client', clientId)
    redirectUrl.searchParams.set('connected', 'true')
    redirectUrl.searchParams.set('email', userInfo.email)
    
    if (analyticsData?.accounts?.length > 0) {
      redirectUrl.searchParams.set('analytics', 'available')
    }
    if (adsData?.resourceNames?.length > 0) {
      redirectUrl.searchParams.set('ads', 'available')
    }
    if (searchConsoleData?.siteEntry?.length > 0) {
      redirectUrl.searchParams.set('searchConsole', 'available')
    }

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_callback_failed`
    )
  }
}

// Handle POST requests for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, state } = body

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      )
    }

    const tokens = await exchangeCodeForTokens(code)
    const userInfo = await getUserInfo(tokens.access_token)

    return NextResponse.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
        // Don't return refresh token in response for security
      },
      userInfo: {
        email: userInfo.email,
        name: userInfo.name
      },
      clientId: state
    })

  } catch (error) {
    console.error('Error in OAuth callback POST:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth callback failed' },
      { status: 500 }
    )
  }
} 