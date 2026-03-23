import Link from 'next/link'
import { ArrowRight, Sparkles, Calendar, BarChart3, Shield, Zap } from 'lucide-react'

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
              <Link 
                href="/signup" 
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Get Started
              </Link>
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
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100"
            >
              Start Free Trial
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-indigo-500/10 p-3 w-fit">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Generated Content</h3>
              <p className="text-gray-400">
                Never run out of ideas. Our AI generates engaging tweets tailored to your voice.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-purple-500/10 p-3 w-fit">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-gray-400">
                Schedule posts at optimal times. Set it and forget it.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="mb-4 rounded-lg bg-blue-500/10 p-3 w-fit">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Growth Analytics</h3>
              <p className="text-gray-400">
                Track engagement, followers, and performance metrics in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="mx-auto max-w-7xl text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10x</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Posts Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
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
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100"
          >
            Get Started Free
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
