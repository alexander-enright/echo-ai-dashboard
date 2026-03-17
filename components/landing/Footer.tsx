import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-white">Echo</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
              Dashboard
            </Link>
            <a
              href="mailto:alexenrightt@gmail.com"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} Echo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
