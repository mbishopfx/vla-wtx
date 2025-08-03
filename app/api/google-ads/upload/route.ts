import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionName = formData.get('sessionName') as string

    if (!sessionName) {
      return NextResponse.json({ error: 'Session name is required' }, { status: 400 })
    }

    // Create upload session
    const sessionId = crypto.randomUUID()
    const files: File[] = []
    
    // Extract all uploaded files
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No CSV files uploaded' }, { status: 400 })
    }

    // Process each CSV file
    const processedData = {
      campaigns: [] as any[],
      timeSeries: [] as any[],
      devices: [] as any[],
      schedule: [] as any[],
      changes: [] as any[],
      optimization: [] as any[],
      biggestChanges: [] as any[]
    }

    const dataAnalytics = {
      totalImpressions: 0,
      totalClicks: 0,
      totalCost: 0,
      totalConversions: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageCPA: 0,
      campaignCount: 0,
      topPerformingCampaigns: [] as any[],
      underperformingCampaigns: [] as any[],
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
      timeBasedPerformance: [] as any[],
      keywordData: [] as any[]
    }

    for (const file of files) {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) continue // Skip empty files
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      // Categorize data based on filename or content
      const fileName = file.name.toLowerCase()
      
      if (fileName.includes('campaign') || fileName.includes('overview')) {
        processedData.campaigns.push(...rows)
        
        // Calculate campaign analytics
        rows.forEach(row => {
          const impressions = parseInt(row.Impressions || row.impressions || '0') || 0
          const clicks = parseInt(row.Clicks || row.clicks || '0') || 0
          const cost = parseFloat(row.Cost || row.cost || row['Cost ($)'] || '0') || 0
          const conversions = parseInt(row.Conversions || row.conversions || '0') || 0
          
          dataAnalytics.totalImpressions += impressions
          dataAnalytics.totalClicks += clicks
          dataAnalytics.totalCost += cost
          dataAnalytics.totalConversions += conversions
          
          if (impressions > 0) {
            const ctr = (clicks / impressions) * 100
            const cpc = clicks > 0 ? cost / clicks : 0
            const cpa = conversions > 0 ? cost / conversions : 0
            
            const campaignMetrics = {
              name: row['Campaign name'] || row.Campaign || row.campaign || 'Unknown Campaign',
              impressions,
              clicks,
              cost,
              conversions,
              ctr,
              cpc,
              cpa,
              performance: ctr > 2 ? 'high' : ctr > 1 ? 'medium' : 'low'
            }
            
            if (campaignMetrics.performance === 'high') {
              dataAnalytics.topPerformingCampaigns.push(campaignMetrics)
            } else if (campaignMetrics.performance === 'low') {
              dataAnalytics.underperformingCampaigns.push(campaignMetrics)
            }
          }
        })
        
        dataAnalytics.campaignCount = rows.length
      } else if (fileName.includes('time') || fileName.includes('series')) {
        processedData.timeSeries.push(...rows)
        
        // Process time-based performance
        rows.forEach(row => {
          const date = row.Date || row.date || ''
          const impressions = parseInt(row.Impressions || '0') || 0
          const clicks = parseInt(row.Clicks || '0') || 0
          
          if (date && impressions > 0) {
            dataAnalytics.timeBasedPerformance.push({
              date,
              impressions,
              clicks,
              ctr: (clicks / impressions) * 100
            })
          }
        })
      } else if (fileName.includes('device')) {
        processedData.devices.push(...rows)
        
        // Process device performance
        rows.forEach(row => {
          const device = (row.Device || row.device || '').toLowerCase()
          const clicks = parseInt(row.Clicks || '0') || 0
          
          if (device.includes('mobile')) {
            dataAnalytics.deviceBreakdown.mobile += clicks
          } else if (device.includes('tablet')) {
            dataAnalytics.deviceBreakdown.tablet += clicks
          } else if (device.includes('desktop') || device.includes('computer')) {
            dataAnalytics.deviceBreakdown.desktop += clicks
          }
        })
      } else if (fileName.includes('schedule') || fileName.includes('hour')) {
        processedData.schedule.push(...rows)
      } else if (fileName.includes('change') && fileName.includes('biggest')) {
        processedData.biggestChanges.push(...rows)
      } else if (fileName.includes('change')) {
        processedData.changes.push(...rows)
      } else if (fileName.includes('optimization') || fileName.includes('score')) {
        processedData.optimization.push(...rows)
      } else {
        // Default to campaigns if unclear
        processedData.campaigns.push(...rows)
      }
    }

    // Calculate overall metrics
    if (dataAnalytics.totalImpressions > 0) {
      dataAnalytics.averageCTR = (dataAnalytics.totalClicks / dataAnalytics.totalImpressions) * 100
    }
    if (dataAnalytics.totalClicks > 0) {
      dataAnalytics.averageCPC = dataAnalytics.totalCost / dataAnalytics.totalClicks
    }
    if (dataAnalytics.totalConversions > 0) {
      dataAnalytics.averageCPA = dataAnalytics.totalCost / dataAnalytics.totalConversions
    }

    // Sort top/underperforming campaigns
    dataAnalytics.topPerformingCampaigns.sort((a, b) => b.ctr - a.ctr).slice(0, 5)
    dataAnalytics.underperformingCampaigns.sort((a, b) => a.ctr - b.ctr).slice(0, 5)

    // Store in database (for now, just return success)
    // TODO: Implement actual database storage when Supabase is configured

    return NextResponse.json({
      success: true,
      sessionId,
      filesProcessed: files.length,
      dataCategories: {
        campaigns: processedData.campaigns.length,
        timeSeries: processedData.timeSeries.length,
        devices: processedData.devices.length,
        schedule: processedData.schedule.length,
        changes: processedData.changes.length,
        optimization: processedData.optimization.length,
        biggestChanges: processedData.biggestChanges.length
      },
      analytics: dataAnalytics,
      processedData: processedData // Include actual data for analysis
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process uploaded files' },
      { status: 500 }
    )
  }
} 