'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  AlertCircle, 
  Play,
  RefreshCw,
  Database,
  Users,
  Car,
  Settings,
  Zap
} from 'lucide-react'

interface SetupStatus {
  clientsCount: number
  vehiclesCount: number
  clients: Array<{ id: string; company_name: string; website_url: string }>
  isSetupComplete: boolean
}

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)
  const [setupResults, setSetupResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/setup')
      if (response.ok) {
        const data = await response.json()
        setSetupStatus(data.setupStatus)
      }
    } catch (error) {
      console.error('Error checking setup status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runFullSetup = async () => {
    setIsRunning(true)
    setSetupProgress(0)
    setSetupResults(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSetupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full_setup' })
      })

      clearInterval(progressInterval)
      setSetupProgress(100)

      if (response.ok) {
        const data = await response.json()
        setSetupResults(data)
        await checkSetupStatus() // Refresh status
      } else {
        const errorData = await response.json()
        setSetupResults({ success: false, error: errorData.error || 'Setup failed' })
      }
    } catch (error) {
      console.error('Setup error:', error)
      setSetupResults({ success: false, error: 'Network error during setup' })
    } finally {
      setIsRunning(false)
    }
  }

  const StatusCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="mx-auto max-w-4xl flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg">Checking system status...</p>
          </div>
        </div>
      </div>
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
            System Setup
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Initialize your VLA Dashboard with real client data and vehicle inventory
          </p>
        </motion.div>

        {/* System Status */}
        {setupStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <StatusCard
              title="Active Clients"
              value={setupStatus.clientsCount}
              icon={Users}
              color="blue"
              description="Configured dealership clients"
            />
            <StatusCard
              title="Vehicle Inventory"
              value={setupStatus.vehiclesCount}
              icon={Car}
              color="emerald"
              description="Imported vehicle records"
            />
            <StatusCard
              title="System Status"
              value={setupStatus.isSetupComplete ? "Ready" : "Needs Setup"}
              icon={setupStatus.isSetupComplete ? CheckCircle2 : AlertCircle}
              color={setupStatus.isSetupComplete ? "emerald" : "amber"}
              description={setupStatus.isSetupComplete ? "All systems operational" : "Setup required"}
            />
          </motion.div>
        )}

        {/* Setup Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setup Actions
              </CardTitle>
              <CardDescription>
                Initialize your system with Nissan of Wichita Falls data and vehicle inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Setup Progress */}
              {isRunning && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Setup Progress</span>
                    <span className="text-slate-400">{setupProgress}%</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                  <p className="text-sm text-slate-400">
                    {setupProgress < 30 && "Creating client records..."}
                    {setupProgress >= 30 && setupProgress < 70 && "Setting up database tables..."}
                    {setupProgress >= 70 && setupProgress < 100 && "Importing vehicle data..."}
                    {setupProgress === 100 && "Setup complete!"}
                  </p>
                </div>
              )}

              {/* Setup Results */}
              {setupResults && (
                <div className={`p-4 rounded-lg border ${
                  setupResults.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {setupResults.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`font-medium ${
                      setupResults.success ? 'text-emerald-200' : 'text-red-200'
                    }`}>
                      {setupResults.success ? 'Setup Successful!' : 'Setup Failed'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    setupResults.success ? 'text-emerald-100' : 'text-red-100'
                  }`}>
                    {setupResults.message || setupResults.error}
                  </p>
                  
                  {setupResults.results && (
                    <div className="mt-3 space-y-1 text-xs">
                      <p className="text-slate-300">
                        • Client: {setupResults.results.clientCreated ? 'Created' : 'Already exists'}
                      </p>
                      <p className="text-slate-300">
                        • Vehicles: {setupResults.results.vehicleCount} imported
                      </p>
                      {setupResults.results.errors?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-red-300">Errors:</p>
                          {setupResults.results.errors.map((error: string, index: number) => (
                            <p key={index} className="text-red-200 text-xs">• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={runFullSetup}
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Full Setup
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={checkSetupStatus}
                  disabled={isRunning}
                  className="border-slate-600 text-slate-300"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Current Clients */}
        {setupStatus?.clients && setupStatus.clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Current Clients</CardTitle>
                <CardDescription>Active clients in your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {setupStatus.clients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{client.company_name}</p>
                        <p className="text-sm text-slate-400">{client.website_url}</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Next Steps</CardTitle>
              <CardDescription>What to do after setup is complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {setupStatus?.isSetupComplete ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-200 mb-2">🎉 Setup Complete!</h4>
                  <ul className="text-sm text-emerald-100 space-y-1">
                    <li>• Visit <strong>/dashboard/analytics</strong> to view real-time analytics</li>
                    <li>• Test the <strong>Competitor Intelligence</strong> system</li>
                    <li>• Try the <strong>Inventory Optimizer</strong> with real vehicle data</li>
                    <li>• Configure Google API integrations for enhanced data</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-amber-200 mb-2">⚡ Setup Required</h4>
                  <ul className="text-sm text-amber-100 space-y-1">
                    <li>• Run the full setup to create your first client</li>
                    <li>• Import vehicle inventory data for testing</li>
                    <li>• Ensure your Supabase database is properly configured</li>
                    <li>• Check your environment variables are set correctly</li>
                  </ul>
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
} 