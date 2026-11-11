import { CalendarClock, ChevronRight, CircleAlert, ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type UpcomingExpensesProps = {
  expenses: DashboardSummary["upcoming_expenses"];
};

function getDueDateInformation(dateValue: string) {
  const dueDate = new Date(`${dateValue}T12:00:00`);
  const today = new Date();

  today.setHours(12, 0, 0, 0);

  const difference = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (difference === 0) {
    return {
      label: "Vence hoje",
      urgent: true,
    };
  }

  if (difference === 1) {
    return {
      label: "Vence amanhã",
      urgent: true,
    };
  }

  if (difference < 0) {
    return {
      label: `${Math.abs(difference)} dia(s) em atraso`,
      urgent: true,
    };
  }

  return {
    label: `Vence dia ${dueDate.getDate()}`,
    urgent: false,
  };
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  return (
    <article className="bg-card rounded-3xl border p-5 shadow-sm transition duration-300 hover:shadow-lg hover:shadow-black/5 sm:p-6">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
          Atenção
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight">Próximas contas</h2>

        <p className="text-muted-foreground mt-1 text-sm">
          Vencimentos que precisam ser acompanhados.
        </p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Nenhuma conta pendente"
          description="Quando uma conta estiver próxima do vencimento, ela aparecerá aqui."
          className="mt-8"
        />
      ) : (
        <div className="mt-6 space-y-3">
          {expenses.map((expense) => {
            const dueDate = getDueDateInformation(expense.due_date);

            const isOverdue = expense.status === "overdue";

            return (
              <div
                key={expense.id}
                className="group bg-background/40 hover:border-foreground/10 hover:bg-muted/30 flex items-center justify-between gap-3 rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      isOverdue || dueDate.urgent
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {isOverdue ? (
                      <CircleAlert className="size-5" />
                    ) : (
                      <CalendarClock className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium">{expense.title}</p>

                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-xs">
                      <span>{expense.category ?? "Sem categoria"}</span>

                      <span>•</span>

                      <span
                        className={cn(
                          dueDate.urgent && "font-medium text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {dueDate.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-semibold">{formatCurrency(Number(expense.amount))}</p>

                  <ChevronRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
