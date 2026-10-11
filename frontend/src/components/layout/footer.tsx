import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 py-8 text-xs text-slate-500 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="font-semibold text-slate-800">
            {siteConfig.name} <span className="text-slate-400">· Portfolio Project</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Automated scraping pipeline from Kalibrr & OnlineJobs.ph targeting IT openings in NCR & Remote.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Overview
          </Link>
          <Link href="/jobs" className="hover:text-slate-900 transition-colors">
            Jobs
          </Link>
          <Link href="/analytics" className="hover:text-slate-900 transition-colors">
            Analytics
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            API Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
