import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateNissanCampaign, NissanCampaignInput } from '@/lib/ai-agents/budget-strategy-agent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🚗 Starting Nissan campaign generation...')
    
    const body = await request.json()
    console.log('📝 Request data:', body)
    
    const { 
      strategyName,
      ...campaignInput 
    } = body as { 
      strategyName: string
    } & NissanCampaignInput
    
    if (!campaignInput.totalBudget || !campaignInput.timeFrame) {
      return NextResponse.json({ 
        error: 'Missing required parameters: totalBudget and timeFrame are required' 
      }, { status: 400 })
    }

    console.log('🏢 Processing for Nissan of Wichita Falls...')

    // Start AI processing
    console.log('🤖 Generating Nissan campaign with AI...')
    const startTime = Date.now()
    
    // Create initial database record - no client_id needed for Nissan campaigns
    const { data: strategyRecord, error: insertError } = await supabase
      .from('budget_strategies')
      .insert({
        strategy_name: strategyName || `Nissan Campaign ${new Date().toLocaleDateString()}`,
        total_budget: campaignInput.totalBudget,
        time_frame: campaignInput.timeFrame,
        time_frame_unit: campaignInput.timeFrameUnit || 'months',
        campaign_type: campaignInput.campaignType,
        primary_goal: campaignInput.primaryGoal,
        target_audience: campaignInput.targetAudience,
        geographic_targeting: campaignInput.geographicTargeting,
        bidding_strategy: campaignInput.biddingStrategy,
        target_cpa: campaignInput.targetCPA,
        target_roas: campaignInput.targetROAS,
        max_cpc: campaignInput.maxCPC,
        keyword_research_focus: campaignInput.primaryKeywords,
        negative_keywords: campaignInput.negativeKeywords || [],
        search_budget_percentage: campaignInput.searchBudgetPercentage || 70,
        display_budget_percentage: campaignInput.displayBudgetPercentage || 15,
        shopping_budget_percentage: campaignInput.shoppingBudgetPercentage || 10,
        video_budget_percentage: campaignInput.videoBudgetPercentage || 5,
        expected_conversions: campaignInput.expectedConversions,
        ai_processing_status: 'processing',
        ai_processing_started_at: new Date().toISOString(),
        status: 'draft'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating strategy record:', insertError)
      return NextResponse.json({ error: 'Failed to create strategy record' }, { status: 500 })
    }

    console.log('💾 Strategy record created:', strategyRecord.id)

    try {
      // Generate AI campaign for Nissan
      const aiCampaign = await generateNissanCampaign(campaignInput)

      const endTime = Date.now()
      const processingDuration = Math.round((endTime - startTime) / 1000)

      console.log('✅ AI campaign generated successfully')
      console.log(`⏱️ Processing time: ${processingDuration} seconds`)

      // Update strategy record with AI results
      const { data: updatedStrategy, error: updateError } = await supabase
        .from('budget_strategies')
        .update({
          ai_strategy_analysis: aiCampaign,
          optimization_recommendations: aiCampaign.optimizationRecommendations,
          success_probability: aiCampaign.successProbability,
          risk_assessment: aiCampaign.riskAssessment,
          daily_budget: aiCampaign.budgetAllocation.dailyBudget,
          weekly_budget: aiCampaign.budgetAllocation.weeklyBudget,
          monthly_budget: aiCampaign.budgetAllocation.monthlyBudget,
          expected_impressions: aiCampaign.performanceProjections.expectedImpressions,
          expected_clicks: aiCampaign.performanceProjections.expectedClicks,
          expected_conversions: aiCampaign.performanceProjections.expectedConversions,
          expected_ctr: aiCampaign.performanceProjections.expectedCTR,
          expected_conversion_rate: aiCampaign.performanceProjections.expectedConversionRate,
          campaign_structure: aiCampaign.adGroups,
          ad_extensions_config: aiCampaign.googleAdsContent.sitelinks,
          launch_phases: aiCampaign.implementationPlan.phases,
          optimization_schedule: aiCampaign.implementationPlan,
          setup_costs: aiCampaign.budgetAllocation.setupCosts,
          contingency_budget: aiCampaign.budgetAllocation.contingencyBudget,
          ai_processing_status: 'completed',
          ai_processing_completed_at: new Date().toISOString(),
          ai_processing_duration_seconds: processingDuration,
          status: 'active'
        })
        .eq('id', strategyRecord.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating strategy with AI results:', updateError)
        throw updateError
      }

      console.log('🎉 Nissan campaign generation completed successfully!')

      return NextResponse.json({
        success: true,
        strategy: updatedStrategy,
        aiCampaign: aiCampaign,
        processingTime: processingDuration,
        message: 'Nissan campaign generated successfully'
      })

    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Update record to reflect failure
      await supabase
        .from('budget_strategies')
        .update({
          ai_processing_status: 'failed',
          ai_processing_completed_at: new Date().toISOString(),
          ai_processing_duration_seconds: Math.round((Date.now() - startTime) / 1000),
          status: 'draft'
        })
        .eq('id', strategyRecord.id)

      return NextResponse.json({ 
        error: 'Failed to generate AI campaign',
        details: aiError instanceof Error ? aiError.message : 'Unknown error',
        strategyId: strategyRecord.id 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Nissan campaign generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exportFormat = searchParams.get('export')
    const strategyId = searchParams.get('strategyId')
    
    if (exportFormat === 'txt' && strategyId) {
      console.log('📄 Exporting strategy as TXT:', strategyId)

      const { data: strategy, error } = await supabase
        .from('budget_strategies')
        .select('*')
        .eq('id', strategyId)
        .single()

      if (error || !strategy) {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
      }

      const aiCampaign = strategy.ai_strategy_analysis
      if (!aiCampaign || !aiCampaign.exportText) {
        return NextResponse.json({ error: 'Export data not available' }, { status: 404 })
      }

      return new NextResponse(aiCampaign.exportText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="nissan-campaign-${strategy.strategy_name.replace(/[^a-zA-Z0-9]/g, '-')}.txt"`
        }
      })
    }

    console.log('📋 Fetching Nissan campaign strategies...')

    const { data: strategies, error } = await supabase
      .from('budget_strategies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching strategies:', error)
      return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 })
    }

    console.log(`✅ Found ${strategies.length} strategies`)

    return NextResponse.json({
      success: true,
      strategies,
      count: strategies.length
    })

  } catch (error) {
    console.error('❌ Error in GET endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 