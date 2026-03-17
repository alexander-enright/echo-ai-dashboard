'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react'

export default function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-gray-950 to-gray-950" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Social Automation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
            Grow Your X Account
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Automatically with AI
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl mb-10">
            Turn AI into a daily content and engagement engine.
            <br className="hidden sm:block" />
            Post, comment, and retweet on autopilot.
          </p>

          {/* CTA Buttons */}
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
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-base font-medium text-white hover:bg-gray-800 transition"
                >
                  See How It Works
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>AI-powered content</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Automatic engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full bg-indigo-500" />
                <div className="h-6 w-6 rounded-full bg-purple-500" />
                <div className="h-6 w-6 rounded-full bg-pink-500" />
              </div>
              <span>Join 100+ creators</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
