"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CountItem } from "@/types/analytics";

interface BarChartCardProps {
  title: string;
  description?: string;
  data: CountItem[];
  /** Bar color; defaults to the charcoal accent. */
  color?: string;
  /** Count label used in the tooltip, e.g. "Jobs". */
  unit?: string;
}

const ROW_HEIGHT = 34;

export function BarChartCard({ title, description, data, color = "#2b3036", unit = "Jobs" }: BarChartCardProps) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {data.length === 0 ? (
        <EmptyState title="No data available" />
      ) : (
        <div className="p-4" style={{ height: Math.max(data.length * ROW_HEIGHT + 40, 160) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#e4e6e9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#5b636d" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 12, fill: "#1f2328" }}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "#f6f7f8" }}
                formatter={(value) => [value, unit]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e6e9", fontSize: 12 }}
              />
              <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
