'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, 
  Calendar, 
  Target, 
  TrendingUp,
  Settings,
  BarChart3,
  Zap,
  FileText,
  Copy,
  Download,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  MousePointer,
  Clock,
  Car
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface NissanStrategy {
  id: string
  strategy_name: string
  total_budget: number
  time_frame: number
  success_probability: number
  ai_strategy_analysis: any
  status: string
  created_at: string
}

export default function NissanCampaignCreator() {
  const [strategies, setStrategies] = useState<NissanStrategy[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('input')
  
  // Form data state - simplified for Nissan focus
  const [formData, setFormData] = useState({
    // Basic Configuration
    strategyName: '',
    totalBudget: '',
    timeFrame: '3',
    timeFrameUnit: 'months',
    campaignType: 'search',
    primaryGoal: 'leads',
    
    // Main Focus: Target Audience & Keywords
    targetAudience: 'Car buyers in Wichita Falls and surrounding North Texas area',
    primaryKeywords: 'nissan wichita falls, nissan dealer, new nissan, used nissan',
    secondaryKeywords: 'nissan altima, nissan rogue, nissan sentra, car financing',
    negativeKeywords: 'free, cheap, wholesale, auction, salvage, junk',
    geographicTargeting: 'Wichita Falls, TX, Burkburnett, TX, Iowa Park, TX, Electra, TX',
    
    // Campaign Preferences
    biddingStrategy: 'maximize_conversions',
    targetCPA: '',
    targetROAS: '',
    maxCPC: '',
    
    // Budget Distribution
    searchBudgetPercentage: '70',
    displayBudgetPercentage: '15',
    shoppingBudgetPercentage: '10',
    videoBudgetPercentage: '5',
    
    // Additional Context
    expectedConversions: '',
    currentCTR: '',
    currentConversionRate: '',
    seasonalFactors: '',
    competitiveFocus: '',
    specialOffers: ''
  })

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/budget-strategy/generate')
      if (response.ok) {
        const data = await response.json()
        setStrategies(data.strategies || [])
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const errors = []
    if (!formData.totalBudget || parseFloat(formData.totalBudget) <= 0) errors.push('Please enter a valid total budget')
    if (!formData.targetAudience) errors.push('Please specify your target audience')
    if (!formData.primaryKeywords) errors.push('Please specify primary keywords')
    if (!formData.geographicTargeting) errors.push('Please specify geographic targeting')
    
    return errors
  }

  const generateCampaign = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`)
      return
    }

    setIsGenerating(true)
    setActiveTab('results')
    
    try {
      const payload = {
        strategyName: formData.strategyName || `Nissan Campaign ${new Date().toLocaleDateString()}`,
        totalBudget: parseFloat(formData.totalBudget),
        timeFrame: parseInt(formData.timeFrame),
        timeFrameUnit: formData.timeFrameUnit,
        campaignType: formData.campaignType,
        primaryGoal: formData.primaryGoal,
        targetAudience: formData.targetAudience,
        primaryKeywords: formData.primaryKeywords.split(',').map(s => s.trim()).filter(Boolean),
        secondaryKeywords: formData.secondaryKeywords.split(',').map(s => s.trim()).filter(Boolean),
        negativeKeywords: formData.negativeKeywords ? formData.negativeKeywords.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        geographicTargeting: formData.geographicTargeting.split(',').map(s => s.trim()).filter(Boolean),
        biddingStrategy: formData.biddingStrategy,
        targetCPA: formData.targetCPA ? parseFloat(formData.targetCPA) : undefined,
        targetROAS: formData.targetROAS ? parseFloat(formData.targetROAS) : undefined,
        maxCPC: formData.maxCPC ? parseFloat(formData.maxCPC) : undefined,
        searchBudgetPercentage: parseFloat(formData.searchBudgetPercentage),
        displayBudgetPercentage: parseFloat(formData.displayBudgetPercentage),
        shoppingBudgetPercentage: parseFloat(formData.shoppingBudgetPercentage),
        videoBudgetPercentage: parseFloat(formData.videoBudgetPercentage),
        expectedConversions: formData.expectedConversions ? parseInt(formData.expectedConversions) : undefined,
        currentCTR: formData.currentCTR ? parseFloat(formData.currentCTR) : undefined,
        currentConversionRate: formData.currentConversionRate ? parseFloat(formData.currentConversionRate) : undefined,
        seasonalFactors: formData.seasonalFactors || undefined,
        competitiveFocus: formData.competitiveFocus || undefined,
        specialOffers: formData.specialOffers || undefined
      }

      const response = await fetch('/api/budget-strategy/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        setGeneratedCampaign(data.aiCampaign)
        fetchStrategies() // Refresh the list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error generating campaign:', error)
      alert('Failed to generate campaign. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToTxt = async (strategyId: string) => {
    try {
      const response = await fetch(`/api/budget-strategy/generate?export=txt&strategyId=${strategyId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `nissan-campaign-${Date.now()}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to export campaign')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export campaign')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Car className="h-8 w-8 text-red-400" />
            Nissan of Wichita Falls Campaign Creator
          </h1>
          <p className="text-slate-400 mt-2">
            Generate AI-powered Google Ads campaigns specifically optimized for Nissan of Wichita Falls
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500/10 text-red-400">
            Nissan Optimized
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-400">
            Google Ads Ready
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="input" className="data-[state=active]:bg-red-600">
            Campaign Configuration
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-green-600">
            Generated Campaign
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
            Campaign History
          </TabsTrigger>
        </TabsList>

        {/* Input Configuration Tab */}
        <TabsContent value="input" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Basic Configuration */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-400" />
                  Basic Configuration
                </CardTitle>
                <CardDescription>Core budget and campaign settings for Nissan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Campaign Name</label>
                  <Input
                    placeholder="Nissan Wichita Falls Q1 Campaign"
                    value={formData.strategyName}
                    onChange={(e) => handleInputChange('strategyName', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Total Budget ($) *</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.totalBudget}
                    onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Time Frame *</label>
                    <Input
                      type="number"
                      placeholder="3"
                      value={formData.timeFrame}
                      onChange={(e) => handleInputChange('timeFrame', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Unit</label>
                    <Select value={formData.timeFrameUnit} onValueChange={(value) => handleInputChange('timeFrameUnit', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="quarters">Quarters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Campaign Type</label>
                  <Select value={formData.campaignType} onValueChange={(value) => handleInputChange('campaignType', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="performance_max">Performance Max</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Primary Goal</label>
                  <Select value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience & Keywords - Main Focus */}
            <Card className="bg-slate-900/50 border-slate-700 ring-2 ring-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-red-400" />
                  Target Audience & Keywords
                </CardTitle>
                <CardDescription>Primary focus: Define your target audience and keywords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Target Audience *</label>
                  <Textarea
                    placeholder="Car buyers aged 25-55 in Wichita Falls area, military personnel from Sheppard AFB, working families looking for reliable transportation"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Primary Keywords *</label>
                  <Textarea
                    placeholder="nissan wichita falls, nissan dealer, new nissan, used nissan, nissan financing"
                    value={formData.primaryKeywords}
                    onChange={(e) => handleInputChange('primaryKeywords', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Secondary Keywords</label>
                  <Textarea
                    placeholder="nissan altima, nissan rogue, nissan sentra, car financing, auto service"
                    value={formData.secondaryKeywords}
                    onChange={(e) => handleInputChange('secondaryKeywords', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Negative Keywords</label>
                  <Input
                    placeholder="free, cheap, wholesale, auction, salvage, junk"
                    value={formData.negativeKeywords}
                    onChange={(e) => handleInputChange('negativeKeywords', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Geographic Targeting *</label>
                  <Input
                    placeholder="Wichita Falls, TX, Burkburnett, TX, Iowa Park, TX, Electra, TX"
                    value={formData.geographicTargeting}
                    onChange={(e) => handleInputChange('geographicTargeting', e.target.value)}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bidding Strategy */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Bidding Strategy
                </CardTitle>
                <CardDescription>Configure bidding and optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Bidding Strategy</label>
                  <Select value={formData.biddingStrategy} onValueChange={(value) => handleInputChange('biddingStrategy', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual_cpc">Manual CPC</SelectItem>
                      <SelectItem value="enhanced_cpc">Enhanced CPC</SelectItem>
                      <SelectItem value="maximize_clicks">Maximize Clicks</SelectItem>
                      <SelectItem value="maximize_conversions">Maximize Conversions</SelectItem>
                      <SelectItem value="maximize_conversion_value">Maximize Conversion Value</SelectItem>
                      <SelectItem value="target_cpa">Target CPA</SelectItem>
                      <SelectItem value="target_roas">Target ROAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Target CPA ($)</label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={formData.targetCPA}
                      onChange={(e) => handleInputChange('targetCPA', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Target ROAS</label>
                    <Input
                      type="number"
                      placeholder="4.0"
                      value={formData.targetROAS}
                      onChange={(e) => handleInputChange('targetROAS', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Max CPC ($)</label>
                    <Input
                      type="number"
                      placeholder="3.50"
                      value={formData.maxCPC}
                      onChange={(e) => handleInputChange('maxCPC', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Distribution */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Budget Distribution
                </CardTitle>
                <CardDescription>Allocate budget across campaign types (must total 100%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Search (%)</label>
                    <Input
                      type="number"
                      value={formData.searchBudgetPercentage}
                      onChange={(e) => handleInputChange('searchBudgetPercentage', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Display (%)</label>
                    <Input
                      type="number"
                      value={formData.displayBudgetPercentage}
                      onChange={(e) => handleInputChange('displayBudgetPercentage', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Shopping (%)</label>
                    <Input
                      type="number"
                      value={formData.shoppingBudgetPercentage}
                      onChange={(e) => handleInputChange('shoppingBudgetPercentage', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Video (%)</label>
                    <Input
                      type="number"
                      value={formData.videoBudgetPercentage}
                      onChange={(e) => handleInputChange('videoBudgetPercentage', e.target.value)}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-slate-400">
                    Total: {(
                      parseFloat(formData.searchBudgetPercentage || '0') +
                      parseFloat(formData.displayBudgetPercentage || '0') +
                      parseFloat(formData.shoppingBudgetPercentage || '0') +
                      parseFloat(formData.videoBudgetPercentage || '0')
                    ).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Context */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Additional Context (Optional)
              </CardTitle>
              <CardDescription>Extra information to enhance your Nissan campaign</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Expected Conversions</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.expectedConversions}
                  onChange={(e) => handleInputChange('expectedConversions', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Current CTR (%)</label>
                <Input
                  type="number"
                  placeholder="4.2"
                  value={formData.currentCTR}
                  onChange={(e) => handleInputChange('currentCTR', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Current Conversion Rate (%)</label>
                <Input
                  type="number"
                  placeholder="5.1"
                  value={formData.currentConversionRate}
                  onChange={(e) => handleInputChange('currentConversionRate', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Seasonal Factors</label>
                <Input
                  placeholder="Spring peak sales season"
                  value={formData.seasonalFactors}
                  onChange={(e) => handleInputChange('seasonalFactors', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Competitive Focus</label>
                <Input
                  placeholder="Against Ford and Toyota dealers"
                  value={formData.competitiveFocus}
                  onChange={(e) => handleInputChange('competitiveFocus', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Special Offers</label>
                <Input
                  placeholder="0% financing, military discounts"
                  value={formData.specialOffers}
                  onChange={(e) => handleInputChange('specialOffers', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateCampaign}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-4 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Nissan Campaign...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate Nissan Campaign
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-red-400" />
              <h3 className="text-xl font-semibold text-white">Generating Your Nissan Campaign...</h3>
              <p className="text-slate-400 text-center max-w-md">
                Our AI specialist is creating a comprehensive Google Ads campaign optimized specifically for Nissan of Wichita Falls.
              </p>
            </div>
          ) : generatedCampaign ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Campaign Summary
                    </CardTitle>
                    <Button
                      onClick={() => exportToTxt(strategies[0]?.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export as TXT
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Success Probability</h3>
                      <p className="text-slate-400">AI confidence in campaign effectiveness</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{generatedCampaign.successProbability}%</div>
                      <Progress value={generatedCampaign.successProbability} className="w-24 mt-1" />
                    </div>
                  </div>
                  
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-300">{generatedCampaign.executiveSummary}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-xl font-bold text-red-400">
                        ${generatedCampaign.budgetAllocation.dailyBudget.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Daily Budget</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        {generatedCampaign.performanceProjections.expectedConversions}
                      </div>
                      <div className="text-sm text-slate-400">Expected Conversions</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-xl font-bold text-purple-400">
                        ${generatedCampaign.performanceProjections.expectedCPA}
                      </div>
                      <div className="text-sm text-slate-400">Expected CPA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Ads Content - Headlines */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Copy className="h-5 w-5 text-yellow-400" />
                    Headlines (15) - Ready to Copy
                  </CardTitle>
                  <CardDescription>Copy these headlines directly into Google Ads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {generatedCampaign.googleAdsContent.headlines.map((headline: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-sm">
                        <span className="text-slate-300">{index + 1}. {headline}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(headline)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Google Ads Content - Descriptions */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Descriptions (30) - Ready to Copy
                  </CardTitle>
                  <CardDescription>Copy these descriptions directly into Google Ads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {generatedCampaign.googleAdsContent.descriptions.map((description: string, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-slate-800/50 rounded text-sm">
                        <span className="text-slate-300 flex-1">{index + 1}. {description}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(description)}
                          className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keywords Structure */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="h-5 w-5 text-green-400" />
                    Keywords by Match Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Exact Match</h4>
                      <div className="space-y-1">
                        {generatedCampaign.googleAdsContent.keywords.exact.map((keyword: string, index: number) => (
                          <div key={index} className="text-sm text-slate-300 p-2 bg-slate-800/50 rounded">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Phrase Match</h4>
                      <div className="space-y-1">
                        {generatedCampaign.googleAdsContent.keywords.phrase.map((keyword: string, index: number) => (
                          <div key={index} className="text-sm text-slate-300 p-2 bg-slate-800/50 rounded">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Broad Match</h4>
                      <div className="space-y-1">
                        {generatedCampaign.googleAdsContent.keywords.broad.map((keyword: string, index: number) => (
                          <div key={index} className="text-sm text-slate-300 p-2 bg-slate-800/50 rounded">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Projections */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Performance Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {generatedCampaign.performanceProjections.expectedImpressions.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Expected Impressions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {generatedCampaign.performanceProjections.expectedClicks.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Expected Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {generatedCampaign.performanceProjections.expectedCTR.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">Expected CTR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {generatedCampaign.performanceProjections.expectedROAS.toFixed(1)}x
                      </div>
                      <div className="text-sm text-slate-400">Expected ROAS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Recommendations */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedCampaign.optimizationRecommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Campaign Generated Yet</h3>
              <p className="text-slate-400 mb-6">
                Configure your campaign settings and generate a Nissan-optimized campaign to see results here.
              </p>
              <Button onClick={() => setActiveTab('input')} variant="outline">
                Go to Configuration
              </Button>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Campaign History
              </CardTitle>
              <CardDescription>Previously generated Nissan campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {strategies.length > 0 ? (
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{strategy.strategy_name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              strategy.status === 'active' ? 'bg-green-500/10 text-green-400' :
                              strategy.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-slate-500/10 text-slate-400'
                            }
                          >
                            {strategy.status}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => exportToTxt(strategy.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Budget:</span>
                          <span className="text-white ml-2">${strategy.total_budget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-white ml-2">{strategy.time_frame} months</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Success Rate:</span>
                          <span className="text-white ml-2">{strategy.success_probability || 'N/A'}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-slate-400">
                        Created: {new Date(strategy.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-400">No Nissan campaigns generated yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 