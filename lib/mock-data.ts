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
  totalSpend: { value: 45280, change: 8.4, trend: 'up' },
  totalConversions: { value: 842, change: 12.3, trend: 'up' },
  blendedRoas: { value: 3.18, change: 5.2, trend: 'up' },
  totalLeads: { value: 1247, change: 9.7, trend: 'up' },
  totalRevenue: { value: 144090, change: 14.8, trend: 'up' },
  totalImpressions: { value: 2134567, change: 6.2, trend: 'up' },
};

// Channel Metrics
export const mockChannels: ChannelMetrics[] = [
  {
    platform: 'google_ads',
    spend: { value: 22140, change: 10.2, trend: 'up' },
    impressions: { value: 1245890, change: 7.8, trend: 'up' },
    clicks: { value: 24918, change: 9.4, trend: 'up' },
    conversions: { value: 498, change: 15.2, trend: 'up' },
    revenue: { value: 84726, change: 18.3, trend: 'up' },
    roas: { value: 3.83, change: 7.3, trend: 'up' },
    cpl: { value: 44.46, change: -3.2, trend: 'down' },
    ctr: { value: 2.0, change: 1.5, trend: 'up' },
    cpc: { value: 0.89, change: 0.8, trend: 'up' },
  },
  {
    platform: 'meta_ads',
    spend: { value: 18620, change: 6.8, trend: 'up' },
    impressions: { value: 654320, change: 4.2, trend: 'up' },
    clicks: { value: 13086, change: 5.9, trend: 'up' },
    conversions: { value: 262, change: 8.7, trend: 'up' },
    revenue: { value: 44824, change: 11.2, trend: 'up' },
    roas: { value: 2.41, change: 4.1, trend: 'up' },
    cpl: { value: 71.07, change: -1.8, trend: 'down' },
    ctr: { value: 2.0, change: 1.7, trend: 'up' },
    cpc: { value: 1.42, change: 0.9, trend: 'up' },
  },
  {
    platform: 'tiktok_ads',
    spend: { value: 4520, change: 7.5, trend: 'up' },
    impressions: { value: 234357, change: 9.1, trend: 'up' },
    clicks: { value: 4687, change: 11.3, trend: 'up' },
    conversions: { value: 82, change: 13.9, trend: 'up' },
    revenue: { value: 14540, change: 16.8, trend: 'up' },
    roas: { value: 3.22, change: 8.6, trend: 'up' },
    cpl: { value: 55.12, change: -4.3, trend: 'down' },
    ctr: { value: 2.0, change: 2.0, trend: 'up' },
    cpc: { value: 0.96, change: -3.5, trend: 'down' },
  },
];

// Spend Allocation
export const mockSpendAllocation: SpendAllocation[] = [
  { platform: 'google_ads', spend: 22140, percentage: 48.9 },
  { platform: 'meta_ads', spend: 18620, percentage: 41.1 },
  { platform: 'tiktok_ads', spend: 4520, percentage: 10.0 },
];

