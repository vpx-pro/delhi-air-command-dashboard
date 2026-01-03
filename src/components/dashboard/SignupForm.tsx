'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setMessage(null);

    try {
      const { error } = await supabaseBrowserClient.from('signups').insert({
        email,
        meta: { source: 'dashboard', created_via: 'public_form' },
      });

      if (error) {
        setStatus('error');
        setMessage(error.message);
        return;
      }

      setStatus('success');
      setMessage('Thanks! You will receive occasional update emails.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Something went wrong, please try again.',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:gap-4"
    >
      <div className="flex-1">
        <p className="section-title mb-1">Stay in the loop</p>
        <p className="text-xs text-slate-300">
          Get low-volume updates when we ship new features or improve Delhi coverage.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.org"
          className="w-full rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-400/70 focus:ring-sky-500/40"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-900/70 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {message && (
        <p
          className={`text-[11px] ${
            status === 'error' ? 'text-rose-300' : 'text-emerald-300'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}


