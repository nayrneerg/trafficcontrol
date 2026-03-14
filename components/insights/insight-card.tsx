import { AlertCircle, TrendingUp, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'optimization' | 'alert' | 'opportunity' | 'trend'
  impact: string
  action: string
}

interface InsightCardProps {
  insight: Insight
}

const priorityConfig = {
  high: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  low: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
}

const categoryIcons = {
  optimization: TrendingUp,
  alert: AlertCircle,
  opportunity: Zap,
  trend: Target,
}

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = categoryIcons[insight.category]
  const config = priorityConfig[insight.priority]

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-lg border-2 p-5',
      config.border
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {insight.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {insight.category}
            </p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase',
          config.badge
        )}>
          {insight.priority}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        {insight.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
            Impact:
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {insight.impact}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
            Action:
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {insight.action}
          </span>
        </div>
      </div>

      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        Apply Recommendation
      </button>
    </div>
  )
}
