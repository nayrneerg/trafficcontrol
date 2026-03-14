'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: Array<{
    date: string
    spend?: number
    conversions?: number
    clicks?: number
    impressions?: number
    [key: string]: any
  }>
}

export function TrendChart({ data }: TrendChartProps) {
  // Determine which metrics are present in the data
  const hasSpend = data.some(d => d.spend !== undefined)
  const hasConversions = data.some(d => d.conversions !== undefined)
  const hasClicks = data.some(d => d.clicks !== undefined)
  const hasImpressions = data.some(d => d.impressions !== undefined)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Performance Trend
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          {hasSpend && (
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="#2563eb" 
              strokeWidth={2}
              name="Spend"
              dot={false}
            />
          )}
          {hasConversions && (
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#16a34a" 
              strokeWidth={2}
              name="Conversions"
              dot={false}
            />
          )}
          {hasClicks && (
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#7c3aed" 
              strokeWidth={2}
              name="Clicks"
              dot={false}
            />
          )}
          {hasImpressions && (
            <Line 
              type="monotone" 
              dataKey="impressions" 
              stroke="#ea580c" 
              strokeWidth={2}
              name="Impressions"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
