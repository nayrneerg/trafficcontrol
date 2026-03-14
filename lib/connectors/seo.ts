import type { NormalizedMetric } from './google-ads';

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  url: string;
  updatedAt: string;
}

export interface SeoMetrics {
  organicSessions: number;
  organicConversions: number;
  topKeywords: KeywordRanking[];
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

export async function syncSeoData(creds: { access_token: string; metadata?: any }): Promise<NormalizedMetric[]> {
  // Option 1: DataForSEO API
  // POST https://api.dataforseo.com/v3/serp/google/organic/live/advanced
  // Headers: Authorization: Basic base64(login:password)
  
  // Option 2: SEMrush API
  // GET https://api.semrush.com/?type=domain_organic&key={API_KEY}&domain={domain}&database=us
  
  // Option 3: Google Search Console API (free, via OAuth)
  // POST https://searchconsole.googleapis.com/v1/sites/{site}/searchAnalytics/query
  // body: { startDate, endDate, dimensions: ['query', 'page'], rowLimit: 1000 }
  
  console.log('[seo] Sync called \u2014 connect Google Search Console via OAuth or configure DataForSEO/SEMrush API key');
  return [];
}
