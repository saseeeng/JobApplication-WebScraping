"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { JobFilterOptions } from "@/types/job";

const controlClass =
  "h-9 rounded-md border border-line bg-surface px-3 text-sm text-ink shadow-sm placeholder:text-subtle";

interface SelectFieldProps {
  label: string;
  param: string;
  value: string;
  options: string[];
  onChange: (param: string, value: string) => void;
}

function SelectField({ label, param, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
      {label}
      <select
        className={cn(controlClass, "min-w-40 font-normal")}
        value={value}
        onChange={(e) => onChange(param, e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function JobFilters({ options }: { options: JobFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search);

  const apply = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page"); // any filter change returns to the first page
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  useEffect(() => {
    if (debouncedSearch !== urlSearch) apply({ search: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced input
  }, [debouncedSearch]);

  const hasFilters = ["search", "location", "category", "employment_type"].some((k) => searchParams.has(k));

  return (
    <div className={cn("flex flex-wrap items-end gap-3 p-4", isPending && "opacity-70")} aria-busy={isPending}>
      <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium text-muted">
        Search
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-subtle" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, company or keyword"
            className={cn(controlClass, "w-full pl-9 font-normal")}
          />
        </span>
      </label>
      <SelectField
        label="Location"
        param="location"
        value={searchParams.get("location") ?? ""}
        options={options.locations}
        onChange={(p, v) => apply({ [p]: v })}
      />
      <SelectField
        label="Category"
        param="category"
        value={searchParams.get("category") ?? ""}
        options={options.categories}
        onChange={(p, v) => apply({ [p]: v })}
      />
      <SelectField
        label="Employment type"
        param="employment_type"
        value={searchParams.get("employment_type") ?? ""}
        options={options.employment_types}
        onChange={(p, v) => apply({ [p]: v })}
      />
      {hasFilters ? (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden /> Clear
        </button>
      ) : null}
    </div>
  );
}
