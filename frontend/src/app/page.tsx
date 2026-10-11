import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
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
    <>
      <PageHeader title="Dashboard" description="An overview of current job market activity." />
      {overview.total_jobs === 0 ? (
        <Card>
          <EmptyState
            title="No job data yet"
            description="Click “Refresh jobs” in the header to scrape the latest IT jobs in NCR, Philippines."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <SummaryCards overview={overview} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentJobs jobs={recent.items} />
            <BarChartCard title="Top skills in demand" description="Mentions across all listings" data={skills} unit="Listings" />
          </div>
        </div>
      )}
    </>
  );
}
