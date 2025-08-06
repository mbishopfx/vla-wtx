import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const AI_ASSISTANT_SYSTEM_PROMPT = `You are the VLA Dashboard AI Assistant - an expert automotive marketing intelligence advisor specializing in:

🎯 **CORE EXPERTISE:**
- Google Ads campaign analysis and optimization
- Automotive inventory management and pricing strategies  
- Competitive intelligence and market positioning
- Vehicle merchandising and digital marketing
- Dealership operations and performance optimization

🔧 **AVAILABLE TOOLS & DATA ACCESS:**
- Dashboard: Google Ads CSV analysis, campaign performance insights
- Competitor Intel: Market analysis, threat assessment, competitive positioning
- Inventory Optimizer: Vehicle pricing, demand forecasting, profit optimization
- Nissan Campaign Creator: AI campaign generation, keyword research, ad copy creation
- File Storage: Access to uploaded CSV files, reports, and analysis documents

📊 **DATA SOURCES YOU CAN ACCESS:**
- VLA analysis reports and saved sessions
- Uploaded Google Ads CSV files and campaign data
- Inventory files (CSV/Excel/TSV) with vehicle details
- Competitor analysis reports and market intelligence
- Client files and documents in Supabase storage
- Analytics data and performance metrics

🎯 **YOUR MISSION:**
Help users maximize their automotive marketing ROI by providing:
1. **Campaign Optimization**: Analyze Google Ads data, identify underperforming campaigns, suggest specific improvements
2. **Inventory Insights**: Review vehicle data, recommend pricing adjustments, identify slow-moving inventory
3. **Competitive Strategy**: Analyze competitor intelligence, suggest market positioning strategies
4. **Tool Guidance**: Help users navigate and effectively use all VLA Dashboard features
5. **Data Interpretation**: Explain complex analytics in actionable business terms

🗣️ **COMMUNICATION STYLE:**
- Be conversational but professional
- Provide specific, actionable recommendations
- Use automotive industry terminology appropriately
- Reference actual data when available
- Ask clarifying questions when context is needed
- Offer step-by-step guidance for using tools

💡 **WHEN USERS ASK FOR HELP:**
1. First understand their specific challenge or goal
2. Reference relevant uploaded data or previous analyses if available
3. Provide specific, actionable recommendations
4. Guide them to the right tool for their task
5. Offer to help interpret results or next steps

Remember: You have access to all their uploaded files and analysis data. Always try to provide data-driven insights based on their actual business information when possible.`

const CONTEXT_TEMPLATE = `
Based on the user's question and available data context, provide helpful assistance.

AVAILABLE DATA CONTEXT:
{dataContext}

USER QUESTION:
{question}

RECENT ANALYSES:
{recentAnalyses}

UPLOADED FILES:
{uploadedFiles}

Please provide a helpful, specific response that references their actual data when relevant. If you need more information, ask clarifying questions. Always guide them toward actionable next steps.
`

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Assistant request received...')
    
    const { question, clientId } = await request.json()
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    console.log('📝 Processing question:', question)

    // Initialize LangChain components
    const llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
      maxTokens: 2000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    // Gather context data
    console.log('📊 Gathering context data...')
    const dataContext = await gatherContextData(clientId)
    
    // Create the prompt template
    const promptTemplate = PromptTemplate.fromTemplate(CONTEXT_TEMPLATE)
    
    // Create the chain
    const chain = RunnableSequence.from([
      {
        question: (input: any) => input.question,
        dataContext: (input: any) => input.dataContext,
        recentAnalyses: (input: any) => input.recentAnalyses,
        uploadedFiles: (input: any) => input.uploadedFiles
      },
      promptTemplate,
      llm,
      new StringOutputParser()
    ])

    // Execute the chain
    console.log('🚀 Running AI Assistant chain...')
    const result = await chain.invoke({
      question,
      dataContext: dataContext.context,
      recentAnalyses: dataContext.recentAnalyses,
      uploadedFiles: dataContext.uploadedFiles
    })

    console.log('✅ AI Assistant response generated')

    return NextResponse.json({
      success: true,
      response: result,
      contextUsed: {
        analysesCount: dataContext.recentAnalyses.split('\n').length - 1,
        filesCount: dataContext.uploadedFiles.split('\n').length - 1,
        hasClientContext: !!clientId
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ AI Assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI Assistant request' },
      { status: 500 }
    )
  }
}

