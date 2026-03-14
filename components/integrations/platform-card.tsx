import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Check, X } from 'lucide-react'

interface Platform {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  icon: keyof typeof Icons
  lastSync?: string
}

interface PlatformCardProps {
  platform: Platform
}

const statusConfig = {
  connected: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Check,
    text: 'Connected',
  },
  disconnected: {
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    icon: X,
    text: 'Not Connected',
  },
  error: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: X,
    text: 'Connection Error',
  },
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const Icon = Icons[platform.icon]
  const config = statusConfig[platform.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {platform.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {platform.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
          <StatusIcon className="w-3 h-3" />
          {config.text}
        </span>
        {platform.lastSync && platform.status === 'connected' && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last sync: {platform.lastSync}
          </span>
        )}
      </div>

      {platform.status === 'connected' ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
            Disconnect
          </Button>
        </div>
      ) : (
        <Button className="w-full" size="sm">
          Connect
        </Button>
      )}
    </div>
  )
}
