'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

const ROLE_OPTIONS = [
  'Developer',
  'Data scientist',
  'Designer',
  'Policy / advocacy',
  'Student',
  'Other',
];

export function ContributorSignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setFeedback(null);

    try {
      const { error } = await supabaseBrowserClient
        .from('contributor_signups')
        .insert({
          name,
          email,
          roles,
          message,
        });

      if (error) {
        setStatus('error');
        setFeedback(error.message);
        return;
      }

      setStatus('success');
      setFeedback('Saved! We will reach out once there are issues that match you.');
      setName('');
      setEmail('');
      setRoles([]);
      setMessage('');
    } catch (err) {
      setStatus('error');
      setFeedback(
        err instanceof Error ? err.message : 'Something went wrong, please try again.',
      );
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel flex flex-col gap-4 p-5 text-xs text-slate-100"
    >
      <div>
        <p className="section-title mb-1">Join the effort</p>
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Contributor sign-up
        </h2>
        <p className="mt-1 max-w-xl text-xs text-slate-300">
          We&apos;ll use this list to coordinate contributors, share context, and assign
          issues. No spam, no tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-xs outline-none ring-1 ring-transparent focus:border-sky-400/70 focus:ring-sky-500/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.org"
            className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-xs outline-none ring-1 ring-transparent focus:border-sky-400/70 focus:ring-sky-500/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] uppercase tracking-wide text-slate-400">
          Roles / interests
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((role) => {
            const active = roles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  active
                    ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                    : 'border-slate-600 bg-slate-900/80 text-slate-200 hover:border-sky-500/60'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wide text-slate-400">
          Context (optional)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your background, constraints (time zone, bandwidth), and what you’d like to work on."
          className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-xs outline-none ring-1 ring-transparent focus:border-sky-400/70 focus:ring-sky-500/40"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="max-w-sm text-[11px] text-slate-400">
          We may later enable magic-link auth for maintainers/admins only. All normal
          contributions can happen via pull requests and issues.
        </p>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-900/70 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving…' : 'Sign up to contribute'}
        </button>
      </div>

      {feedback && (
        <p
          className={`text-[11px] ${
            status === 'error' ? 'text-rose-300' : 'text-emerald-300'
          }`}
        >
          {feedback}
        </p>
      )}
    </form>
  );
}


