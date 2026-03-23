/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co', 'pbs.twimg.com'],
  },
  // Disable static generation for pages that use client-side auth
  // These pages must be server-rendered to access cookies/session
  output: 'standalone',
}

module.exports = nextConfig
