import { ReceiptText } from "lucide-react";

import { ExpenseCard } from "@/components/expenses/expense-card";
import { InstallmentGroupCard } from "@/components/expenses/installment-group-card";
import { EmptyState } from "@/components/shared/empty-state";

import type {
  ExpenseFormOptions,
  ExpenseListItem,
} from "@/types/expenses";

type ExpensesListProps = {
  expenses: ExpenseListItem[];
  options: ExpenseFormOptions;
};

function groupExpenses(
  expenses: ExpenseListItem[]
): ExpenseListItem[][] {
  const groups = new Map<
    string,
    ExpenseListItem[]
  >();

  for (const expense of expenses) {
    const key =
      expense.installment_group_id ??
      expense.id;

    const currentGroup =
      groups.get(key) ?? [];

    currentGroup.push(expense);

    groups.set(
      key,
      currentGroup
    );
  }

  return Array.from(
    groups.values()
  );
}

function getGroupSortDate(
  group: ExpenseListItem[]
) {
  const pendingInstallments =
    group
      .filter(
        (expense) =>
          expense.status === "pending" ||
          expense.status === "overdue"
      )
      .sort((a, b) =>
        a.due_date.localeCompare(
          b.due_date
        )
      );

  if (
    pendingInstallments.length > 0
  ) {
    return pendingInstallments[0]
      .due_date;
  }

  const sorted =
    [...group].sort((a, b) =>
      b.due_date.localeCompare(
        a.due_date
      )
    );

  return (
    sorted[0]?.due_date ??
    ""
  );
}

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

  const groupedExpenses =
    groupExpenses(expenses)
      .sort((a, b) => {
        const dateA =
          getGroupSortDate(a);

        const dateB =
          getGroupSortDate(b);

        return dateA.localeCompare(
          dateB
        );
      });

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groupedExpenses.map(
        (group) => {
          const first =
            group[0];

          if (!first) {
            return null;
          }

          if (
            first.installment_group_id
          ) {
            return (
              <InstallmentGroupCard
                key={
                  first.installment_group_id
                }
                installments={group}
              />
            );
          }

          return (
            <ExpenseCard
              key={first.id}
              expense={first}
              options={options}
            />
          );
        }
      )}
    </div>
  );
}