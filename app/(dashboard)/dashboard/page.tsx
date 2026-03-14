import { MetricCard } from '@/components/dashboard/metric-card'
import { ChannelComparison } from '@/components/dashboard/channel-comparison'
import { SpendAllocation } from '@/components/dashboard/spend-allocation'
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel'
import { PerformanceTable } from '@/components/dashboard/performance-table'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { getDashboardMetrics } from '@/lib/mock-data'
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Users, Receipt } from 'lucide-react'

export default function DashboardPage() {
  const metrics = getDashboardMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Your marketing performance at a glance</p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Spend"
          value={metrics.totalSpend}
          change={metrics.spendChange}
          format="currency"
          icon={DollarSign}
          trend={metrics.spendTrend}
        />
        <MetricCard
          title="Total Conversions"
          value={metrics.totalConversions}
          change={metrics.conversionsChange}
          format="number"
          icon={Target}
          trend={metrics.conversionsTrend}
        />
        <MetricCard
          title="Blended ROAS"
          value={metrics.blendedRoas}
          change={metrics.roasChange}
          format="decimal"
          icon={Award}
          trend={metrics.roasTrend}
          suffix="x"
        />
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          change={metrics.leadsChange}
          format="number"
          icon={Users}
          trend={metrics.leadsTrend}
        />
        <MetricCard
          title="Avg CPL"
          value={metrics.avgCpl}
          change={metrics.cplChange}
          format="currency"
          icon={Receipt}
          trend={metrics.cplTrend}
          inverse
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendAllocation data={metrics.spendByChannel} />
        <ChannelComparison data={metrics.channelRoas} />
      </div>

      {/* Trend Chart */}
      <TrendChart data={metrics.trendData} />

      {/* Conversion Funnel */}
      <ConversionFunnel data={metrics.funnelData} />

      {/* Performance Table */}
      <PerformanceTable data={metrics.campaignPerformance} />
    </div>
  )
}
