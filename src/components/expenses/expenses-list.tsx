import { ReceiptText } from "lucide-react";

import { ExpenseCard } from "@/components/expenses/expense-card";
import { EmptyState } from "@/components/shared/empty-state";

import type {
  ExpenseFormOptions,
  ExpenseListItem,
} from "@/types/expenses";

type ExpensesListProps = {
  expenses: ExpenseListItem[];
  options: ExpenseFormOptions;
};

export function ExpensesList({
  expenses,
  options,
}: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Nenhuma conta cadastrada"
        description="Use o botão Nova conta para registrar a primeira despesa da casa."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          options={options}
        />
      ))}
    </div>
  );
}