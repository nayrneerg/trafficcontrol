'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Integration {
  platform: string;
  name: string;
  description: string;
  connected: boolean;
  lastSynced: string | null;
  color: string;
}

const integrations: Integration[] = [
  {
    platform: 'google_ads',
    name: 'Google Ads',
    description: 'Search, Display & Shopping campaign performance',
    connected: true,
    lastSynced: '2 hours ago',
    color: '#4285F4',
  },
  {
    platform: 'google_analytics',
    name: 'Google Analytics 4',
    description: 'Website traffic, conversions, and user behavior',
    connected: true,
    lastSynced: '2 hours ago',
    color: '#E37400',
  },
  {
    platform: 'meta_ads',
    name: 'Meta Ads',
    description: 'Facebook & Instagram campaign performance',
    connected: true,
    lastSynced: '3 hours ago',
    color: '#1877F2',
  },
  {
    platform: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Leads, deals, pipeline and close rates',
    connected: false,
    lastSynced: null,
    color: '#FF7A59',
  },
  {
    platform: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'Video ad performance and engagement metrics',
    connected: false,
    lastSynced: null,
    color: '#FF0050',
  },
  {
    platform: 'salesforce',
    name: 'Salesforce',
    description: 'CRM pipeline, opportunities and revenue',
    connected: false,
    lastSynced: null,
    color: '#00A1E0',
  },
];

export default function IntegrationsPage() {
  const [connectionStates, setConnectionStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((int) => [int.platform, int.connected]))
  );

  const handleConnect = (platform: string) => {
    window.location.href = `/api/auth/${platform}/connect`;
  };

  const handleDisconnect = async (platform: string) => {
    // TODO: Implement disconnect API call
    setConnectionStates((prev) => ({ ...prev, [platform]: false }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your marketing platforms to start syncing data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => {
          const isConnected = connectionStates[integration.platform];
          return (
            <Card key={integration.platform} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: integration.color }}
                    >
                      {integration.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <Badge
                          variant={isConnected ? 'default' : 'secondary'}
                          className={isConnected ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {integration.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isConnected && integration.lastSynced ? (
                      <span>Last synced: {integration.lastSynced}</span>
                    ) : (
                      <span>Never synced</span>
                    )}
                  </div>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.platform)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration.platform)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
