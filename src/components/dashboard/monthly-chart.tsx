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
import { ChartNoAxesCombined } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";
import type { DashboardTrendItem } from "@/types/dashboard";

type MonthlyChartProps = {
  data: DashboardTrendItem[];
};

export function MonthlyChart({
  data,
}: MonthlyChartProps) {
  const hasData = data.some(
    (item) => item.income > 0 || item.expenses > 0
  );

  return (
    <article className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:shadow-lg hover:shadow-black/5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Últimos seis meses
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Evolução financeira
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Comparação entre receitas e despesas da casa.
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-4 rounded-xl border bg-muted/20 px-3 py-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Receitas
            </span>

            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground" />
              Despesas
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Seu gráfico aparecerá aqui"
          description="Cadastre receitas e despesas para visualizar a evolução financeira da casa."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="incomeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0.15}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="4 8"
                stroke="var(--border)"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
              />

              <Tooltip
                cursor={{
                  stroke: "var(--border)",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  boxShadow:
                    "0 16px 40px rgba(0, 0, 0, 0.08)",
                }}
                formatter={(value) =>
                  formatCurrency(Number(value))
                }
              />

              <Area
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="url(#incomeGradient)"
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                }}
              />

              <Area
                type="monotone"
                dataKey="expenses"
                name="Despesas"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}