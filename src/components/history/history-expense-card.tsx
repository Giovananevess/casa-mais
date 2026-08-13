import {
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Layers3,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

import type {
  ExpenseFormOptions,
} from "@/types/expenses";

import type {
  HistoryExpense,
} from "@/types/history";

type HistoryExpenseCardProps = {
  expense: HistoryExpense;
  options: ExpenseFormOptions;
};

function getStatusInformation(
  expense: HistoryExpense
) {
  if (expense.display_status === "paid") {
    return {
      label: "Paga",
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (
    expense.display_status ===
    "overdue"
  ) {
    return {
      label: "Atrasada",
      icon: CircleAlert,
      className:
        "bg-red-500/10 text-red-700 dark:text-red-300",
    };
  }

  if (
    expense.display_status ===
    "cancelled"
  ) {
    return {
      label: "Cancelada",
      icon: CircleAlert,
      className:
        "bg-muted text-muted-foreground",
    };
  }

  return {
    label: "Pendente",
    icon: Clock3,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
}

export function HistoryExpenseCard({
  expense,
  options,
}: HistoryExpenseCardProps) {
  const status =
    getStatusInformation(expense);

  const StatusIcon = status.icon;

  const dueDate =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        `${expense.due_date}T12:00:00`
      )
    );

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
            <ReceiptText className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {expense.title}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {expense.category?.name ??
                "Sem categoria"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            status.className
          )}
        >
          <StatusIcon className="size-3.5" />
          {status.label}
        </span>
      </div>

      <p className="mt-5 text-2xl font-semibold">
        {formatCurrency(
          Number(expense.amount)
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {expense.is_recurring && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-700 dark:text-violet-300">
            <CalendarSync className="size-3.5" />
            Recorrente
          </span>
        )}

        {expense.installment_number &&
          expense.installment_total && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300">
              <Layers3 className="size-3.5" />
              Parcela{" "}
              {expense.installment_number}/
              {expense.installment_total}
            </span>
          )}
      </div>

      <div className="mt-5 grid gap-3 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          {dueDate}
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="size-4" />

          {expense.paid_by_profile?.name ??
            "Não informado"}
        </div>
      </div>

      {expense.display_status !==
        "cancelled" && (
        <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
          <EditExpenseDialog
            expense={expense}
            options={options}
          />

          <ExpenseActions
            expense={expense}
            options={options}
          />
        </div>
      )}
    </article>
  );
}