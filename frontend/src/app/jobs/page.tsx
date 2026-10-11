import type { Metadata } from "next";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobsTable } from "@/components/jobs/jobs-table";
import { Pagination } from "@/components/jobs/pagination";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { siteConfig } from "@/config/site";
import { api } from "@/lib/api";
import type { JobQueryParams, SortField, SortOrder } from "@/types/job";

export const metadata: Metadata = { title: "Jobs" };

type RawParams = Record<string, string | string[] | undefined>;

const SORT_FIELDS: SortField[] = ["posted_at", "title", "company", "location"];

function first(value: string | string[] | undefined): string | undefined {
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

function parseQuery(raw: RawParams): JobQueryParams {
  const sortBy = first(raw.sort_by);
  const sortOrder = first(raw.sort_order);
  const page = Number(first(raw.page));
  return {
    search: first(raw.search),
    location: first(raw.location),
    category: first(raw.category),
    employment_type: first(raw.employment_type),
    sort_by: SORT_FIELDS.includes(sortBy as SortField) ? (sortBy as SortField) : "posted_at",
    sort_order: (sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc") as SortOrder,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const query = parseQuery(await searchParams);
  const [result, options] = await Promise.all([
    api.getJobs({ ...query, page_size: siteConfig.jobsPageSize }),
    api.getJobFilters(),
  ]);

  return (
    <>
      <PageHeader title="Jobs" description="Search, filter and sort job listings." />
      <Card>
        <JobFilters options={options} />
        <div className="border-t border-line">
          {result.items.length === 0 ? (
            <EmptyState
              title="No jobs match your filters"
              description="Try a different keyword or clear some filters."
            />
          ) : (
            <>
              <JobsTable jobs={result.items} query={query} />
              <Pagination result={result} query={query} />
            </>
          )}
        </div>
      </Card>
    </>
  );
}
