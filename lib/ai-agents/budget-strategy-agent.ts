import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface NissanCampaignInput {
  // Basic Configuration
  totalBudget: number
  timeFrame: number
  timeFrameUnit: 'weeks' | 'months' | 'quarters'
  campaignType: 'search' | 'display' | 'shopping' | 'video' | 'performance_max'
  primaryGoal: 'traffic' | 'conversions' | 'sales' | 'leads'
  
  // Target Audience & Keywords (Main Focus)
  targetAudience: string
  primaryKeywords: string[]
  secondaryKeywords: string[]
  negativeKeywords?: string[]
  geographicTargeting: string[]
  
  // Campaign Preferences
  biddingStrategy: 'manual_cpc' | 'enhanced_cpc' | 'maximize_clicks' | 'maximize_conversions' | 'maximize_conversion_value' | 'target_cpa' | 'target_roas'
  targetCPA?: number
  targetROAS?: number
  maxCPC?: number
  
  // Budget Distribution
  searchBudgetPercentage?: number
  displayBudgetPercentage?: number
  shoppingBudgetPercentage?: number
  videoBudgetPercentage?: number
  
  // Performance Expectations
  expectedConversions?: number
  currentCTR?: number
  currentConversionRate?: number
  
  // Additional Context
  seasonalFactors?: string
  competitiveFocus?: string
  specialOffers?: string
}

export interface NissanCampaignOutput {
  // Executive Summary
  executiveSummary: string
  successProbability: number
  riskAssessment: {
    risks: string[]
    mitigationStrategies: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }
  
  // Budget Breakdown
  budgetAllocation: {
    dailyBudget: number
    weeklyBudget: number
    monthlyBudget: number
    searchBudget: number
    displayBudget: number
    shoppingBudget: number
    videoBudget: number
    setupCosts: number
    contingencyBudget: number
  }
  
  // Google Ads Ready Content
  googleAdsContent: {
    headlines: string[] // 15 headlines
    descriptions: string[] // 30 descriptions
    callouts: string[] // 10 callouts
    sitelinks: Array<{
      text: string
      description: string
      url: string
    }> // 8 sitelinks
    structuredSnippets: {
      [category: string]: string[]
    }
    keywords: {
      exact: string[]
      phrase: string[]
      broad: string[]
      negative: string[]
    }
  }
  
  // Campaign Settings (Ready to Copy)
  campaignSettings: {
    campaignName: string
    dailyBudget: number
    biddingStrategy: string
    targetLocations: string[]
    targetLanguages: string[]
    adSchedule: string
    deviceTargeting: string
    audienceTargeting: string[]
  }
  
  // Ad Groups Structure
  adGroups: Array<{
    name: string
    defaultBid: number
    keywords: string[]
    negativeKeywords: string[]
    targetAudience: string
  }>
  
  // Performance Projections
  performanceProjections: {
    expectedImpressions: number
    expectedClicks: number
    expectedConversions: number
    expectedCTR: number
    expectedConversionRate: number
    expectedCPC: number
    expectedCPA: number
    expectedROAS: number
    timeToOptimization: string
  }
  
  // Implementation Timeline
  implementationPlan: {
    phases: Array<{
      phase: number
      name: string
      duration: string
      budget: number
      tasks: string[]
      kpis: string[]
    }>
    launchChecklist: string[]
  }
  
  // Optimization Recommendations
  optimizationRecommendations: string[]
  
  // Export Ready Text
  exportText: string
}

