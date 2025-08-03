'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Eye,
  Globe,
  Target,
  Brain,
  Zap,
  RefreshCw,
  AlertTriangle,
  Users,
  DollarSign,
  Star
} from 'lucide-react'

interface Competitor {
  id: string
  name: string
  domain?: string
  website_url?: string
  business_type: string
  city?: string
  state?: string
  threat_level: string
  priority_level: string
  marketShare?: number
  estimatedBudget?: number
  adHealthScore?: number
  strengths?: string[]
  weaknesses?: string[]
  created_at: string
}

interface Client {
  id: string
  company_name: string
  website_url: string
}

export default function CompetitorIntelligencePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all')
  const [newCompetitorDomain, setNewCompetitorDomain] = useState('')
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')
  const [competitorProgress, setCompetitorProgress] = useState<{[key: string]: 'pending' | 'analyzing' | 'completed'}>({})

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
    }
  }

  const loadCompetitors = async () => {
    if (!selectedClient) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/competitors/manual?clientId=${selectedClient}`)
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data.competitors || [])
      }
    } catch (error) {
      console.error('Error loading competitors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults([])
    setAnalysisSteps([])
    setCurrentStep('')
    setCompetitorProgress({})

    try {
      console.log('Starting analysis for client:', selectedClient)
      console.log('Available competitors:', competitors.length)
      
      if (competitors.length === 0) {
        setAnalysisResults([{
          error: true,
          competitor: { name: 'No Competitors Found' },
          analysis: `❌ No competitors found for analysis. 

To get started:
1. Add competitors using the form above
2. Make sure you have a client selected
3. Competitors must be added before running analysis

Current status:
- Selected client: ${selectedClient}
- Competitors in database: ${competitors.length}`
        }])
        setIsAnalyzing(false)
        setAnalysisProgress(100)
        return
      }

      // Initialize competitor progress
      const initialProgress: {[key: string]: 'pending' | 'analyzing' | 'completed'} = {}
      competitors.forEach(comp => {
        initialProgress[comp.name] = 'pending'
      })
      setCompetitorProgress(initialProgress)

      // Add initial steps
      setAnalysisSteps(['🔍 Initializing AI Analysis Engine...'])
      setCurrentStep('🔍 Initializing AI Analysis Engine...')
      
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAnalysisSteps(prev => [...prev, '📊 Loading competitor data...'])
      setCurrentStep('📊 Loading competitor data...')
      
      await new Promise(resolve => setTimeout(resolve, 500))

      // Start real AI analysis with 4000 token limit per competitor
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      // Add step for AI processing
      setAnalysisSteps(prev => [...prev, '🤖 Processing with GPT-4o AI Engine...'])
      setCurrentStep('🤖 Processing with GPT-4o AI Engine...')

      // Simulate competitor analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = Math.min(prev + 2, 90)
          
          // Update competitor progress based on overall progress
          const progressPerCompetitor = 90 / competitors.length
          const currentCompetitorIndex = Math.floor(newProgress / progressPerCompetitor)
          
          setCompetitorProgress(prevProgress => {
            const newProgress = { ...prevProgress }
            competitors.forEach((comp, index) => {
              if (index < currentCompetitorIndex) {
                newProgress[comp.name] = 'completed'
              } else if (index === currentCompetitorIndex) {
                newProgress[comp.name] = 'analyzing'
              } else {
                newProgress[comp.name] = 'pending'
              }
            })
            return newProgress
          })

          // Update current step
          if (currentCompetitorIndex < competitors.length) {
            setCurrentStep(`🎯 Analyzing ${competitors[currentCompetitorIndex]?.name}...`)
          }
          
          return newProgress
        })
      }, 800)

      const data = await response.json()
      
      clearInterval(progressInterval)
      
      // Final steps
      setAnalysisSteps(prev => [...prev, '💾 Saving analysis results...'])
      setCurrentStep('💾 Saving analysis results...')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAnalysisSteps(prev => [...prev, '✅ Analysis complete!'])
      setCurrentStep('✅ Analysis complete!')
      
      setAnalysisProgress(100)
      setAnalysisResults(data.analyses || [])
      setIsAnalyzing(false)
      setLastAnalysis(new Date())

      // Mark all competitors as completed
      setCompetitorProgress(prevProgress => {
        const newProgress = { ...prevProgress }
        competitors.forEach(comp => {
          newProgress[comp.name] = 'completed'
        })
        return newProgress
      })

    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisSteps(prev => [...prev, '❌ Analysis failed'])
      setCurrentStep('❌ Analysis failed')
      setAnalysisResults([{
        error: true,
        competitor: { name: 'Analysis Error' },
        analysis: `❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}

Please check:
1. Internet connection
2. Valid competitors exist
3. OpenAI API key is configured
4. Database connection is working

