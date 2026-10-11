"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Runs in the browser, so it needs the browser-reachable API URL.
const API = `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")}/api/v1/scrape`;

interface ScrapeStatus {
  running: boolean;
  created: number;
  updated: number;
  error: string | null;
}

type Phase = "idle" | "running" | "done" | "error";

export function RefreshJobsButton() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttempts = useRef(0);

  const stopPolling = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    pollAttempts.current = 0;
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setPhase("idle");
      setMessage("");
    }, 4500);
  }, []);

  const poll = useCallback(async () => {
    pollAttempts.current += 1;
    // Timeout safeguard after ~30s (15 polls * 2s)
    if (pollAttempts.current > 15) {
      stopPolling();
      setPhase("done");
      setMessage("Scrape finished in background");
      router.refresh();
      scheduleReset();
      return;
    }

    try {
      const res = await fetch(`${API}/status`, { cache: "no-store" });
      if (!res.ok) throw new Error("Status check failed");
      const status = (await res.json()) as ScrapeStatus;

      if (status.running) return;

      stopPolling();
      if (status.error) {
        setPhase("error");
        setMessage("Scrape error");
      } else {
        setPhase("done");
        setMessage(
          status.created > 0 || status.updated > 0
            ? `+${status.created} new, ${status.updated} updated`
            : "Dataset is up to date",
        );
        router.refresh();
      }
      scheduleReset();
    } catch {
      stopPolling();
      setPhase("error");
      setMessage("Backend offline");
      scheduleReset();
    }
  }, [router, stopPolling, scheduleReset]);

  // Check on mount if a scrape is already running
  useEffect(() => {
    let mounted = true;
    async function checkInitial() {
      try {
        const res = await fetch(`${API}/status`, { cache: "no-store" });
        if (!res.ok || !mounted) return;
        const status = (await res.json()) as ScrapeStatus;
        if (status.running && mounted) {
          setPhase("running");
          setMessage("Scraping live job boards…");
          timer.current = setInterval(poll, 2000);
        }
      } catch {
        // Silently ignore on initial load
      }
    }
    checkInitial();

    return () => {
      mounted = false;
      stopPolling();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [poll, stopPolling]);

  async function start() {
    if (phase === "running") return;
    setPhase("running");
    setMessage("Scraping live job boards…");
    pollAttempts.current = 0;

    try {
      const res = await fetch(API, { method: "POST" });
      if (!res.ok && res.status !== 409) {
        throw new Error(String(res.status));
      }
      stopPolling();
      timer.current = setInterval(poll, 2000);
    } catch {
      setPhase("error");
      setMessage("Could not start scrape");
      scheduleReset();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message ? (
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "hidden text-xs font-medium transition-all sm:inline",
            phase === "error" && "text-rose-600",
            phase === "done" && "text-emerald-700",
            phase === "running" && "text-slate-500",
            phase === "idle" && "text-slate-400",
          )}
        >
          {message}
        </span>
      ) : null}
      <button
        type="button"
        onClick={start}
        disabled={phase === "running"}
        title="Trigger live scraper for latest jobs"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
          phase === "done" && "border-emerald-200 bg-emerald-50/50 text-emerald-800",
        )}
      >
        {phase === "running" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" aria-hidden />
        ) : phase === "done" ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
        ) : (
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        )}
        <span>{phase === "running" ? "Refreshing…" : phase === "done" ? "Refreshed" : "Refresh jobs"}</span>
      </button>
    </div>
  );
}
