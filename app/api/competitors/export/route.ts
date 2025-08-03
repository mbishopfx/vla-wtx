import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ExportRequest {
  clientId: string
  format: 'csv' | 'json' | 'pdf'
  includeAnalyses?: boolean
  competitorIds?: string[]
  filters?: {
    businessType?: string
    priorityLevel?: string
    threatLevel?: string
    discoveredVia?: string
  }
}

async function getCompetitorData(clientId: string, filters?: any, competitorIds?: string[]) {
  let query = supabase
    .from('competitors')
    .select(`
      *,
      competitor_brands (
        brand_name,
        is_primary_brand,
        estimated_inventory_count
      ),
      competitor_categories (
        category_name,
        is_primary
      ),
      competitor_digital_presence (
        facebook_url,
        facebook_followers,
        instagram_url,
        instagram_followers,
        domain_authority,
        estimated_monthly_traffic,
        running_google_ads,
        running_facebook_ads,
        estimated_ad_spend_monthly
      ),
      competitor_analyses (
        analysis_type,
        analysis_title,
        key_findings,
        strategic_recommendations,
        threat_assessment,
        opportunity_score,
        completed_at
      )
    `)
    .eq('client_id', clientId)
    .eq('is_active', true)

  if (competitorIds && competitorIds.length > 0) {
    query = query.in('id', competitorIds)
  }

  if (filters) {
    if (filters.businessType) {
      query = query.eq('business_type', filters.businessType)
    }
    if (filters.priorityLevel) {
      query = query.eq('priority_level', filters.priorityLevel)
    }
    if (filters.threatLevel) {
      query = query.eq('threat_level', filters.threatLevel)
    }
    if (filters.discoveredVia) {
      query = query.eq('discovered_via', filters.discoveredVia)
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch competitor data: ${error.message}`)
  }

  return data || []
}

function convertToCSV(competitors: any[]): string {
  if (competitors.length === 0) {
    return 'No competitors found'
  }

  // Define CSV headers
  const headers = [
    'Name',
    'Business Type',
    'Website',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Phone',
    'Google Rating',
    'Review Count',
    'Distance (miles)',
    'Priority Level',
    'Threat Level',
    'Discovered Via',
    'Brands',
    'Categories',
    'Digital Authority',
    'Monthly Traffic',
    'Running Ads',
    'Last Analyzed',
    'Created Date'
  ]

  // Convert data to CSV rows
  const rows = competitors.map(competitor => {
    const brands = competitor.competitor_brands
      ?.map((b: any) => b.brand_name)
      .join('; ') || ''
    
    const categories = competitor.competitor_categories
      ?.map((c: any) => c.category_name)
      .join('; ') || ''

    const digitalPresence = competitor.competitor_digital_presence?.[0]
    
    return [
      competitor.name || '',
      competitor.business_type || '',
      competitor.website_url || '',
      competitor.address || '',
      competitor.city || '',
      competitor.state || '',
      competitor.zip_code || '',
      competitor.phone || '',
      competitor.google_rating || '',
      competitor.google_review_count || '',
      competitor.distance_from_client || '',
      competitor.priority_level || '',
      competitor.threat_level || '',
      competitor.discovered_via || '',
      brands,
      categories,
      digitalPresence?.domain_authority || '',
      digitalPresence?.estimated_monthly_traffic || '',
      digitalPresence?.running_google_ads ? 'Yes' : 'No',
      competitor.last_analyzed_at ? new Date(competitor.last_analyzed_at).toLocaleDateString() : '',
      new Date(competitor.created_at).toLocaleDateString()
    ].map(field => {
      // Escape commas and quotes in CSV
      const stringField = String(field)
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`
      }
      return stringField
    })
  })

  // Combine headers and rows
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

