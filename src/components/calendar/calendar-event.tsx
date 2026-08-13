"use client";

import {
  CalendarSync,
  Layers3,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

import type {
  CalendarExpense,
} from "@/types/calendar";

type CalendarEventProps = {
  expense: CalendarExpense;
  onClick: () => void;
  compact?: boolean;
};

function getEventStyles(
  expense: CalendarExpense
) {
  if (
    expense.display_status === "paid"
  ) {
    return {
      container:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-200",
      dot: "bg-emerald-500",
    };
  }

  if (
    expense.display_status ===
    "overdue"
  ) {
    return {
      container:
        "border-red-500/20 bg-red-500/10 text-red-800 hover:bg-red-500/15 dark:text-red-200",
      dot: "bg-red-500",
    };
  }

  if (
    expense.expense_type ===
    "installment"
  ) {
    return {
      container:
        "border-blue-500/20 bg-blue-500/10 text-blue-800 hover:bg-blue-500/15 dark:text-blue-200",
      dot: "bg-blue-500",
    };
  }

  if (expense.is_recurring) {
    return {
      container:
        "border-violet-500/20 bg-violet-500/10 text-violet-800 hover:bg-violet-500/15 dark:text-violet-200",
      dot: "bg-violet-500",
    };
  }

  return {
    container:
      "border-amber-500/20 bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:text-amber-200",
    dot: "bg-amber-500",
  };
}

export function CalendarEvent({
  expense,
  onClick,
  compact = false,
}: CalendarEventProps) {
  const styles =
    getEventStyles(expense);

  return (
    <button
      type="button"
      className={cn(
        "group/event flex w-full items-center gap-2 overflow-hidden rounded-lg border text-left transition",
        compact
          ? "px-2 py-1.5"
          : "px-2.5 py-2",
        styles.container
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          styles.dot
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">
          {expense.title}
        </p>

        {!compact && (
          <p className="mt-0.5 truncate text-[11px] opacity-75">
            {formatCurrency(
              Number(expense.amount)
            )}
          </p>
        )}
      </div>

      {expense.is_recurring && (
        <CalendarSync className="size-3 shrink-0 opacity-60" />
      )}

      {expense.installment_number && (
        <Layers3 className="size-3 shrink-0 opacity-60" />
      )}
    </button>
  );
}