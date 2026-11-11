import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import { ExpenseAttachments } from "@/components/expenses/expense-attachments";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { EXPENSE_STATUS_LABELS } from "@/lib/labels";
import type { ExpenseFormOptions, ExpenseListItem, ExpenseStatus } from "@/types/expenses";

type ExpenseCardProps = {
  expense: ExpenseListItem;
  options: ExpenseFormOptions;
};

const statusLabels = EXPENSE_STATUS_LABELS;

function getStatusStyles(status: ExpenseStatus) {
  if (status === "paid") {
    return {
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (status === "overdue") {
    return {
      icon: CircleAlert,
      className: "bg-red-500/10 text-red-700 dark:text-red-300",
    };
  }

  if (status === "cancelled") {
    return {
      icon: CircleAlert,
      className: "bg-muted text-muted-foreground",
    };
  }

  return {
    icon: Clock3,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
}

export function ExpenseCard({ expense, options }: ExpenseCardProps) {
  const status = getStatusStyles(expense.status);
  const StatusIcon = status.icon;

  const dueDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${expense.due_date}T12:00:00`));

  return (
    <article className="group bg-card rounded-3xl border p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <ReceiptText className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">{expense.title}</p>

            <p className="text-muted-foreground mt-1 text-sm">
              {expense.category?.name ?? "Sem categoria"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {expense.installment_number && expense.installment_total && (
                <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2 py-1 text-xs">
                  Parcela {expense.installment_number}/{expense.installment_total}
                </span>
              )}

              {expense.is_recurring && (
                <span className="bg-primary/10 text-primary inline-flex rounded-full px-2 py-1 text-xs">
                  Recorrente
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            status.className,
          )}
        >
          <StatusIcon className="size-3.5" />
          {statusLabels[expense.status]}
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight">{formatCurrency(expense.amount)}</p>

      {expense.description && (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
          {expense.description}
        </p>
      )}

      <div className="text-muted-foreground mt-5 grid gap-3 border-t pt-4 text-xs sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          {dueDate}
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="size-4" />
          {expense.paid_by_profile?.name ?? "Não informado"}
        </div>
      </div>

      <div className="mt-5 space-y-5 border-t pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <EditExpenseDialog expense={expense} options={options} />

          <ExpenseActions expense={expense} options={options} />
        </div>

        <ExpenseAttachments expense={expense} />
      </div>
    </article>
  );
}
