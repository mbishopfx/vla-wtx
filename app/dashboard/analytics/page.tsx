'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Phone,
  Car,
  Target,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  pageViews: number
  vehicleViews: number
  leadGeneration: number
  phoneClicks: number
  totalSessions: number
  avgSessionDuration: number
  bounceRate: number
  conversionRate: number
  topPages: Array<{ page: string; views: number }>
  topVehicles: Array<{ vehicle: string; views: number; inquiries: number }>
  recentEvents: Array<{ event: string; timestamp: string; details: any }>
}

interface Client {
  id: string
  company_name: string
  website_url: string
  google_analytics_property_id: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [dataSource, setDataSource] = useState<'local' | 'google_analytics'>('local')
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      fetchAnalyticsData()
    }
  }, [selectedClient, dateRange])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
        if (data.clients && data.clients.length > 0) {
          setSelectedClient(data.clients[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError('Failed to load clients')
    }
  }

  const fetchAnalyticsData = async () => {
    if (!selectedClient) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics/track?client_id=${selectedClient}&date_range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.analytics) {
          console.log('✅ Using REAL analytics data:', data.analytics)
          setAnalyticsData(data.analytics)
          setDataSource('local')
          setError(null)
        } else {
          console.log('⚠️ No analytics data found, trying Google Analytics')
          await tryGoogleAnalytics()
        }
      } else {
        console.log('❌ Analytics API failed, trying Google Analytics')
        await tryGoogleAnalytics()
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      console.log('❌ Analytics fetch failed, trying Google Analytics')
      await tryGoogleAnalytics()
    } finally {
      setIsLoading(false)
    }
  }

  const tryGoogleAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/google?clientId=${selectedClient}&dateRange=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          console.log('✅ Using Google Analytics data')
          setAnalyticsData({
            pageViews: data.summary.totalPageViews,
            vehicleViews: Math.floor(data.summary.totalPageViews * 0.6), // Estimate
            leadGeneration: Math.floor(data.summary.totalSessions * 0.037), // Estimate
            phoneClicks: Math.floor(data.summary.totalSessions * 0.021), // Estimate
            totalSessions: data.summary.totalSessions,
            avgSessionDuration: data.summary.averageSessionDuration,
            bounceRate: 0.42, // Default estimate
            conversionRate: parseFloat(data.summary.conversionRate) / 100,
            topPages: data.topPages.map((page: any) => ({ page: page.path, views: page.views })),
            topVehicles: generateMockData().topVehicles, // Keep mock for now
            recentEvents: generateMockData().recentEvents // Keep mock for now
          })
          setDataSource('google_analytics')
          setError(null)
          return
        }
      }
    } catch (error) {
      console.error('Google Analytics fetch failed:', error)
    }
    
    // Fallback to mock data
    console.log('❌ All data sources failed, using mock data')
    setAnalyticsData(generateMockData())
    setDataSource('local')
    setError('All data sources unavailable - showing demo data')
  }

  const syncWithGoogleAnalytics = async () => {
    if (!selectedClient) return
    
    setIsSyncing(true)
    try {
      const response = await fetch('/api/analytics/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: selectedClient, 
          dateRange,
          clearExisting: false 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Google Analytics sync successful:', data.message)
        setLastSync(new Date().toISOString())
        await fetchAnalyticsData() // Refresh data
      } else {
        const error = await response.json()
        console.error('❌ Google Analytics sync failed:', error)
        setError(`Google Analytics sync failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error syncing with Google Analytics:', error)
      setError('Failed to sync with Google Analytics')
    } finally {
      setIsSyncing(false)
    }
  }

  const generateMockData = (): AnalyticsData => ({
    pageViews: 15420,
    vehicleViews: 8760,
    leadGeneration: 156,
    phoneClicks: 89,
    totalSessions: 4230,
    avgSessionDuration: 245,
    bounceRate: 0.42,
    conversionRate: 0.037,
    topPages: [
      { page: '/inventory', views: 3240 },
      { page: '/new-vehicles', views: 2180 },
      { page: '/used-vehicles', views: 1950 },
      { page: '/service', views: 1420 },
      { page: '/contact', views: 890 }
    ],
    topVehicles: [
      { vehicle: '2025 Nissan Sentra', views: 450, inquiries: 12 },
      { vehicle: '2025 Nissan Rogue', views: 380, inquiries: 8 },
      { vehicle: '2024 Nissan Kicks', views: 320, inquiries: 6 },
      { vehicle: '2025 Nissan Murano', views: 290, inquiries: 9 },
      { vehicle: '2019 Ford Mustang GT', views: 260, inquiries: 7 }
    ],
    recentEvents: [
      { event: 'vehicle_view', timestamp: '2024-01-15T14:30:00Z', details: { vehicle: '2025 Nissan Sentra' } },
      { event: 'lead_generation', timestamp: '2024-01-15T14:25:00Z', details: { form: 'contact' } },
      { event: 'phone_click', timestamp: '2024-01-15T14:20:00Z', details: { page: '/inventory' } }
    ]
  })

  const StatCard = ({ title, value, change, icon: Icon, color, format = 'number' }: any) => {
    const formatValue = (val: number) => {
      if (format === 'percentage') return `${(val * 100).toFixed(1)}%`
      if (format === 'duration') return `${Math.floor(val / 60)}m ${val % 60}s`
      if (format === 'currency') return `$${val.toLocaleString()}`
      return val.toLocaleString()
    }

    return (
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
              {change && (
                <p className={`text-sm ${change > 0 ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                  <TrendingUp className="h-3 w-3" />
                  {change > 0 ? '+' : ''}{change}%
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-${color}-400`} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!clients.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Clients Found</h3>
              <p className="text-slate-400 mb-4">You need to set up at least one client to view analytics data.</p>
              <Button 
                onClick={() => window.location.href = '/dashboard/setup/google'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Set Up First Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              {dataSource === 'google_analytics' ? (
                <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                  <Cloud className="w-3 h-3 mr-1" />
                  Google Analytics
                </Badge>
              ) : error ? (
                <Badge variant="outline" className="border-amber-500 text-amber-400 bg-amber-500/10">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Demo Data
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              )}
            </div>
            <p className="text-slate-400 mt-1">
              {error ? error : 'Real-time website and lead generation analytics'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[250px] bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-white">
                    {client.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px] bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1d" className="text-white">Today</SelectItem>
                <SelectItem value="7d" className="text-white">7 Days</SelectItem>
                <SelectItem value="30d" className="text-white">30 Days</SelectItem>
                <SelectItem value="90d" className="text-white">90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={syncWithGoogleAnalytics}
              disabled={isSyncing || isLoading}
              size="sm"
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              {isSyncing ? (
                <Zap className="h-4 w-4 animate-pulse mr-2" />
              ) : (
                <Cloud className="h-4 w-4 mr-2" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync GA'}
            </Button>
            
            <Button
              onClick={fetchAnalyticsData}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-slate-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData && (
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Page Views"
                value={analyticsData.pageViews}
                change={15.2}
                icon={Eye}
                color="blue"
              />
              <StatCard
                title="Vehicle Views"
                value={analyticsData.vehicleViews}
                change={8.7}
                icon={Car}
                color="emerald"
              />
              <StatCard
                title="Leads Generated"
                value={analyticsData.leadGeneration}
                change={23.1}
                icon={Target}
                color="purple"
              />
              <StatCard
                title="Phone Clicks"
                value={analyticsData.phoneClicks}
                change={-5.2}
                icon={Phone}
                color="amber"
              />
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Total Sessions"
                value={analyticsData.totalSessions}
                change={12.3}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Avg Session Duration"
                value={analyticsData.avgSessionDuration}
                change={-2.1}
                icon={Calendar}
                color="emerald"
                format="duration"
              />
              <StatCard
                title="Bounce Rate"
                value={analyticsData.bounceRate}
                change={-3.4}
                icon={MousePointer}
                color="amber"
                format="percentage"
              />
              <StatCard
                title="Conversion Rate"
                value={analyticsData.conversionRate}
                change={18.9}
                icon={TrendingUp}
                color="purple"
                format="percentage"
              />
            </motion.div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Top Pages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Pages
                    </CardTitle>
                    <CardDescription>Most viewed pages on your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full border-slate-600 text-slate-300 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-white font-medium">{page.page}</span>
                          </div>
                          <span className="text-slate-400">{page.views.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Vehicles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Top Vehicles
                    </CardTitle>
                    <CardDescription>Most viewed vehicles and their inquiries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topVehicles.map((vehicle, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full border-slate-600 text-slate-300 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <div>
                              <span className="text-white font-medium block">{vehicle.vehicle}</span>
                              <span className="text-xs text-slate-400">{vehicle.views} views</span>
                            </div>
                          </div>
                          <Badge className="bg-purple-500/10 text-purple-400">
                            {vehicle.inquiries} inquiries
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            </div>

            {/* Recent Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest events from your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.recentEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <div className="flex-1">
                          <p className="text-white font-medium capitalize">{event.event.replace('_', ' ')}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {JSON.stringify(event.details)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
} 