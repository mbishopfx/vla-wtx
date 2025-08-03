import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { AIInsight, ClientAccount, CampaignAnalytics } from './database'

// Dashboard Layout Types
export interface DashboardLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  className?: string
}

export interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  className?: string
}

export interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: LucideIcon
  isActive?: boolean
}

// Navigation Types
export interface NavigationItem {
  title: string
  href: string
  icon: string
  description: string
  badge?: string | number
  isActive?: boolean
  children?: NavigationItem[]
}

export interface ClientSelectorProps {
  clients: ClientAccount[]
  selectedClient?: ClientAccount
  onClientChange: (client: ClientAccount) => void
  className?: string
}

// Card and Component Types
export interface DashboardCardProps {
  title: string
  subtitle?: string
  value?: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    timeframe: string
  }
  icon?: LucideIcon
  action?: ReactNode
  loading?: boolean
  className?: string
}

export interface MetricCardProps extends DashboardCardProps {
  metric: 'impressions' | 'clicks' | 'conversions' | 'cost' | 'ctr' | 'roas'
  data?: number
  previousData?: number
  format?: 'number' | 'currency' | 'percentage'
}

export interface ChartCardProps {
  title: string
  subtitle?: string
  data: any[]
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'donut'
  xAxisKey?: string
  yAxisKey?: string
  loading?: boolean
  error?: string
  className?: string
}

// AI Agent Component Types
export interface AgentCardProps {
  agentType: string
  name: string
  description: string
  status: 'idle' | 'running' | 'completed' | 'error'
  lastRun?: string
  nextRun?: string
  insights?: AIInsight[]
  onRun?: () => void
  onConfigure?: () => void
  className?: string
}

export interface AgentInsightProps {
  insight: AIInsight
  onImplement?: (insightId: string) => void
  onDismiss?: (insightId: string) => void
  className?: string
}

export interface InsightActionProps {
  insight: AIInsight
  actions: {
    label: string
    action: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary'
    icon?: LucideIcon
  }[]
  className?: string
}

// Table and List Types
export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    key: keyof T
    direction: 'asc' | 'desc'
    onSort: (key: keyof T, direction: 'asc' | 'desc') => void
  }
  filtering?: {
    query: string
    onFilter: (query: string) => void
  }
  selection?: {
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
  }
  className?: string
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  width?: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

// Form Types
export interface DashboardFormProps {
  onSubmit: (data: any) => void
  loading?: boolean
  error?: string
  initialData?: any
  schema?: any
  className?: string
}

export interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  placeholder?: string
  description?: string
  required?: boolean
  options?: { label: string; value: string }[]
  validation?: any
  className?: string
}

// Chart Data Types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export interface PerformanceChartData {
  impressions: ChartDataPoint[]
  clicks: ChartDataPoint[]
  conversions: ChartDataPoint[]
  cost: ChartDataPoint[]
}

export interface CompetitorChartData {
  competitor: string
  marketShare: number
  adSpend: number
  impressionShare: number
  color?: string
}

export interface KeywordChartData {
  keyword: string
  rank: number
  searchVolume: number
  difficulty: number
  opportunity: number
  trend: 'up' | 'down' | 'stable'
}

export interface SEOMetricsChartData {
  date: string
  optimizationScore: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
  aiOverviewVisibility: boolean
}

// Dashboard State Types
export interface DashboardState {
  selectedClient?: ClientAccount
  dateRange: {
    from: Date
    to: Date
  }
  loading: {
    campaigns: boolean
    insights: boolean
    competitors: boolean
    seo: boolean
  }
  error?: {
    message: string
    type: 'network' | 'auth' | 'permission' | 'server'
  }
  filters: {
    campaigns: CampaignFilter
    insights: InsightFilter
    keywords: KeywordFilter
  }
}

export interface CampaignFilter {
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED'
  type?: string
  minImpressions?: number
  maxImpressions?: number
  minClicks?: number
  maxClicks?: number
}

export interface InsightFilter {
  agentType?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'pending' | 'processing' | 'completed' | 'error'
  category?: string
}

export interface KeywordFilter {
  minSearchVolume?: number
  maxSearchVolume?: number
  competition?: 'LOW' | 'MEDIUM' | 'HIGH'
  minRank?: number
  maxRank?: number
}

// Real-time Update Types
export interface RealtimeUpdate {
  type: 'campaign_update' | 'insight_generated' | 'competitor_change' | 'seo_update'
  timestamp: string
  data: any
  clientId: string
}

export interface NotificationProps {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: boolean
  duration?: number
  onClose: (id: string) => void
}

// Widget Types
export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list' | 'custom'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: any
  data?: any
  loading?: boolean
  error?: string
}

export interface WidgetGridProps {
  widgets: DashboardWidget[]
  editable?: boolean
  onWidgetUpdate?: (widget: DashboardWidget) => void
  onWidgetRemove?: (widgetId: string) => void
  onWidgetAdd?: () => void
  className?: string
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  dateRange: {
    from: Date
    to: Date
  }
  includeCharts?: boolean
  includeRawData?: boolean
  sections: {
    campaigns: boolean
    insights: boolean
    competitors: boolean
    seo: boolean
    keywords: boolean
  }
}

export interface ReportGenerationProps {
  options: ExportOptions
  onGenerate: (options: ExportOptions) => void
  loading?: boolean
  className?: string
} 