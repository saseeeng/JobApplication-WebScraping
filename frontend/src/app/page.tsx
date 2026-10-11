import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { HeroSection } from "@/components/dashboard/hero-section";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

// Data comes from the live API; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [overview, recent, skills] = await Promise.all([
    api.getOverview(),
    api.getJobs({ page_size: 6, sort_by: "posted_at", sort_order: "desc" }),
    api.getSkills(8),
  ]);

  return (
    <div className="space-y-8">
      {/* Landing / Hero Section */}
      <HeroSection />

      {/* Market Snapshot & Data Section */}
      <div>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Live Market Snapshot
            </h2>
            <p className="text-xs text-slate-500">
              Key indicators across tracked employers, tech stacks, and locations
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 transition-colors hover:text-slate-900 hover:underline"
          >
            <span>View all listings</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {overview.total_jobs === 0 ? (
          <Card>
            <EmptyState
              title="No job data yet"
              description="Click “Refresh jobs” in the navigation bar to scrape the latest live IT postings."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            <SummaryCards overview={overview} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentJobs jobs={recent.items} />
              <BarChartCard
                title="Top skills in demand"
                description="Frequency of mentions across listings"
                data={skills}
                unit="Listings"
              />
            </div>

            {/* Quick Explore Banner */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Looking for specific technologies or locations?
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Filter by programming language, salary ranges, and remote eligibility.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                <Link
                  href="/jobs"
                  className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-slate-800"
                >
                  Explore Jobs Table
                </Link>
                <Link
                  href="/analytics"
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
                >
                  Deep Analytics
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
