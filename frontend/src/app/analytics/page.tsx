import type { Metadata } from "next";
import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Analytics" };

// Data comes from the live API; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [categories, locations, skills, companies] = await Promise.all([
    api.getCategories(10),
    api.getLocations(10),
    api.getSkills(12),
    api.getCompanies(10),
  ]);

  return (
    <>
      <PageHeader title="Analytics" description="Hiring demand by category, location, skill and company." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard title="Jobs by category" data={categories} />
        <BarChartCard title="Jobs by location" data={locations} color="#5b636d" />
        <BarChartCard title="Most mentioned skills" description="Number of listings mentioning each skill" data={skills} unit="Listings" />
        <BarChartCard title="Top hiring companies" description="Companies with the most listings" data={companies} color="#5b636d" />
      </div>
    </>
  );
}
