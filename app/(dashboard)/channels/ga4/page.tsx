import { MetricCard } from '@/components/dashboard/metric-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { getGA4Data } from '@/lib/mock-data'
import { Users, MousePointerClick, Clock, BarChart3 } from 'lucide-react'

export default function GA4Page() {
  const data = getGA4Data()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Google Analytics 4</h1>
          <p className="text-slate-600 dark:text-slate-400">Website traffic and user behavior analytics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data.users}
          change={data.usersChange}
          format="number"
          icon={Users}
          trend={data.usersTrend}
        />
        <MetricCard
          title="Sessions"
          value={data.sessions}
          change={data.sessionsChange}
          format="number"
          icon={MousePointerClick}
          trend={data.sessionsTrend}
        />
        <MetricCard
          title="Avg Session Duration"
          value={data.avgSessionDuration}
          change={data.durationChange}
          format="time"
          icon={Clock}
          trend={data.durationTrend}
        />
        <MetricCard
          title="Bounce Rate"
          value={data.bounceRate}
          change={data.bounceRateChange}
          format="percent"
          icon={BarChart3}
          trend={data.bounceRateTrend}
          inverse
        />
      </div>

      {/* Trend Chart */}
      <TrendChart data={data.trendData} />

      {/* Top Pages */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Pages</h2>
        <div className="space-y-3">
          {data.topPages.map((page, idx) => (
            <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{page.path}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {page.views.toLocaleString()} views
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {page.avgTime}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">avg time</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