Technical details: ${JSON.stringify(error, null, 2)}`
      }])
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }
  }

  const addNewCompetitor = async () => {
    if (!newCompetitorDomain || !selectedClient) return

    try {
      const response = await fetch('/api/competitors/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          name: newCompetitorDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
          websiteUrl: newCompetitorDomain.startsWith('http') ? newCompetitorDomain : `https://${newCompetitorDomain}`,
          businessType: 'dealer_group',
          priorityLevel: 'medium',
          threatLevel: 'medium'
        })
      })

      if (response.ok) {
        setNewCompetitorDomain('')
        loadCompetitors()
      }
    } catch (error) {
      console.error('Error adding competitor:', error)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-500/10 text-red-400'
      case 'high': return 'bg-orange-500/10 text-orange-400'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400'
      case 'low': return 'bg-green-500/10 text-green-400'
      default: return 'bg-slate-500/10 text-slate-400'
    }
  }

  const filteredCompetitors = competitors.filter(comp => 
    searchTerm === '' || 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.website_url?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add function to format analysis text for better display
  const formatAnalysisContent = (text: string) => {
    if (!text) return null

    // Split into sections and format
    const sections = text.split(/###?\s*\d+\.\s*/).filter(section => section.trim())
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) return null

      const title = lines[0].replace(/\*\*/g, '').replace(/^#+\s*/, '').trim()
      const content = lines.slice(1)

      return (
        <div key={index} className="mb-8">
          <h4 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-600 pb-2">
            {title}
          </h4>
          <div className="space-y-3">
            {content.map((line, lineIndex) => {
              const cleanLine = line.trim()
              if (!cleanLine) return null

              // Handle bold headers
              if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
                return (
                  <h5 key={lineIndex} className="text-white font-semibold text-sm mt-4 mb-2">
                    {cleanLine.replace(/\*\*/g, '')}
                  </h5>
                )
              }

              // Handle bullet points
              if (cleanLine.startsWith('- ')) {
                const content = cleanLine.substring(2).replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                return (
                  <div key={lineIndex} className="flex items-start gap-2 ml-4">
                    <span className="text-blue-400 mt-1 text-xs">•</span>
                    <div className="text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                )
              }

              // Regular paragraphs
              if (cleanLine.length > 10) {
                const formattedContent = cleanLine.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                return (
                  <div key={lineIndex} className="text-slate-300 text-sm leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )
    })
  }

  // Add export function
  const exportAnalysisToTxt = () => {
    if (analysisResults.length === 0) return

    const exportContent = analysisResults.map(result => {
      return `
================================================================================
COMPETITOR ANALYSIS REPORT
================================================================================
Competitor: ${result.competitor.name}
Website: ${result.competitor.website_url || 'N/A'}
Analysis Date: ${new Date().toLocaleString()}
Token Count: ${result.token_count || 0}
Client: Nissan of Wichita Falls
================================================================================

${result.analysis}

================================================================================
END OF ANALYSIS FOR ${result.competitor.name.toUpperCase()}
================================================================================

`
    }).join('\n\n')

    const fullReport = `
TRD VLA v2 - COMPETITOR INTELLIGENCE REPORT
===========================================
Generated: ${new Date().toLocaleString()}
Client: Nissan of Wichita Falls
Total Competitors Analyzed: ${analysisResults.length}
Total Tokens Used: ${analysisResults.reduce((sum, a) => sum + (a.token_count || 0), 0)}

${exportContent}

Report generated by TRD VLA v2 Competitor Intelligence System
Contact: Nissan of Wichita Falls - 4000 Kell West Blvd, Wichita Falls, TX 76309
    `.trim()

    const blob = new Blob([fullReport], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TRD_VLA_Competitor_Analysis_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="mx-auto max-w-4xl flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg">Loading competitor data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!clients.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Clients Found</h3>
              <p className="text-slate-400 mb-4">You need to set up at least one client to analyze competitors.</p>
              <Button 
                onClick={() => window.location.href = '/dashboard/setup'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Set Up Client
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Competitor Intelligence
            </h1>
            <p className="text-slate-400 mt-1">AI-powered competitor analysis and market intelligence</p>
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
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Competitors</p>
                  <p className="text-2xl font-bold text-white">{competitors.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Critical Threats</p>
                  <p className="text-2xl font-bold text-white">
                    {competitors.filter(c => c.threat_level === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">High Priority</p>
                  <p className="text-2xl font-bold text-white">
                    {competitors.filter(c => c.priority_level === 'high').length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Last Analysis</p>
                  <p className="text-2xl font-bold text-white">
                    {lastAnalysis ? lastAnalysis.toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">AI Analysis & New Competitors</CardTitle>
              <CardDescription>Run competitive intelligence analysis and add new competitors to track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Enhanced Analysis Progress */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Main Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                        />
                        AI Competitive Intelligence Analysis
                      </span>
                      <span className="text-slate-400">{Math.round(analysisProgress)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={analysisProgress} className="h-3" />
                      <motion.div
                        className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${analysisProgress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Current Step */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-blue-400 text-xl"
                      >
                        ⚡
                      </motion.div>
                      <p className="text-blue-200 font-medium">{currentStep}</p>
                    </div>
                  </motion.div>

                  {/* Competitor Progress Cards */}
                  {competitors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Competitor Analysis Progress:</h4>
                      <div className="grid gap-3">
                        {competitors.map((competitor, index) => (
                          <motion.div
                            key={competitor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border
                              ${competitorProgress[competitor.name] === 'completed' ? 'bg-green-500/10 border-green-500/20' :
                                competitorProgress[competitor.name] === 'analyzing' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                'bg-slate-700/50 border-slate-600'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-3 h-3 rounded-full
                                ${competitorProgress[competitor.name] === 'completed' ? 'bg-green-400' :
                                  competitorProgress[competitor.name] === 'analyzing' ? 'bg-yellow-400 animate-pulse' :
                                  'bg-slate-500'}
                              `} />
                              <span className="text-white text-sm font-medium">{competitor.name}</span>
                              <Badge className={getThreatLevelColor(competitor.threat_level)}>
                                {competitor.threat_level}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {competitorProgress[competitor.name] === 'completed' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-green-400"
                                >
                                  ✅
                                </motion.div>
                              )}
                              {competitorProgress[competitor.name] === 'analyzing' && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
                                />
                              )}
                              {competitorProgress[competitor.name] === 'pending' && (
                                <div className="text-slate-500 text-sm">Pending</div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Steps Timeline */}
                  {analysisSteps.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Analysis Timeline:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {analysisSteps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span className="text-slate-300">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Enter competitor domain (e.g., competitorsite.com)"
                    value={newCompetitorDomain}
                    onChange={(e) => setNewCompetitorDomain(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Button
                    onClick={addNewCompetitor}
                    disabled={!newCompetitorDomain}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing || competitors.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Results */}
        {analysisResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">🎯 AI Analysis Results</CardTitle>
                    <CardDescription>Comprehensive competitive intelligence with 4000 token analysis per competitor</CardDescription>
                  </div>
                  <Button
                    onClick={exportAnalysisToTxt}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    📄 Export TXT Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {analysisResults.map((result, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                      {/* Header */}
                      <div className="bg-slate-700/50 p-4 border-b border-slate-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white">{result.competitor.name}</h3>
                            <p className="text-slate-400 text-sm">{result.competitor.website_url || 'No website provided'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/10 text-blue-400">
                              {result.token_count || 0} tokens
                            </Badge>
                            {result.error && (
                              <Badge className="bg-red-500/10 text-red-400">
                                Error
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        {result.error ? (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <div className="text-red-200 whitespace-pre-wrap text-sm leading-relaxed">
                              {result.analysis}
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-invert max-w-none">
                            {formatAnalysisContent(result.analysis)}
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      {result.competitor.website_url && !result.error && (
                        <div className="bg-slate-700/30 p-4 border-t border-slate-600">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-400">
                              Analysis completed at {new Date().toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(result.competitor.website_url, '_blank')}
                              className="border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">📊 Analysis Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{analysisResults.length}</div>
                      <div className="text-slate-300 text-sm">Competitors Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {analysisResults.reduce((sum, a) => sum + (a.token_count || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-slate-300 text-sm">Total Tokens Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {analysisResults.filter(a => !a.error).length}
                      </div>
                      <div className="text-slate-300 text-sm">Successful Analyses</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search competitors by name or website..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-white">All Competitors</SelectItem>
              <SelectItem value="critical" className="text-white">Critical Threat</SelectItem>
              <SelectItem value="high" className="text-white">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Competitors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Competitor Analysis ({filteredCompetitors.length})</CardTitle>
              <CardDescription>Comprehensive competitor intelligence and threat assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCompetitors.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No competitors found. Add some competitors to get started.</p>
                  </div>
                ) : (
                  filteredCompetitors.map((competitor) => (
                    <div key={competitor.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-medium">{competitor.name}</h3>
                            <Badge className={getThreatLevelColor(competitor.threat_level)}>
                              {competitor.threat_level} threat
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {competitor.business_type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-400 mb-2">
                            <span>{competitor.website_url || 'No website'}</span>
                            <span>{competitor.city ? `${competitor.city}, ${competitor.state}` : 'Location unknown'}</span>
                            <span>Priority: {competitor.priority_level}</span>
                          </div>
                          
                          {competitor.marketShare && (
                            <div className="mb-2">
                              <p className="text-sm text-slate-300">Market Share: {competitor.marketShare}%</p>
                              <Progress value={competitor.marketShare} className="h-1 mt-1" />
                            </div>
                          )}
                          
                          <p className="text-xs text-slate-500">
                            Added: {new Date(competitor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {competitor.website_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(competitor.website_url, '_blank')}
                              className="border-slate-600 text-slate-300"
                            >
                              <Globe className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
} 