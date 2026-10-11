"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { RefreshJobsButton } from "./refresh-jobs-button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs transition-transform group-hover:scale-105">
            <Activity className="h-4 w-4 text-emerald-400" aria-hidden />
          </span>
          <span className="text-sm font-semibold sm:text-base">{siteConfig.name}</span>
          <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">
            PH
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {siteConfig.nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all",
                  active
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <RefreshJobsButton />
      </div>
    </header>
  );
}
