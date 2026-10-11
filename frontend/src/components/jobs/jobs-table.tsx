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
        <thead className="border-b border-line bg-canvas">
          <tr>
            <SortHeader field="title" label="Title" query={query} />
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
        <tbody className="divide-y divide-line">
          {jobs.map((job) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
            return (
              <tr key={job.id} className="hover:bg-canvas/70">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-ink">{job.title}</p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {job.category}
                    {salary ? ` · ${salary}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-muted">{job.company}</td>
                <td className="px-4 py-3.5 text-muted">{job.location}</td>
                <td className="px-4 py-3.5">
                  <Badge>{job.employment_type}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-muted">{formatDate(job.posted_at)}</td>
                <td className="px-4 py-3.5">
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-ink hover:underline"
                    aria-label={`Apply for ${job.title} at ${job.company} (opens in a new tab)`}
                  >
                    Apply <ExternalLink className="h-3.5 w-3.5" aria-hidden />
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
