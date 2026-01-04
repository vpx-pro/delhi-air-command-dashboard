'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

type Issue = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[] | null;
};

const FALLBACK_ISSUES: Issue[] = [
  {
    id: 'seed-1',
    slug: 'improve-mobile-layout',
    title: 'Improve mobile layout for dashboard cards',
    description:
      'Tighten spacing and typography for the AQI summary, timeline, and map on small screens (≤ 640px).',
    difficulty: 'easy',
    tags: ['frontend', 'design'],
  },
  {
    id: 'seed-2',
    slug: 'add-pm10-support',
    title: 'Wire PM10 into Explore filters and visualisations',
    description:
      'Extend the Explore correlation chart and filters to let users switch between PM2.5 and PM10, including aggregation logic in Supabase queries.',
    difficulty: 'medium',
    tags: ['data', 'supabase', 'typescript'],
  },
  {
    id: 'seed-3',
    slug: 'scheduling-ingestion',
    title: 'Document and script ingestion scheduling',
    description:
      'Create docs and example cron configuration (GitHub Actions or Supabase Edge functions) to run AQI/fire/weather ingestion scripts on a schedule.',
    difficulty: 'medium',
    tags: ['ops', 'scripts'],
  },
];

function difficultyColor(level: Issue['difficulty']): string {
  switch (level) {
    case 'easy':
      return 'bg-emerald-500/20 text-emerald-200';
    case 'medium':
      return 'bg-amber-500/20 text-amber-200';
    case 'hard':
    default:
      return 'bg-rose-500/20 text-rose-200';
  }
}

export function GoodFirstIssuesList() {
  const [issues, setIssues] = useState<Issue[]>(FALLBACK_ISSUES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabaseBrowserClient
        .from('good_first_issues')
        .select('id, slug, title, description, difficulty, tags')
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data && data.length) {
        setIssues(
          (data as any[]).map((row: any) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            difficulty: row.difficulty,
            tags: row.tags,
          })),
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <section className="glass-panel flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title mb-1">Issues</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Good first issues
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-300">
            These are intentionally scoped, low-ceremony tasks. Feel free to open new
            issues if you spot bugs, data quality problems, or ideas we haven&apos;t
            captured yet.
          </p>
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-rose-300">
          Failed to load issues from Supabase, showing seed list instead: {error}
        </p>
      )}
      {loading && (
        <p className="text-xs text-slate-300">
          Loading issues from Supabase… If this hangs, check that RLS policies allow
          `select` on `good_first_issues`.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {issues.map((issue) => (
          <article
            key={issue.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 text-xs text-slate-100"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {issue.title}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyColor(
                  issue.difficulty,
                )}`}
              >
                {issue.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-300">{issue.description}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(issue.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              When you&apos;re ready, open an issue or PR in the repository mentioning{' '}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-[10px]">
                {issue.slug}
              </code>
              .
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}


