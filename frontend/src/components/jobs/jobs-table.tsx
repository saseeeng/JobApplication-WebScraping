import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildJobsHref, formatDate, formatSalary } from "@/lib/utils";
import type { Job, JobQueryParams, SortField } from "@/types/job";

interface JobsTableProps {
  jobs: Job[];
  /** Current query, used to build sort links that preserve filters. */
  query: JobQueryParams;
}

function SortHeader({ field, label, query }: { field: SortField; label: string; query: JobQueryParams }) {
  const active = query.sort_by === field;
  const defaultOrder = field === "posted_at" ? "desc" : "asc";
  const nextOrder = active ? (query.sort_order === "asc" ? "desc" : "asc") : defaultOrder;
  const Icon = query.sort_order === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (query.sort_order === "asc" ? "ascending" : "descending") : "none"}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
    >
      <Link
        href={buildJobsHref({ ...query, sort_by: field, sort_order: nextOrder, page: 1 })}
        className="inline-flex items-center gap-1 hover:text-ink"
      >
        {label}
        {active ? <Icon className="h-3 w-3" aria-hidden /> : null}
      </Link>
    </th>
  );
}

const plainHeader = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted";

export function JobsTable({ jobs, query }: JobsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80">
          <tr>
            <SortHeader field="title" label="Title & Skills" query={query} />
            <SortHeader field="company" label="Company" query={query} />
            <SortHeader field="location" label="Location" query={query} />
            <th scope="col" className={plainHeader}>
              Type
            </th>
            <SortHeader field="posted_at" label="Posted" query={query} />
            <th scope="col" className={plainHeader}>
              Apply
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
            return (
              <tr key={job.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  {salary ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {salary}
                      </span>
                    </div>
                  ) : null}
                  {job.skills && job.skills.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 ? (
                        <span className="text-[10px] text-slate-400 self-center">+{job.skills.length - 3}</span>
                      ) : null}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{job.company}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{job.location}</td>
                <td className="px-4 py-3.5">
                  <Badge>{job.employment_type}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{formatDate(job.posted_at)}</td>
                <td className="px-4 py-3.5">
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-900 hover:underline"
                    aria-label={`Apply for ${job.title} at ${job.company} (opens in a new tab)`}
                  >
                    Apply <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
