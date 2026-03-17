'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Landing() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      {/* Logo at top */}
      <div className="absolute top-8">
        {!imageError ? (
          <Image
            src="/ae-logo.png"
            alt="AE Logo"
            width={240}
            height={240}
            className="h-60 w-60 object-contain"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="flex h-60 w-60 items-center justify-center rounded-full bg-red-600 text-6xl font-bold text-white">
            AE
          </div>
        )}
      </div>

      {/* Echo in middle */}
      <div className="text-center">
        <h1 className="mb-8 text-8xl font-bold tracking-tight text-white sm:text-9xl">
          Echo
        </h1>
        
        <p className="mb-12 text-xl text-gray-400">
          AI Social Dashboard
        </p>

        {/* Dashboard button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition hover:bg-gray-200"
        >
          Dashboard
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-sm text-gray-600">
        Powered by AI
      </div>
    </div>
  )
}
