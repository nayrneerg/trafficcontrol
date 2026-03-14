import type {
  ExecutiveSummary,
  ChannelMetrics,
  SpendAllocation,
  ConversionFunnel,
  TimeSeries,
  Insight,
} from './types/metrics';

// Executive Summary
export const mockSummary: ExecutiveSummary = {
  totalSpend: {
    value: 45280,
    change: 8.4,
    trend: 'up',
  },
  totalConversions: {
    value: 842,
    change: 12.3,
    trend: 'up',
  },
  blendedRoas: {
    value: 3.18,
    change: 5.2,
    trend: 'up',
  },
  totalLeads: {
    value: 1247,
    change: 9.7,
    trend: 'up',
  },
  totalRevenue: {
    value: 144090,
    change: 14.8,
    trend: 'up',
  },
  totalImpressions: {
    value: 2134567,
    change: 6.2,
    trend: 'up',
  },
};

// Channel Metrics
export const mockChannels: ChannelMetrics[] = [
  {
    platform: 'google_ads',
    spend: {
      value: 22140,
      change: 10.2,
      trend: 'up',
    },
    impressions: {
      value: 1245890,
      change: 7.8,
      trend: 'up',
    },
    clicks: {
      value: 24918,
      change: 9.4,
      trend: 'up',
    },
    conversions: {
      value: 498,
      change: 15.2,
      trend: 'up',
    },
    revenue: {
      value: 84726,
      change: 18.3,
      trend: 'up',
    },
    roas: {
      value: 3.83,
      change: 7.3,
      trend: 'up',
    },
    cpl: {
      value: 44.46,
      change: -3.2,
      trend: 'down',
    },
    ctr: {
      value: 2.0,
      change: 1.5,
      trend: 'up',
    },
    cpc: {
      value: 0.89,
      change: 0.8,
      trend: 'up',
    },
  },
  {
    platform: 'meta_ads',
    spend: {
      value: 18620,
      change: 6.8,
      trend: 'up',
    },
    impressions: {
      value: 654320,
      change: 4.2,
      trend: 'up',
    },
    clicks: {
      value: 13086,
      change: 5.9,
      trend: 'up',
    },
    conversions: {
      value: 262,
      change: 8.7,
      trend: 'up',
    },
    revenue: {
      value: 44824,
      change: 11.2,
      trend: 'up',
    },
    roas: {
      value: 2.41,
      change: 4.1,
      trend: 'up',
    },
    cpl: {
      value: 71.07,
      change: -1.8,
      trend: 'down',
    },
    ctr: {
      value: 2.0,
      change: 1.7,
      trend: 'up',
    },
    cpc: {
      value: 1.42,
      change: 0.9,
      trend: 'up',
    },
  },
  {
    platform: 'tiktok_ads',
    spend: {
      value: 4520,
      change: 7.5,
      trend: 'up',
    },
    impressions: {
      value: 234357,
      change: 9.1,
      trend: 'up',
    },
    clicks: {
      value: 4687,
      change: 11.3,
      trend: 'up',
    },
    conversions: {
      value: 82,
      change: 13.9,
      trend: 'up',
    },
    revenue: {
      value: 14540,
      change: 16.8,
      trend: 'up',
    },
    roas: {
      value: 3.22,
      change: 8.6,
      trend: 'up',
    },
    cpl: {
      value: 55.12,
      change: -4.3,
      trend: 'down',
    },
    ctr: {
      value: 2.0,
      change: 2.0,
      trend: 'up',
    },
    cpc: {
      value: 0.96,
      change: -3.5,
      trend: 'down',
    },
  },
];

// Spend Allocation
export const mockSpendAllocation: SpendAllocation[] = [
  {
    platform: 'google_ads',
    spend: 22140,
    percentage: 48.9,
  },
  {
    platform: 'meta_ads',
    spend: 18620,
    percentage: 41.1,
  },
  {
    platform: 'tiktok_ads',
    spend: 4520,
    percentage: 10.0,
  },
];

