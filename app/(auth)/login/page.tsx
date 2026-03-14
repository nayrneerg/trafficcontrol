'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Check your email for the login link!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icons.tower className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to ControlTower
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Marketing analytics that scale with your agency
        </p>
      </div>

      <form onSubmit={useMagicLink ? handleMagicLink : handleEmailLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        {!useMagicLink && (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {useMagicLink ? 'Send Magic Link' : 'Sign In'}
        </Button>

        <button
          type="button"
          onClick={() => setUseMagicLink(!useMagicLink)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  )
}
