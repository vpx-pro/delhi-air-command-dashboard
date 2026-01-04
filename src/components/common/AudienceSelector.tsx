'use client';

import { useEffect, useState } from 'react';

type Audience = 'public' | 'research' | 'policy' | 'builder';

const STORAGE_KEY = 'dac-audience';

const AUDIENCE_LABELS: Record<Audience, string> = {
  public: 'Public',
  research: 'Research',
  policy: 'Policy',
  builder: 'Builder',
};

const AUDIENCE_COPY: Record<Audience, string> = {
  public: 'Designed for residents who want a calm, plain-language view of Delhi’s air today.',
  research:
    'Highlights correlations, lags, and raw series so you can take this into your own analysis.',
  policy:
    'Emphasises thresholds, hotspots, and windows where interventions like GRAP may matter most.',
  builder:
    'Focuses on datasets, tables, and APIs so you can quickly build products on top of this data.',
};

export function AudienceSelector({ context }: { context: 'overview' | 'understand' }) {
  const [audience, setAudience] = useState<Audience>('public');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Audience | null;
    if (stored && AUDIENCE_LABELS[stored]) {
      setAudience(stored);
    }
  }, []);

  const updateAudience = (next: Audience) => {
    setAudience(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <section className="glass-panel flex flex-col gap-2 p-4 text-xs text-slate-100">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <p className="section-title mb-0">Who is this for?</p>
          <p className="text-[11px] text-slate-300">
            This {context === 'overview' ? 'overview' : 'analysis view'} is lightly tuned to
            your role.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-700/70 bg-slate-900/80 p-0.5 text-[11px]">
          {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((key) => {
            const active = key === audience;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateAudience(key)}
                className={`rounded-full px-3 py-1 capitalize transition ${
                  active
                    ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-900/70'
                    : 'text-slate-200 hover:bg-slate-800/80 hover:text-sky-200'
                }`}
              >
                {AUDIENCE_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-slate-300">{AUDIENCE_COPY[audience]}</p>
    </section>
  );
}


