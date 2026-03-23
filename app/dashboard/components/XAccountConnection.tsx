'use client'

import { useState, useEffect } from 'react'
import { Twitter, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react'

interface XAccount {
  id: string
  x_username: string
  x_display_name: string
  profile_image_url: string
  followers_count: number
  is_active: boolean
}

export function XAccountConnection() {
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  // Fetch connected accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/x/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (err) {
      console.error('Failed to fetch X accounts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError('')

    try {
      const response = await fetch('/api/x/connect', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to X OAuth
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to initiate connection')
      }
    } catch (err) {
      setError('Failed to connect. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch('/api/x/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountId))
      }
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-400">Loading accounts...</span>
        </div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-2">
        {error && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-sm text-gray-400">Connecting...</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Twitter className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Connect X Account</p>
                <p className="text-xs text-gray-500">Post to your X profile</p>
              </div>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {accounts.map(account => (
        <div
          key={account.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-green-500/30 bg-green-500/10"
        >
          <div className="relative">
            {account.profile_image_url ? (
              <img
                src={account.profile_image_url}
                alt={account.x_username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-white font-bold">{account.x_username[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              @{account.x_username}
            </p>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>
          <button
            onClick={() => handleDisconnect(account.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Disconnect"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
