'use client';

import { useState } from 'react';
import type { DateRange } from '@/lib/types/metrics';

export function useDateRange(initial: DateRange = '30d') {
  const [dateRange, setDateRange] = useState<DateRange>(initial);

  const getDateBounds = () => {
    const end = new Date();
    const start = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);
    return { start, end };
  };

  return { dateRange, setDateRange, getDateBounds };
}
