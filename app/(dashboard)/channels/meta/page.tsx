import { MetricCard } from '@/components/dashboard/metric-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { PerformanceTable } from '@/components/dashboard/performance-table'
import { getMetaAdsData } from '@/lib/mock-data'
import { DollarSign, Eye, Target, TrendingUp } from 'lucide-react'

export default function MetaAdsPage() {
  const data = getMetaAdsData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 4C7.01 4 5 6.01 5 8.5V15.5C5 17.99 7.01 20 9.5 20C10.54 20 11.5 19.63 12.24 19L14.76 19C15.5 19.63 16.46 20 17.5 20C19.99 20 22 17.99 22 15.5V8.5C22 6.01 19.99 4 17.5 4H9.5Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meta Ads</h1>
          <p className="text-slate-600 dark:text-slate-400">Facebook and Instagram campaign performance</p>
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
          title="Impressions"
          value={data.impressions}
          change={data.impressionsChange}
          format="number"
          icon={Eye}
          trend={data.impressionsTrend}
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
