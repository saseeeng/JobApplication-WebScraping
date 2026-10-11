import type { Metadata } from "next";
import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Analytics" };

// Data comes from the live API; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [skills, locations, companies] = await Promise.all([
    api.getSkills(15),
    api.getLocations(10),
    api.getCompanies(10),
  ]);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Philippine IT hiring demand across technical skills, locations, and top recruiting companies."
      />
      <div className="space-y-6">
        {/* Primary Chart: In-Demand Tech Skills */}
        <BarChartCard
          title="Most In-Demand Skills & Technologies"
          description="Number of active listings explicitly requiring each skill or framework"
          data={skills}
          unit="Listings"
          color="#0f172a"
        />

        {/* Secondary Charts Grid: Locations & Companies */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BarChartCard
            title="Jobs by Location"
            description="Geographic breakdown across Metro Manila & Remote"
            data={locations}
            color="#3b82f6"
          />
          <BarChartCard
            title="Top Hiring Companies"
            description="Employers with the most open tech positions"
            data={companies}
            color="#8b5cf6"
          />
        </div>
      </div>
    </>
  );
}
