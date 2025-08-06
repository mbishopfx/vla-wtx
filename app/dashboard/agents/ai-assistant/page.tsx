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
  HelpCircle,
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
    if (!content) return null

    // Split content into lines for processing
    const lines = content.split('\n')
    const elements: JSX.Element[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        elements.push(<div key={i} className="h-2" />)
        continue
      }

      // Handle main headers (### or ##)
      if (trimmedLine.startsWith('###') || trimmedLine.startsWith('##')) {
        const headerText = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '')
        elements.push(
          <h3 key={i} className="text-white font-bold text-lg mt-6 mb-3 border-b border-slate-600 pb-2">
            {headerText}
          </h3>
        )
        continue
      }

      // Handle subheaders (#### )
      if (trimmedLine.startsWith('####')) {
        const headerText = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '')
        elements.push(
          <h4 key={i} className="text-blue-400 font-semibold text-base mt-4 mb-2">
            {headerText}
          </h4>
        )
        continue
      }

      // Handle numbered sections (1. 2. etc.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const sectionText = trimmedLine.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')
        elements.push(
          <h4 key={i} className="text-purple-400 font-semibold text-base mt-4 mb-2 flex items-center">
            <span className="bg-purple-500/20 text-purple-300 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              {trimmedLine.match(/^(\d+)/)?.[1]}
            </span>
            {sectionText}
          </h4>
        )
        continue
      }

      // Handle bullet points with emoji/icons
      if (trimmedLine.match(/^[🎯📦🚗📊💡🔧⚡🏆⚠️📱⏰🤖🔥💰🚀]/)) {
        const content = formatInlineMarkdown(trimmedLine)
        elements.push(
          <div key={i} className="flex items-start gap-3 my-2 p-3 bg-slate-800/50 rounded-lg border-l-4 border-blue-500/50">
            <div className="text-slate-200 leading-relaxed break-words" 
                 dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )
        continue
      }

      // Handle bullet points (- or •)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        const bulletContent = trimmedLine.substring(2).trim()
        const formattedContent = formatInlineMarkdown(bulletContent)
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-4 my-1">
            <span className="text-blue-400 mt-1 text-sm">•</span>
            <div className="text-slate-300 text-sm leading-relaxed break-words flex-1" 
                 dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        )
        continue
      }

      // Handle indented bullet points
      if (trimmedLine.startsWith('  - ') || trimmedLine.startsWith('    - ')) {
        const bulletContent = trimmedLine.replace(/^\s*-\s*/, '')
        const formattedContent = formatInlineMarkdown(bulletContent)
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-8 my-1">
            <span className="text-cyan-400 mt-1 text-xs">▸</span>
            <div className="text-slate-400 text-sm leading-relaxed break-words flex-1" 
                 dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        )
        continue
      }

      // Handle special action sections
      if (trimmedLine.includes('IMMEDIATE ACTIONS') || trimmedLine.includes('SHORT TERM') || trimmedLine.includes('LONG TERM')) {
        const content = formatInlineMarkdown(trimmedLine)
        elements.push(
          <div key={i} className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 my-3">
            <div className="text-green-400 font-semibold text-lg" 
                 dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )
        continue
      }

      // Handle performance metrics or ROI sections
      if (trimmedLine.includes('ROI') || trimmedLine.includes('Performance') || trimmedLine.includes('Projection')) {
        const content = formatInlineMarkdown(trimmedLine)
        elements.push(
          <div key={i} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 my-3">
            <div className="text-purple-400 font-semibold" 
                 dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )
        continue
      }

      // Handle regular paragraphs
      if (trimmedLine.length > 0) {
        const formattedContent = formatInlineMarkdown(trimmedLine)
        elements.push(
          <div key={i} className="text-slate-300 text-sm leading-relaxed my-2 break-words" 
               dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )
      }
    }

    return <div className="space-y-1 max-w-full overflow-hidden">{elements}</div>
  }

  // Helper function to format inline markdown
  const formatInlineMarkdown = (text: string): string => {
    return text
      // Bold text **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      // Italic text *text*
      .replace(/\*([^*]+)\*/g, '<em class="text-blue-300 italic">$1</em>')
      // Code blocks `code`
      .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-cyan-300 px-2 py-1 rounded text-xs font-mono">$1</code>')
      // Numbers with % or $
      .replace(/(\$[\d,]+\.?\d*)/g, '<span class="text-green-400 font-semibold">$1</span>')
      .replace(/([\d,]+\.?\d*%)/g, '<span class="text-blue-400 font-semibold">$1</span>')
      // CTR, CPC, CPA metrics
      .replace(/(CTR|CPC|CPA|ROI|ROAS):\s*([\d.]+%?)/g, '<span class="text-purple-400 font-medium">$1:</span> <span class="text-white font-semibold">$2</span>')
      // Target indicators
      .replace(/(Target:|Projected:|Current:)/g, '<span class="text-yellow-400 font-medium">$1</span>')
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

        <div className="max-w-5xl mx-auto">
          {/* Chat Interface */}
          <div className="w-full">
            <Card className="bg-slate-900/50 border-slate-700 h-[800px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-blue-400" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] min-w-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-4 rounded-2xl break-words overflow-hidden shadow-lg ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/30' 
                            : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 border border-slate-600/50'
                        }`}>
                          <div className="prose prose-invert max-w-none overflow-hidden">
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
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700 order-1' 
                          : 'bg-gradient-to-br from-purple-500 to-purple-700 order-2'
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

                {/* Quick Question Suggestions - Show when only welcome message exists */}
                {messages.length === 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 mt-6"
                  >
                    <div className="text-center mb-4">
                      <p className="text-slate-400 text-sm">💡 Try asking one of these questions to get started:</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickQuestions.map((question, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => handleQuickQuestion(question)}
                            className="w-full p-4 h-auto text-left bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/50 hover:border-slate-600 hover:from-slate-700/60 hover:to-slate-800/40 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-500/20 rounded-lg p-1.5 mt-0.5 flex-shrink-0">
                                <HelpCircle className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-slate-300 text-sm leading-relaxed break-words">{question}</span>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 p-4 rounded-2xl shadow-lg">
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm">AI is analyzing your request...</span>
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
        </div>
      </div>
    </div>
  )
} 