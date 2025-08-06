import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const analysisData = await request.json()
    
    // Prepare data for the vla_analyses table structure
    const analysisToSave = {
      session_name: analysisData.session_name || analysisData.name || 'Untitled Analysis',
      session_id: analysisData.session_id || crypto.randomUUID(),
      total_impressions: analysisData.total_impressions || 0,
      total_clicks: analysisData.total_clicks || 0,
      total_cost: analysisData.total_cost || 0,
      total_conversions: analysisData.total_conversions || 0,
      average_ctr: analysisData.average_ctr || 0,
      average_cpc: analysisData.average_cpc || 0,
      average_cpa: analysisData.average_cpa || 0,
      analytics_data: analysisData.analytics_data || analysisData,
      ai_insights: analysisData.ai_insights || null,
      dealership_context: analysisData.dealership_context || null,
      files_processed: analysisData.files_processed || 1,
      analysis_type: analysisData.analysis_type || 'google_ads_campaign',
      status: 'active',
      tags: analysisData.tags || [],
      notes: analysisData.notes || null,
      client_name: analysisData.client_name || 'Unknown Client'
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('vla_analyses')
      .insert(analysisToSave)
      .select()
      .single()

    if (error) {
      console.error('Supabase save error:', error)
      return NextResponse.json(
        { error: 'Failed to save analysis to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis saved successfully',
      analysis: data
    })

  } catch (error) {
    console.error('Save analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    )
  }
} 