import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting competitor analysis...')
    
    const { competitorId, clientId } = await request.json()
    console.log('📝 Request data:', { competitorId, clientId })
    
    if (!competitorId && !clientId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get competitor details
    console.log('📊 Fetching competitors...')
    let competitors = []
    if (competitorId) {
      const { data: competitor, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('id', competitorId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching single competitor:', error)
        throw new Error(`Failed to fetch competitor: ${error.message}`)
      }
      
      if (competitor) competitors = [competitor]
    } else {
      const { data: allCompetitors, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('client_id', clientId)
        .limit(3) // Limit to 3 competitors to avoid timeout
      
      if (error) {
        console.error('❌ Error fetching competitors:', error)
        throw new Error(`Failed to fetch competitors: ${error.message}`)
      }
      
      competitors = allCompetitors || []
    }

    console.log(`📈 Found ${competitors.length} competitors to analyze`)

    if (competitors.length === 0) {
      return NextResponse.json({ error: 'No competitors found' }, { status: 404 })
    }

    // Get client details for context
    console.log('🏢 Fetching client details...')
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError) {
      console.error('❌ Error fetching client:', clientError)
    }

    const analyses = []

    // Analyze each competitor individually with timeout protection
    for (let i = 0; i < competitors.length; i++) {
      const competitor = competitors[i]
      console.log(`🔍 Analyzing competitor ${i + 1}/${competitors.length}: ${competitor.name}`)

      // Focused analysis prompt
      const analysisPrompt = `
Analyze this automotive competitor quickly and concisely:

CLIENT: ${client?.company_name || 'Automotive Dealership'}
COMPETITOR: ${competitor.name}
WEBSITE: ${competitor.website_url || 'N/A'}
BUSINESS TYPE: ${competitor.business_type}
THREAT LEVEL: ${competitor.threat_level}

Provide analysis in these 3 areas:

1. COMPETITIVE POSITION
- Market position and key advantages
- Target customer segments

2. DIGITAL PRESENCE  
- Website and online strategy
- Digital marketing approach

3. STRATEGIC RECOMMENDATIONS
- Main threats they pose to us
- Their vulnerabilities we can exploit
- 3 specific action items to outcompete them

Keep response under 1500 tokens. Be specific and actionable.
      `

      try {
        console.log(`🤖 Calling OpenAI for ${competitor.name}...`)
        
        // Add timeout to OpenAI call using AbortController
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an automotive market intelligence analyst. Provide concise, actionable competitive analysis."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          max_tokens: 1500, // Reduced token limit
          temperature: 0.3,
        }, {
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const analysis = completion.choices[0]?.message?.content || 'Analysis failed to generate'
        console.log(`✅ Analysis completed for ${competitor.name} (${completion.usage?.total_tokens || 0} tokens)`)
        
        // Save analysis to database
        console.log(`💾 Saving analysis for ${competitor.name}...`)
        const { data: savedAnalysis, error: saveError } = await supabase
          .from('competitor_analyses')
          .insert({
            competitor_id: competitor.id,
            client_id: clientId,
            analysis_content: analysis,
            analysis_type: 'comprehensive',
            token_count: completion.usage?.total_tokens || 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (saveError) {
          console.error(`❌ Error saving analysis for ${competitor.name}:`, saveError)
        }

        analyses.push({
          competitor,
          analysis,
          analysis_id: savedAnalysis?.id,
          token_count: completion.usage?.total_tokens || 0
        })

      } catch (error) {
        console.error(`❌ Analysis failed for competitor ${competitor.name}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        analyses.push({
          competitor,
          analysis: `Analysis failed for ${competitor.name}: ${errorMessage}`,
          error: true
        })
      }
    }

    console.log(`🎉 Analysis complete! Processed ${analyses.length} competitors`)
    
    return NextResponse.json({
      success: true,
      analyses,
      total_competitors: competitors.length,
      total_tokens: analyses.reduce((sum, a) => sum + (a.token_count || 0), 0)
    })

  } catch (error) {
    console.error('❌ Competitor analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze competitors', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 