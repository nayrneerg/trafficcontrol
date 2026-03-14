'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  Users,
  Lightbulb,
  BarChart3,
} from 'lucide-react'
import { Icons } from '@/components/icons'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Channels',
    icon: BarChart3,
    children: [
      { name: 'Google Ads', href: '/channels/google', icon: Icons.google },
      { name: 'Meta Ads', href: '/channels/meta', icon: Icons.meta },
      { name: 'TikTok Ads', href: '/channels/tiktok', icon: Icons.tiktok },
      { name: 'Google Analytics', href: '/channels/ga4', icon: Icons.analytics },
      { name: 'CRM Pipeline', href: '/channels/crm', icon: Icons.crm },
    ],
  },
  { name: 'AI Insights', href: '/insights', icon: Lightbulb },
  { name: 'Integrations', href: '/settings', icon: Settings },
  { name: 'Team', href: '/settings/team', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icons.tower className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ControlTower</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ) : (
              <div>
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
                {item.children && (
                  <div className="ml-3 space-y-1 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          pathname === child.href
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Acme Agency</div>
            <div className="text-xs text-slate-400 truncate">admin@acme.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
