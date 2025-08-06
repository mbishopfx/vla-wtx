'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageCircle, 
  Send, 
  Brain,
  BarChart3,
  Radar,
  Package,
  DollarSign,
  FileText,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  HelpCircle,
  Sparkles,
  Bot,
  User
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  contextUsed?: {
    analysesCount: number
    filesCount: number
    hasClientContext: boolean
  }
}

interface Client {
  id: string
  company_name: string
  website_url: string
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [quickQuestions] = useState([
    "How can I improve my Google Ads performance?",
    "What tools should I use to analyze my inventory?", 
    "Help me understand my competitor analysis results",
    "How do I create effective Nissan campaigns?",
    "What's the best way to price my vehicles?",
    "How do I upload and analyze my Google Ads data?"
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadClients()
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `👋 Hello! I'm your VLA Dashboard AI Assistant. I'm here to help you with:

🎯 **Campaign Analysis** - Google Ads optimization and performance insights
📦 **Inventory Management** - Vehicle pricing and inventory optimization  
🎯 **Competitor Intelligence** - Market analysis and competitive strategy
🚗 **Nissan Campaigns** - AI-powered campaign creation and management
📊 **Data Analysis** - Help interpreting your reports and analytics

I have access to all your uploaded files, analysis reports, and can guide you through using every tool in the VLA Dashboard.

What would you like help with today?`,
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agents/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: content.trim(),
          clientId: selectedClient || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          contextUsed: data.contextUsed
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const formatMessageContent = (content: string) => {
    // Basic formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index} className="mb-2">
          {line.startsWith('**') && line.endsWith('**') ? (
            <strong className="text-white">{line.slice(2, -2)}</strong>
          ) : line.startsWith('🎯') || line.startsWith('📦') || line.startsWith('🚗') ? (
            <div className="font-medium text-blue-400">{line}</div>
          ) : line.startsWith('-') ? (
            <div className="ml-4 text-slate-300">{line}</div>
          ) : (
            <span className="text-slate-300">{line}</span>
          )}
        </div>
      ))
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Assistant</h1>
              <p className="text-slate-300 text-xl">Your intelligent guide to VLA Dashboard tools and insights</p>
            </div>
          </div>

          {/* Client Selection */}
          {clients.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-700 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-300">
                    Client Context:
                  </label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-64 bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {clients.map((client) => (
                        <SelectItem 
                          key={client.id} 
                          value={client.id}
                          className="text-slate-300 focus:bg-slate-700 focus:text-white"
                        >
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-slate-400">
                    (Provides access to uploaded files and client-specific data)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-blue-400" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-4 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          <div className="prose prose-invert max-w-none">
                            {formatMessageContent(message.content)}
                          </div>
                          
                          {/* Context indicator for assistant messages */}
                          {message.role === 'assistant' && message.contextUsed && (
                            <div className="mt-3 pt-3 border-t border-slate-600 flex gap-2 text-xs">
                              {message.contextUsed.analysesCount > 0 && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                                  {message.contextUsed.analysesCount} analyses used
                                </Badge>
                              )}
                              {message.contextUsed.filesCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                                  {message.contextUsed.filesCount} files referenced
                                </Badge>
                              )}
                              {message.contextUsed.hasClientContext && (
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                                  Client context
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className={`text-xs text-slate-500 mt-1 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 order-1' 
                          : 'bg-purple-600 order-2'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        AI is thinking...
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about campaigns, inventory, competitors, or any VLA Dashboard feature..."
                    className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Tool Guide */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800 p-3 h-auto"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Available Tools */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  VLA Dashboard Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">Dashboard - Google Ads Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Radar className="h-4 w-4 text-red-400" />
                    <span className="text-slate-300">Competitor Intel</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">Inventory Optimizer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">Nissan Campaign Creator</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    Ask me about any of these tools for step-by-step guidance!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-300 space-y-2">
                  <p>💡 I can analyze your actual uploaded files and data</p>
                  <p>🎯 Ask specific questions about your campaign performance</p>
                  <p>📊 Request help interpreting analysis results</p>
                  <p>🔧 Get step-by-step tool usage guidance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 