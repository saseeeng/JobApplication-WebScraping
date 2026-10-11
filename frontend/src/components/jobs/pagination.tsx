import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildJobsHref, cn, formatNumber } from "@/lib/utils";
import type { JobListResponse, JobQueryParams } from "@/types/job";

interface PaginationProps {
  result: JobListResponse;
  query: JobQueryParams;
}

const linkClass =
  "inline-flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-3 text-sm font-medium shadow-sm";

export function Pagination({ result, query }: PaginationProps) {
  const { page, pages, total, page_size } = result;
  const first = (page - 1) * page_size + 1;
  const last = Math.min(page * page_size, total);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
      <p className="text-sm text-muted">
        Showing {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={buildJobsHref({ ...query, page: page - 1 })} className={cn(linkClass, "hover:bg-canvas")}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
          </Link>
        ) : (
          <span aria-disabled className={cn(linkClass, "cursor-not-allowed text-subtle opacity-60")}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
          </span>
        )}
        <span className="px-1 text-sm text-muted">
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link href={buildJobsHref({ ...query, page: page + 1 })} className={cn(linkClass, "hover:bg-canvas")}>
            Next <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span aria-disabled className={cn(linkClass, "cursor-not-allowed text-subtle opacity-60")}>
            Next <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