// Conversion Funnel
export const mockConversionFunnel: ConversionFunnel = {
  stages: [
    {
      stage: 'Impressions',
      value: 2134567,
      percentage: 100,
    },
    {
      stage: 'Clicks',
      value: 42691,
      percentage: 2.0,
    },
    {
      stage: 'Landing Page Views',
      value: 35128,
      percentage: 82.3,
    },
    {
      stage: 'Leads',
      value: 1247,
      percentage: 3.55,
    },
    {
      stage: 'MQLs',
      value: 386,
      percentage: 30.95,
    },
    {
      stage: 'SQLs',
      value: 142,
      percentage: 36.79,
    },
    {
      stage: 'Closed Won',
      value: 48,
      percentage: 33.8,
    },
  ],
};

// Helper function to generate dates
function generateDateSeries(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Trend Data - Spend
const dates = generateDateSeries(30);

const googleSpendData = dates.map((date, i) => ({
  date,
  value: 700 + Math.random() * 200 + Math.sin(i / 7) * 100,
  platform: 'google_ads' as const,
}));

const metaSpendData = dates.map((date, i) => ({
  date,
  value: 580 + Math.random() * 150 + Math.sin(i / 7) * 80,
  platform: 'meta_ads' as const,
}));

const tiktokSpendData = dates.map((date, i) => ({
  date,
  value: 140 + Math.random() * 40 + Math.sin(i / 7) * 20,
  platform: 'tiktok_ads' as const,
}));

// Trend Data - Conversions
const googleConversionData = dates.map((date, i) => ({
  date,
  value: 15 + Math.random() * 8 + Math.sin(i / 7) * 4,
  platform: 'google_ads' as const,
}));

const metaConversionData = dates.map((date, i) => ({
  date,
  value: 8 + Math.random() * 4 + Math.sin(i / 7) * 2,
  platform: 'meta_ads' as const,
}));

const tiktokConversionData = dates.map((date, i) => ({
  date,
  value: 2 + Math.random() * 2 + Math.sin(i / 7) * 1,
  platform: 'tiktok_ads' as const,
}));

export const mockTrendData: TimeSeries[] = [
  {
    metric: 'spend',
    data: [...googleSpendData, ...metaSpendData, ...tiktokSpendData],
  },
  {
    metric: 'conversions',
    data: [...googleConversionData, ...metaConversionData, ...tiktokConversionData],
  },
];

// Insights
export const mockInsights: Insight[] = [
  {
    id: 'insight-001',
    type: 'recommendation',
    priority: 'high',
    title: 'Google Ads ROAS exceeding target by 28%',
    description:
      'Google Ads is delivering a 3.83x ROAS, well above the 3.0x target. Consider increasing budget allocation by 15-20% to capitalize on strong performance.',
    metric: 'roas',
    platform: 'google_ads',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'insight-002',
    type: 'anomaly',
    priority: 'medium',
    title: 'TikTok CPC decreased 3.5% week-over-week',
    description:
      'TikTok Ads cost-per-click dropped from $1.00 to $0.96, indicating improved ad relevance or reduced competition. Monitor this trend for sustained efficiency gains.',
    metric: 'cpc',
    platform: 'tiktok_ads',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'insight-003',
    type: 'summary',
    priority: 'low',
    title: 'Overall conversion rate improved 12.3% this period',
    description:
      'Total conversions increased from 750 to 842, driven primarily by Google Ads (+15.2%) and TikTok Ads (+13.9%). Meta Ads also showed solid growth at +8.7%.',
    metric: 'conversions',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'insight-004',
    type: 'recommendation',
    priority: 'medium',
    title: 'Meta Ads CPL optimization opportunity',
    description:
      'Meta Ads CPL of $71.07 is 60% higher than Google Ads ($44.46). Review audience targeting and creative performance to identify efficiency improvements.',
    metric: 'cpl',
    platform: 'meta_ads',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'insight-005',
    type: 'anomaly',
    priority: 'high',
    title: 'Funnel drop-off spike at MQL to SQL stage',
    description:
      'Conversion rate from MQL to SQL is 36.79%, down from historical average of 42%. Sales team should review lead quality and follow-up timing.',
    metric: 'conversion_rate',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'insight-006',
    type: 'recommendation',
    priority: 'medium',
    title: 'Cross-platform CTR consistency at 2.0%',
    description:
      'All three platforms showing identical 2.0% CTR suggests opportunity to test more aggressive creative variations and audience expansion.',
    metric: 'ctr',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
