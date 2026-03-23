'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Twitter, LogOut, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-white">Echo</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/settings" className="text-gray-300 hover:text-white flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button onClick={signOut} className="text-gray-300 hover:text-white flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.email?.split('@')[0]}</h1>
          <p className="text-gray-400">Manage your X automation and scheduled posts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/settings" className="rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-700 transition">
            <div className="rounded-lg bg-blue-500/10 p-3 w-fit mb-4">
              <Twitter className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect X Account</h3>
            <p className="text-gray-400">Link your X account to start posting</p>
          </Link>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="rounded-lg bg-indigo-500/10 p-3 w-fit mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Content</h3>
            <p className="text-gray-400">Generate posts with AI</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="rounded-lg bg-purple-500/10 p-3 w-fit mb-4">
              <Settings className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scheduling</h3>
            <p className="text-gray-400">Schedule posts for optimal times</p>
          </div>
        </div>
      </main>
    </div>
  )
}
