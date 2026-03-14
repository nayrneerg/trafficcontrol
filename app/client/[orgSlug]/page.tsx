'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, MousePointerClick, Users } from 'lucide-react';
import { formatCurrency, formatNumber, formatRoas, formatPercent } from '@/lib/utils';

const mockOrgData: Record<string, { name: string; logo?: string; primaryColor: string; metrics: any }> = {
  'acme-corp': {
    name: 'Acme Corp',
    primaryColor: '#6366f1',
    metrics: {
      spend: 45240, spendChange: 4.2,
      roas: 3.19, roasChange: -1.4,
      conversions: 842, conversionsChange: 12.1,
      leads: 1284, leadsChange: 8.7,
    },
  },
  'demo': {
    name: 'Demo Client',
    primaryColor: '#0ea5e9',
    metrics: {
      spend: 12400, spendChange: 7.1,
      roas: 2.84, roasChange: 3.2,
      conversions: 241, conversionsChange: 18.4,
      leads: 384, leadsChange: 11.2,
    },
  },
};

export default function ClientPortalPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const org = mockOrgData[orgSlug] || mockOrgData['demo'];

  const kpis = [
    { label: 'Total Ad Spend', value: formatCurrency(org.metrics.spend), change: org.metrics.spendChange, icon: DollarSign },
    { label: 'Blended ROAS', value: formatRoas(org.metrics.roas), change: org.metrics.roasChange, icon: TrendingUp },
    { label: 'Conversions', value: formatNumber(org.metrics.conversions), change: org.metrics.conversionsChange, icon: MousePointerClick },
    { label: 'Leads Generated', value: formatNumber(org.metrics.leads), change: org.metrics.leadsChange, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: org.primaryColor }}
            >
              {org.name[0]}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">{org.name}</h1>
              <p className="text-xs text-gray-500">Marketing Performance Dashboard</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Powered by ControlTower
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Overview</h2>
          <p className="text-gray-500 mt-1">Last 30 days — Updated 2 hours ago</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            return (
              <Card key={kpi.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      isPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatPercent(kpi.change)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Google Ads', spend: 18420, roas: 3.84, color: '#4285F4' },
                { name: 'Meta Ads', spend: 15840, roas: 2.96, color: '#1877F2' },
                { name: 'TikTok Ads', spend: 8240, roas: 1.81, color: '#FF0050' },
              ].map((channel) => (
                <div key={channel.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: channel.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(channel.spend)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          backgroundColor: channel.color,
                          width: `${(channel.spend / 45240) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {formatRoas(channel.roas)} ROAS
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          This report is generated by ControlTower. Questions? Contact your account manager.
        </p>
      </main>
    </div>
  );
}
