'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/explore', label: 'Understand' },
  { href: '/decide', label: 'Decide' },
  { href: '/build', label: 'Build' },
  { href: '/contribute', label: 'Contribute' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 px-1 py-1 text-xs font-medium text-slate-200 shadow-lg shadow-black/40">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-[11px] tracking-wide transition ${
              isActive
                ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-900/80'
                : 'text-slate-200 hover:bg-slate-800/90 hover:text-sky-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{item.label}</span>
              {isActive && (
                <span className="rounded-full bg-slate-900/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                  You are here
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}


