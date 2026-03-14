import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    google_ads: 'Google Ads',
    meta_ads: 'Meta Ads',
    tiktok_ads: 'TikTok Ads',
    google_analytics: 'Google Analytics',
    hubspot: 'HubSpot',
    salesforce: 'Salesforce',
    seo: 'SEO',
  };
  return labels[platform] || platform;
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    google_ads: '#4285F4',
    meta_ads: '#1877F2',
    tiktok_ads: '#FF0050',
    google_analytics: '#E37400',
    hubspot: '#FF7A59',
    salesforce: '#00A1E0',
    seo: '#10B981',
  };
  return colors[platform] || '#6B7280';
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
