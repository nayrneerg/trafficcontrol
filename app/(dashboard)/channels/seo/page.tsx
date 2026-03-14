'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatPercent } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const kpis = [
  { label: 'Organic Sessions', value: '18,420', change: 12.4, trend: 'up' as const },
  { label: 'Organic vs Paid Split', value: '38%', change: 2.1, trend: 'up' as const, subtitle: 'organic traffic' },
  { label: 'Top 10 Keywords', value: '142', change: 8, trend: 'up' as const },
  { label: 'Avg Position', value: '14.2', change: -1.4, trend: 'up' as const, subtitle: 'lower is better' },
  { label: 'Page 1 Keywords', value: '89', change: 11, trend: 'up' as const },
];

const trafficData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  organic: Math.floor(600 + Math.random() * 300),
  paid: Math.floor(400 + Math.random() * 300),
  direct: Math.floor(200 + Math.random() * 150),
  social: Math.floor(100 + Math.random() * 100),
}));

const landingPages = [
  { page: '/free-trial', sessions: 2840, convRate: 8.4, conversions: 238, avgPosition: 3.2 },
  { page: '/pricing', sessions: 1920, convRate: 5.1, conversions: 98, avgPosition: 7.8 },
  { page: '/features', sessions: 3100, convRate: 2.8, conversions: 87, avgPosition: 11.2 },
  { page: '/blog/guide', sessions: 2240, convRate: 3.2, conversions: 72, avgPosition: 5.4 },
  { page: '/compare', sessions: 1480, convRate: 4.6, conversions: 68, avgPosition: 9.1 },
  { page: '/case-studies', sessions: 980, convRate: 6.2, conversions: 61, avgPosition: 14.8 },
  { page: '/demo', sessions: 760, convRate: 7.8, conversions: 59, avgPosition: 18.3 },
  { page: '/blog/tips', sessions: 1840, convRate: 1.4, conversions: 26, avgPosition: 6.7 },
];

const topKeywords = [
  { keyword: 'marketing analytics platform', position: 3, volume: 8200, change: 2 },
  { keyword: 'multi-channel attribution', position: 5, volume: 5400, change: -1 },
  { keyword: 'marketing dashboard software', position: 7, volume: 6800, change: 0 },
  { keyword: 'google ads reporting tool', position: 9, volume: 4200, change: 3 },
  { keyword: 'saas marketing analytics', position: 11, volume: 3100, change: -2 },
  { keyword: 'marketing roi tracker', position: 14, volume: 2700, change: 1 },
  { keyword: 'cross-channel analytics', position: 16, volume: 1900, change: 4 },
  { keyword: 'marketing performance dashboard', position: 18, volume: 2400, change: 0 },
  { keyword: 'ad spend optimization', position: 12, volume: 3800, change: -3 },
  { keyword: 'marketing automation reporting', position: 8, volume: 5100, change: 2 },
];

const positionDistribution = [
  { range: '1-3', count: 22 },
  { range: '4-10', count: 67 },
  { range: '11-20', count: 53 },
  { range: '21-50', count: 89 },
  { range: '50+', count: 142 },
];

const coreWebVitals = [
  { 
    metric: 'LCP', 
    name: 'Largest Contentful Paint', 
    value: '2.1s', 
    status: 'good' as const,
    description: 'Page main content loads in 2.1 seconds'
  },
  { 
    metric: 'FID/INP', 
    name: 'First Input Delay / Interaction to Next Paint', 
    value: '48ms', 
    status: 'good' as const,
    description: 'Pages respond to user input within 48ms'
  },
  { 
    metric: 'CLS', 
    name: 'Cumulative Layout Shift', 
    value: '0.08', 
    status: 'needs-improvement' as const,
    description: 'Some visual instability detected during load'
  },
];

export default function SeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
          <Search className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">SEO & Website Intelligence</h1>
          <p className="text-sm text-muted-foreground">Organic performance, keyword rankings, and website health</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              )}
              <div className="flex items-center gap-1 text-xs mt-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(kpi.change)}{kpi.label === 'Organic vs Paid Split' ? 'pp' : kpi.label.includes('Keywords') ? '' : '%'}
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Source Split (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="organic" stackId="1" stroke="#10B981" fill="#10B981" name="Organic" />
              <Area type="monotone" dataKey="paid" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Paid" />
              <Area type="monotone" dataKey="direct" stackId="1" stroke="#6B7280" fill="#6B7280" name="Direct" />
              <Area type="monotone" dataKey="social" stackId="1" stroke="#A855F7" fill="#A855F7" name="Social" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Landing Pages by Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Page URL</th>
                  <th className="text-right py-3 px-4 font-medium">Organic Sessions</th>
                  <th className="text-right py-3 px-4 font-medium">Conv Rate</th>
                  <th className="text-right py-3 px-4 font-medium">Conversions</th>
                  <th className="text-right py-3 px-4 font-medium">Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {landingPages.map((page, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs text-green-600">{page.page}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(page.sessions)}</td>
                    <td className="py-3 px-4 text-right">{formatPercent(page.convRate)}</td>
                    <td className="py-3 px-4 text-right font-medium">{page.conversions}</td>
                    <td className="py-3 px-4 text-right">{page.avgPosition.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Ranking Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topKeywords.map((kw, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{kw.keyword}</div>
                    <div className="text-xs text-muted-foreground">Vol: {formatNumber(kw.volume)}/mo</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      #{kw.position}
                    </Badge>
                    {kw.change !== 0 && (
                      <div className="flex items-center gap-1">
                        {kw.change > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs ${kw.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(kw.change)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" name="Keywords" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-muted-foreground">
              Total keywords tracked: {positionDistribution.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {coreWebVitals.map((vital) => (
              <div key={vital.metric} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{vital.metric}</div>
                  <Badge 
                    variant={vital.status === 'good' ? 'default' : 'secondary'}
                    className={vital.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}
                  >
                    {vital.status === 'good' ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">{vital.value}</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">{vital.name}</div>
                <div className="text-xs text-muted-foreground">{vital.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
