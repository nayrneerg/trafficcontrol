import type { Insight } from '@/lib/types/metrics';
import type { ChannelROI } from '@/lib/attribution/roi-engine';

export interface MetricsSummary {
  period: string;
  totalSpend: number;
  totalRevenue: number;
  blendedRoas: number;
  totalConversions: number;
  channelBreakdown: Array<{
    platform: string;
    spend: number;
    conversions: number;
    roas: number;
    cpl: number;
  }>;
  weekOverWeekChanges: Record<string, number>;
  // ROI attribution data (optional — enriched when CRM is connected)
  roiAttribution?: {
    blended_roi_percent: number | null;
    blended_roas: number | null;
    total_closed_revenue: number;
    total_deals: number;
    channels: Array<{
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
    }>;
  };
}

export async function generateInsights(metrics: MetricsSummary): Promise<Insight[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('[insights-engine] No OpenAI API key — returning rule-based insights');
    return generateRuleBasedInsights(metrics);
  }

  const prompt = buildInsightsPrompt(metrics);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are a senior marketing analytics consultant with deep expertise in multi-touch attribution and revenue operations. Analyze the provided cross-channel marketing metrics — including real closed-deal revenue from the CRM where available — and return a JSON array of insights.

Each insight must have:
- id (uuid)
- type ('recommendation' | 'anomaly' | 'summary')
- priority ('high' | 'medium' | 'low')
- title (concise, max 80 chars)
- description (actionable, 1-2 sentences, cite specific numbers)
- platform (optional)
- metric (optional)
- createdAt (ISO string)

When ROI attribution data is present, prioritize insights about:
1. Channels with negative or below-average ROI (spend > closed revenue)
2. Channels with high CPL but high avg deal size (may still be worth it)
3. Budget reallocation opportunities based on true ROI, not just ROAS
4. Differences between ad-reported conversions and actual CRM closed deals

Return only valid JSON: { "insights": [...] }`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed.insights || parsed;
  } catch (err) {
    console.error('[insights-engine] OpenAI call failed:', err);
    return generateRuleBasedInsights(metrics);
  }
}

function buildInsightsPrompt(metrics: MetricsSummary): string {
  const base = `Analyze these marketing metrics for ${metrics.period}:

AD PLATFORM METRICS
-------------------
Total Ad Spend: $${metrics.totalSpend.toLocaleString()}
Total Conversions (ad-reported): ${metrics.totalConversions}
Blended ROAS (ad-reported): ${metrics.blendedRoas.toFixed(2)}x

Channel Breakdown:
${metrics.channelBreakdown.map(c =>
  `- ${c.platform}: $${c.spend.toLocaleString()} spend, ${c.conversions} conversions, ${c.roas.toFixed(2)}x ROAS, $${c.cpl.toFixed(0)} CPL`
).join('\n')}

Week-over-week changes:
${Object.entries(metrics.weekOverWeekChanges).map(([k, v]) =>
  `- ${k}: ${v > 0 ? '+' : ''}${v.toFixed(1)}%`
).join('\n')}`;

  if (!metrics.roiAttribution) {
    return base + '\n\nNote: CRM not connected — no closed-deal revenue data available. Recommend connecting HubSpot or Salesforce for true ROI.\n\nGenerate 4-6 insights: 2-3 recommendations, 1-2 anomalies, 1 summary.';
  }

  const roi = metrics.roiAttribution;
  const roiSection = `

CRM REVENUE ATTRIBUTION (actual closed deals)
----------------------------------------------
Total Closed Revenue: $${roi.total_closed_revenue.toLocaleString()}
Total Closed Deals: ${roi.total_deals}
Blended ROI: ${roi.blended_roi_percent !== null ? roi.blended_roi_percent.toFixed(1) + '%' : 'N/A (no paid spend)'}
Blended ROAS (on closed revenue): ${roi.blended_roas !== null ? roi.blended_roas.toFixed(2) + 'x' : 'N/A'}

