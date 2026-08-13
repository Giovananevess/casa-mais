"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartNoAxesColumn } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";

import type {
  HistoryCategorySummary,
} from "@/types/history";

type HistoryCategoryChartProps = {
  categories: HistoryCategorySummary[];
};

export function HistoryCategoryChart({
  categories,
}: HistoryCategoryChartProps) {
  const data = categories
    .slice(0, 8)
    .map((category) => ({
      name: category.categoryName,
      amount: category.amount,
    }));

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Categorias
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Gastos por categoria
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          As categorias com maior valor no período.
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesColumn}
          title="Nenhuma categoria encontrada"
          description="Os gastos por categoria aparecerão após a aplicação dos filtros."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 0,
                right: 20,
                bottom: 0,
                left: 10,
              }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="4 8"
                stroke="var(--border)"
              />

              <XAxis
                type="number"
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

              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={105}
                tick={{
                  fill:
                    "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />

              <Tooltip
                formatter={(value) =>
                  formatCurrency(
                    Number(value)
                  )
                }
                contentStyle={{
                  borderRadius: "16px",
                  border:
                    "1px solid var(--border)",
                  background: "var(--card)",
                }}
              />

              <Bar
                dataKey="amount"
                name="Total"
                fill="var(--primary)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}