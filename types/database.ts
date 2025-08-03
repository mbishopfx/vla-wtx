// Database Types for VLA Dashboard

export interface ClientAccount {
  id: string
  name: string
  email?: string
  businessType?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface AIInsight {
  id: string
  agentType: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'processing' | 'completed' | 'error'
  category: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  implementationEffort: 'low' | 'medium' | 'high'
  recommendations: string[]
  data: any
  createdAt: string
  clientId: string
}

export interface CampaignAnalytics {
  id: string
  campaignId: string
  clientId: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
  date: string
  metadata: any
} 