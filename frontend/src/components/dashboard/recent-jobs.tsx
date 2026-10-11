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
        <ul className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{job.title}</p>
                <p className="truncate text-xs text-slate-500 mt-0.5">
                  <span className="font-medium text-slate-700">{job.company}</span> · {job.location}
                </p>
                {job.skills && job.skills.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 ? (
                      <span className="text-[10px] text-slate-400 self-center">+{job.skills.length - 3}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge>{job.employment_type}</Badge>
                <span className="text-[11px] text-slate-400">{formatDate(job.posted_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
