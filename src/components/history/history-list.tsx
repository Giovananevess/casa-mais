import { HistoryExpenseCard } from "@/components/history/history-expense-card";
import { EmptyState } from "@/components/shared/empty-state";
import { History } from "lucide-react";

import type {
  ExpenseFormOptions,
} from "@/types/expenses";

import type {
  HistoryExpense,
} from "@/types/history";

type HistoryListProps = {
  expenses: HistoryExpense[];
  options: ExpenseFormOptions;
};

export function HistoryList({
  expenses,
  options,
}: HistoryListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhum lançamento encontrado"
        description="Altere os filtros ou selecione outro período."
      />
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {expenses.map((expense) => (
        <HistoryExpenseCard
          key={expense.id}
          expense={expense}
          options={options}
        />
      ))}
    </section>
  );
}