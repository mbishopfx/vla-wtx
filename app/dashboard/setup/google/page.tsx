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
  ExternalLink,
  Copy,
  HelpCircle,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Search,
  DollarSign
} from 'lucide-react'

export default function GoogleSetupPage() {
  const [step, setStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [clientData, setClientData] = useState({
    analyticsPropertyId: '',
    adsCustomerId: '',
    searchConsoleDomain: ''
  })

  // Mock client ID - replace with actual client ID from auth/context
  const clientId = 'demo-client-id'

  const handleConnectGoogle = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/auth/google/initiate?clientId=${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Error initiating Google OAuth:', error)
      setIsConnecting(false)
    }
  }

  const handleSaveAccountInfo = async () => {
    try {
      const response = await fetch('/api/clients/google-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          googleAnalyticsPropertyId: clientData.analyticsPropertyId,
          googleAdsCustomerId: clientData.adsCustomerId,
          googleSearchConsoleDomain: clientData.searchConsoleDomain
        })
      })

      if (response.ok) {
        setStep(4) // Success step
      }
    } catch (error) {
      console.error('Error saving account info:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Connect Your Google Accounts
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get real data from your Google Analytics, Ads, and Search Console for competitive intelligence
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {step > stepNum ? <CheckCircle2 className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-blue-600' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >

          {/* Step 1: Understanding */}
          {step === 1 && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-400" />
                  How This Works
                </CardTitle>
                <CardDescription className="text-slate-400">
                  No technical setup required on your end! Here's what happens:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white">1. You Grant Permission</h3>
                    <p className="text-sm text-slate-400">
                      You'll log in with YOUR Google account and give us permission to access your data
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">2. We Access Your Data</h3>
                    <p className="text-sm text-slate-400">
                      Our system can now pull real data from your Google Analytics, Ads, and Search Console
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">3. Get Real Insights</h3>
                    <p className="text-sm text-slate-400">
                      We analyze your real data against competitors for strategic insights
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-medium">Important:</p>
                      <p className="text-blue-100 text-sm mt-1">
                        You don't need to set up any APIs or technical configuration. 
                        Just click "Connect" and log in with your Google account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    I Understand
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Connect Google */}
          {step === 2 && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  Connect Your Google Account
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Click the button below to securely connect your Google accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjRkZDMTA3IiBkPSJtNDMuNjExIDIwLjA4M0g0MlYyMEgyNHY4aDExLjMwM2MtMS42NDkgNC42NTctNi4wOCA4LTExLjMwMyA4LTYuNjI3IDAtMTItNS4zNzMtMTItMTJzNS4zNzMtMTIgMTItMTJjMy4wNTkgMCA1Ljg0MiAxLjE1NCA3Ljk2MSAzLjAzOWw1LjY1Ny01LjY1N0MzNC4wNDYgNi4wNTMgMjkuMjY4IDQgMjQgNGMtMTEuMDQ5IDAtMjAgOC45NTEtMjAgMjBzOC45NTEgMjAgMjAgMjBjMTEuMDQ5IDAgMjAtOC45NTEgMjAtMjAgMC0xLjM0MS0uMTM4LTIuNjUtLjM4OS0zLjkxN3oiLz48cGF0aCBmaWxsPSIjRkYzRDAwIiBkPSJtNi4zMDYgMTQuNjkxIDYuNTcxIDQuODE5QzE0LjY1NSAxNS4xMDggMTguOTYxIDEyIDI0IDEyYzMuMDU5IDAgNS44NDIgMS4xNTQgNy45NjEgMy4wMzlsNS42NTctNS42NTdDMzQuMDQ2IDYuMDUzIDI5LjI2OCA0IDI0IDQgMTYuMzE4IDQgOS42NTYgOC4zMzcgNi4zMDYgMTQuNjkxeiIvPjxwYXRoIGZpbGw9IiM0Q0FGNTAI" 
                      alt="Google" 
                      className="w-12 h-12"
                    />
                  </div>

                  <Button
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Connect with Google
                      </span>
                    )}
                  </Button>

                  <p className="text-sm text-slate-400">
                    You'll be redirected to Google to grant permissions safely and securely
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <BarChart3 className="h-8 w-8 text-blue-400 mx-auto" />
                    <p className="text-sm font-medium text-white">Google Analytics</p>
                    <p className="text-xs text-slate-400">Website traffic & behavior</p>
                  </div>
                  <div className="space-y-2">
                    <DollarSign className="h-8 w-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-medium text-white">Google Ads</p>
                    <p className="text-xs text-slate-400">Campaign performance</p>
                  </div>
                  <div className="space-y-2">
                    <Search className="h-8 w-8 text-purple-400 mx-auto" />
                    <p className="text-sm font-medium text-white">Search Console</p>
                    <p className="text-xs text-slate-400">Search rankings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Account Information */}
          {step === 3 && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Now we need your specific account IDs to pull the right data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* GA4 Property ID */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Google Analytics 4 Property ID
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="123456789"
                      value={clientData.analyticsPropertyId}
                      onChange={(e) => setClientData(prev => ({ ...prev, analyticsPropertyId: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-blue-200">
                        <strong>Where to find this:</strong> Google Analytics → Admin → Property Settings → Property ID
                      </p>
                      <p className="text-xs text-blue-300 mt-1">
                        Format: 9-digit number like "123456789"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Ads Customer ID */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Google Ads Customer ID
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="123-456-7890"
                      value={clientData.adsCustomerId}
                      onChange={(e) => setClientData(prev => ({ ...prev, adsCustomerId: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-sm text-emerald-200">
                        <strong>Where to find this:</strong> Google Ads → Settings → Account Settings → Customer ID
                      </p>
                      <p className="text-xs text-emerald-300 mt-1">
                        Format: "123-456-7890" (with or without dashes)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Console Domain */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Website Domain (Search Console)
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="https://yourwebsite.com"
                      value={clientData.searchConsoleDomain}
                      onChange={(e) => setClientData(prev => ({ ...prev, searchConsoleDomain: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-sm text-purple-200">
                        <strong>Your verified domain in Search Console</strong>
                      </p>
                      <p className="text-xs text-purple-300 mt-1">
                        Format: "https://yourwebsite.com" or "sc-domain:yourwebsite.com"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-200 font-medium">Not sure where to find these?</p>
                      <p className="text-amber-100 text-sm mt-1">
                        That tag you mentioned (AW-696993687) is a conversion tracking tag, not what we need. 
                        We need the account IDs from the admin sections of each Google service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-slate-600 text-slate-300"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSaveAccountInfo}
                    disabled={!clientData.analyticsPropertyId || !clientData.adsCustomerId}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Save & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  Successfully Connected!
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your Google accounts are now connected and we can access your real data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">All Set!</h3>
                  <p className="text-slate-400">
                    We can now pull real data from your Google accounts for competitive analysis
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 mb-2">Connected</Badge>
                    <p className="text-sm font-medium text-white">Google Analytics</p>
                    <p className="text-xs text-slate-400">Property: {clientData.analyticsPropertyId}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 mb-2">Connected</Badge>
                    <p className="text-sm font-medium text-white">Google Ads</p>
                    <p className="text-xs text-slate-400">Customer: {clientData.adsCustomerId}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 mb-2">Connected</Badge>
                    <p className="text-sm font-medium text-white">Search Console</p>
                    <p className="text-xs text-slate-400">Domain: {clientData.searchConsoleDomain}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  )
} 