'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Twitter, User, AlertTriangle, Loader2, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface XAccount {
  id: string;
  x_user_id: string;
  x_username: string;
  x_display_name: string | null;
  profile_image_url: string | null;
  followers_count: number;
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const [accounts, setAccounts] = useState<XAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const connected = urlParams.get('connected');
      const errorParam = urlParams.get('error');
      const detail = urlParams.get('detail');

      if (connected === 'true') {
        setMessage('X account connected successfully!');
        fetchAccounts();
        window.history.replaceState({}, '', '/settings');
      } else if (errorParam) {
        const detailText = detail ? ` - ${decodeURIComponent(detail)}` : '';
        setError(`Connection failed: ${errorParam}${detailText}`);
        window.history.replaceState({}, '', '/settings');
      }
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/x/profile');
      const data = await res.json();
      
      if (data.connected) {
        setAccounts(data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch X accounts:', error);
      setError('Failed to load X accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectX = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      const res = await fetch('/api/x/connect', { method: 'POST' });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to start OAuth flow');
        setIsConnecting(false);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect X account');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (xUserId: string) => {
    try {
      const res = await fetch('/api/x/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xUserId }),
      });

      if (res.ok) {
        setMessage('X account disconnected');
        fetchAccounts();
      } else {
        setError('Failed to disconnect account');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        {message && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            {message}
            <button onClick={() => setMessage('')} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-400" />
              X (Twitter) Accounts
              {accounts.length > 0 && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  {accounts.length} connected
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.x_user_id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50">
                  {account.profile_image_url ? (
                    <img
                      src={account.profile_image_url}
                      alt={account.x_display_name || account.x_username}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {account.x_display_name || account.x_username}
                    </p>
                    <p className="text-gray-400 text-sm">@{account.x_username}</p>
                  </div>

                  <button
                    onClick={() => handleDisconnect(account.x_user_id)}
                    className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded border border-red-500/30 hover:border-red-500/50"
                  >
                    Disconnect
                  </button>
                </div>
              ))}

              <button
                onClick={handleConnectX}
                disabled={isConnecting}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-3 text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Twitter className="h-4 w-4" />
                    Connect Another X Account
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Twitter className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                Connect your X account to start posting
              </p>
              <button
                onClick={handleConnectX}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Twitter className="h-4 w-4" />
                    Connect X Account
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Account
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-white">{user?.email}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <button onClick={signOut} className="text-sm text-red-400 hover:text-red-300">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
