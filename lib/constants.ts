// VLA Dashboard Application Constants

// API Endpoints
export const API_ENDPOINTS = {
  // AI Agents
  AGENTS: {
    COMPETITOR_INTEL: '/api/agents/competitor-intel',
    INVENTORY_OPTIMIZER: '/api/agents/inventory-optimizer',
  },
  
  // Google APIs
  GOOGLE: {
    ADS: '/api/google-ads',
    ANALYTICS: '/api/analytics',
    BUSINESS_PROFILE: '/api/google-business',
    MERCHANT_CENTER: '/api/google-merchant',
    SEARCH_CONSOLE: '/api/google-search-console',
    PAGESPEED: '/api/google-pagespeed',
  },
  
  // Database Operations
  DATABASE: {
    CLIENTS: '/api/supabase/clients',
    CAMPAIGNS: '/api/supabase/campaigns',
    INSIGHTS: '/api/supabase/insights',
    VEHICLES: '/api/supabase/vehicles',
    SEO: '/api/supabase/seo',
  },
  
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CALLBACK: '/api/auth/callback',
    SESSION: '/api/auth/session',
  }
} as const

// AI Agent Types
export const AGENT_TYPES = {
  CAMPAIGN_ANALYZER: 'campaign_analyzer',
  SEO_OPPORTUNITY_SCOUT: 'seo_opportunity_scout', 
  COMPETITOR_INTELLIGENCE: 'competitor_intelligence',
  INVENTORY_OPTIMIZER: 'inventory_optimizer',
  CUSTOMER_JOURNEY_MAPPER: 'customer_journey_mapper',
} as const

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

// Insight Status
export const INSIGHT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  COMPLETED: 'completed',
  ERROR: 'error',
} as const

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const

// Dashboard Navigation Items
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Main dashboard with KPIs and insights'
  },
  {
    title: 'Campaign Management', 
    href: '/dashboard/campaigns',
    icon: 'Target',
    description: 'Manage Google Ads campaigns'
  },
  {
    title: 'AI Agents Hub',
    href: '/dashboard/agents',
    icon: 'Bot',
    description: 'AI agents for optimization'
  },
  {
    title: 'Competitor Analysis',
    href: '/dashboard/competitors', 
    icon: 'Users',
    description: 'Track and analyze competitors'
  },
  {
    title: 'Keyword Intelligence',
    href: '/dashboard/keywords',
    icon: 'Search',
    description: 'Keyword tracking and opportunities'
  },
  {
    title: 'Vehicle Listings',
    href: '/dashboard/vehicles',
    icon: 'Car',
    description: 'Manage vehicle inventory'
  },
  {
    title: 'SEO Performance',
    href: '/dashboard/seo',
    icon: 'TrendingUp',
    description: 'SEO metrics and optimization'
  },
  {
    title: 'Analytics & Reports',
    href: '/dashboard/reports',
    icon: 'BarChart3',
    description: 'Detailed analytics and reports'
  }
] as const

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  CTR: {
    EXCELLENT: 5,
    GOOD: 3,
    AVERAGE: 2,
    POOR: 1
  },
  CONVERSION_RATE: {
    EXCELLENT: 10,
    GOOD: 5,
    AVERAGE: 2,
    POOR: 1
  },
  CPA: {
    EXCELLENT: 50,
    GOOD: 100,
    AVERAGE: 200,
    POOR: 300
  },
  SEO_SCORE: {
    EXCELLENT: 90,
    GOOD: 70,
    AVERAGE: 50,
    POOR: 30
  }
} as const

// Core Web Vitals Thresholds
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: {
    GOOD: 2.5,
    NEEDS_IMPROVEMENT: 4.0
  },
  FID: {
    GOOD: 100,
    NEEDS_IMPROVEMENT: 300
  },
  CLS: {
    GOOD: 0.1,
    NEEDS_IMPROVEMENT: 0.25
  }
} as const

// Update Frequencies
export const UPDATE_FREQUENCIES = {
  REAL_TIME: 1000, // 1 second
  FAST: 30000, // 30 seconds
  MEDIUM: 300000, // 5 minutes
  SLOW: 3600000, // 1 hour
  DAILY: 86400000 // 24 hours
} as const

// Cache Durations
export const CACHE_DURATIONS = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes 
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const

// Rate Limits
export const RATE_LIMITS = {
  GOOGLE_ADS: {
    REQUESTS_PER_DAY: 10000,
    REQUESTS_PER_HOUR: 1000,
  },
  GOOGLE_ANALYTICS: {
    REQUESTS_PER_DAY: 50000,
    REQUESTS_PER_HOUR: 5000,
  },
  OPENAI: {
    REQUESTS_PER_MINUTE: 60,
    TOKENS_PER_MINUTE: 150000,
  }
} as const

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  DATE_RANGE_DAYS: 30,
  AI_TEMPERATURE: 0.1,
  MAX_RETRIES: 3,
  TIMEOUT_MS: 60000
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_AGENTS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_COMPETITOR_TRACKING: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_VOICE_SEARCH_OPT: true,
  ENABLE_AI_OVERVIEW_OPT: true
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  RATE_LIMIT_ERROR: 'Rate limit exceeded. Please try again later.',
  AI_AGENT_ERROR: 'AI agent encountered an error. Please try again.',
  DATA_NOT_FOUND: 'Requested data was not found.',
  INVALID_INPUT: 'Invalid input provided. Please check your data.',
  SERVER_ERROR: 'Server error occurred. Please contact support.'
} as const

// Success Messages  
export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully.',
  AGENT_STARTED: 'AI agent analysis started successfully.',
  REPORT_GENERATED: 'Report generated successfully.',
  CAMPAIGN_UPDATED: 'Campaign updated successfully.',
  INSIGHTS_GENERATED: 'New insights generated successfully.'
} as const 