"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong while loading data.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-accent-soft p-3 text-muted">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm font-medium text-ink">Unable to load data</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-canvas"
        >
          Try again
        </button>
      ) : null}
    </Card>
  );
}
