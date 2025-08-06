'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Search, 
  Radar, 
  Package, 
  Route,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  HardDrive,
  DollarSign,
  Brain
} from 'lucide-react'

const agents = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Intelligent help and guidance',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    href: '/dashboard/agents/ai-assistant',
    status: 'active'
  },
  {
    id: 'competitor-intel',
    name: 'Competitor Intel',
    description: 'Market positioning insights',
    icon: Radar,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    href: '/dashboard/agents/competitor-intel',
    status: 'active'
  },
  {
    id: 'inventory-optimizer',
    name: 'Inventory Optimizer',
    description: 'Vehicle listing optimization',
    icon: Package,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    href: '/dashboard/agents/inventory-optimizer',
    status: 'active'
  }
]

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    isActive: false
  },
  {
    name: 'Documentation',
    href: '/dashboard/documentation',
    icon: Search, // Using Search icon as a documentation/help icon
    isActive: false
  }
]

const tools = [
  {
    id: 'budget-strategy',
    name: 'Nissan Campaign Creator',
    description: 'AI-powered Nissan ad campaigns with budget optimization',
    icon: DollarSign,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    href: '/dashboard/tools/budget-strategy',
    status: 'active'
  }
]


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarCollapsed ? '4rem' : '16rem',
        }}
        className={`
          fixed lg:relative top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50
          transform transition-transform lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isSidebarCollapsed && (
                  <>
                    <img 
                      src="/9C0B4569-B802-4EBD-B07C-5A6914E7F683_4_5005_c.jpeg" 
                      alt="VLA Logo" 
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <h1 className="text-lg font-bold text-white">VLA Dashboard</h1>
                      <p className="text-xs text-slate-400">Vehicle Listing Advisor</p>
                    </div>
                  </>
                )}
                {isSidebarCollapsed && (
                  <img 
                    src="/9C0B4569-B802-4EBD-B07C-5A6914E7F683_4_5005_c.jpeg" 
                    alt="VLA" 
                    className="w-8 h-8 rounded object-cover mx-auto"
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-slate-400 hover:text-white hidden lg:flex"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/25' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}>
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                      {!isSidebarCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* AI Agents */}
            <div className="p-4">
              {!isSidebarCollapsed && (
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  AI Agents
                </h3>
              )}
              <div className="space-y-1">
                {agents.map((agent) => {
                  const isActive = pathname === agent.href
                  return (
                    <Link key={agent.id} href={agent.href}>
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                        ${isActive 
                          ? 'bg-slate-800/80 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                      `}>
                        <div className={`
                          p-1.5 rounded-md transition-colors
                          ${isActive ? agent.bgColor : 'bg-slate-800/50 group-hover:bg-slate-700/50'}
                        `}>
                          <agent.icon className={`h-4 w-4 ${isActive ? agent.color : 'text-slate-400 group-hover:text-white'}`} />
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{agent.name}</p>
                            <p className="text-xs text-slate-500 truncate">{agent.description}</p>
                          </div>
                        )}
                        {!isSidebarCollapsed && agent.status === 'active' && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Tools */}
            <div className="p-4">
              {!isSidebarCollapsed && (
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Tools
                </h3>
              )}
              <div className="space-y-1">
                {tools.map((tool) => {
                  const isActive = pathname === tool.href
                  return (
                    <Link key={tool.id} href={tool.href}>
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                        ${isActive 
                          ? 'bg-slate-800/80 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                      `}>
                        <div className={`
                          p-1.5 rounded-md transition-colors
                          ${isActive ? tool.bgColor : 'bg-slate-800/50 group-hover:bg-slate-700/50'}
                        `}>
                          <tool.icon className={`h-4 w-4 ${isActive ? tool.color : 'text-slate-400 group-hover:text-white'}`} />
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{tool.name}</p>
                            <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                          </div>
                        )}
                        {!isSidebarCollapsed && tool.status === 'active' && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {pathname === '/dashboard' ? 'Dashboard Overview' : 
                 agents.find(agent => pathname === agent.href)?.name || 
                 tools.find(tool => pathname === tool.href)?.name || 'VLA Dashboard'}
              </h2>
              <p className="text-sm text-slate-400">
                {pathname === '/dashboard' ? 'AI-powered vehicle listing optimization platform' :
                 agents.find(agent => pathname === agent.href)?.description || 
                 tools.find(tool => pathname === tool.href)?.description || 'Advanced analytics and insights'}
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 