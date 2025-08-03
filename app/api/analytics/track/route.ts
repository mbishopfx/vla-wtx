import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      client_id,
      event_name,
      event_data,
      user_id,
      session_id,
      page_url,
      page_title,
      user_agent,
      ip_address,
      timestamp
    } = body

    // Look up client UUID if client_id is a string identifier
    let actualClientId = client_id
    
    if (client_id && typeof client_id === 'string' && !client_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Try to find client by website URL or company name
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .or(`website_url.ilike.%${client_id}%,company_name.ilike.%${client_id}%`)
        .single()
      
      if (client) {
        actualClientId = client.id
      } else {
        console.error('Client not found for identifier:', client_id)
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    // Save analytics event to Supabase
    const { data: analyticsEvent, error: analyticsError } = await supabase
      .from('client_analytics_events')
      .insert({
        client_id: actualClientId,
        event_name,
        event_data: event_data || {},
        user_id,
        session_id,
        page_url,
        page_title,
        user_agent,
        ip_address,
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (analyticsError) {
      console.error('Analytics error:', analyticsError)
      return NextResponse.json(
        { success: false, error: 'Failed to save analytics event' },
        { status: 500 }
      )
    }

    // Update client's analytics summary
    const { error: summaryError } = await supabase
      .rpc('update_client_analytics_summary', {
        p_client_id: actualClientId,
        p_event_name: event_name
      })

    if (summaryError) {
      console.error('Summary update error:', summaryError)
    }

    return NextResponse.json({
      success: true,
      event_id: analyticsEvent.id,
      message: 'Analytics event tracked successfully'
    })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function processEventsToAnalytics(events: any[]) {
  // Initialize counters
  let pageViews = 0
  let vehicleViews = 0
  let leadGeneration = 0
  let phoneClicks = 0
  let totalSessions = 0

  // Track unique sessions for session calculations
  const uniqueSessions = new Set()
  const vehicleViewCounts: { [key: string]: { views: number; inquiries: number } } = {}
  const pageViewCounts: { [key: string]: number } = {}
  const recentEvents: any[] = []

  // Process each event
  events.forEach(event => {
    // Track unique sessions
    if (event.session_id) {
      uniqueSessions.add(event.session_id)
    }

    // Count events by type
    switch (event.event_name) {
      case 'page_view':
        pageViews++
        // Use page_path if available, otherwise extract from page_url
        const pagePath = event.page_path || (event.page_url ? new URL(event.page_url).pathname : '/unknown')
        pageViewCounts[pagePath] = (pageViewCounts[pagePath] || 0) + 1
        break
        
      case 'vehicle_view':
        vehicleViews++
        if (event.event_data?.vehicle_id || event.event_data?.model) {
          const vehicleKey = event.event_data.vehicle_id || 
                           `${event.event_data.year} ${event.event_data.make} ${event.event_data.model}`
          if (!vehicleViewCounts[vehicleKey]) {
            vehicleViewCounts[vehicleKey] = { views: 0, inquiries: 0 }
          }
          vehicleViewCounts[vehicleKey].views++
        }
        break
        
      case 'lead_generation':
        leadGeneration++
        if (event.event_data?.vehicle_id) {
          const vehicleKey = event.event_data.vehicle_id
          if (vehicleViewCounts[vehicleKey]) {
            vehicleViewCounts[vehicleKey].inquiries++
          }
        }
        break
        
      case 'phone_call':
      case 'phone_click':
        phoneClicks++
        break
    }

    // Add to recent events (limit to 10 most recent)
    if (recentEvents.length < 10) {
      recentEvents.push({
        event: event.event_name,
        timestamp: event.timestamp,
        details: event.event_data
      })
    }
  })

  totalSessions = uniqueSessions.size

  // Calculate conversion metrics
  const conversionRate = totalSessions > 0 ? leadGeneration / totalSessions : 0
  const bounceRate = 0.42 // Mock bounce rate for now
  const avgSessionDuration = 180 // Mock average session duration

  // Format top pages
  const topPages = Object.entries(pageViewCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([page, views]) => ({ page, views }))

  // Format top vehicles
  const topVehicles = Object.entries(vehicleViewCounts)
    .sort(([,a], [,b]) => b.views - a.views)
    .slice(0, 5)
    .map(([vehicle, data]) => ({ 
      vehicle, 
      views: data.views, 
      inquiries: data.inquiries 
    }))

  return {
    pageViews,
    vehicleViews,
    leadGeneration,
    phoneClicks,
    totalSessions,
    avgSessionDuration,
    bounceRate,
    conversionRate,
    topPages,
    topVehicles,
    recentEvents: recentEvents.reverse() // Show most recent first
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const eventName = searchParams.get('event_name')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Look up client UUID if client_id is a string identifier
    let actualClientId = clientId
    
    if (clientId && typeof clientId === 'string' && !clientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Try to find client by website URL or company name
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .or(`website_url.ilike.%${clientId}%,company_name.ilike.%${clientId}%`)
        .single()
      
      if (client) {
        actualClientId = client.id
      } else {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    let query = supabase
      .from('client_analytics_events')
      .select('*')
      .eq('client_id', actualClientId)

    if (startDate) {
      query = query.gte('timestamp', startDate)
    }

    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    if (eventName) {
      query = query.eq('event_name', eventName)
    }

    const { data: events, error } = await query
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Analytics fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics events' },
        { status: 500 }
      )
    }

    // Process events into analytics metrics
    const analytics = processEventsToAnalytics(events)

    // Get summary data
    const { data: summary, error: summaryError } = await supabase
      .from('client_analytics_summary')
      .select('*')
      .eq('client_id', actualClientId)
      .single()

    return NextResponse.json({
      success: true,
      events,
      analytics,
      summary: summary || {},
      total_events: events.length
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 