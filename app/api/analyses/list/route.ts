import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get analyses from Supabase, ordered by creation date (newest first)
    const { data: analyses, error } = await supabase
      .from('vla_analyses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase list error:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve analyses from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    })

  } catch (error) {
    console.error('List analyses error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analyses' },
      { status: 500 }
    )
  }
} 