async function gatherContextData(clientId?: string) {
  const context = {
    context: '',
    recentAnalyses: '',
    uploadedFiles: ''
  }

  try {
    // Get recent VLA analyses
    console.log('📈 Fetching recent analyses...')
    const { data: analyses, error: analysesError } = await supabase
      .from('vla_analyses')
      .select('session_name, total_impressions, total_clicks, total_cost, average_ctr, average_cpc, created_at, ai_insights')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!analysesError && analyses) {
      context.recentAnalyses = analyses.map(analysis => 
        `${analysis.session_name}: ${analysis.total_clicks} clicks, $${analysis.total_cost} cost, ${analysis.average_ctr}% CTR (${new Date(analysis.created_at).toLocaleDateString()})`
      ).join('\n')
    }

    // Get uploaded files if clientId provided
    if (clientId) {
      console.log('📁 Fetching uploaded files...')
      const { data: files, error: filesError } = await supabase
        .from('client_files')
        .select('filename, original_filename, file_size, upload_date, description')
        .eq('client_id', clientId)
        .order('upload_date', { ascending: false })
        .limit(10)

      if (!filesError && files) {
        context.uploadedFiles = files.map(file => 
          `${file.original_filename} (${(file.file_size / 1024 / 1024).toFixed(1)}MB) - ${file.description || 'No description'} (${new Date(file.upload_date).toLocaleDateString()})`
        ).join('\n')
      }
    }

    // Get competitor data
    console.log('🎯 Fetching competitor data...')
    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('name, threat_level, business_type')
      .limit(5)

    if (!competitorsError && competitors) {
      const competitorInfo = competitors.map(comp => 
        `${comp.name} (${comp.business_type}) - Threat Level: ${comp.threat_level}`
      ).join('\n')
      
      context.context = `Recent competitor intelligence:\n${competitorInfo}\n\n`
    }

    // Add tool capabilities context
    context.context += `
Available VLA Dashboard Tools:
1. Dashboard (/dashboard) - Upload Google Ads CSV files for AI analysis
2. Competitor Intel (/dashboard/agents/competitor-intel) - Market analysis and competitive intelligence
3. Inventory Optimizer (/dashboard/agents/inventory-optimizer) - Vehicle pricing and inventory optimization  
4. Nissan Campaign Creator (/dashboard/tools/nissan-campaign-creator) - AI-powered campaign generation
5. Files Tool (/dashboard/tools/files) - Document management and file storage

Current platform capabilities:
- Real-time Google Ads performance analysis
- Competitive threat assessment and market positioning
- AI-powered inventory pricing optimization
- Automated campaign creation with industry expertise
- Comprehensive file management and data storage
`

  } catch (error) {
    console.error('Error gathering context:', error)
  }

  return context
}

// Additional endpoint for tool-specific help
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tool = searchParams.get('tool')
  
  const toolGuides = {
    dashboard: {
      name: "Dashboard - Google Ads Analysis",
      steps: [
        "Export your Google Ads data as CSV files",
        "Navigate to /dashboard",
        "Click 'Choose Files' and select your CSV exports",
        "Enter a descriptive session name",
        "Click 'Upload & Analyze' to start AI processing",
        "Review the comprehensive analysis and recommendations"
      ],
      tips: [
        "Upload multiple CSV files for comprehensive analysis",
        "Use descriptive session names for easy organization",
        "Export data for at least 30 days for better insights",
        "Include campaign, keyword, and demographic data"
      ]
    },
    "competitor-intel": {
      name: "Competitor Intel",
      steps: [
        "Navigate to /dashboard/agents/competitor-intel",
        "Select your client from the dropdown",
        "Set market parameters (radius, competitor types)",
        "Click 'Run Analysis' to start automated discovery",
        "Review competitor profiles and threat assessments",
        "Implement strategic recommendations"
      ],
      tips: [
        "Run analysis monthly to track competitive changes",
        "Focus on high-threat competitors first",
        "Use insights to adjust pricing and marketing strategies",
        "Monitor new competitors entering your market"
      ]
    },
    "inventory-optimizer": {
      name: "Inventory Optimizer", 
      steps: [
        "Navigate to /dashboard/agents/inventory-optimizer",
        "Upload your inventory file (CSV, Excel, or TSV)",
        "Wait for AI processing and analysis",
        "Review vehicle scoring and recommendations",
        "Implement pricing adjustments and promotions",
        "Monitor performance and re-run monthly"
      ],
      tips: [
        "Include VIN, price, mileage, and vehicle details",
        "Update inventory data weekly for best results",
        "Focus on slow-moving inventory recommendations first",
        "Track the impact of implemented changes"
      ]
    }
  }

  if (tool && toolGuides[tool as keyof typeof toolGuides]) {
    return NextResponse.json({
      success: true,
      guide: toolGuides[tool as keyof typeof toolGuides]
    })
  }

  return NextResponse.json({
    success: true,
    availableTools: Object.keys(toolGuides),
    message: "Use ?tool=toolname to get specific guidance"
  })
} 