Per-Channel ROI (spend vs actual closed revenue):
${roi.channels.map(c => [
  `- ${c.label}:`,
  `  Spend: $${c.ad_spend.toLocaleString()}`,
  `  Closed Revenue: $${c.closed_revenue.toLocaleString()}`,
  `  ROI: ${c.roi_percent !== null ? c.roi_percent.toFixed(1) + '%' : 'N/A'}`,
  `  ROAS: ${c.roas !== null ? c.roas.toFixed(2) + 'x' : 'N/A'}`,
  `  Leads: ${c.leads_count} | Deals: ${c.deals_count}`,
  `  CPL: ${c.cost_per_lead !== null ? '$' + c.cost_per_lead.toFixed(0) : 'N/A'} | Cost/Deal: ${c.cost_per_deal !== null ? '$' + c.cost_per_deal.toFixed(0) : 'N/A'}`,
  `  Avg Deal Size: ${c.avg_deal_size !== null ? '$' + c.avg_deal_size.toFixed(0) : 'N/A'}`,
].join('\n')).join('\n\n')}

IMPORTANT: The CRM closed revenue is the ground truth. Ad-platform ROAS can be inflated. Focus ROI insights on the CRM numbers.

Generate 5-7 insights: 2-3 ROI-focused recommendations (cite specific numbers), 1-2 anomalies (e.g. high ad ROAS but low actual closed revenue), 1 summary.`;

  return base + roiSection;
}

function generateRuleBasedInsights(metrics: MetricsSummary): Insight[] {
  const insights: Insight[] = [];
  const now = new Date().toISOString();

  // --- ROI-based insights (when CRM data available) ---
  if (metrics.roiAttribution) {
    const roi = metrics.roiAttribution;
    const paidChannels = roi.channels.filter(c => c.ad_spend > 0);

    // Best and worst by true ROI
    const byRoi = [...paidChannels]
      .filter(c => c.roi_percent !== null)
      .sort((a, b) => (b.roi_percent ?? 0) - (a.roi_percent ?? 0));

    const best = byRoi[0];
    const worst = byRoi[byRoi.length - 1];

    if (best && worst && best !== worst) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        priority: 'high',
        title: `${best.label} has the strongest true ROI at ${best.roi_percent?.toFixed(0)}%`,
        description: `Based on actual closed deals, ${best.label} returns $${best.roas?.toFixed(2)} for every $1 spent vs ${worst.label} at ${worst.roi_percent?.toFixed(0) ?? 'N/A'}% ROI. Consider shifting budget toward ${best.label}.`,
        platform: best.channel as any,
        metric: 'roi',
        createdAt: now,
      });
    }

    // Negative ROI alert
    const negativeROI = paidChannels.filter(c => (c.roi_percent ?? 0) < 0);
    for (const ch of negativeROI) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'anomaly',
        priority: 'high',
        title: `${ch.label} has negative ROI — spending more than it returns`,
        description: `${ch.label} spent $${ch.ad_spend.toLocaleString()} but only closed $${ch.closed_revenue.toLocaleString()} in revenue (${ch.roi_percent?.toFixed(0)}% ROI). Pause or restructure this channel immediately.`,
        platform: ch.channel as any,
        metric: 'roi',
        createdAt: now,
      });
    }

    // Ad platform ROAS vs true ROAS discrepancy
    for (const ch of paidChannels) {
      const adPlatformEntry = metrics.channelBreakdown.find(c => c.platform === ch.channel);
      if (adPlatformEntry && ch.roas !== null) {
        const adRoas = adPlatformEntry.roas;
        const trueRoas = ch.roas;
        if (adRoas > trueRoas * 1.5 && trueRoas < 2) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'anomaly',
            priority: 'medium',
            title: `${ch.label}: ad-reported ROAS (${adRoas.toFixed(1)}x) overstates true ROAS (${trueRoas.toFixed(1)}x)`,
            description: `The platform reports ${adRoas.toFixed(1)}x ROAS but closed-deal data shows only ${trueRoas.toFixed(1)}x. Review attribution windows and conversion definitions.`,
            platform: ch.channel as any,
            metric: 'roas',
            createdAt: now,
          });
        }
      }
    }

    // High CPL but high avg deal size (hidden gem)
    for (const ch of paidChannels) {
      const avgCpl = roi.channels.reduce((s, c) => s + (c.cost_per_lead ?? 0), 0) / paidChannels.length;
      if (
        ch.cost_per_lead !== null &&
        ch.avg_deal_size !== null &&
        ch.cost_per_lead > avgCpl * 1.3 &&
        ch.avg_deal_size > (roi.total_closed_revenue / (roi.total_deals || 1)) * 1.5
      ) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'recommendation',
          priority: 'medium',
          title: `${ch.label} has high CPL but delivers ${(ch.avg_deal_size / ch.cost_per_lead).toFixed(1)}x deal value per lead cost`,
          description: `CPL of $${ch.cost_per_lead.toFixed(0)} is above average, but avg deal size of $${ch.avg_deal_size.toLocaleString()} makes it worthwhile. Focus on lead quality over volume here.`,
          platform: ch.channel as any,
          metric: 'cpl',
          createdAt: now,
        });
      }
    }

    // Summary with true ROI
    insights.push({
      id: crypto.randomUUID(),
      type: 'summary',
      priority: 'low',
      title: `Revenue attribution summary — ${metrics.period}`,
      description: `$${metrics.totalSpend.toLocaleString()} in ad spend generated $${roi.total_closed_revenue.toLocaleString()} in closed revenue across ${roi.total_deals} deals (${roi.blended_roi_percent?.toFixed(0) ?? 'N/A'}% blended ROI).`,
      createdAt: now,
    });

    return insights;
  }

  // --- Fallback: no CRM data, use ad-platform metrics only ---
  const sorted = [...metrics.channelBreakdown].sort((a, b) => b.roas - a.roas);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (best && worst && best.roas > worst.roas * 1.5) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'recommendation',
      priority: 'high',
      title: `Reallocate budget from ${worst.platform} to ${best.platform}`,
      description: `${best.platform} delivers ${best.roas.toFixed(1)}x ROAS vs ${worst.platform} at ${worst.roas.toFixed(1)}x. Connect your CRM to validate with real closed-deal revenue.`,
      platform: worst.platform as any,
      metric: 'roas',
      createdAt: now,
    });
  }

  metrics.channelBreakdown.forEach(channel => {
    const avgCpl = metrics.totalSpend / metrics.totalConversions;
    if (channel.cpl > avgCpl * 1.5) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'anomaly',
        priority: 'medium',
        title: `${channel.platform} CPL is ${((channel.cpl / avgCpl - 1) * 100).toFixed(0)}% above average`,
        description: `${channel.platform} cost per lead ($${channel.cpl.toFixed(0)}) significantly exceeds your blended average ($${avgCpl.toFixed(0)}). Review targeting and creative.`,
        platform: channel.platform as any,
        metric: 'cpl',
        createdAt: now,
      });
    }
  });

  insights.push({
    id: crypto.randomUUID(),
    type: 'recommendation',
    priority: 'medium',
    title: 'Connect HubSpot or Salesforce for true ROI tracking',
    description: `Current insights are based on ad-platform conversions only. Connecting your CRM will reveal actual closed-deal revenue per channel and true ROI.`,
    createdAt: now,
  });

  insights.push({
    id: crypto.randomUUID(),
    type: 'summary',
    priority: 'low',
    title: `Performance summary — ${metrics.period}`,
    description: `$${metrics.totalSpend.toLocaleString()} spend generated $${metrics.totalRevenue.toLocaleString()} in reported revenue (${metrics.blendedRoas.toFixed(2)}x ROAS). ${metrics.totalConversions} total conversions across ${metrics.channelBreakdown.length} channels.`,
    createdAt: now,
  });

  return insights;
}
