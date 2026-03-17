'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ArrowRight, Mail } from 'lucide-react'

export default function CTASection() {
  const { user } = useAuth()

  const handleRequestAccess = () => {
    const subject = encodeURIComponent('Echo Access Request')
    const body = encodeURIComponent("Hi, I'd like access to Echo.")
    window.open(`mailto:alexenrightt@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <section id="pricing" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-950/30 to-gray-900" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to Grow Your X Account?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join the creators and entrepreneurs using Echo to automate their social presence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-100 transition"
                >
                  Sign In to Echo
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </Link>
                <button
                  onClick={handleRequestAccess}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-base font-medium text-white hover:bg-gray-800 transition"
                >
                  <Mail className="h-5 w-5" />
                  Request Access
                </button>
              </>
            )}
          </div>

          {!user && (
            <p className="mt-6 text-sm text-gray-500">
              Not ready yet?{' '}
              <button
                onClick={handleRequestAccess}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Request early access
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
