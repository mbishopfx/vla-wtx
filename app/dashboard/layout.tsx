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
  Settings,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  TrendingUp,
  HardDrive,
  DollarSign
} from 'lucide-react'

const agents = [
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
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
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
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <img 
                      src="/9C0B4569-B802-4EBD-B07C-5A6914E7F683_4_5005_c.jpeg" 
                      alt="TRD VLA Logo" 
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="font-bold text-white">TRD VLA v2</h1>
                    <p className="text-xs text-slate-400">AI Optimization</p>
                  </div>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-slate-400 hover:text-white lg:flex hidden"
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Navigation
                </p>
              )}
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* AI Agents */}
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    AI Agents
                  </p>
                  <Badge className="bg-green-500/10 text-green-400 text-xs">
                    2 Active
                  </Badge>
                </div>
              )}
              {agents.map((agent) => {
                const isActive = pathname === agent.href
                return (
                  <Link key={agent.id} href={agent.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg ${agent.bgColor} ${agent.color} 
                        ${isActive ? 'shadow-lg' : 'group-hover:scale-110'}
                        transition-transform duration-200
                      `}>
                        <agent.icon className="h-4 w-4" />
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className={`
                            font-medium text-sm truncate
                            ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                          `}>
                            {agent.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {agent.description}
                          </p>
                        </div>
                      )}
                      {!isSidebarCollapsed && agent.status === 'active' && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                      )}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                          {agent.name}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Tools */}
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tools
                  </p>
                  <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                    1 Available
                  </Badge>
                </div>
              )}
              {tools.map((tool) => {
                const isActive = pathname === tool.href
                return (
                  <Link key={tool.id} href={tool.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg ${tool.bgColor} ${tool.color} 
                        ${isActive ? 'shadow-lg' : 'group-hover:scale-110'}
                        transition-transform duration-200
                      `}>
                        <tool.icon className="h-4 w-4" />
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className={`
                            font-medium text-sm truncate
                            ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                          `}>
                            {tool.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {tool.description}
                          </p>
                        </div>
                      )}
                      {!isSidebarCollapsed && tool.status === 'active' && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        </div>
                      )}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                          {tool.name}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin User</p>
                  <p className="text-xs text-slate-400 truncate">admin@vla-dashboard.com</p>
                </div>
              </div>
            )}
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Activity className="h-5 w-5" />
            </Button>
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