'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SpendAllocationProps {
  data: Array<{
    platform: string
    spend: number
  }>
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04']

const PLATFORM_LABELS: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  google_analytics: 'Google Analytics',
  hubspot: 'HubSpot',
  salesforce: 'Salesforce',
  seo: 'SEO',
}

export function SpendAllocation({ data }: SpendAllocationProps) {
  const total = data.reduce((sum, item) => sum + item.spend, 0)

  const chartData = data.map(item => ({
    name: PLATFORM_LABELS[item.platform] || item.platform,
    spend: item.spend,
  }))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Spend Allocation
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="spend"
            nameKey="name"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => {
              const item = chartData.find(d => d.name === value)
              const percentage = item ? ((item.spend / total) * 100).toFixed(1) : '0'
              return `${value} (${percentage}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
