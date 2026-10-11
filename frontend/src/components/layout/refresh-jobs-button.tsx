"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
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

  const stopPolling = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/status`, { cache: "no-store" });
      const status = (await res.json()) as ScrapeStatus;
      if (status.running) return;
      stopPolling();
      if (status.error) {
        setPhase("error");
        setMessage("Scrape failed");
      } else {
        setPhase("done");
        setMessage(`${status.created} new, ${status.updated} updated`);
        router.refresh();
      }
    } catch {
      stopPolling();
      setPhase("error");
      setMessage("Backend unreachable");
    }
  }, [router, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  async function start() {
    setPhase("running");
    setMessage("Scraping live job boards…");
    try {
      const res = await fetch(API, { method: "POST" });
      if (!res.ok && res.status !== 409) throw new Error(String(res.status));
      stopPolling();
      timer.current = setInterval(poll, 2500);
    } catch {
      setPhase("error");
      setMessage("Could not start scrape");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        role="status"
        aria-live="polite"
        className={cn("hidden text-xs sm:inline", phase === "error" ? "text-red-600" : "text-muted")}
      >
        {message}
      </span>
      <button
        type="button"
        onClick={start}
        disabled={phase === "running"}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", phase === "running" && "animate-spin")} aria-hidden />
        Refresh jobs
      </button>
    </div>
  );
}