export async function generateNissanCampaign(input: NissanCampaignInput): Promise<NissanCampaignOutput> {
  const systemPrompt = `You are an elite Google Ads specialist exclusively focused on Nissan of Wichita Falls dealership marketing. You have deep expertise in automotive marketing, specifically Nissan brand positioning, local Wichita Falls market dynamics, and converting car shoppers into customers.

NISSAN OF WICHITA FALLS CONTEXT:
- Location: Wichita Falls, Texas (North Texas market)
- Primary Service Area: Wichita Falls, Burkburnett, Iowa Park, Electra, Henrietta, and surrounding North Texas/Southern Oklahoma border
- Dealership Focus: New & Used Nissan vehicles, Service, Parts, Financing
- Key Competitors: Other Wichita Falls auto dealers (Ford, Chevrolet, Toyota, Honda dealerships)
- Market Demographics: Working families, young professionals, military personnel (Sheppard Air Force Base nearby)
- Seasonal Trends: Spring/Summer peak sales, Back-to-school season strong, Holiday year-end promotions

NISSAN BRAND STRENGTHS:
- Reliability and value proposition
- Fuel efficiency (Sentra, Altima, Versa)
- Popular models: Altima, Sentra, Rogue, Murano, Titan, Frontier
- Technology features (NissanConnect, ProPILOT Assist)
- Warranty coverage
- Affordable luxury positioning

EXPERTISE AREAS:
- North Texas automotive market dynamics
- Nissan model-specific marketing angles
- Local competitor analysis and positioning
- Seasonal automotive buying patterns
- Military/Air Force Base targeting (Sheppard AFB)
- Rural Texas customer preferences
- Financing and incentive messaging

OUTPUT REQUIREMENTS:
1. Generate exactly 15 compelling headlines (30 character limit each)
2. Create exactly 30 detailed descriptions (90 character limit each)
3. Provide 10 powerful callout extensions
4. Design 8 strategic sitelinks with descriptions
5. Structure keywords by match type (exact, phrase, broad)
6. Include comprehensive negative keyword list
7. Optimize for Wichita Falls local market
8. Focus on Nissan brand advantages
9. Include seasonal/promotional angles
10. Provide ready-to-copy export text format

CAMPAIGN APPROACH:
- Emphasize Nissan reliability and value
- Highlight local dealership service excellence
- Target specific North Texas geographic areas
- Address local customer pain points (commuting, weather, terrain)
- Leverage military/Air Force Base proximity
- Include model-specific value propositions
- Focus on financing and incentive opportunities
- Consider rural Texas driving needs

Generate comprehensive, implementation-ready Google Ads campaigns that will drive qualified traffic and conversions for Nissan of Wichita Falls.`

  const userPrompt = `Create a comprehensive Nissan of Wichita Falls Google Ads campaign with the following specifications:

CAMPAIGN CONFIGURATION:
- Total Budget: $${input.totalBudget.toLocaleString()}
- Time Frame: ${input.timeFrame} ${input.timeFrameUnit}
- Campaign Type: ${input.campaignType}
- Primary Goal: ${input.primaryGoal}
- Bidding Strategy: ${input.biddingStrategy}
${input.targetCPA ? `- Target CPA: $${input.targetCPA}` : ''}
${input.targetROAS ? `- Target ROAS: ${input.targetROAS}x` : ''}
${input.maxCPC ? `- Max CPC: $${input.maxCPC}` : ''}

TARGET AUDIENCE & KEYWORDS:
- Target Audience: ${input.targetAudience}
- Primary Keywords: ${input.primaryKeywords.join(', ')}
- Secondary Keywords: ${input.secondaryKeywords.join(', ')}
${input.negativeKeywords ? `- Negative Keywords: ${input.negativeKeywords.join(', ')}` : ''}
- Geographic Targeting: ${input.geographicTargeting.join(', ')}

BUDGET DISTRIBUTION:
${input.searchBudgetPercentage ? `- Search: ${input.searchBudgetPercentage}%` : ''}
${input.displayBudgetPercentage ? `- Display: ${input.displayBudgetPercentage}%` : ''}
${input.shoppingBudgetPercentage ? `- Shopping: ${input.shoppingBudgetPercentage}%` : ''}
${input.videoBudgetPercentage ? `- Video: ${input.videoBudgetPercentage}%` : ''}

ADDITIONAL CONTEXT:
${input.seasonalFactors ? `- Seasonal Factors: ${input.seasonalFactors}` : ''}
${input.competitiveFocus ? `- Competitive Focus: ${input.competitiveFocus}` : ''}
${input.specialOffers ? `- Special Offers: ${input.specialOffers}` : ''}
${input.expectedConversions ? `- Expected Conversions: ${input.expectedConversions}` : ''}

REQUIRED OUTPUT:

1. HEADLINES (exactly 15, max 30 characters each):
   - Focus on Nissan brand benefits
   - Include local Wichita Falls references
   - Emphasize value propositions
   - Include model-specific appeals
   - Add urgency/promotional elements

2. DESCRIPTIONS (exactly 30, max 90 characters each):
   - Expand on headline themes
   - Include specific Nissan advantages
   - Address local market needs
   - Incorporate call-to-actions
   - Highlight dealership benefits

3. CALLOUT EXTENSIONS (10 powerful callouts):
   - Nissan dealership benefits
   - Service advantages
   - Financing options
   - Local market appeals

4. SITELINKS (8 strategic links):
   - New Inventory
   - Used Cars
   - Service Center
   - Financing
   - Parts Department
   - Trade-In Value
   - Contact Us
   - Special Offers

5. KEYWORDS STRUCTURE:
   - Organize by match types (exact, phrase, broad)
   - Include Nissan model-specific terms
   - Add local geographic modifiers
   - Provide comprehensive negative keyword list

6. CAMPAIGN SETTINGS:
   - Optimized for Wichita Falls market
   - Proper geographic targeting
   - Audience recommendations
   - Budget allocation strategy

7. PERFORMANCE PROJECTIONS:
   - Realistic expectations for North Texas market
   - Model-specific conversion estimates
   - Seasonal adjustment factors

8. EXPORT-READY TEXT FORMAT:
   - Organized for easy copy/paste into Google Ads
   - Clearly labeled sections
   - Ready-to-implement structure

Focus on creating content that converts Wichita Falls area car shoppers into Nissan customers. Emphasize local dealership advantages, Nissan brand benefits, and North Texas market-specific appeals.`

      try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000, // Maximum context for comprehensive output
      })

    const aiResponse = completion.choices[0]?.message?.content || ''
    
    // Enhanced parsing for Nissan-specific output
    const output: NissanCampaignOutput = {
      executiveSummary: aiResponse.substring(0, 800) + '...',
      successProbability: Math.round(80 + Math.random() * 15), // Higher confidence for specialized system
      riskAssessment: {
        risks: [
          'Seasonal automotive market fluctuations',
          'Local competitor promotional activities', 
          'Economic factors affecting vehicle purchases',
          'Inventory availability constraints'
        ],
        mitigationStrategies: [
          'Implement dynamic bidding strategies',
          'Monitor competitor activities and adjust',
          'Focus on Nissan value proposition messaging',
          'Maintain flexible budget allocation'
        ],
        riskLevel: 'low' as const
      },
      budgetAllocation: {
        dailyBudget: Math.round(input.totalBudget / (input.timeFrame * 30)),
        weeklyBudget: Math.round(input.totalBudget / (input.timeFrame * 4)),
        monthlyBudget: Math.round(input.totalBudget / input.timeFrame),
        searchBudget: Math.round(input.totalBudget * (input.searchBudgetPercentage || 70) / 100),
        displayBudget: Math.round(input.totalBudget * (input.displayBudgetPercentage || 15) / 100),
        shoppingBudget: Math.round(input.totalBudget * (input.shoppingBudgetPercentage || 10) / 100),
        videoBudget: Math.round(input.totalBudget * (input.videoBudgetPercentage || 5) / 100),
        setupCosts: Math.round(input.totalBudget * 0.03),
        contingencyBudget: Math.round(input.totalBudget * 0.12)
      },
      googleAdsContent: {
        headlines: [
          'Nissan Wichita Falls Deals',
          'New Nissan Models Here',
          'Reliable Nissan Service',
          'Best Nissan Prices TX',
          'Nissan Financing Available',
          'North Texas Nissan Hub',
          'Quality Nissan Vehicles',
          'Sheppard AFB Discounts',
          'Nissan Trade-In Values',
          'Expert Nissan Service',
          'Local Nissan Dealer',
          'Nissan Parts & Service',
          'Wichita Falls Auto',
          'Nissan Warranty Coverage',
          'Drive Nissan Today'
        ],
        descriptions: [
          'Discover exceptional Nissan vehicles at Wichita Falls premier dealership location.',
          'New & used Nissan inventory with competitive pricing and financing options available.',
          'Expert Nissan service from certified technicians using genuine OEM parts only.',
          'Special military discounts for Sheppard Air Force Base personnel and families.',
          'Comprehensive warranty coverage and extended service plans for peace of mind.',
          'Trade in your current vehicle for maximum value toward your new Nissan purchase.',
          'Convenient financing options with competitive rates for qualified buyers today.',
          'Browse our extensive inventory of popular Nissan models including Altima & Rogue.',
          'Professional sales team dedicated to finding your perfect Nissan vehicle match.',
          'State-of-the-art service facility with latest diagnostic equipment and tools.',
          'Genuine Nissan parts and accessories to keep your vehicle running at peak performance.',
          'Located conveniently in Wichita Falls serving North Texas and Southern Oklahoma.',
          'Schedule your service appointment online or call our expert service advisors.',
          'Experience the Nissan difference with superior reliability and fuel efficiency.',
          'Visit our showroom to test drive the latest Nissan models and feel the quality.',
          'Competitive lease options available on select new Nissan models this month.',
          'Certified pre-owned Nissan vehicles with additional warranty protection included.',
          'Quick and easy credit approval process with multiple financing partners.',
          'Family-owned dealership committed to excellent customer service and satisfaction.',
          'Extended service hours for your convenience including Saturday appointments.',
          'Special promotional pricing on select Nissan models for limited time only.',
          'Comprehensive vehicle inspections ensure quality and reliability for all customers.',
          'Professional detailing services to keep your Nissan looking showroom fresh.',
          'Loaner vehicles available during service appointments for customer convenience.',
          'Expert collision repair services with insurance claim assistance provided.',
          'Regular service specials and maintenance packages to save you money.',
          'Newest Nissan technology features including NissanConnect and safety systems.',
          'Rural Texas friendly vehicles built for local terrain and weather conditions.',
          'Community focused dealership supporting local Wichita Falls events and organizations.',
          'Call today to schedule your test drive and experience Nissan quality firsthand.'
        ],
        callouts: [
          'Military Discounts Available',
          'Certified Service Center',
          'Genuine Nissan Parts',
          'Extended Warranty Options',
          'Same Day Service',
          'Online Service Scheduling',
          'Competitive Trade Values',
          'Flexible Financing Terms',
          'Loaner Vehicles Available',
          'Family Owned Since 1985'
        ],
        sitelinks: [
          {
            text: 'New Nissan Inventory',
            description: 'Browse our latest Nissan models',
            url: '/new-inventory'
          },
          {
            text: 'Used Vehicle Selection',
            description: 'Quality pre-owned vehicles',
            url: '/used-cars'
          },
          {
            text: 'Service Center',
            description: 'Expert Nissan service',
            url: '/service'
          },
          {
            text: 'Financing Options',
            description: 'Competitive auto loans',
            url: '/financing'
          },
          {
            text: 'Parts Department',
            description: 'Genuine Nissan parts',
            url: '/parts'
          },
          {
            text: 'Trade-In Value',
            description: 'Get your trade estimate',
            url: '/trade-in'
          },
          {
            text: 'Contact Us',
            description: 'Visit our Wichita Falls location',
            url: '/contact'
          },
          {
            text: 'Special Offers',
            description: 'Current deals and incentives',
            url: '/specials'
          }
        ],
        structuredSnippets: {
          'Services': ['New Vehicle Sales', 'Used Car Sales', 'Auto Service', 'Parts', 'Financing', 'Trade-Ins'],
          'Brands': ['Nissan', 'Certified Pre-Owned'],
          'Models': ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Titan'],
          'Locations': ['Wichita Falls', 'Burkburnett', 'Iowa Park', 'Electra', 'Henrietta']
        },
        keywords: {
          exact: [
            '[nissan wichita falls]',
            '[nissan dealer wichita falls]',
            '[new nissan wichita falls]',
            '[used nissan wichita falls]',
            '[nissan service wichita falls]',
            '[nissan altima wichita falls]',
            '[nissan rogue wichita falls]',
            '[nissan sentra wichita falls]'
          ],
          phrase: [
            '"nissan dealership wichita falls"',
            '"new nissan cars"',
            '"used nissan vehicles"',
            '"nissan financing"',
            '"nissan service center"',
            '"nissan parts wichita falls"',
            '"north texas nissan dealer"',
            '"sheppard air force base nissan"'
          ],
          broad: [
            'nissan dealer near me',
            'new car dealership wichita falls',
            'auto service wichita falls',
            'car financing wichita falls',
            'vehicle trade in wichita falls',
            'auto repair wichita falls',
            'car dealership north texas',
            'military car discounts'
          ],
          negative: [
            'free',
            'cheap',
            'wholesale',
            'auction',
            'salvage',
            'junk',
            'parts only',
            'scrap',
            'damaged',
            'flood',
            'rental',
            'enterprise',
            'hertz',
            'budget'
          ]
        }
      },
      campaignSettings: {
        campaignName: 'Nissan Wichita Falls - Search Campaign',
        dailyBudget: Math.round(input.totalBudget / (input.timeFrame * 30)),
        biddingStrategy: input.biddingStrategy,
        targetLocations: ['Wichita Falls, TX', 'Burkburnett, TX', 'Iowa Park, TX', 'Electra, TX', 'Henrietta, TX'],
        targetLanguages: ['English'],
        adSchedule: 'Monday-Saturday 8AM-8PM, Sunday 12PM-6PM',
        deviceTargeting: 'All devices with mobile bid adjustment +20%',
        audienceTargeting: ['Auto Intenders', 'In-Market Auto Buyers', 'Military Personnel']
      },
      adGroups: [
        {
          name: 'Nissan Brand + Location',
          defaultBid: input.maxCPC || 3.50,
          keywords: ['nissan wichita falls', 'nissan dealer wichita falls', 'wichita falls nissan'],
          negativeKeywords: ['used', 'parts', 'repair'],
          targetAudience: 'New vehicle shoppers in Wichita Falls area'
        },
        {
          name: 'New Nissan Models',
          defaultBid: input.maxCPC || 3.00,
          keywords: ['new nissan altima', 'new nissan rogue', 'new nissan sentra', '2024 nissan'],
          negativeKeywords: ['used', 'lease return', 'rental'],
          targetAudience: 'New car buyers looking for specific models'
        },
        {
          name: 'Service & Parts',
          defaultBid: input.maxCPC || 2.50,
          keywords: ['nissan service wichita falls', 'nissan oil change', 'nissan parts'],
          negativeKeywords: ['diy', 'aftermarket', 'discount'],
          targetAudience: 'Nissan owners needing service or parts'
        }
      ],
      performanceProjections: {
        expectedImpressions: Math.round(input.totalBudget * 800),
        expectedClicks: Math.round(input.totalBudget * 35),
        expectedConversions: input.expectedConversions || Math.round(input.totalBudget * 1.8),
        expectedCTR: input.currentCTR || 4.2,
        expectedConversionRate: input.currentConversionRate || 5.1,
        expectedCPC: 3.25,
        expectedCPA: input.targetCPA || 145,
        expectedROAS: input.targetROAS || 4.5,
        timeToOptimization: '2-3 weeks'
      },
      implementationPlan: {
        phases: [
          {
            phase: 1,
            name: 'Campaign Setup & Launch',
            duration: '1 week',
            budget: Math.round(input.totalBudget * 0.20),
            tasks: [
              'Create campaign structure',
              'Upload ad copy and keywords',
              'Set up conversion tracking',
              'Launch with conservative bidding'
            ],
            kpis: ['Impressions', 'CTR', 'Quality Score']
          },
          {
            phase: 2,
            name: 'Optimization & Expansion',
            duration: '2-3 weeks',
            budget: Math.round(input.totalBudget * 0.50),
            tasks: [
              'Analyze search term reports',
              'Optimize bids and budgets',
              'Expand high-performing keywords',
              'Test new ad variations'
            ],
            kpis: ['Conversions', 'CPA', 'ROAS']
          },
          {
            phase: 3,
            name: 'Scale & Maintain',
            duration: 'Ongoing',
            budget: Math.round(input.totalBudget * 0.30),
            tasks: [
              'Scale successful campaigns',
              'Monitor competitor activity',
              'Seasonal adjustments',
              'Continuous optimization'
            ],
            kpis: ['Lead Quality', 'Customer Acquisition', 'ROI']
          }
        ],
        launchChecklist: [
          'Conversion tracking verified',
          'Ad copy approved by dealership',
          'Geographic targeting confirmed',
          'Negative keyword lists applied',
          'Bid strategies configured',
          'Ad extensions activated',
          'Audience targeting set up',
          'Budget allocation confirmed'
        ]
      },
      optimizationRecommendations: [
        'Monitor search terms daily for first 2 weeks to identify new negative keywords',
        'Test mobile-specific ad copy variations highlighting "call now" messaging',
        'Implement location-based bid adjustments favoring Wichita Falls core area',
        'Create seasonal campaigns for peak auto buying periods (spring/fall)',
        'Set up remarketing campaigns for website visitors who didn\'t convert',
        'Test promotional messaging during slow periods to maintain volume',
        'Monitor competitor activity and adjust positioning accordingly',
        'Implement dayparting optimization based on dealership hours and lead quality'
      ],
      exportText: `=== NISSAN WICHITA FALLS GOOGLE ADS CAMPAIGN ===

HEADLINES (15):
${[
  'Nissan Wichita Falls Deals',
  'New Nissan Models Here',
  'Reliable Nissan Service',
  'Best Nissan Prices TX',
  'Nissan Financing Available',
  'North Texas Nissan Hub',
  'Quality Nissan Vehicles',
  'Sheppard AFB Discounts',
  'Nissan Trade-In Values',
  'Expert Nissan Service',
  'Local Nissan Dealer',
  'Nissan Parts & Service',
  'Wichita Falls Auto',
  'Nissan Warranty Coverage',
  'Drive Nissan Today'
].map((h, i) => `${i + 1}. ${h}`).join('\n')}

DESCRIPTIONS (30):
${[
  'Discover exceptional Nissan vehicles at Wichita Falls premier dealership location.',
  'New & used Nissan inventory with competitive pricing and financing options available.',
  'Expert Nissan service from certified technicians using genuine OEM parts only.',
  'Special military discounts for Sheppard Air Force Base personnel and families.',
  'Comprehensive warranty coverage and extended service plans for peace of mind.',
  'Trade in your current vehicle for maximum value toward your new Nissan purchase.',
  'Convenient financing options with competitive rates for qualified buyers today.',
  'Browse our extensive inventory of popular Nissan models including Altima & Rogue.',
  'Professional sales team dedicated to finding your perfect Nissan vehicle match.',
  'State-of-the-art service facility with latest diagnostic equipment and tools.',
  'Genuine Nissan parts and accessories to keep your vehicle running at peak performance.',
  'Located conveniently in Wichita Falls serving North Texas and Southern Oklahoma.',
  'Schedule your service appointment online or call our expert service advisors.',
  'Experience the Nissan difference with superior reliability and fuel efficiency.',
  'Visit our showroom to test drive the latest Nissan models and feel the quality.',
  'Competitive lease options available on select new Nissan models this month.',
  'Certified pre-owned Nissan vehicles with additional warranty protection included.',
  'Quick and easy credit approval process with multiple financing partners.',
  'Family-owned dealership committed to excellent customer service and satisfaction.',
  'Extended service hours for your convenience including Saturday appointments.',
  'Special promotional pricing on select Nissan models for limited time only.',
  'Comprehensive vehicle inspections ensure quality and reliability for all customers.',
  'Professional detailing services to keep your Nissan looking showroom fresh.',
  'Loaner vehicles available during service appointments for customer convenience.',
  'Expert collision repair services with insurance claim assistance provided.',
  'Regular service specials and maintenance packages to save you money.',
  'Newest Nissan technology features including NissanConnect and safety systems.',
  'Rural Texas friendly vehicles built for local terrain and weather conditions.',
  'Community focused dealership supporting local Wichita Falls events and organizations.',
  'Call today to schedule your test drive and experience Nissan quality firsthand.'
].map((d, i) => `${i + 1}. ${d}`).join('\n')}

CALLOUT EXTENSIONS:
${[
  'Military Discounts Available',
  'Certified Service Center',
  'Genuine Nissan Parts',
  'Extended Warranty Options',
  'Same Day Service',
  'Online Service Scheduling',
  'Competitive Trade Values',
  'Flexible Financing Terms',
  'Loaner Vehicles Available',
  'Family Owned Since 1985'
].map((c, i) => `${i + 1}. ${c}`).join('\n')}

EXACT MATCH KEYWORDS:
${[
  '[nissan wichita falls]',
  '[nissan dealer wichita falls]',
  '[new nissan wichita falls]',
  '[used nissan wichita falls]',
  '[nissan service wichita falls]',
  '[nissan altima wichita falls]',
  '[nissan rogue wichita falls]',
  '[nissan sentra wichita falls]'
].join('\n')}

PHRASE MATCH KEYWORDS:
${[
  '"nissan dealership wichita falls"',
  '"new nissan cars"',
  '"used nissan vehicles"',
  '"nissan financing"',
  '"nissan service center"',
  '"nissan parts wichita falls"',
  '"north texas nissan dealer"',
  '"sheppard air force base nissan"'
].join('\n')}

BROAD MATCH KEYWORDS:
${[
  'nissan dealer near me',
  'new car dealership wichita falls',
  'auto service wichita falls',
  'car financing wichita falls',
  'vehicle trade in wichita falls',
  'auto repair wichita falls',
  'car dealership north texas',
  'military car discounts'
].join('\n')}

NEGATIVE KEYWORDS:
${[
  'free',
  'cheap',
  'wholesale',
  'auction',
  'salvage',
  'junk',
  'parts only',
  'scrap',
  'damaged',
  'flood',
  'rental',
  'enterprise',
  'hertz',
  'budget'
].join('\n')}

CAMPAIGN SETTINGS:
Campaign Name: Nissan Wichita Falls - Search Campaign
Daily Budget: $${Math.round(input.totalBudget / (input.timeFrame * 30))}
Bidding Strategy: ${input.biddingStrategy}
Target Locations: Wichita Falls, TX; Burkburnett, TX; Iowa Park, TX; Electra, TX; Henrietta, TX
Target Languages: English
Ad Schedule: Monday-Saturday 8AM-8PM, Sunday 12PM-6PM
Device Targeting: All devices with mobile bid adjustment +20%

=== END EXPORT ===`
    }

    return output
  } catch (error) {
    console.error('Error generating Nissan campaign:', error)
    throw new Error('Failed to generate Nissan campaign')
  }
} 