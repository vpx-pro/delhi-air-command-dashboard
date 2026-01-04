import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delhi Pollution Dashboard – Overview, Understand, Decide, Build",
  description:
    "Open-source Delhi air quality dashboard to help the public, researchers, policymakers, and builders understand and act on pollution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
          <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8 lg:px-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-400/60">
                  <span className="text-lg font-semibold text-sky-300">
                    AQ
                  </span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-tight">
                    Delhi Air Crisis
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Community Monitoring Dashboard
                  </span>
                </div>
              </Link>
              <MainNav />
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-white/10 bg-slate-950/80">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-400 md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
              <p>
                Built with Next.js, Supabase, and open environmental datasets.
              </p>
              <p>
                Data is experimental and may lag official CPCB / DPCC
                reporting. Use with care.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

