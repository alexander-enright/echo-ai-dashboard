'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition">
              Echo
            </Link>
            <p className="text-sm text-gray-400">AI Social Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-400">Connected</span>
            </div>
            
            {user && (
              <button
                onClick={signOut}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
