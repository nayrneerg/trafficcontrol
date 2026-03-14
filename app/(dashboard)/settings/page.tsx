import { PlatformCard } from '@/components/integrations/platform-card'
import { getIntegrationStatus } from '@/lib/mock-data'
import { Link2 } from 'lucide-react'

export default function SettingsPage() {
  const integrations = getIntegrationStatus()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-slate-600 dark:text-slate-400">Connect your marketing platforms and data sources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <PlatformCard key={integration.id} platform={integration} />
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Secure OAuth Authentication
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All integrations use industry-standard OAuth 2.0 for secure authentication. Your credentials are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
