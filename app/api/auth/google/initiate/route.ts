import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/business.manage' // For Google My Business
]

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

    // Validate required environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google OAuth not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables.' },
        { status: 500 }
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    
    // Build OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES.join(' '))
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', clientId) // Pass client ID to identify which client is connecting
    authUrl.searchParams.set('access_type', 'offline') // Required for refresh tokens
    authUrl.searchParams.set('prompt', 'consent') // Force consent to get refresh token
    authUrl.searchParams.set('include_granted_scopes', 'true') // Include previously granted scopes

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      scopes: GOOGLE_OAUTH_SCOPES,
      clientId,
      redirectUri
    })

  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
}

// Alternative POST method for direct redirect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId in request body' },
        { status: 400 }
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES.join(' '))
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', clientId)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    // Return redirect response
    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('Error in Google OAuth POST:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
} 