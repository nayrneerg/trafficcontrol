export type Platform = 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'google_analytics' | 'hubspot' | 'salesforce' | 'seo';

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export interface MetricValue {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
}

export interface ChannelMetrics {
  platform: Platform;
  spend: MetricValue;
  impressions: MetricValue;
  clicks: MetricValue;
  conversions: MetricValue;
  revenue: MetricValue;
  roas: MetricValue;
  cpl: MetricValue;
  ctr: MetricValue;
  cpc: MetricValue;
}

export interface ExecutiveSummary {
  totalSpend: MetricValue;
  totalConversions: MetricValue;
  blendedRoas: MetricValue;
  totalLeads: MetricValue;
  totalRevenue: MetricValue;
  totalImpressions: MetricValue;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  platform?: Platform;
}

export interface TimeSeries {
  metric: string;
  data: TimeSeriesPoint[];
}

export interface SpendAllocation {
  platform: Platform;
  spend: number;
  percentage: number;
}

export interface ConversionFunnelStage {
  stage: string;
  value: number;
  percentage: number;
}

export interface ConversionFunnel {
  stages: ConversionFunnelStage[];
}

export interface Insight {
  id: string;
  type: 'recommendation' | 'anomaly' | 'summary';
  priority: 'high' | 'medium' | 'low';
  category: 'optimization' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: string;
  action: string;
  metric?: string;
  platform?: Platform;
  createdAt: string;
}

export interface DashboardData {
  summary: ExecutiveSummary;
  channels: ChannelMetrics[];
  spendAllocation: SpendAllocation[];
  conversionFunnel: ConversionFunnel;
  trendData: TimeSeries[];
  insights: Insight[];
}
