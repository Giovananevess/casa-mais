import {
  CalendarCheck2,
  CircleAlert,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";

import type {
  CalendarMonthSummary,
} from "@/types/calendar";

type CalendarSummaryProps = {
  summary: CalendarMonthSummary;
};

const cards = [
  {
    key: "total",
    title: "Total previsto",
    icon: CircleDollarSign,
    className:
      "bg-primary/10 text-primary",
  },
  {
    key: "paid",
    title: "Total pago",
    icon: CalendarCheck2,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "pending",
    title: "Pendente",
    icon: Clock3,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    key: "overdue",
    title: "Atrasado",
    icon: CircleAlert,
    className:
      "bg-red-500/10 text-red-700 dark:text-red-300",
  },
] as const;

export function CalendarSummary({
  summary,
}: CalendarSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];

        return (
          <article
            key={card.key}
            className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {formatCurrency(
                    Number(value)
                  )}
                </p>
              </div>

              <div
                className={`flex size-11 items-center justify-center rounded-2xl ${card.className}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}