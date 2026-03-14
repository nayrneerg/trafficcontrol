import { MetricCard } from '@/components/dashboard/metric-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { PerformanceTable } from '@/components/dashboard/performance-table'
import { getGoogleAdsData } from '@/lib/mock-data'
import { DollarSign, MousePointerClick, Target, TrendingUp } from 'lucide-react'

export default function GoogleAdsPage() {
  const data = getGoogleAdsData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 2L2 7.5V16.5L12.5 22L23 16.5V7.5L12.5 2Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Google Ads</h1>
          <p className="text-slate-600 dark:text-slate-400">Search and Display campaign performance</p>
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
          title="Clicks"
          value={data.clicks}
          change={data.clicksChange}
          format="number"
          icon={MousePointerClick}
          trend={data.clicksTrend}
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