function createJSONExport(competitors: any[]): any {
  return {
    exportMetadata: {
      exportDate: new Date().toISOString(),
      totalCompetitors: competitors.length,
      format: 'json'
    },
    competitors: competitors.map(competitor => ({
      id: competitor.id,
      basicInfo: {
        name: competitor.name,
        businessType: competitor.business_type,
        website: competitor.website_url,
        priorityLevel: competitor.priority_level,
        threatLevel: competitor.threat_level,
        discoveredVia: competitor.discovered_via
      },
      location: {
        address: competitor.address,
        city: competitor.city,
        state: competitor.state,
        zipCode: competitor.zip_code,
        latitude: competitor.latitude,
        longitude: competitor.longitude,
        distanceFromClient: competitor.distance_from_client
      },
      contact: {
        phone: competitor.phone,
        email: competitor.email
      },
      googleData: {
        rating: competitor.google_rating,
        reviewCount: competitor.google_review_count,
        photosCount: competitor.google_photos_count,
        placeId: competitor.google_place_id
      },
      brands: competitor.competitor_brands?.map((b: any) => ({
        name: b.brand_name,
        isPrimary: b.is_primary_brand,
        estimatedInventory: b.estimated_inventory_count
      })) || [],
      categories: competitor.competitor_categories?.map((c: any) => ({
        name: c.category_name,
        isPrimary: c.is_primary
      })) || [],
      digitalPresence: competitor.competitor_digital_presence?.[0] || {},
      analyses: competitor.competitor_analyses?.map((a: any) => ({
        type: a.analysis_type,
        title: a.analysis_title,
        keyFindings: a.key_findings,
        recommendations: a.strategic_recommendations,
        threatAssessment: a.threat_assessment,
        opportunityScore: a.opportunity_score,
        completedAt: a.completed_at
      })) || [],
      metadata: {
        createdAt: competitor.created_at,
        updatedAt: competitor.updated_at,
        lastAnalyzedAt: competitor.last_analyzed_at
      }
    }))
  }
}

