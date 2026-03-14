import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatRoas, formatNumber } from '@/lib/utils';

interface ReportTokenData {
  orgSlug: string;
  expiresAt: string;
  createdBy: string;
  nonce: string;
}

function decodeToken(token: string): ReportTokenData | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function SharedReportPage({ params }: { params: { token: string } }) {
  const tokenData = decodeToken(params.token);

  if (!tokenData) return notFound();

  const isExpired = new Date(tokenData.expiresAt) < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Report Link Expired</h2>
            <p className="text-gray-500">This report link has expired. Please request a new one from your account manager.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportData = {
    orgName: tokenData.orgSlug.split('-').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' '),
    period: 'Last 30 Days',
    generatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    expiresAt: new Date(tokenData.expiresAt).toLocaleDateString(),
    kpis: [
      { label: 'Total Ad Spend', value: formatCurrency(45240) },
      { label: 'Total Revenue', value: formatCurrency(144180) },
      { label: 'Blended ROAS', value: formatRoas(3.19) },
      { label: 'Conversions', value: formatNumber(842) },
      { label: 'Leads Generated', value: formatNumber(1284) },
    ],
    channels: [
      { name: 'Google Ads', spend: formatCurrency(18420), roas: formatRoas(3.84), conv: formatNumber(312) },
      { name: 'Meta Ads', spend: formatCurrency(15840), roas: formatRoas(2.96), conv: formatNumber(284) },
      { name: 'TikTok Ads', spend: formatCurrency(8240), roas: formatRoas(1.81), conv: formatNumber(124) },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            ControlTower Report
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{reportData.orgName}</h1>
          <p className="text-gray-500 mt-1">Marketing Performance — {reportData.period}</p>
          <p className="text-xs text-gray-400 mt-1">Generated {reportData.generatedAt} · Link expires {reportData.expiresAt}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {reportData.kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
                <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500 font-medium">Channel</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Spend</th>
                  <th className="text-right py-2 text-gray-500 font-medium">ROAS</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {reportData.channels.map((ch) => (
                  <tr key={ch.name} className="border-b last:border-0">
                    <td className="py-2 font-medium">{ch.name}</td>
                    <td className="py-2 text-right">{ch.spend}</td>
                    <td className="py-2 text-right">{ch.roas}</td>
                    <td className="py-2 text-right">{ch.conv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          This is a read-only report. Data is confidential and intended for the recipient only.
        </p>
      </div>
    </div>
  );
}
