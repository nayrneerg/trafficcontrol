import { InsightCard } from '@/components/insights/insight-card'
import { getAIInsights } from '@/lib/mock-data'
import { Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  const insights = getAIInsights()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
          <p className="text-slate-600 dark:text-slate-400">Automated recommendations to improve performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}
