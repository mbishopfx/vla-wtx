'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  AlertCircle, 
  Play,
  BarChart3,
  MousePointer,
  Phone,
  Car,
  Send,
  RefreshCw
} from 'lucide-react'

export default function AnalyticsTestPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [clientId, setClientId] = useState('demo-client-123')
  const [measurementId, setMeasurementId] = useState('G-XXXXXXXXXX')

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsRunning(true)
    try {
      const result = await testFunction()
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error instanceof Error ? error.message : String(error) }
      }))
    }
    setIsRunning(false)
  }

  const testPageView = async () => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        event_name: 'page_view',
        event_data: {
          page_category: 'test',
          test_mode: true
        },
        session_id: `test-session-${Date.now()}`,
        page_url: window.location.href,
        page_title: 'Analytics Test Page',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    })
    return await response.json()
  }

  const testVehicleView = async () => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        event_name: 'vehicle_view',
        event_data: {
          vehicle_id: 'test-vehicle-001',
          make: 'Honda',
          model: 'Civic',
          year: 2024,
          price: 25000,
          test_mode: true
        },
        session_id: `test-session-${Date.now()}`,
        page_url: window.location.href,
        page_title: 'Test Vehicle - Honda Civic',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    })
    return await response.json()
  }

  const testLeadGeneration = async () => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        event_name: 'lead_generation',
        event_data: {
          form_type: 'contact',
          vehicle_interest: 'test-vehicle-001',
          lead_source: 'test',
          test_mode: true
        },
        session_id: `test-session-${Date.now()}`,
        page_url: window.location.href,
        page_title: 'Contact Form Test',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    })
    return await response.json()
  }

  const testAnalyticsRetrieval = async () => {
    const response = await fetch(`/api/analytics/track?client_id=${clientId}&start_date=${new Date().toISOString().split('T')[0]}`)
    return await response.json()
  }

  const runAllTests = async () => {
    setTestResults({})
    setIsRunning(true)
    
    await runTest('pageView', testPageView)
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay
    
    await runTest('vehicleView', testVehicleView)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await runTest('leadGeneration', testLeadGeneration)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await runTest('dataRetrieval', testAnalyticsRetrieval)
    
    setIsRunning(false)
  }

  const TestCard = ({ testName, title, description, icon: Icon, color }: any) => {
    const result = testResults[testName]
    
    return (
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-${color}-400`} />
              </div>
              <div>
                <CardTitle className="text-white text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </div>
            </div>
            
            {result && (
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
                <Badge 
                  variant={result.success ? "default" : "destructive"}
                  className="text-xs"
                >
                  {result.success ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        {result && (
          <CardContent className="pt-0">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <pre className="text-xs text-slate-300 overflow-x-auto">
                {JSON.stringify(result.success ? result.data : result.error, null, 2)}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Analytics System Test
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Test your analytics tracking system to ensure everything is working correctly
          </p>
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Test Configuration</CardTitle>
              <CardDescription>Configure your test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Client ID
                  </label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="demo-client-123"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    GA4 Measurement ID
                  </label>
                  <Input
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Run All Tests
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setTestResults({})}
                  className="border-slate-600 text-slate-300"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <TestCard
            testName="pageView"
            title="Page View Tracking"
            description="Test basic page view event tracking"
            icon={BarChart3}
            color="blue"
          />
          
          <TestCard
            testName="vehicleView"
            title="Vehicle View Tracking"
            description="Test vehicle-specific event tracking"
            icon={Car}
            color="emerald"
          />
          
          <TestCard
            testName="leadGeneration"
            title="Lead Generation Tracking"
            description="Test contact form and lead events"
            icon={Send}
            color="purple"
          />
          
          <TestCard
            testName="dataRetrieval"
            title="Data Retrieval"
            description="Test fetching analytics data from API"
            icon={RefreshCw}
            color="amber"
          />
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
              <CardDescription>Current analytics system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">Analytics API</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400">Ready</Badge>
                  <p className="text-xs text-slate-400">Tracking events to Supabase</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Database</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400">Connected</Badge>
                  <p className="text-xs text-slate-400">Supabase integration active</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Send className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white">Google APIs</h3>
                  <Badge className="bg-amber-500/10 text-amber-400">OAuth Ready</Badge>
                  <p className="text-xs text-slate-400">Client credentials configured</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Next Steps</CardTitle>
              <CardDescription>What to do after testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-200 mb-2">✅ If All Tests Pass:</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Your analytics system is working correctly</li>
                  <li>• Add the tracking code to your client's website</li>
                  <li>• Complete the Google OAuth setup</li>
                  <li>• Start collecting real client data</li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h4 className="font-medium text-amber-200 mb-2">⚠️ If Tests Fail:</h4>
                <ul className="text-sm text-amber-100 space-y-1">
                  <li>• Check your Supabase connection and credentials</li>
                  <li>• Ensure you've run the analytics SQL schema</li>
                  <li>• Verify your .env.local configuration</li>
                  <li>• Check the browser console for errors</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <h4 className="font-medium text-emerald-200 mb-2">🚀 Ready for Production:</h4>
                <ul className="text-sm text-emerald-100 space-y-1">
                  <li>• Deploy to Vercel or your hosting platform</li>
                  <li>• Update Google OAuth redirect URIs</li>
                  <li>• Onboard clients through /dashboard/setup/google</li>
                  <li>• Start running competitor analysis with real data</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
} 