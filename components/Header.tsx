'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Echo</h1>
                <p className="text-xs text-gray-400">AI Social Dashboard</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                
                <div className="h-6 w-px bg-gray-700 mx-1" />
                
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}