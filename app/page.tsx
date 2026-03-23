import Link from 'next/link'
import { ArrowRight, Sparkles, Calendar, BarChart3, Shield, Zap, MessageSquare, Clock, TrendingUp, Bot, Send, Repeat } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-white">Echo</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white">
                Log in
              </Link>
              <a
                href="mailto:alexenrightt@gmail.com?subject=Echo Access Request"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Request Access
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-8">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">AI-Powered Social Automation</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            Automate Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Social Presence
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-10">
            Echo uses AI to generate, schedule, and post engaging content to your X (Twitter) account.
            Save hours every week while growing your audience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100"
            >
              Log In
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <a
              href="mailto:alexenrightt@gmail.com?subject=Echo Access Request"
              className="text-gray-400 hover:text-white"
            >
              Request Access →
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-indigo-500/10 p-3 w-fit">
                <Bot className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Generated Content</h3>
              <p className="text-gray-400 mb-4">
                Never run out of ideas. Our AI generates engaging tweets tailored to your voice.
              </p>
              <div className="text-sm text-indigo-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate threads, single posts, or replies</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-purple-500/10 p-3 w-fit">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-gray-400 mb-4">
                Schedule posts at optimal times. Set it and forget it.
              </p>
              <div className="text-sm text-purple-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Best time suggestions + visual calendar</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-blue-500/10 p-3 w-fit">
                <Send className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">One-Click Publishing</h3>
              <p className="text-gray-400 mb-4">
                Connect your X account and post instantly or schedule for later.
              </p>
              <div className="text-sm text-blue-400 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>Auto-post or queue for review</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 w-fit">
                <MessageSquare className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Content Ideas</h3>
              <p className="text-gray-400 mb-4">
                Get unlimited content suggestions based on trending topics and your niche.
              </p>
              <div className="text-sm text-emerald-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Trending topics + AI suggestions</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-pink-500/10 p-3 w-fit">
                <BarChart3 className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Simple Analytics</h3>
              <p className="text-gray-400 mb-4">
                Track your growth with easy-to-read metrics that matter.
              </p>
              <div className="text-sm text-pink-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Engagement, followers, impressions</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-amber-500/10 p-3 w-fit">
                <Zap className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Time Saving</h3>
              <p className="text-gray-400 mb-4">
                What used to take hours now takes minutes. Focus on engagement, not posting.
              </p>
              <div className="text-sm text-amber-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Batch create a week of content in 30 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-semibold text-white mb-12">Trusted by Early Adopters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">5x</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Beta Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Posts Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-8">Join our beta and be part of the early growth.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to grow your audience?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join creators and businesses using Echo to automate their social media.
          </p>
          
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100"
          >
            Log In
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-white font-semibold">Echo</span>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2026 Echo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
