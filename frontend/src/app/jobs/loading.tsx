import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading jobs" className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
