import { MetricCard } from '@/components/dashboard/metric-card'
import { getCRMData } from '@/lib/mock-data'
import { Users, DollarSign, TrendingUp, Percent } from 'lucide-react'

export default function CRMPage() {
  const data = getCRMData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CRM Pipeline</h1>
          <p className="text-slate-600 dark:text-slate-400">Sales pipeline and deal flow analytics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={data.totalLeads}
          change={data.leadsChange}
          format="number"
          icon={Users}
          trend={data.leadsTrend}
        />
        <MetricCard
          title="Pipeline Value"
          value={data.pipelineValue}
          change={data.pipelineChange}
          format="currency"
          icon={DollarSign}
          trend={data.pipelineTrend}
        />
        <MetricCard
          title="Closed Deals"
          value={data.closedDeals}
          change={data.dealsChange}
          format="number"
          icon={TrendingUp}
          trend={data.dealsTrend}
        />
        <MetricCard
          title="Close Rate"
          value={data.closeRate}
          change={data.closeRateChange}
          format="percent"
          icon={Percent}
          trend={data.closeRateTrend}
        />
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pipeline by Stage</h2>
        <div className="space-y-4">
          {data.pipelineStages.map((stage, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{stage.name}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {stage.count} deals
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    ${(stage.value / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Closed Deals</h2>
        <div className="space-y-3">
          {data.recentDeals.map((deal, idx) => (
            <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{deal.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {deal.company} • {deal.closedDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ${deal.value.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{deal.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
