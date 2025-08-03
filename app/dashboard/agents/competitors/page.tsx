'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

import { 
  Search, 
  Plus, 
  MapPin, 
  Globe, 
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  Building,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react'

interface Competitor {
  id: string
  name: string
  website_url?: string
  business_type: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  phone?: string
  google_rating?: number
  google_review_count?: number
  distance_from_client?: number
  priority_level: string
  threat_level: string
  discovered_via: string
  last_analyzed_at?: string
  created_at: string
  competitor_brands?: Array<{ brand_name: string; is_primary_brand: boolean }>
  competitor_categories?: Array<{ category_name: string; is_primary: boolean }>
  competitor_digital_presence?: Array<{
    domain_authority?: number
    estimated_monthly_traffic?: number
    running_google_ads?: boolean
    running_facebook_ads?: boolean
  }>
}

interface DiscoveryState {
  isDiscovering: boolean
  progress: number
  zipCode: string
  radiusMiles: number
  message: string
}

interface ManualEntryState {
  isOpen: boolean
  isSubmitting: boolean
  formData: {
    name: string
    websiteUrl: string
    businessType: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    priorityLevel: string
    threatLevel: string
    brands: string
    categories: string
  }
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>({
    isDiscovering: false,
    progress: 0,
    zipCode: '',
    radiusMiles: 25,
    message: ''
  })

  const [manualEntry, setManualEntry] = useState<ManualEntryState>({
    isOpen: false,
    isSubmitting: false,
    formData: {
      name: '',
      websiteUrl: '',
      businessType: 'online',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      priorityLevel: 'medium',
      threatLevel: 'medium',
      brands: '',
      categories: ''
    }
  })

  const [analysisState, setAnalysisState] = useState({
    isAnalyzing: false,
    progress: 0,
    competitorId: '',
    analysisType: ''
  })

  // Client management state
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')

  // Load clients and competitors on component mount
  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      loadCompetitors()
    }
  }, [selectedClient])

  const loadClients = async () => {
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
      console.error('Error loading clients:', error)
      console.error('Failed to load clients')
    }
  }

  const loadCompetitors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/competitors/manual?clientId=${selectedClient}`)
      const data = await response.json()
      
      if (data.success) {
        setCompetitors(data.competitors)
      }
    } catch (error) {
      console.error('Error loading competitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const discoverCompetitors = async () => {
    if (!discoveryState.zipCode) return

    setDiscoveryState(prev => ({ 
      ...prev, 
      isDiscovering: true, 
      progress: 0, 
      message: 'Starting competitor discovery...' 
    }))

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDiscoveryState(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: prev.progress + 10,
              message: prev.progress < 30 ? 'Searching Google Places...' :
                      prev.progress < 60 ? 'Analyzing competitor data...' :
                      'Saving to database...'
            }
          }
          return prev
        })
      }, 500)

      const response = await fetch('/api/competitors/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: discoveryState.zipCode,
          clientId: selectedClient,
          radiusMiles: discoveryState.radiusMiles
        })
      })

      const data = await response.json()
      clearInterval(progressInterval)

      if (data.success) {
        setDiscoveryState(prev => ({
          ...prev,
          progress: 100,
          message: `Found ${data.competitors.length} competitors!`
        }))
        
        // Reload competitors list
        await loadCompetitors()
        
        setTimeout(() => {
          setDiscoveryState(prev => ({ ...prev, isDiscovering: false, progress: 0 }))
        }, 2000)
      } else {
        setDiscoveryState(prev => ({
          ...prev,
          isDiscovering: false,
          message: data.error || 'Discovery failed'
        }))
      }
    } catch (error) {
      setDiscoveryState(prev => ({
        ...prev,
        isDiscovering: false,
        message: 'Error during discovery'
      }))
    }
  }

  const addManualCompetitor = async () => {
    setManualEntry(prev => ({ ...prev, isSubmitting: true }))

    try {
      const response = await fetch('/api/competitors/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          name: manualEntry.formData.name,
          websiteUrl: manualEntry.formData.websiteUrl || undefined,
          businessType: manualEntry.formData.businessType,
          address: manualEntry.formData.address || undefined,
          city: manualEntry.formData.city || undefined,
          state: manualEntry.formData.state || undefined,
          zipCode: manualEntry.formData.zipCode || undefined,
          phone: manualEntry.formData.phone || undefined,
          email: manualEntry.formData.email || undefined,
          priorityLevel: manualEntry.formData.priorityLevel,
          threatLevel: manualEntry.formData.threatLevel,
          brands: manualEntry.formData.brands ? manualEntry.formData.brands.split(',').map(b => b.trim()) : [],
          categories: manualEntry.formData.categories ? manualEntry.formData.categories.split(',').map(c => c.trim()) : []
        })
      })

      const data = await response.json()

      if (data.success) {
        // Reset form and close modal
        setManualEntry({
          isOpen: false,
          isSubmitting: false,
          formData: {
            name: '', websiteUrl: '', businessType: 'online', address: '', city: '', 
            state: '', zipCode: '', phone: '', email: '', priorityLevel: 'medium', 
            threatLevel: 'medium', brands: '', categories: ''
          }
        })
        
        // Reload competitors
        await loadCompetitors()
      }
    } catch (error) {
      console.error('Error adding competitor:', error)
    } finally {
      setManualEntry(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const analyzeCompetitor = async (competitorId: string, analysisType: string) => {
    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      competitorId,
      analysisType
    })

    // Simulate CrewAI analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisState(prev => {
        if (prev.progress < 90) {
          return { ...prev, progress: prev.progress + 10 }
        }
        return prev
      })
    }, 800)

    try {
      // TODO: Implement actual CrewAI analysis API call
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      clearInterval(progressInterval)
      setAnalysisState(prev => ({ ...prev, progress: 100 }))
      
      setTimeout(() => {
        setAnalysisState({ isAnalyzing: false, progress: 0, competitorId: '', analysisType: '' })
      }, 1000)
    } catch (error) {
      clearInterval(progressInterval)
      setAnalysisState({ isAnalyzing: false, progress: 0, competitorId: '', analysisType: '' })
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-200'
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-200'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-200'
      case 'low': return 'bg-green-500/10 text-green-400 border-green-200'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-200'
    }
  }

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Globe className="h-4 w-4" />
      case 'local': return <MapPin className="h-4 w-4" />
      case 'franchise': return <Building className="h-4 w-4" />
      case 'dealer_group': return <Users className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Competitor Intelligence</h1>
          <p className="text-slate-400">
            Auto-discover local competitors and manage your competitive intelligence database
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setManualEntry(prev => ({ ...prev, isOpen: true }))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Competitors</p>
                <p className="text-2xl font-bold text-white">{competitors.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-white">
                  {competitors.filter(c => c.priority_level === 'high' || c.priority_level === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Auto-Discovered</p>
                <p className="text-2xl font-bold text-white">
                  {competitors.filter(c => c.discovered_via === 'google_api').length}
                </p>
              </div>
              <Search className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Analyzed</p>
                <p className="text-2xl font-bold text-white">
                  {competitors.filter(c => c.last_analyzed_at).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-700 backdrop-blur-xl">
            <TabsTrigger value="discover" className="data-[state=active]:bg-orange-600">
              <Search className="mr-2 h-4 w-4" />
              Auto-Discovery
            </TabsTrigger>
            <TabsTrigger value="competitors" className="data-[state=active]:bg-orange-600">
              <Target className="mr-2 h-4 w-4" />
              Saved Competitors
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-600">
              <Brain className="mr-2 h-4 w-4" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* Auto-Discovery Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Discover Local Competitors</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter a zip code to automatically discover automotive competitors in the area using Google Places API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Zip Code
                      </label>
                      <Input
                        placeholder="90210"
                        value={discoveryState.zipCode}
                        onChange={(e) => setDiscoveryState(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Search Radius (miles)
                      </label>
                      <Input
                        type="number"
                        value={discoveryState.radiusMiles}
                        onChange={(e) => setDiscoveryState(prev => ({ ...prev, radiusMiles: parseInt(e.target.value) || 25 }))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={discoverCompetitors}
                        disabled={!discoveryState.zipCode || discoveryState.isDiscovering}
                        className="bg-orange-600 hover:bg-orange-700 w-full"
                      >
                        {discoveryState.isDiscovering ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="mr-2 h-4 w-4" />
                        )}
                        Discover Competitors
                      </Button>
                    </div>
                  </div>

                  {/* Discovery Progress */}
                  <AnimatePresence>
                    {discoveryState.isDiscovering && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{discoveryState.message}</span>
                          <span className="text-orange-400">{discoveryState.progress}%</span>
                        </div>
                        <Progress value={discoveryState.progress} className="h-2" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            {loading ? (
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-400" />
                  <p className="text-slate-400">Loading competitors...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {competitors.map((competitor, index) => (
                  <motion.div
                    key={competitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={selectedCompetitors.includes(competitor.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCompetitors(prev => [...prev, competitor.id])
                                  } else {
                                    setSelectedCompetitors(prev => prev.filter(id => id !== competitor.id))
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-orange-600"
                              />
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-white text-lg">{competitor.name}</h3>
                                  <Badge className={getThreatLevelColor(competitor.threat_level)}>
                                    {competitor.threat_level} threat
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {getBusinessTypeIcon(competitor.business_type)}
                                    <span className="ml-1">{competitor.business_type}</span>
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  {competitor.website_url && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4 text-slate-400" />
                                      <a
                                        href={competitor.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 truncate"
                                      >
                                        {competitor.website_url.replace(/^https?:\/\//, '')}
                                      </a>
                                      <ExternalLink className="h-3 w-3 text-slate-500" />
                                    </div>
                                  )}
                                  
                                  {competitor.address && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-300 truncate">{competitor.address}</span>
                                    </div>
                                  )}
                                  
                                  {competitor.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-300">{competitor.phone}</span>
                                    </div>
                                  )}
                                </div>

                                {competitor.google_rating && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span className="text-white font-medium">{competitor.google_rating}</span>
                                      <span className="text-slate-400 text-sm">
                                        ({competitor.google_review_count} reviews)
                                      </span>
                                    </div>
                                    {competitor.distance_from_client && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-300 text-sm">
                                          {competitor.distance_from_client} miles away
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => analyzeCompetitor(competitor.id, 'swot')}
                                disabled={analysisState.isAnalyzing && analysisState.competitorId === competitor.id}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {analysisState.isAnalyzing && analysisState.competitorId === competitor.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Brain className="h-4 w-4" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Analysis Progress */}
                          <AnimatePresence>
                            {analysisState.isAnalyzing && analysisState.competitorId === competitor.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-4 border-t border-slate-700"
                              >
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300">Running AI Analysis...</span>
                                  <span className="text-purple-400">{analysisState.progress}%</span>
                                </div>
                                <Progress value={analysisState.progress} className="h-2" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">CrewAI Competitive Analysis</CardTitle>
                <CardDescription className="text-slate-400">
                  Advanced AI-powered competitive intelligence and strategic recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">AI Analysis Coming Soon</h3>
                  <p className="text-slate-400 mb-4">
                    CrewAI agents will analyze competitor weaknesses and generate strategic recommendations
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Run Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {manualEntry.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !manualEntry.isSubmitting && setManualEntry(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Competitor Manually</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Competitor Name *
                    </label>
                    <Input
                      placeholder="Cars.com, AutoTrader, etc."
                      value={manualEntry.formData.name}
                      onChange={(e) => setManualEntry(prev => ({
                        ...prev,
                        formData: { ...prev.formData, name: e.target.value }
                      }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website URL
                    </label>
                    <Input
                      placeholder="https://cars.com"
                      value={manualEntry.formData.websiteUrl}
                      onChange={(e) => setManualEntry(prev => ({
                        ...prev,
                        formData: { ...prev.formData, websiteUrl: e.target.value }
                      }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Business Type *
                    </label>
                    <select
                      value={manualEntry.formData.businessType}
                      onChange={(e) => setManualEntry(prev => ({
                        ...prev,
                        formData: { ...prev.formData, businessType: e.target.value }
                      }))}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
                    >
                      <option value="online">Online Platform</option>
                      <option value="local">Local Dealer</option>
                      <option value="franchise">Franchise</option>
                      <option value="dealer_group">Dealer Group</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={manualEntry.formData.priorityLevel}
                      onChange={(e) => setManualEntry(prev => ({
                        ...prev,
                        formData: { ...prev.formData, priorityLevel: e.target.value }
                      }))}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Brands/Makes (comma-separated)
                  </label>
                  <Input
                    placeholder="Toyota, Honda, Ford, etc."
                    value={manualEntry.formData.brands}
                    onChange={(e) => setManualEntry(prev => ({
                      ...prev,
                      formData: { ...prev.formData, brands: e.target.value }
                    }))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={addManualCompetitor}
                    disabled={!manualEntry.formData.name || manualEntry.isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {manualEntry.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Competitor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setManualEntry(prev => ({ ...prev, isOpen: false }))}
                    disabled={manualEntry.isSubmitting}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 