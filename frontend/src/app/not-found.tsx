import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card>
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        action={
          <Link href="/" className="text-sm font-medium text-ink underline underline-offset-4">
            Back to dashboard
          </Link>
        }
      />
    </Card>
  );
}
