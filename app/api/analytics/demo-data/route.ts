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
    const { clientId } = await request.json()
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const demoEvents = [
      // Page views
      {
        client_id: clientId,
        event_name: 'page_view',
        event_data: {},
        session_id: 'demo-session-001',
        page_url: 'https://nissanofwichitafalls.com/',
        page_title: 'Home - Nissan of Wichita Falls',
        page_path: '/',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        client_id: clientId,
        event_name: 'page_view',
        event_data: {},
        session_id: 'demo-session-002',
        page_url: 'https://nissanofwichitafalls.com/inventory',
        page_title: 'Inventory - Nissan of Wichita Falls',
        page_path: '/inventory',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString() // 1.5 hours ago
      },
      {
        client_id: clientId,
        event_name: 'page_view',
        event_data: {},
        session_id: 'demo-session-003',
        page_url: 'https://nissanofwichitafalls.com/new-vehicles',
        page_title: 'New Vehicles - Nissan of Wichita Falls',
        page_path: '/new-vehicles',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() // 1 hour ago
      },
      {
        client_id: clientId,
        event_name: 'page_view',
        event_data: {},
        session_id: 'demo-session-004',
        page_url: 'https://nissanofwichitafalls.com/service',
        page_title: 'Service - Nissan of Wichita Falls',
        page_path: '/service',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
      },
      {
        client_id: clientId,
        event_name: 'page_view',
        event_data: {},
        session_id: 'demo-session-005',
        page_url: 'https://nissanofwichitafalls.com/inventory',
        page_title: 'Inventory - Nissan of Wichita Falls',
        page_path: '/inventory',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },

      // Vehicle views
      {
        client_id: clientId,
        event_name: 'vehicle_view',
        event_data: {
          make: 'Nissan',
          model: 'Sentra',
          year: 2025,
          price: 22000,
          vehicle_id: '2025-nissan-sentra-001',
          color: 'Gun Metallic'
        },
        session_id: 'demo-session-006',
        page_url: 'https://nissanofwichitafalls.com/inventory/2025-nissan-sentra',
        page_title: '2025 Nissan Sentra - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      },
      {
        client_id: clientId,
        event_name: 'vehicle_view',
        event_data: {
          make: 'Nissan',
          model: 'Rogue',
          year: 2025,
          price: 35000,
          vehicle_id: '2025-nissan-rogue-002',
          color: 'Brilliant Silver'
        },
        session_id: 'demo-session-007',
        page_url: 'https://nissanofwichitafalls.com/inventory/2025-nissan-rogue-002',
        page_title: '2025 Nissan Rogue - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      },
      {
        client_id: clientId,
        event_name: 'vehicle_view',
        event_data: {
          make: 'Nissan',
          model: 'Murano',
          year: 2025,
          price: 42000,
          vehicle_id: '2025-nissan-murano-001',
          color: 'Deep Blue Pearl'
        },
        session_id: 'demo-session-008',
        page_url: 'https://nissanofwichitafalls.com/inventory/2025-nissan-murano',
        page_title: '2025 Nissan Murano - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },

      // Lead generation
      {
        client_id: clientId,
        event_name: 'lead_generation',
        event_data: {
          form_type: 'contact',
          vehicle_id: '2025-nissan-sentra-001',
          lead_source: 'website_form',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@example.com',
          customer_phone: '(940) 555-0234',
          message: 'Interested in scheduling a test drive for the 2025 Sentra'
        },
        session_id: 'demo-session-009',
        page_url: 'https://nissanofwichitafalls.com/contact',
        page_title: 'Contact Us - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        client_id: clientId,
        event_name: 'lead_generation',
        event_data: {
          form_type: 'financing',
          vehicle_id: '2025-nissan-rogue-002',
          lead_source: 'website_form',
          customer_name: 'Michael Davis',
          customer_email: 'michael@example.com',
          customer_phone: '(940) 555-0345',
          message: 'Looking for financing options on the 2025 Rogue'
        },
        session_id: 'demo-session-010',
        page_url: 'https://nissanofwichitafalls.com/financing',
        page_title: 'Financing - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },

      // Phone clicks
      {
        client_id: clientId,
        event_name: 'phone_click',
        event_data: {
          phone_number: '(940) 723-3656',
          click_source: 'header_button'
        },
        session_id: 'demo-session-011',
        page_url: 'https://nissanofwichitafalls.com/inventory',
        page_title: 'Inventory - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
      },
      {
        client_id: clientId,
        event_name: 'phone_click',
        event_data: {
          phone_number: '(940) 723-3656',
          click_source: 'contact_page'
        },
        session_id: 'demo-session-012',
        page_url: 'https://nissanofwichitafalls.com/contact',
        page_title: 'Contact Us - Nissan of Wichita Falls',
        user_agent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString()
      }
    ]

    // Insert all demo events
    const { data, error } = await supabase
      .from('client_analytics_events')
      .insert(demoEvents)

    if (error) {
      console.error('Error inserting demo analytics:', error)
      return NextResponse.json(
        { error: 'Failed to create demo analytics data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${demoEvents.length} demo analytics events`,
      events_created: demoEvents.length
    })

  } catch (error) {
    console.error('Demo data creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 