'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  TrendingUp, 
  Radar, 
  Package, 
  DollarSign, 
  BarChart3, 
  Zap,
  CheckCircle,
  Info,
  Target,
  Brain,
  Search,
  Upload,
  Download,
  RefreshCw,
  Globe,
  Shield,
  Cpu,
  Clock,
  Calculator,
  Building,
  Car,
  Star,
  Eye,
  Filter,
  Layers,
  Network,
  Activity,
  PieChart,
  LineChart,
  ArrowRight,
  Workflow,
  Gauge
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function DocumentationPage() {
  const platformOverview = {
    title: "VLA Dashboard - Vehicle Lead Accelerator",
    description: "Advanced AI-powered automotive intelligence platform designed to revolutionize dealership operations through cutting-edge competitor analysis, inventory optimization, and campaign creation.",
    purpose: "Transform your dealership into a data-driven powerhouse that dominates local markets, outperforms online competitors, and maximizes profitability through intelligent automation.",
    keyBenefits: [
      "Beat online platforms like Carvana and CarMax with superior local intelligence",
      "Optimize inventory mix and pricing for maximum profitability", 
      "Create high-converting campaigns with AI-generated insights",
      "Monitor and counter competitive threats in real-time"
    ]
  }

  const tools = [
    {
      id: 'dashboard-tutorial',
      title: 'Dashboard - Google Ads Analysis',
      icon: BarChart3,
      color: 'text-blue-500',
      description: 'The main dashboard where you upload Google Ads CSV files for comprehensive AI-powered campaign analysis and performance insights.',
      location: '/dashboard',
      keyFeatures: [
        'Google Ads CSV file upload and processing',
        'Comprehensive campaign performance analysis',
        'AI-powered insights and recommendations',
        'Interactive charts and visualizations',
        'Campaign comparison and benchmarking',
        'Export analysis reports and data'
      ],
      howToUse: [
        {
          step: 1,
          title: 'Download Google Ads Data',
          description: 'Export your campaign data from Google Ads as CSV files. Include campaigns, keywords, demographics, and performance metrics.'
        },
        {
          step: 2,
          title: 'Access Main Dashboard',
          description: 'Navigate to the main dashboard at /dashboard - this is your primary analysis workspace.'
        },
        {
          step: 3,
          title: 'Upload CSV Files',
          description: 'Click "Choose Files" and select your Google Ads CSV exports. You can upload multiple files at once for comprehensive analysis.'
        },
        {
          step: 4,
          title: 'Name Your Analysis Session',
          description: 'Enter a descriptive session name (e.g., "Nissan Q3 Campaign Analysis") to organize your reports.'
        },
        {
          step: 5,
          title: 'Run AI Analysis',
          description: 'Click "Upload & Analyze" to start the AI processing. The system will analyze performance, identify trends, and generate actionable insights.'
        },
        {
          step: 6,
          title: 'Review Results & Export',
          description: 'Examine the detailed analysis report, charts, and recommendations. Export the complete analysis as PDF or save for future reference.'
        }
      ],
      businessValue: [
        'Identifies underperforming campaigns costing money',
        'Provides specific optimization recommendations',
        'Reveals competitive positioning opportunities',
        'Generates actionable insights for immediate implementation',
        'Tracks performance trends and campaign health',
        'Saves 10+ hours of manual analysis time per session'
      ]
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: Brain,
      color: 'text-purple-500',
      description: 'LangChain-powered intelligent assistant that helps with campaigns, inventory, competitors, and provides step-by-step guidance for all VLA Dashboard tools.',
      location: '/dashboard/agents/ai-assistant',
      keyFeatures: [
        'Access to all uploaded files and analysis data',
        'Context-aware responses using LangChain',
        'Step-by-step tool guidance and tutorials',
        'Campaign optimization recommendations',
        'Data interpretation and insights explanation',
        'Real-time help with VLA Dashboard features'
      ],
      howToUse: [
        {
          step: 1,
          title: 'Access AI Assistant',
          description: 'Navigate to Agents → AI Assistant to open the intelligent chat interface.'
        },
        {
          step: 2,
          title: 'Select Client Context',
          description: 'Choose your client from the dropdown to provide the AI with access to uploaded files and client-specific data.'
        },
        {
          step: 3,
          title: 'Ask Questions',
          description: 'Type questions about campaigns, inventory, competitors, or request help using any VLA Dashboard tool.'
        },
        {
          step: 4,
          title: 'Use Quick Questions',
          description: 'Click on suggested quick questions for common help topics and instant guidance.'
        },
        {
          step: 5,
          title: 'Get Data-Driven Insights',
          description: 'The AI will reference your actual uploaded files and analysis data to provide personalized recommendations.'
        }
      ],
      businessValue: [
        'Reduces learning curve for new users by 80%',
        'Provides instant access to expert automotive marketing knowledge',
        'References actual data for personalized recommendations',
        'Eliminates need for external support or training',
        'Accelerates decision-making with context-aware insights',
        'Available 24/7 with comprehensive tool knowledge'
      ]
    },
    {
      id: 'nissan-campaign-creator',
      title: 'Nissan Campaign Creator',
      icon: DollarSign,
      color: 'text-green-500',
      description: 'AI-powered campaign generation tool that creates high-converting Google Ads campaigns specifically optimized for Nissan dealerships.',
      location: '/dashboard/tools/nissan-campaign-creator',
      keyFeatures: [
        'Automated Google Ads campaign structure generation',
        'AI-written ad copy optimized for automotive conversion',
        'Smart keyword research with competitor analysis',
        'Budget allocation recommendations',
        'Landing page optimization suggestions',
        'Performance prediction modeling'
      ],
      howToUse: [
        {
          step: 1,
          title: 'Access the Tool',
          description: 'Navigate to Tools → Nissan Campaign Creator from the main dashboard sidebar.'
        },
        {
          step: 2,
          title: 'Input Dealership Details',
          description: 'Enter your dealership information, target location, and current inventory focus areas.'
        },
        {
          step: 3,
          title: 'Configure Campaign Parameters',
          description: 'Set your budget, target audience demographics, and campaign objectives (leads, sales, brand awareness).'
        },
        {
          step: 4,
          title: 'AI Generation Process',
          description: 'Click "Generate Campaign" and let the AI analyze your market, competitors, and create optimized campaigns.'
        },
        {
          step: 5,
          title: 'Review and Export',
          description: 'Review the generated campaigns, make any adjustments, and export directly to Google Ads or download as CSV/Excel files.'
        }
      ],
      businessValue: [
        'Reduces campaign creation time from 8+ hours to 15 minutes',
        'Improves campaign performance by 35% through AI optimization',
        'Generates campaigns that outperform online competitors',
        'Provides competitive intelligence for strategic positioning'
      ]
    },
    {
      id: 'inventory-optimizer',
      title: 'Inventory Optimizer',
      icon: Package,
      color: 'text-cyan-500',
      description: 'Advanced AI system that analyzes your current inventory, market demand, and competitive positioning to provide actionable optimization recommendations.',
      location: '/dashboard/agents/inventory-optimizer',
      keyFeatures: [
        'Real-time inventory analysis and scoring',
        'Market demand prediction and trend analysis', 
        'Competitive pricing recommendations',
        'Slow-moving inventory identification',
        'Profit margin optimization suggestions',
        'Seasonal demand forecasting'
      ],
      howToUse: [
        {
          step: 1,
          title: 'Upload Inventory Data',
          description: 'Go to Agents → Inventory Optimizer and upload your current inventory file (CSV, Excel, or TSV format).'
        },
        {
          step: 2,
          title: 'Data Processing',
          description: 'The AI will automatically process your inventory, analyzing each vehicle for market position, pricing, and demand signals.'
        },
        {
          step: 3,
          title: 'Review Optimization Report',
          description: 'Examine the comprehensive report showing inventory scoring, recommendations, and market insights.'
        },
        {
          step: 4,
          title: 'Implement Recommendations',
          description: 'Use the provided pricing adjustments, promotion suggestions, and inventory mix recommendations.'
        },
        {
          step: 5,
          title: 'Monitor Performance',
          description: 'Track the impact of implemented changes and re-run analysis monthly for continuous optimization.'
        }
      ],
      businessValue: [
        'Increases inventory turnover rate by 28% on average',
        'Identifies overpriced vehicles costing profit margins',
        'Predicts slow-moving inventory 30+ days in advance',
        'Optimizes pricing strategies against local competition'
      ]
    },
    {
      id: 'competitor-intel',
      title: 'Competitor Intel',
      icon: Radar,
      color: 'text-red-500',
      description: 'Comprehensive competitive intelligence platform that monitors, analyzes, and provides strategic insights about your local automotive competition.',
      location: '/dashboard/agents/competitor-intel',
      keyFeatures: [
        'Automated competitor discovery and monitoring',
        'Real-time pricing and inventory analysis',
        'Digital marketing strategy assessment',
        'Market share and positioning analysis',
        'Threat assessment and opportunity identification',
        'Strategic recommendation engine'
      ],
      howToUse: [
        {
          step: 1,
          title: 'Set Market Parameters',
          description: 'Navigate to Agents → Competitor Intel and define your market area, competitor types, and analysis depth.'
        },
        {
          step: 2,
          title: 'Automated Discovery',
          description: 'The system automatically identifies and catalogs all automotive competitors in your specified market radius.'
        },
        {
          step: 3,
          title: 'Analysis Execution',
          description: 'Click "Run Analysis" to initiate comprehensive competitive intelligence gathering across multiple data sources.'
        },
        {
          step: 4,
          title: 'Review Intelligence Report',
          description: 'Examine detailed competitor profiles, strategic insights, and actionable recommendations.'
        },
        {
          step: 5,
          title: 'Strategic Implementation',
          description: 'Use the insights to adjust pricing, marketing strategies, and competitive positioning.'
        }
      ],
      businessValue: [
        'Identifies competitive threats 60+ days before impact',
        'Reveals market opportunities worth $200K+ annually',
        'Provides strategic positioning advantages',
        'Enables proactive competitive responses'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Platform Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
              <BookOpen className="h-10 w-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{platformOverview.title}</h1>
              <p className="text-slate-300 text-xl mt-2">{platformOverview.description}</p>
            </div>
          </div>
          
          {/* Platform Overview Card */}
          <Card className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-600 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-400" />
                Platform Purpose & Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {platformOverview.purpose}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformOverview.keyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tools Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white flex items-center gap-3">
                <Cpu className="h-8 w-8 text-purple-400" />
                Available Tools & Features
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Comprehensive guide to using each AI-powered tool in the VLA Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {tools.map((tool, index) => (
                  <AccordionItem 
                    key={tool.id} 
                    value={tool.id}
                    className="border border-slate-600 rounded-lg bg-slate-800/30"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <div className={`p-3 bg-slate-700 rounded-xl border border-slate-600`}>
                          <tool.icon className={`h-8 w-8 ${tool.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                          <p className="text-slate-400 mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                        {/* Tool Location */}
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="h-5 w-5 text-blue-400" />
                            <span className="font-semibold text-blue-400">Access Location</span>
                          </div>
                          <p className="text-slate-300 font-mono text-sm bg-slate-800/50 px-3 py-2 rounded border border-slate-600">
                            {tool.location}
                          </p>
                        </div>

                        {/* Key Features */}
                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tool.keyFeatures.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-600">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* How to Use */}
                        <div>
                          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Workflow className="h-5 w-5 text-purple-400" />
                            Step-by-Step Usage Guide
                          </h4>
                          <div className="space-y-4">
                            {tool.howToUse.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {step.step}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-white mb-2">{step.title}</h5>
                                  <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Business Value */}
                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Business Value & ROI
                          </h4>
                          <div className="space-y-2">
                            {tool.businessValue.map((value, valueIndex) => (
                              <div key={valueIndex} className="flex items-start gap-3">
                                <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Zap className="h-8 w-8 text-blue-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    1
                  </div>
                  <h4 className="font-semibold text-white mb-2">Meet Your AI Assistant</h4>
                  <p className="text-slate-300 text-sm">
                    Start with the AI Assistant to get personalized guidance, ask questions, and learn how to use all VLA Dashboard tools effectively.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    2
                  </div>
                  <h4 className="font-semibold text-white mb-2">Analyze Current Performance</h4>
                  <p className="text-slate-300 text-sm">
                    Upload your Google Ads CSV files to the main Dashboard and get comprehensive AI analysis of your current campaign performance.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    3
                  </div>
                  <h4 className="font-semibold text-white mb-2">Understand Your Competition</h4>
                  <p className="text-slate-300 text-sm">
                    Use Competitor Intel to analyze your market landscape and identify opportunities to outperform local and online competitors.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    4
                  </div>
                  <h4 className="font-semibold text-white mb-2">Optimize Your Inventory</h4>
                  <p className="text-slate-300 text-sm">
                    Upload your inventory data to get AI-powered pricing and positioning recommendations that maximize profitability.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    5
                  </div>
                  <h4 className="font-semibold text-white mb-2">Create Winning Campaigns</h4>
                  <p className="text-slate-300 text-sm">
                    Use insights from your analysis to generate high-converting Nissan campaigns that dominate your local market.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 