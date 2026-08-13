"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/currency";
import type {
  GoalChartItem,
} from "@/types/goals";

export function ContributionChart({
  data,
}: {
  data: GoalChartItem[];
}) {
  return (
    <article className="rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-semibold">
        Evolução da meta
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Valor acumulado ao longo dos meses.
      </p>

      <div className="mt-7 h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat(
                  "pt-BR",
                  {
                    notation: "compact",
                  }
                ).format(value)
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(
                  Number(value)
                )
              }
            />

            <Area
              type="monotone"
              dataKey="accumulated"
              name="Acumulado"
              stroke="var(--primary)"
              strokeWidth={3}
              fill="var(--primary)"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}