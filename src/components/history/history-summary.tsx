import {
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";

import type {
  HistorySummary,
} from "@/types/history";

type HistorySummaryProps = {
  summary: HistorySummary;
};

export function HistorySummary({
  summary,
}: HistorySummaryProps) {
  const cards = [
    {
      title: "Total do período",
      value: formatCurrency(
        summary.total
      ),
      description: `${summary.totalCount} lançamento(s)`,
      icon: CircleDollarSign,
      tone:
        "bg-primary/10 text-primary",
    },
    {
      title: "Total pago",
      value: formatCurrency(
        summary.paid
      ),
      description: `${summary.paidCount} conta(s) paga(s)`,
      icon: CheckCircle2,
      tone:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      title: "Pendente",
      value: formatCurrency(
        summary.pending
      ),
      description: `${summary.pendingCount} conta(s) pendente(s)`,
      icon: Clock3,
      tone:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    {
      title: "Atrasado",
      value: formatCurrency(
        summary.overdue
      ),
      description: `${summary.overdueCount} conta(s) atrasada(s)`,
      icon: CircleAlert,
      tone:
        "bg-red-500/10 text-red-700 dark:text-red-300",
    },
    {
      title: "Média por conta",
      value: formatCurrency(
        summary.averageExpense
      ),
      description: "Média no período selecionado",
      icon: ReceiptText,
      tone:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      title: "Percentual pago",
      value: `${summary.paidPercentage.toFixed(
        0
      )}%`,
      description: "Quantidade de contas concluídas",
      icon: TrendingUp,
      tone:
        "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-3 truncate text-xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <Icon className="size-4" />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {card.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}