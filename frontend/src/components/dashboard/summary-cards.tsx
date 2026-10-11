import { Briefcase, Building2, Layers, MapPin, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { Overview } from "@/types/analytics";

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="rounded-md bg-accent-soft p-2.5 text-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-ink">{formatNumber(value)}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Card>
  );
}

export function SummaryCards({ overview }: { overview: Overview }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total jobs" value={overview.total_jobs} icon={Briefcase} />
      <StatCard label="Companies" value={overview.total_companies} icon={Building2} />
      <StatCard label="Locations" value={overview.total_locations} icon={MapPin} />
      <StatCard label="Job categories" value={overview.total_categories} icon={Layers} />
    </div>
  );
}
