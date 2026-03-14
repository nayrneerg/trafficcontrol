interface ConversionFunnelProps {
  data: {
    stages: Array<{
      stage: string
      value: number
      percentage: number
    }>
  }
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const stages = data.stages
  const maxValue = stages[0]?.value || 1

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Conversion Funnel
      </h2>
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const barWidth = (stage.value / maxValue) * 100
          const prevStage = stages[idx - 1]
          const conversionRate = prevStage 
            ? ((stage.value / prevStage.value) * 100).toFixed(1)
            : '100.0'

          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {stage.stage}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {stage.value.toLocaleString()}
                  </div>
                  {idx > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {conversionRate}% conversion
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-10 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-10 flex items-center justify-end px-4 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 15 && (
                      <span className="text-sm font-medium text-white">
                        {stage.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
