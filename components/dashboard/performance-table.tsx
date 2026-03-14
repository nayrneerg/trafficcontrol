'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface CampaignRow {
  campaign: string
  platform: string
  spend: number
  clicks: number
  conversions: number
  roas: number
}

interface PerformanceTableProps {
  data: CampaignRow[]
}

type SortField = 'campaign' | 'platform' | 'spend' | 'clicks' | 'conversions' | 'roas'
type SortDirection = 'asc' | 'desc'

export function PerformanceTable({ data }: PerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('spend')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    
    return sortDirection === 'asc' 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  const platformColors: Record<string, string> = {
    'Google': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Meta': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'TikTok': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Campaign Performance
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('campaign')}
              >
                <div className="flex items-center gap-2">
                  Campaign
                  <SortIcon field="campaign" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('platform')}
              >
                <div className="flex items-center gap-2">
                  Platform
                  <SortIcon field="platform" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('spend')}
              >
                <div className="flex items-center justify-end gap-2">
                  Spend
                  <SortIcon field="spend" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('clicks')}
              >
                <div className="flex items-center justify-end gap-2">
                  Clicks
                  <SortIcon field="clicks" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('conversions')}
              >
                <div className="flex items-center justify-end gap-2">
                  Conversions
                  <SortIcon field="conversions" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSort('roas')}
              >
                <div className="flex items-center justify-end gap-2">
                  ROAS
                  <SortIcon field="roas" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  {row.campaign}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platformColors[row.platform] || 'bg-slate-100 text-slate-800'}`}>
                    {row.platform}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white">
                  {formatCurrency(row.spend)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white">
                  {formatNumber(row.clicks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white">
                  {formatNumber(row.conversions)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900 dark:text-white">
                  {row.roas.toFixed(2)}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
