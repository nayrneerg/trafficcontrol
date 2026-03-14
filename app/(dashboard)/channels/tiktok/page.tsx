import { MetricCard } from '@/components/dashboard/metric-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { PerformanceTable } from '@/components/dashboard/performance-table'
import { getTikTokAdsData } from '@/lib/mock-data'
import { DollarSign, Video, Target, TrendingUp } from 'lucide-react'

export default function TikTokAdsPage() {
  const data = getTikTokAdsData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">TikTok Ads</h1>
          <p className="text-slate-600 dark:text-slate-400">TikTok for Business campaign performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spend"
          value={data.spend}
          change={data.spendChange}
          format="currency"
          icon={DollarSign}
          trend={data.spendTrend}
        />
        <MetricCard
          title="Video Views"
          value={data.views}
          change={data.viewsChange}
          format="number"
          icon={Video}
          trend={data.viewsTrend}
        />
        <MetricCard
          title="Conversions"
          value={data.conversions}
          change={data.conversionsChange}
          format="number"
          icon={Target}
          trend={data.conversionsTrend}
        />
        <MetricCard
          title="ROAS"
          value={data.roas}
          change={data.roasChange}
          format="decimal"
          icon={TrendingUp}
          trend={data.roasTrend}
          suffix="x"
        />
      </div>

      {/* Trend Chart */}
      <TrendChart data={data.trendData} />

      {/* Campaign Performance */}
      <PerformanceTable data={data.campaigns} />
    </div>
  )
}