// Conversion Funnel
export const mockConversionFunnel: ConversionFunnel = {
  stages: [
    { stage: 'Impressions', value: 2134567, percentage: 100 },
    { stage: 'Clicks', value: 42691, percentage: 2.0 },
    { stage: 'Landing Page Views', value: 35128, percentage: 82.3 },
    { stage: 'Leads', value: 1247, percentage: 3.55 },
    { stage: 'MQLs', value: 386, percentage: 30.95 },
    { stage: 'SQLs', value: 142, percentage: 36.79 },
    { stage: 'Closed Won', value: 48, percentage: 33.8 },
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

// Trend Data
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
  { metric: 'spend', data: [...googleSpendData, ...metaSpendData, ...tiktokSpendData] },
  { metric: 'conversions', data: [...googleConversionData, ...metaConversionData, ...tiktokConversionData] },
];

function buildFlatTrendData(): Array<{ date: string; spend: number; conversions: number }> {
  return dates.map((date, i) => ({
    date,
    spend: Math.round(googleSpendData[i].value + metaSpendData[i].value + tiktokSpendData[i].value),
    conversions: Math.round(googleConversionData[i].value + metaConversionData[i].value + tiktokConversionData[i].value),
  }));
}

const flatTrendData = buildFlatTrendData();

// Insights
export const mockInsights: Insight[] = [
  { id: 'insight-001', type: 'recommendation', priority: 'high', title: 'Google Ads ROAS exceeding target by 28%', description: 'Google Ads is delivering a 3.83x ROAS, well above the 3.0x target. Consider increasing budget allocation by 15-20% to capitalize on strong performance.', metric: 'roas', platform: 'google_ads', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'insight-002', type: 'anomaly', priority: 'medium', title: 'TikTok CPC decreased 3.5% week-over-week', description: 'TikTok Ads cost-per-click dropped from $1.00 to $0.96, indicating improved ad relevance or reduced competition.', metric: 'cpc', platform: 'tiktok_ads', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'insight-003', type: 'summary', priority: 'low', title: 'Overall conversion rate improved 12.3% this period', description: 'Total conversions increased from 750 to 842, driven primarily by Google Ads (+15.2%) and TikTok Ads (+13.9%).', metric: 'conversions', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: 'insight-004', type: 'recommendation', priority: 'medium', title: 'Meta Ads CPL optimization opportunity', description: 'Meta Ads CPL of $71.07 is 60% higher than Google Ads ($44.46). Review audience targeting and creative performance.', metric: 'cpl', platform: 'meta_ads', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: 'insight-005', type: 'anomaly', priority: 'high', title: 'Funnel drop-off spike at MQL to SQL stage', description: 'Conversion rate from MQL to SQL is 36.79%, down from historical average of 42%.', metric: 'conversion_rate', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
  { id: 'insight-006', type: 'recommendation', priority: 'medium', title: 'Cross-platform CTR consistency at 2.0%', description: 'All three platforms showing identical 2.0% CTR suggests opportunity to test more aggressive creative variations.', metric: 'ctr', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

// Sparkline arrays for MetricCard trend prop (expects number[])
const sparkUp = [3, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9];
const sparkDown = [9, 8, 9, 7, 8, 6, 7, 5, 6, 4, 5, 3];

// =============================================
// Data accessor functions used by page components
// =============================================

export function getGoogleAdsData() {
  const google = mockChannels.find(c => c.platform === 'google_ads')!;
  return {
    spend: google.spend.value,
    spendChange: google.spend.change,
    spendTrend: sparkUp,
    clicks: google.clicks.value,
    clicksChange: google.clicks.change,
    clicksTrend: sparkUp,
    conversions: google.conversions.value,
    conversionsChange: google.conversions.change,
    conversionsTrend: sparkUp,
    roas: google.roas.value,
    roasChange: google.roas.change,
    roasTrend: sparkUp,
    trendData: flatTrendData,
    campaigns: [
      { campaign: 'Brand Search', platform: 'Google', spend: 8200, clicks: 11389, conversions: 210, roas: 4.12 },
      { campaign: 'Non-Brand Search', platform: 'Google', spend: 6400, clicks: 6095, conversions: 142, roas: 3.56 },
      { campaign: 'Performance Max', platform: 'Google', spend: 4800, clicks: 5714, conversions: 98, roas: 3.88 },
      { campaign: 'Display Remarketing', platform: 'Google', spend: 2740, clicks: 4419, conversions: 48, roas: 3.50 },
    ],
  };
}

export function getMetaAdsData() {
  const meta = mockChannels.find(c => c.platform === 'meta_ads')!;
  return {
    spend: meta.spend.value,
    spendChange: meta.spend.change,
    spendTrend: sparkUp,
    impressions: meta.impressions.value,
    impressionsChange: meta.impressions.change,
    impressionsTrend: sparkUp,
    conversions: meta.conversions.value,
    conversionsChange: meta.conversions.change,
    conversionsTrend: sparkUp,
    roas: meta.roas.value,
    roasChange: meta.roas.change,
    roasTrend: sparkUp,
    trendData: flatTrendData,
    campaigns: [
      { campaign: 'Lookalike - Top Customers', platform: 'Meta', spend: 6200, clicks: 4593, conversions: 95, roas: 2.68 },
      { campaign: 'Interest - Marketing Pros', platform: 'Meta', spend: 5100, clicks: 3446, conversions: 72, roas: 2.42 },
      { campaign: 'Retargeting - Website', platform: 'Meta', spend: 4320, clicks: 3541, conversions: 62, roas: 2.55 },
      { campaign: 'Broad - Awareness', platform: 'Meta', spend: 3000, clicks: 1786, conversions: 33, roas: 1.98 },
    ],
  };
}

export function getTikTokAdsData() {
  const tiktok = mockChannels.find(c => c.platform === 'tiktok_ads')!;
  return {
    spend: tiktok.spend.value,
    spendChange: tiktok.spend.change,
    spendTrend: sparkUp,
    views: tiktok.impressions.value,
    viewsChange: tiktok.impressions.change,
    viewsTrend: sparkUp,
    conversions: tiktok.conversions.value,
    conversionsChange: tiktok.conversions.change,
    conversionsTrend: sparkUp,
    roas: tiktok.roas.value,
    roasChange: tiktok.roas.change,
    roasTrend: sparkUp,
    trendData: flatTrendData,
    campaigns: [
      { campaign: 'Spark Ads - UGC', platform: 'TikTok', spend: 1800, clicks: 2195, conversions: 38, roas: 3.60 },
      { campaign: 'In-Feed - Product Demo', platform: 'TikTok', spend: 1400, clicks: 1474, conversions: 26, roas: 3.18 },
      { campaign: 'TopView - Brand', platform: 'TikTok', spend: 1320, clicks: 1179, conversions: 18, roas: 2.88 },
    ],
  };
}

export function getGA4Data() {
  return {
    users: 48250,
    usersChange: 11.2,
    usersTrend: sparkUp,
    sessions: 72180,
    sessionsChange: 8.7,
    sessionsTrend: sparkUp,
    avgSessionDuration: 154,
    durationChange: 5.1,
    durationTrend: sparkUp,
    bounceRate: 42.3,
    bounceRateChange: -3.8,
    bounceRateTrend: sparkDown,
    trendData: flatTrendData,
    topPages: [
      { path: '/', views: 18420, avgTime: '1:45' },
      { path: '/pricing', views: 8930, avgTime: '3:12' },
      { path: '/features', views: 6840, avgTime: '2:28' },
      { path: '/blog/marketing-guide', views: 4210, avgTime: '4:35' },
      { path: '/contact', views: 3180, avgTime: '1:52' },
    ],
  };
}

export function getCRMData() {
  return {
    totalLeads: 1247,
    leadsChange: 9.7,
    leadsTrend: sparkUp,
    pipelineValue: 482000,
    pipelineChange: 14.2,
    pipelineTrend: sparkUp,
    closedDeals: 48,
    dealsChange: 18.5,
    dealsTrend: sparkUp,
    closeRate: 33.8,
    closeRateChange: 2.4,
    closeRateTrend: sparkUp,
    pipelineStages: [
      { name: 'New Leads', count: 386, value: 115800, percentage: 100 },
      { name: 'Contacted', count: 248, value: 89280, percentage: 74 },
      { name: 'Qualified', count: 142, value: 68160, percentage: 56 },
      { name: 'Proposal Sent', count: 86, value: 51600, percentage: 38 },
      { name: 'Negotiation', count: 52, value: 36400, percentage: 24 },
      { name: 'Closed Won', count: 48, value: 144000, percentage: 18 },
    ],
    recentDeals: [
      { name: 'Enterprise SaaS License', company: 'Acme Corp', value: 24000, closedDate: 'Mar 12', source: 'Google Ads' },
      { name: 'Annual Subscription', company: 'TechStart Inc', value: 18500, closedDate: 'Mar 11', source: 'Meta Ads' },
      { name: 'Premium Package', company: 'GlobalTech', value: 15200, closedDate: 'Mar 10', source: 'Organic' },
      { name: 'Team License', company: 'DataFlow LLC', value: 12800, closedDate: 'Mar 9', source: 'Google Ads' },
      { name: 'Starter Plan', company: 'NewCo', value: 8400, closedDate: 'Mar 8', source: 'TikTok Ads' },
    ],
  };
}

export function getDashboardMetrics() {
  return {
    totalSpend: mockSummary.totalSpend.value,
    spendChange: mockSummary.totalSpend.change,
    spendTrend: sparkUp,
    totalConversions: mockSummary.totalConversions.value,
    conversionsChange: mockSummary.totalConversions.change,
    conversionsTrend: sparkUp,
    blendedRoas: mockSummary.blendedRoas.value,
    roasChange: mockSummary.blendedRoas.change,
    roasTrend: sparkUp,
    totalLeads: mockSummary.totalLeads.value,
    leadsChange: mockSummary.totalLeads.change,
    leadsTrend: sparkUp,
    avgCpl: 36.31,
    cplChange: -4.2,
    cplTrend: sparkDown,
    spendByChannel: mockSpendAllocation,
    channelRoas: mockChannels.map(c => ({ platform: c.platform, roas: c.roas.value })),
    trendData: flatTrendData,
    funnelData: mockConversionFunnel,
    campaignPerformance: [
      { name: 'Google - Brand Search', spend: 8200, conversions: 210, roas: 4.12, cpc: 0.72, ctr: 3.1 },
      { name: 'Meta - Lookalike', spend: 6200, conversions: 95, roas: 2.68, cpc: 1.35, ctr: 2.4 },
      { name: 'Google - Non-Brand', spend: 6400, conversions: 142, roas: 3.56, cpc: 1.05, ctr: 1.8 },
      { name: 'Meta - Retargeting', spend: 4320, conversions: 62, roas: 2.55, cpc: 1.22, ctr: 2.1 },
      { name: 'TikTok - Spark Ads', spend: 1800, conversions: 38, roas: 3.60, cpc: 0.82, ctr: 2.8 },
    ],
  };
}

export function getAIInsights() {
  return mockInsights;
}

export function getIntegrationStatus() {
  return [
    { id: 'google-ads', name: 'Google Ads', platform: 'google_ads', status: 'connected' as const, lastSync: '2 min ago', icon: 'google' },
    { id: 'meta-ads', name: 'Meta Ads', platform: 'meta_ads', status: 'connected' as const, lastSync: '5 min ago', icon: 'meta' },
    { id: 'tiktok-ads', name: 'TikTok Ads', platform: 'tiktok_ads', status: 'connected' as const, lastSync: '8 min ago', icon: 'tiktok' },
    { id: 'google-analytics', name: 'Google Analytics 4', platform: 'ga4', status: 'connected' as const, lastSync: '3 min ago', icon: 'analytics' },
    { id: 'hubspot', name: 'HubSpot CRM', platform: 'hubspot', status: 'pending' as const, lastSync: 'Never', icon: 'hubspot' },
    { id: 'salesforce', name: 'Salesforce', platform: 'salesforce', status: 'disconnected' as const, lastSync: 'Never', icon: 'salesforce' },
  ];
}
