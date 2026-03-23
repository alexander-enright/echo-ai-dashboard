'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ManualConnectPage() {
  const { user } = useAuth();
  const [xUserId, setXUserId] = useState('');
  const [xUsername, setXUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/x/manual-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xUserId,
          xUsername,
          accessToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('X account connected successfully!');
        // Redirect after success
        setTimeout(() => {
          window.location.href = '/settings';
        }, 1500);
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/settings" className="text-gray-400 hover:text-white">
            ← Back to Settings
          </Link>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="text-xl font-bold text-white mb-2">Manual X Connection</h1>
          <p className="text-gray-400 text-sm mb-6">
            Connect your X account by providing your API credentials directly.
            This bypasses the OAuth flow.
          </p>

          {message && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                X User ID
              </label>
              <input
                type="text"
                value={xUserId}
                onChange={(e) => setXUserId(e.target.value)}
                placeholder="123456789"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Your X account's numeric ID</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                X Username
              </label>
              <input
                type="text"
                value={xUsername}
                onChange={(e) => setXUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Access Token
              </label>
              <textarea
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste your X API access token here"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from https://developer.twitter.com/en/portal/dashboard → Keys and Tokens
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> This stores your access token in the database.
              The token will be used to post tweets on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
