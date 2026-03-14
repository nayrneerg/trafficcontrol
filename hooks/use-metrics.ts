'use client';

import { useState, useEffect } from 'react';
import type { DashboardData, DateRange } from '@/lib/types/metrics';
import {
  mockSummary,
  mockChannels,
  mockSpendAllocation,
  mockConversionFunnel,
  mockTrendData,
  mockInsights,
} from '@/lib/mock-data';

export function useMetrics(dateRange: DateRange = '30d') {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      try {
        setData({
          summary: mockSummary,
          channels: mockChannels,
          spendAllocation: mockSpendAllocation,
          conversionFunnel: mockConversionFunnel,
          trendData: mockTrendData,
          insights: mockInsights,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load metrics');
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [dateRange]);

  return { data, loading, error };
}
