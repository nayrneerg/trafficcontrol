'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, RefreshCw } from 'lucide-react';

interface ChannelROI {
  channel: string;
  label: string;
  ad_spend: number;
  closed_revenue: number;
  deals_count: number;
  leads_count: number;
  cost_per_lead: number | null;
  cost_per_deal: number | null;
  roi_percent: number | null;
  roas: number | null;
  avg_deal_size: number | null;
}

interface ROIData {
  source: string;
  period_start: string;
  period_end: string;
  channels: ChannelROI[];
  totals: {
    ad_spend: number;
    closed_revenue: number;
    deals_count: number;
    leads_count: number;
    blended_roi_percent: number | null;
    blended_roas: number | null;
  };
}

const CHANNEL_COLORS: Record<string, string> = {
  google_ads: '#4285F4',
  meta_ads: '#1877F2',
  tiktok_ads: '#010101',
  organic: '#34A853',
  email: '#EA4335',
  direct: '#9AA0A6',
  referral: '#FBBC04',
  unknown: '#C5C5C5',
};

function fmt(n: number | null | undefined, style: 'currency' | 'percent' | 'number' = 'number', decimals = 1): string {
  if (n === null || n === undefined) return '\u2014';
  if (style === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  if (style === 'percent') return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export default function ROIPage() {
  const [data, setData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  const fetchROI = async (p = period, refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/roi?period=${p}${refresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/roi', { method: 'POST' });
      await fetchROI(period, true);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchROI(period); }, [period]);

  const chartData = data?.channels
    .filter(c => c.ad_spend > 0 || c.closed_revenue > 0)
    .map(c => ({
      name: c.label,
      channel: c.channel,
      'Ad Spend': c.ad_spend,
      'Closed Revenue': c.closed_revenue,
    })) ?? [];

  const roiChartData = data?.channels
    .filter(c => c.roi_percent !== null)
    .map(c => ({
      name: c.label,
      channel: c.channel,
      'ROI %': parseFloat((c.roi_percent ?? 0).toFixed(1)),
    })) ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Attribution & ROI</h1>
          <p className="text-muted-foreground mt-1">
            Closed deal revenue matched against ad spend by channel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={triggerSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing CRM...' : 'Sync CRM'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Totals KPI row */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Ad Spend"
            value={fmt(data.totals.ad_spend, 'currency')}
            icon={<DollarSign className="h-4 w-4" />}
            muted
          />
          <KPICard
            title="Closed Revenue"
            value={fmt(data.totals.closed_revenue, 'currency')}
            icon={<TrendingUp className="h-4 w-4" />}
            positive
          />
          <KPICard
            title="Blended ROI"
            value={data.totals.blended_roi_percent !== null
              ? fmt(data.totals.blended_roi_percent, 'percent')
              : '\u2014'}
            icon={<Target className="h-4 w-4" />}
            positive={(data.totals.blended_roi_percent ?? 0) > 0}
            negative={(data.totals.blended_roi_percent ?? 0) < 0}
          />
          <KPICard
            title="Blended ROAS"
            value={data.totals.blended_roas !== null
              ? `${data.totals.blended_roas.toFixed(2)}x`
              : '\u2014'}
            icon={<Users className="h-4 w-4" />}
            positive={(data.totals.blended_roas ?? 0) >= 1}
            negative={(data.totals.blended_roas ?? 0) > 0 && (data.totals.blended_roas ?? 0) < 1}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend vs Revenue bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend vs Closed Revenue by Channel</CardTitle>
            <CardDescription>Direct comparison of what you spent vs what closed</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : chartData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v, 'currency')} />
                  <Legend />
                  <Bar dataKey="Ad Spend" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Closed Revenue" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ROI % by channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ROI % by Channel</CardTitle>
            <CardDescription>(Closed Revenue - Ad Spend) / Ad Spend \u00d7 100</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : roiChartData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roiChartData} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'ROI']} />
                  <Bar dataKey="ROI %" radius={[0, 3, 3, 0]}>
                    {roiChartData.map((entry) => (
                      <Cell
                        key={entry.channel}
                        fill={entry['ROI %'] >= 0 ? (CHANNEL_COLORS[entry.channel] ?? '#6366f1') : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel Attribution Breakdown</CardTitle>
          <CardDescription>
            Each row = ad spend from platform + closed deals attributed via UTM / CRM lead source
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Calculating attribution...</div>
          ) : !data || data.channels.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Channel</th>
                  <th className="text-right py-2 font-medium">Ad Spend</th>
                  <th className="text-right py-2 font-medium">Closed Revenue</th>
                  <th className="text-right py-2 font-medium">ROI</th>
                  <th className="text-right py-2 font-medium">ROAS</th>
                  <th className="text-right py-2 font-medium">Leads</th>
                  <th className="text-right py-2 font-medium">Deals</th>
                  <th className="text-right py-2 font-medium">CPL</th>
                  <th className="text-right py-2 font-medium">Cost / Deal</th>
                  <th className="text-right py-2 font-medium">Avg Deal</th>
                </tr>
              </thead>
              <tbody>
                {data.channels.map(c => (
                  <tr key={c.channel} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: CHANNEL_COLORS[c.channel] ?? '#6366f1' }}
                        />
                        {c.label}
                      </div>
                    </td>
                    <td className="text-right py-3 tabular-nums">{fmt(c.ad_spend, 'currency')}</td>
                    <td className="text-right py-3 tabular-nums font-medium">{fmt(c.closed_revenue, 'currency')}</td>
                    <td className="text-right py-3 tabular-nums">
                      {c.roi_percent !== null ? (
                        <Badge variant={c.roi_percent >= 0 ? 'default' : 'destructive'} className="tabular-nums">
                          {fmt(c.roi_percent, 'percent', 0)}
                        </Badge>
                      ) : '\u2014'}
                    </td>
                    <td className="text-right py-3 tabular-nums">
                      {c.roas !== null ? (
                        <span className={c.roas >= 1 ? 'text-green-600 font-medium' : 'text-red-500'}>
                          {c.roas.toFixed(2)}x
                        </span>
                      ) : '\u2014'}
                    </td>
                    <td className="text-right py-3 tabular-nums">{c.leads_count.toLocaleString()}</td>
                    <td className="text-right py-3 tabular-nums">{c.deals_count.toLocaleString()}</td>
                    <td className="text-right py-3 tabular-nums">{fmt(c.cost_per_lead, 'currency')}</td>
                    <td className="text-right py-3 tabular-nums">{fmt(c.cost_per_deal, 'currency')}</td>
                    <td className="text-right py-3 tabular-nums">{fmt(c.avg_deal_size, 'currency')}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-semibold bg-muted/20">
                  <td className="py-3">Total</td>
                  <td className="text-right py-3 tabular-nums">{fmt(data.totals.ad_spend, 'currency')}</td>
                  <td className="text-right py-3 tabular-nums">{fmt(data.totals.closed_revenue, 'currency')}</td>
                  <td className="text-right py-3 tabular-nums">
                    {data.totals.blended_roi_percent !== null ? (
                      <Badge variant={data.totals.blended_roi_percent >= 0 ? 'default' : 'destructive'}>
                        {fmt(data.totals.blended_roi_percent, 'percent', 0)}
                      </Badge>
                    ) : '\u2014'}
                  </td>
                  <td className="text-right py-3 tabular-nums">
                    {data.totals.blended_roas !== null
                      ? <span className="text-green-600">{data.totals.blended_roas.toFixed(2)}x</span>
                      : '\u2014'}
                  </td>
                  <td className="text-right py-3 tabular-nums">{data.totals.leads_count.toLocaleString()}</td>
                  <td className="text-right py-3 tabular-nums">{data.totals.deals_count.toLocaleString()}</td>
                  <td className="text-right py-3">\u2014</td>
                  <td className="text-right py-3">\u2014</td>
                  <td className="text-right py-3">\u2014</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {data && (
        <p className="text-xs text-muted-foreground">
          Data source: {data.source === 'cache' ? 'Cached (updated within 6h)' : 'Live calculation'}
          {' \u00b7 '}{data.period_start} to {data.period_end}
          {' \u00b7 '} Attribution based on UTM parameters and CRM lead source fields.
        </p>
      )}
    </div>
  );
}

function KPICard({
  title, value, icon, positive, negative, muted,
}: {
  title: string; value: string; icon: React.ReactNode;
  positive?: boolean; negative?: boolean; muted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <div className={`text-2xl font-bold ${
          positive ? 'text-green-600' : negative ? 'text-red-500' : muted ? 'text-foreground' : 'text-foreground'
        }`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground text-sm font-medium">No attribution data yet</p>
      <p className="text-muted-foreground text-xs mt-1">
        Connect HubSpot or Salesforce and click \u201cSync CRM\u201d to pull closed deals.
      </p>
    </div>
  );
}
