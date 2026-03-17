'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth()

  const handleRequestAccess = () => {
    const subject = encodeURIComponent('Echo Access Request')
    const body = encodeURIComponent("Hi, I'd like access to Echo.")
    window.open(`mailto:alexenrightt@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              Echo
            </Link>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-white">Echo</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition">
              Features
            </Link>
            <Link href="#demo" className="text-sm text-gray-400 hover:text-white transition">
              Demo
            </Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition">
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRequestAccess}
                  className="hidden sm:block text-sm text-gray-400 hover:text-white transition"
                >
                  Request Access
                </button>
                <Link
                  href="/login"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
