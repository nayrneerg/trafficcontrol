import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  change: number
  format: 'currency' | 'number' | 'decimal' | 'percent' | 'time'
  icon: LucideIcon
  trend?: number[]
  suffix?: string
  inverse?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  format,
  icon: Icon,
  trend = [],
  suffix = '',
  inverse = false,
}: MetricCardProps) {
  const isPositive = inverse ? change < 0 : change > 0

  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'number':
        return formatNumber(value)
      case 'decimal':
        return value.toFixed(2)
      case 'percent':
        return formatPercent(value)
      case 'time':
        const minutes = Math.floor(value / 60)
        const seconds = value % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      default:
        return value.toString()
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatValue()}{suffix}
          </div>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              vs last period
            </span>
          </div>
        </div>
        
        {trend.length > 0 && (
          <div className="w-20 h-10">
            <svg
              viewBox="0 0 80 40"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={isPositive ? '#16a34a' : '#dc2626'}
                strokeWidth="2"
                points={trend
                  .map((val, idx) => {
                    const x = (idx / (trend.length - 1)) * 80
                    const y = 40 - (val / Math.max(...trend)) * 35
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
