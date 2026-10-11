import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/types/job";

export function RecentJobs({ jobs }: { jobs: Job[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent job listings"
        description="Newest postings in the dataset"
        action={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Click “Refresh jobs” to scrape the latest IT jobs in NCR."
        />
      ) : (
        <ul className="divide-y divide-line">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{job.title}</p>
                <p className="truncate text-xs text-muted">
                  {job.company} · {job.location}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge>{job.employment_type}</Badge>
                <span className="text-xs text-subtle">{formatDate(job.posted_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
