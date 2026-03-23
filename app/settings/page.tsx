'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { 
  Twitter, 
  User, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface XAccount {
  id: string
  x_user_id: string
  x_username: string
  x_display_name: string
  profile_image_url: string | null
  followers_count: number
  verified: boolean
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [xAccount, setXAccount] = useState<XAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchXAccount()
  }, [])

  const fetchXAccount = async () => {
    try {
      const res = await fetch('/api/x/profile')
      const data = await res.json()
      if (data.connected) {
        setXAccount(data.account)
      }
    } catch (error) {
      console.error('Failed to fetch X account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectX = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/x/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to connect X:', error)
      setMessage('Failed to connect X account')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const res = await fetch('/api/x/disconnect', { method: 'POST' })
      if (res.ok) {
        setXAccount(null)
        setShowDisconnectConfirm(false)
        setMessage('X account disconnected successfully')
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
      setMessage('Failed to disconnect X account')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        {message && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span>{message}</span>
            </div>
            <button 
              onClick={() => setMessage('')}
              className="text-green-400 hover:text-green-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Account
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-white">{user?.email}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={signOut}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Sign out of all sessions
                </button>
              </div>
            </div>
          </div>

          {/* X Connection Section */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Twitter className="h-5 w-5 text-blue-400" />
                X (Twitter) Connection
              </h2>
              
              {xAccount && (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : xAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50">
                  {xAccount.profile_image_url ? (
                    <img 
                      src={xAccount.profile_image_url} 
                      alt={xAccount.x_display_name}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center"
                      >
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {xAccount.x_display_name}
                      {xAccount.verified && (
                        <span className="ml-2 text-blue-400">✓</span>
                      )}
                    </p>
                    <p className="text-gray-400">@{xAccount.x_username}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {xAccount.followers_count.toLocaleString()} followers
                    </p>
                  </div>
                </div>

                {!showDisconnectConfirm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDisconnectConfirm(true)}
                      className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
                    >
                      Disconnect Account
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Disconnect X Account?</p>
                        <p className="text-gray-400 text-sm mt-1">
                          This will remove your X connection. You won't be able to post or retweet until you reconnect.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition"
                      >
                        {isDisconnecting ? (
                          <>
                            <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                            Disconnecting...
                          </>
                        ) : (
                          'Yes, Disconnect'
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowDisconnectConfirm(false)}
                        disabled={isDisconnecting}
                        className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Twitter className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Connect your X account to start posting and engaging with your audience
                </p>
                <button
                  onClick={handleConnectX}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Twitter className="h-4 w-4" />
                      Connect X Account
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">About Echo</h2>
            
            <div className="space-y-2 text-sm text-gray-400">
              <p>Echo is your AI-powered social media automation platform for X (Twitter).</p>
              <p>Version 2.0 — Multi-User SaaS</p>
              <p className="pt-2 border-t border-gray-800">Built with Next.js, Supabase, and Twitter API v2.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}