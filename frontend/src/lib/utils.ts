import clsx, { type ClassValue } from "clsx";
import type { JobQueryParams } from "@/types/job";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Build a /jobs URL from query params, omitting empty values and the default page. */
export function buildJobsHref(params: JobQueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || (key === "page" && value === 1)) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSalary(min: number | null, max: number | null, currency: string | null): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const range = min !== null && max !== null ? `${fmt(min)} – ${fmt(max)}` : fmt((min ?? max) as number);
  return currency ? `${currency} ${range}` : range;
}
