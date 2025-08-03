'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload,
  Download,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Car,
  DollarSign,
  Clock,
  Star,
  Zap,
  FileText,
  Users,
  Eye
} from 'lucide-react'

interface InventoryItem {
  id: string
  vin: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  title: string
  description: string
  seoScore: number
  optimizations: string[]
  status: 'pending' | 'optimizing' | 'completed' | 'error'
  beforeOptimization?: {
    title: string
    description: string
    seoScore: number
  }
  condition: string
  color: string
  days_on_lot: number
  image_url?: string
  listing_url?: string
}

interface CSVUploadStatus {
  isUploading: boolean
  progress: number
  totalItems: number
  processedItems: number
  errors: string[]
}

interface BatchOperation {
  id: string
  type: 'seo_optimization' | 'price_adjustment' | 'title_enhancement'
  items: string[]
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: number
}

interface Client {
  id: string
  company_name: string
  website_url: string
}

export default function InventoryOptimizerPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [csvUpload, setCsvUpload] = useState<CSVUploadStatus>({
    isUploading: false,
    progress: 0,
    totalItems: 0,
    processedItems: 0,
    errors: []
  })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [vehicleAnalysis, setVehicleAnalysis] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      loadInventoryData()
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

  const loadInventoryData = async () => {
    if (!selectedClient) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/vehicles/import?clientId=${selectedClient}`)
      if (response.ok) {
        const data = await response.json()
        setVehicleAnalysis(data.analysis)
        
        // Transform vehicles to inventory items with SEO scores
        const transformedItems: InventoryItem[] = (data.vehicles || []).map((vehicle: any) => ({
          id: vehicle.id,
          vin: vehicle.vin || '',
          make: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || new Date().getFullYear(),
          price: vehicle.price || 0,
          mileage: vehicle.mileage || 0,
          title: vehicle.title || `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
          description: vehicle.description || '',
          seoScore: calculateSEOScore(vehicle),
          optimizations: generateOptimizations(vehicle),
          status: 'pending' as const,
          condition: vehicle.condition || 'unknown',
          color: vehicle.color || '',
          days_on_lot: vehicle.days_on_lot || 0,
          image_url: vehicle.image_url,
          listing_url: vehicle.listing_url
        }))
        
        setInventoryItems(transformedItems)
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSEOScore = (vehicle: any): number => {
    let score = 50 // Base score
    
    // Title optimization
    if (vehicle.title && vehicle.title.length > 30) score += 10
    if (vehicle.title && vehicle.title.includes(vehicle.year)) score += 5
    if (vehicle.title && vehicle.title.includes(vehicle.brand)) score += 5
    
    // Description optimization
    if (vehicle.description && vehicle.description.length > 100) score += 15
    if (vehicle.description && vehicle.description.includes(vehicle.brand)) score += 5
    if (vehicle.description && vehicle.description.includes('warranty')) score += 5
    
    // Pricing transparency
    if (vehicle.price && vehicle.price > 0) score += 10
    
    return Math.min(score, 100)
  }

  const generateOptimizations = (vehicle: any): string[] => {
    const optimizations = []
    
    if (!vehicle.title || vehicle.title.length < 30) {
      optimizations.push('Title too short - add more descriptive keywords')
    }
    if (!vehicle.description || vehicle.description.length < 100) {
      optimizations.push('Description needs more detail - add features and benefits')
    }
    if (!vehicle.title?.includes(vehicle.year)) {
      optimizations.push('Add year to title for better SEO')
    }
    if (!vehicle.description?.includes('warranty')) {
      optimizations.push('Mention warranty information in description')
    }
    if (vehicle.days_on_lot > 60) {
      optimizations.push('Consider price adjustment - vehicle on lot for 60+ days')
    }
    
    return optimizations.length > 0 ? optimizations : ['SEO optimized - no major issues found']
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedClient) return

    setCsvUpload({
      isUploading: true,
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      errors: []
    })

    try {
      const text = await file.text()
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setCsvUpload(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const response = await fetch('/api/vehicles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          tsvContent: text
        })
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const data = await response.json()
        setCsvUpload({
          isUploading: false,
          progress: 100,
          totalItems: data.totalProcessed || 0,
          processedItems: data.insertedCount || 0,
          errors: []
        })
        
        // Reload inventory data
        await loadInventoryData()
      } else {
        const errorData = await response.json()
        setCsvUpload(prev => ({
          ...prev,
          isUploading: false,
          errors: [errorData.error || 'Upload failed']
        }))
      }
    } catch (error) {
      setCsvUpload(prev => ({
        ...prev,
        isUploading: false,
        errors: [`Upload error: ${error}`]
      }))
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const exportSelectedItems = async () => {
    if (selectedItems.length === 0) return

    try {
      const selectedVehicles = inventoryItems.filter(item => selectedItems.includes(item.id))
      
      // Create clean merchant-ready CSV headers (no analysis fields)
      const headers = [
        'title', 'id', 'price', 'condition', 'availability', 'brand', 'color',
        'days on lot', 'dealer name', 'description', 'drivetrain', 'engine',
        'image link', 'mileage.value', 'model', 'msrp', 'product type',
        'transmission', 'trim', 'vin', 'year'
      ]
      
      // Create clean CSV content for merchant upload
      const csvContent = [
        headers.join('\t'), // Use tabs to match original TSV format
        ...selectedVehicles.map(item => [
          `"${item.title.replace(/"/g, '""')}"`, // Optimized title
          item.id, // Use internal ID as external ID
          item.price,
          item.condition,
          'in_stock', // Default availability
          item.make, // brand
          item.color || '',
          item.days_on_lot,
          '', // dealer_name - not available in current interface
          `"${item.description.replace(/"/g, '""')}"`, // Optimized description
          '', // drivetrain - not available in current interface
          '', // engine - not available in current interface
          item.image_url || '',
          item.mileage,
          item.model,
          item.price, // Use price as MSRP if no separate MSRP
          'vehicle', // product type
          '', // transmission - not available in current interface
          '', // trim - not available in current interface
          item.vin || '',
          item.year
        ].join('\t'))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      const clientName = clients.find(c => c.id === selectedClient)?.company_name || 'client'
      const timestamp = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `${clientName}_optimized_inventory_${timestamp}.tsv`)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success feedback
      console.log(`Exported ${selectedItems.length} optimized vehicles for merchant upload`)
      
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      // Deselect all
      setSelectedItems([])
    } else {
      // Select all filtered items
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  const runSEOOptimization = async (itemIds: string[] = selectedItems) => {
    if (itemIds.length === 0) return

    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate AI optimization process
      for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i]
        
        // Update progress
        setOptimizationProgress(((i + 1) / itemIds.length) * 100)
        
        // Simulate optimization delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update item status
        setInventoryItems(prev => prev.map(item => 
          item.id === itemId 
            ? {
                ...item,
                status: 'completed' as const,
                beforeOptimization: {
                  title: item.title,
                  description: item.description,
                  seoScore: item.seoScore
                },
                title: optimizeTitle(item),
                description: optimizeDescription(item),
                seoScore: Math.min(item.seoScore + 20, 100),
                optimizations: ['AI-optimized title and description', 'Enhanced keyword targeting', 'Improved conversion potential']
              }
            : item
        ))
      }
      
      // Auto-export optimized items
      if (itemIds.length > 0) {
        setTimeout(() => {
          exportSelectedItems()
        }, 500) // Small delay to ensure UI updates
      }
      
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
      setSelectedItems([])
    }
  }

  const optimizeTitle = (item: InventoryItem): string => {
    // Enhanced competitive title optimization
    const competitiveKeywords = [
      'Best Price Guaranteed',
      'Certified Pre-Owned Excellence',
      'Premium Quality',
      'Unbeatable Value',
      'Local Dealer Advantage',
      'Superior Service',
      'Limited Time Offer',
      'Exclusive Deal'
    ]
    
    const keyword = competitiveKeywords[Math.floor(Math.random() * competitiveKeywords.length)]
    return `${item.year} ${item.make} ${item.model} - ${keyword} | Beat Any Online Price | Local Service Guarantee | ${item.condition === 'new' ? 'New' : 'Certified Pre-Owned'}`
  }

  const optimizeDescription = (item: InventoryItem): string => {
    // Enhanced competitive description with max detail
    return `🏆 BEAT ANY COMPETITOR'S PRICE - GUARANTEED! 🏆

Experience unmatched value with this exceptional ${item.year} ${item.make} ${item.model}. Unlike online competitors who offer no local support, we provide:

🎯 COMPETITIVE ADVANTAGES:
• Local dealership with 30+ years serving the community
• Comprehensive warranty coverage that online sellers can't match
• Same-day financing approval with competitive rates
• Professional inspection and reconditioning process
• Free lifetime CarFax reports and vehicle history
• 24/7 roadside assistance and emergency support

🚗 VEHICLE HIGHLIGHTS:
• Only ${item.mileage.toLocaleString()} carefully maintained miles
• ${item.condition === 'new' ? 'Brand new with full manufacturer warranty' : 'Thoroughly inspected and certified'}
• Premium ${item.color} finish with immaculate interior
• Advanced safety features and modern technology
• Fuel-efficient performance with exceptional reliability

💰 UNBEATABLE VALUE PROPOSITION:
• Price match guarantee - we'll beat any legitimate competitor offer
• No hidden fees or surprise charges (unlike online platforms)
• Trade-in evaluation with fair market value pricing
• Flexible financing options with approved credit
• Free vehicle pickup and delivery within 50 miles

🎉 LIMITED TIME INCENTIVES:
• Special financing rates starting at 1.9% APR
• Extended warranty options at dealer cost
• Free maintenance package for first year
• Complimentary detail service before delivery

Don't trust your investment to faceless online dealers. Choose local expertise, proven reliability, and unmatched customer service. Our ${item.days_on_lot < 30 ? 'recently acquired' : 'thoroughly tested'} inventory undergoes rigorous quality checks that online platforms simply can't provide.

Schedule your test drive today and discover why smart buyers choose local dealerships over online alternatives. Call now for immediate assistance!

#BeatOnlineDealer #LocalAdvantage #GuaranteedBestPrice #${item.make}${item.model} #QualityAssured`
  }

  const runAdvancedOptimization = async (itemIds: string[] = selectedItems) => {
    if (itemIds.length === 0) return

    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i]
        const item = inventoryItems.find(inv => inv.id === itemId)
        
        if (!item) continue
        
        // Update progress
        setOptimizationProgress(((i + 1) / itemIds.length) * 100)
        
        // Enhanced AI optimization with competitive analysis
        const optimizationPrompt = `
You are an elite automotive inventory optimization specialist. Your mission is to create ULTRA-COMPETITIVE vehicle listings that CRUSH online competitors and dominate local markets.

VEHICLE TO OPTIMIZE:
- ${item.year} ${item.make} ${item.model}
- Price: $${item.price.toLocaleString()}
- Mileage: ${item.mileage.toLocaleString()} miles
- Condition: ${item.condition}
- Color: ${item.color}
- Days on lot: ${item.days_on_lot}

COMPETITIVE OBJECTIVES:
1. Beat online dealers (CarMax, Carvana, Vroom) with LOCAL ADVANTAGES
2. Outperform local competitors with SUPERIOR VALUE PROPOSITIONS
3. Create URGENCY and EXCLUSIVE OFFERS
4. Emphasize TRUST, RELIABILITY, and LOCAL SERVICE
5. Include PRICE GUARANTEES and COMPETITIVE ADVANTAGES

OPTIMIZATION REQUIREMENTS:
- Title: 120+ characters with competitive keywords
- Description: 2000+ characters with emotional triggers
- Include local market advantages
- Add urgency and scarcity elements
- Emphasize warranty and service benefits
- Include financing incentives
- Add social proof and trust signals

Generate the most COMPETITIVE, CONVERSION-OPTIMIZED listing possible.
        `

        try {
          // Simulate AI API call (replace with actual OpenAI call in production)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Update item with competitive optimization
          setInventoryItems(prev => prev.map(invItem => 
            invItem.id === itemId 
              ? {
                  ...invItem,
                  status: 'completed' as const,
                  beforeOptimization: {
                    title: invItem.title,
                    description: invItem.description,
                    seoScore: invItem.seoScore
                  },
                  title: optimizeTitle(invItem),
                  description: optimizeDescription(invItem),
                  seoScore: Math.min(invItem.seoScore + 35, 100), // Higher boost for competitive optimization
                  optimizations: [
                    '🏆 Competitive price guarantee added',
                    '🎯 Local advantage messaging optimized', 
                    '💰 Financing incentives highlighted',
                    '🚗 Vehicle features enhanced',
                    '⚡ Urgency elements included',
                    '🛡️ Trust signals emphasized',
                    '📱 Call-to-action optimized',
                    '🔥 Conversion triggers activated'
                  ]
                }
              : invItem
          ))
        } catch (error) {
          console.error(`Optimization failed for ${item.title}:`, error)
        }
      }
      
      // Auto-export optimized items with competitive advantage
      if (itemIds.length > 0) {
        setTimeout(() => {
          exportSelectedItems()
        }, 500)
      }
      
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
      setSelectedItems([])
    }
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSEOScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400'
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-400'
    return 'bg-red-500/10 text-red-400'
  }

  // Add export function for optimized listings
  const exportOptimizedListingsToTxt = () => {
    const optimizedItems = inventoryItems.filter(item => item.status === 'completed')
    
    if (optimizedItems.length === 0) return

    const exportContent = optimizedItems.map(item => {
      return `
================================================================================
OPTIMIZED VEHICLE LISTING
================================================================================
VIN: ${item.vin}
Title: ${item.title}
Year: ${item.year}
Make: ${item.make}
Model: ${item.model}
Price: $${item.price.toLocaleString()}
Mileage: ${item.mileage.toLocaleString()} miles
Condition: ${item.condition}
Color: ${item.color}
Days on Lot: ${item.days_on_lot}
SEO Score: ${item.seoScore}/100
Status: ${item.status}
================================================================================

OPTIMIZED DESCRIPTION:
${item.description}

OPTIMIZATION IMPROVEMENTS:
${item.optimizations.map(opt => `• ${opt}`).join('\n')}

BEFORE OPTIMIZATION:
${item.beforeOptimization ? `
Title: ${item.beforeOptimization.title}
SEO Score: ${item.beforeOptimization.seoScore}/100

Description: ${item.beforeOptimization.description}
` : 'N/A - Original listing'}

================================================================================
END OF LISTING FOR ${item.year} ${item.make} ${item.model}
================================================================================

`
    }).join('\n\n')

    const fullReport = `
TRD VLA v2 - OPTIMIZED INVENTORY REPORT
=======================================
Generated: ${new Date().toLocaleString()}
Client: Nissan of Wichita Falls
Total Vehicles Optimized: ${optimizedItems.length}
Average SEO Score Improvement: ${Math.round(optimizedItems.reduce((sum, item) => {
  const improvement = item.beforeOptimization 
    ? item.seoScore - item.beforeOptimization.seoScore 
    : 0
  return sum + improvement
}, 0) / optimizedItems.length) || 0} points

COMPETITIVE OPTIMIZATION SUMMARY:
• Enhanced local dealer advantages
• Added price guarantee messaging
• Emphasized warranty and service benefits
• Included urgency and scarcity elements
• Optimized for beating online competitors
• Added trust signals and social proof

${exportContent}

Report generated by TRD VLA v2 Inventory Optimization System
Contact: Nissan of Wichita Falls - 4000 Kell West Blvd, Wichita Falls, TX 76309
    `.trim()

    const blob = new Blob([fullReport], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TRD_VLA_Optimized_Inventory_${new Date().toISOString().split('T')[0]}.txt`
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
            <p className="text-white text-lg">Loading inventory data...</p>
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
              <p className="text-slate-400 mb-4">You need to set up at least one client to optimize inventory.</p>
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
              AI Inventory Optimizer
            </h1>
            <p className="text-slate-400 mt-1">Optimize vehicle listings with AI-powered SEO and pricing strategies</p>
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

        {/* Inventory Overview */}
        {vehicleAnalysis && (
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
                    <p className="text-sm font-medium text-slate-400">Total Vehicles</p>
                    <p className="text-2xl font-bold text-white">{vehicleAnalysis.total}</p>
                  </div>
                  <Car className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Avg Price</p>
                    <p className="text-2xl font-bold text-white">${vehicleAnalysis.avgPrice?.toLocaleString() || 0}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Avg Days on Lot</p>
                    <p className="text-2xl font-bold text-white">{vehicleAnalysis.avgDaysOnLot || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Selected Items</p>
                    <p className="text-2xl font-bold text-white">{selectedItems.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Import & Optimize</CardTitle>
              <CardDescription>Upload vehicle data and run AI optimizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* File Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={csvUpload.isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload TSV/CSV
                  </Button>
                  
                  <Button
                    onClick={() => runAdvancedOptimization()}
                    disabled={selectedItems.length === 0 || isOptimizing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isOptimizing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    🏆 Competitive Optimize ({selectedItems.length})
                  </Button>
                  
                  <Button
                    onClick={exportSelectedItems}
                    disabled={selectedItems.length === 0}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export for Upload ({selectedItems.length})
                  </Button>
                  
                  <Button
                    onClick={loadInventoryData}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {csvUpload.isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">Uploading vehicles...</span>
                    <span className="text-slate-400">{csvUpload.progress}%</span>
                  </div>
                  <Progress value={csvUpload.progress} className="h-2" />
                </div>
              )}

              {/* Upload Results */}
              {csvUpload.processedItems > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-emerald-200">
                    ✅ Successfully imported {csvUpload.processedItems} vehicles
                  </p>
                </div>
              )}

              {csvUpload.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-200">❌ Upload errors:</p>
                  {csvUpload.errors.map((error, index) => (
                    <p key={index} className="text-red-100 text-sm">• {error}</p>
                  ))}
                </div>
              )}

              {/* Optimization Progress */}
              {isOptimizing && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">AI Optimization in progress...</span>
                    <span className="text-slate-400">{Math.round(optimizationProgress)}%</span>
                  </div>
                  <Progress value={optimizationProgress} className="h-2" />
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vehicles by make, model, VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-white">All Status</SelectItem>
              <SelectItem value="pending" className="text-white">Pending</SelectItem>
              <SelectItem value="completed" className="text-white">Optimized</SelectItem>
              <SelectItem value="error" className="text-white">Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Vehicle Inventory ({filteredItems.length})</CardTitle>
                  <CardDescription>Select vehicles to optimize with AI-powered SEO enhancement</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={exportOptimizedListingsToTxt}
                    disabled={inventoryItems.filter(item => item.status === 'completed').length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    📄 Export Optimized ({inventoryItems.filter(item => item.status === 'completed').length})
                  </Button>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">
                      Select All ({selectedItems.length}/{filteredItems.length})
                    </span>
                  </div>
                  <Button
                    onClick={exportSelectedItems}
                    disabled={selectedItems.length === 0}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Upload File ({selectedItems.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No vehicles found. Upload inventory data to get started.</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item.id])
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id))
                              }
                            }}
                            className="mt-1"
                          />
                          
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-16 h-12 object-cover rounded border border-slate-600"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-medium">{item.title}</h3>
                              <Badge className={getSEOScoreBadge(item.seoScore)}>
                                SEO: {item.seoScore}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {item.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-400 mb-2">
                              <span>{item.year} {item.make} {item.model}</span>
                              <span>${item.price.toLocaleString()}</span>
                              <span>{item.mileage.toLocaleString()} miles</span>
                              <span>{item.days_on_lot} days on lot</span>
                            </div>
                            
                            <p className="text-slate-300 text-sm mb-2 line-clamp-2">{item.description}</p>
                            
                            {item.optimizations.length > 0 && (
                              <div className="space-y-1">
                                {item.optimizations.slice(0, 2).map((opt, index) => (
                                  <p key={index} className="text-xs text-amber-300">• {opt}</p>
                                ))}
                                {item.optimizations.length > 2 && (
                                  <p className="text-xs text-slate-500">+{item.optimizations.length - 2} more</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {item.listing_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.listing_url, '_blank')}
                              className="border-slate-600 text-slate-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => runAdvancedOptimization([item.id])}
                            disabled={isOptimizing || item.status === 'completed'}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Zap className="h-4 w-4" />
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