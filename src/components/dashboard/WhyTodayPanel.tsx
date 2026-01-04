'use client';

type Props = {
  lastUpdatedIso?: string | null;
};

function formatTimestamp(ts?: string | null): string {
  if (!ts) return 'Recently';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WhyTodayPanel({ lastUpdatedIso }: Props) {
  const formatted = formatTimestamp(lastUpdatedIso);

  return (
    <section className="glass-panel flex flex-col gap-3 p-4 text-xs text-slate-100 md:flex-row md:items-start md:justify-between">
      <div className="max-w-xl">
        <p className="section-title mb-1">Why today might be bad</p>
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Simple hypotheses to keep in mind
        </h2>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
          <li>• Wind is low → pollutants accumulate near the surface.</li>
          <li>• Fire hotspots upwind can raise PM2.5 downwind over Delhi.</li>
          <li>• Temperature inversion can trap smog close to the ground.</li>
        </ul>
      </div>
      <div className="mt-3 flex flex-col items-start text-[11px] text-slate-300 md:mt-0 md:items-end">
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-wide text-slate-300 ring-1 ring-slate-700/80">
          Data trust
        </span>
        <p className="mt-2 text-right">
          Last updated: <span className="font-medium text-slate-100">{formatted}</span>
        </p>
        <p className="text-right">
          Sources: AQI stations • NASA FIRMS (VIIRS) • Basic weather
        </p>
      </div>
    </section>
  );
}


