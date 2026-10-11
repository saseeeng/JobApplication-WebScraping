import { Briefcase, Building2, Layers, MapPin, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { Overview } from "@/types/analytics";

function StatCard({
  label,
  value,
  icon: Icon,
  badgeText,
  accent = "slate",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  badgeText?: string;
  accent?: "blue" | "emerald" | "violet" | "amber" | "slate";
}) {
  const iconColors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[accent];

  return (
    <Card className="p-5 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className={`rounded-lg border p-2 ${iconColors}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{formatNumber(value)}</p>
        {badgeText ? (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {badgeText}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function SummaryCards({ overview }: { overview: Overview }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Tracked Jobs" value={overview.total_jobs} icon={Briefcase} accent="blue" badgeText="Live" />
      <StatCard label="Hiring Companies" value={overview.total_companies} icon={Building2} accent="violet" badgeText="Verified" />
      <StatCard label="Active Locations" value={overview.total_locations} icon={MapPin} accent="emerald" badgeText="NCR & Remote" />
      <StatCard label="Tech Domains" value={overview.total_categories} icon={Layers} accent="amber" badgeText="IT Only" />
    </div>
  );
}
