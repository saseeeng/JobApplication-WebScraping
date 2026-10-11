"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  Briefcase,
  CheckCircle2,
  Cpu,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const POPULAR_SEARCHES = [
  { label: "Python", query: "search=Python" },
  { label: "React", query: "search=React" },
  { label: "DevOps", query: "search=DevOps" },
  { label: "Data Analyst", query: "search=Data+Analyst" },
  { label: "QA Tester", query: "search=QA" },
  { label: "Remote", query: "location=Remote" },
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/jobs?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] sm:p-10">
      {/* Subtle background ambient mesh */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-50/60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Live Philippine Tech Market Intelligence</span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="hidden text-slate-500 sm:inline">NCR & Remote</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Discover Tech Careers & Market Trends in the Philippines
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          Aggregated and parsed in real time from <span className="font-semibold text-slate-800">Kalibrr</span> and{" "}
          <span className="font-semibold text-slate-800">OnlineJobs.ph</span>. Explore live engineering openings, in-demand
          stacks, and salary benchmarks.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearch} className="mt-6 sm:mt-8">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, technology, or company (e.g. Full-Stack, React, Go)…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white shadow-xs transition-all hover:bg-slate-800 active:scale-98"
            >
              <span>Search Jobs</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        {/* Popular Search Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Popular:</span>
          {POPULAR_SEARCHES.map((item) => (
            <Link
              key={item.label}
              href={`/jobs?${item.query}`}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Hero Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Briefcase className="h-3.5 w-3.5 text-slate-600" aria-hidden />
            <span>Browse All Listings</span>
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <BarChart2 className="h-3.5 w-3.5 text-slate-600" aria-hidden />
            <span>View Skill & Market Analytics</span>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900">Live Multi-Board Scraping</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Automated crawling with BeautifulSoup, deduplication, and robot courtesy.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900">100% IT & Tech Filtered</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Strict title and keyword heuristics filter non-IT noise, keeping data clean.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
          <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900">Tech Stack Demand Tracking</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Aggregated skill frequencies to reveal what employers are actually seeking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