function createPDFReport(competitors: any[]): string {
  // For now, return HTML that can be converted to PDF on the frontend
  const reportDate = new Date().toLocaleDateString()
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Competitor Intelligence Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .competitor { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .competitor-name { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .threat-high { color: #dc2626; }
        .threat-medium { color: #f59e0b; }
        .threat-low { color: #059669; }
        .summary { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f3f4f6; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Competitor Intelligence Report</h1>
        <p>Generated on ${reportDate}</p>
        <p>Total Competitors: ${competitors.length}</p>
      </div>
      
      <div class="summary">
        <h2>Executive Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Count</th>
          </tr>
          <tr>
            <td>Total Competitors</td>
            <td>${competitors.length}</td>
          </tr>
          <tr>
            <td>High Priority</td>
            <td>${competitors.filter(c => c.priority_level === 'high' || c.priority_level === 'critical').length}</td>
          </tr>
          <tr>
            <td>Auto-Discovered</td>
            <td>${competitors.filter(c => c.discovered_via === 'google_api').length}</td>
          </tr>
          <tr>
            <td>With Analysis</td>
            <td>${competitors.filter(c => c.last_analyzed_at).length}</td>
          </tr>
        </table>
      </div>
  `

  competitors.forEach(competitor => {
    const threatClass = competitor.threat_level === 'high' || competitor.threat_level === 'critical' ? 'threat-high' : 
                      competitor.threat_level === 'medium' ? 'threat-medium' : 'threat-low'
    
    const brands = competitor.competitor_brands?.map((b: any) => b.brand_name).join(', ') || 'N/A'
    const categories = competitor.competitor_categories?.map((c: any) => c.category_name).join(', ') || 'N/A'
    
    html += `
      <div class="competitor">
        <div class="competitor-name">${competitor.name}</div>
        
        <div class="section">
          <div class="section-title">Business Information</div>
          <p><strong>Type:</strong> ${competitor.business_type}</p>
          <p><strong>Website:</strong> ${competitor.website_url || 'N/A'}</p>
          <p><strong>Priority:</strong> ${competitor.priority_level}</p>
          <p><strong>Threat Level:</strong> <span class="${threatClass}">${competitor.threat_level}</span></p>
        </div>
        
        ${competitor.address ? `
        <div class="section">
          <div class="section-title">Location</div>
          <p>${competitor.address}, ${competitor.city}, ${competitor.state} ${competitor.zip_code}</p>
          ${competitor.distance_from_client ? `<p><strong>Distance:</strong> ${competitor.distance_from_client} miles</p>` : ''}
        </div>
        ` : ''}
        
        ${competitor.google_rating ? `
        <div class="section">
          <div class="section-title">Google Business Profile</div>
          <p><strong>Rating:</strong> ${competitor.google_rating}/5 (${competitor.google_review_count} reviews)</p>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Business Focus</div>
          <p><strong>Brands:</strong> ${brands}</p>
          <p><strong>Categories:</strong> ${categories}</p>
        </div>
        
        ${competitor.competitor_analyses && competitor.competitor_analyses.length > 0 ? `
        <div class="section">
          <div class="section-title">Latest Analysis</div>
          ${competitor.competitor_analyses.slice(0, 1).map((analysis: any) => `
            <p><strong>Type:</strong> ${analysis.analysis_type}</p>
            <p><strong>Threat Score:</strong> ${analysis.threat_assessment}/100</p>
            <p><strong>Opportunity Score:</strong> ${analysis.opportunity_score}/100</p>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `
  })

  html += `
    </body>
    </html>
  `

  return html
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { clientId, format, includeAnalyses = false, competitorIds, filters } = body

    if (!clientId || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and format' },
        { status: 400 }
      )
    }

    if (!['csv', 'json', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv, json, or pdf' },
        { status: 400 }
      )
    }

    // Get competitor data
    const competitors = await getCompetitorData(clientId, filters, competitorIds)

    if (competitors.length === 0) {
      return NextResponse.json(
        { error: 'No competitors found matching the criteria' },
        { status: 404 }
      )
    }

    // Generate export based on format
    let exportData: string | object
    let contentType: string
    let fileName: string

    switch (format) {
      case 'csv':
        exportData = convertToCSV(competitors)
        contentType = 'text/csv'
        fileName = `competitors-export-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'json':
        exportData = createJSONExport(competitors)
        contentType = 'application/json'
        fileName = `competitors-export-${new Date().toISOString().split('T')[0]}.json`
        break

      case 'pdf':
        exportData = createPDFReport(competitors)
        contentType = 'text/html'
        fileName = `competitors-report-${new Date().toISOString().split('T')[0]}.html`
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        )
    }

    // Return the export data
    return NextResponse.json({
      success: true,
      data: exportData,
      metadata: {
        format,
        totalCompetitors: competitors.length,
        fileName,
        exportDate: new Date().toISOString(),
        includeAnalyses
      }
    }, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Error in competitor export:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during export' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const format = searchParams.get('format') as 'csv' | 'json' | 'pdf'

    if (!clientId || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId and format' },
        { status: 400 }
      )
    }

    // Quick export with minimal filtering
    const competitors = await getCompetitorData(clientId)
    
    let exportData: string | object
    let contentType: string

    switch (format) {
      case 'csv':
        exportData = convertToCSV(competitors)
        contentType = 'text/csv; charset=utf-8'
        break
      case 'json':
        exportData = JSON.stringify(createJSONExport(competitors), null, 2)
        contentType = 'application/json; charset=utf-8'
        break
      case 'pdf':
        exportData = createPDFReport(competitors)
        contentType = 'text/html; charset=utf-8'
        break
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const fileName = `competitors-${format}-${new Date().toISOString().split('T')[0]}`

    return new NextResponse(typeof exportData === 'string' ? exportData : JSON.stringify(exportData), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}.${format}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error in competitor export:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
} 