import {
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";

import { ExpensesList } from "@/components/expenses/expenses-list";
import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";
import { formatCurrency } from "@/lib/currency";
import {
  getExpenseFormOptions,
  getExpenses,
} from "@/services/expenses";
import { InstallmentsDialog } from "@/components/expenses/installments-dialog";
import { RecurringExpenseDialog } from "@/components/expenses/recurring-expense-dialog";
import { GenerateRecurringButton } from "@/components/expenses/generate-recurring-button";

export default async function ExpensesPage() {
  const [expenses, options] =
    await Promise.all([
      getExpenses(),
      getExpenseFormOptions(),
    ]);

  const total = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const pending = expenses
    .filter(
      (expense) =>
        expense.status === "pending" ||
        expense.status === "overdue"
    )
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Controle mensal
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Contas da casa
          </h1>

          <p className="mt-2 text-muted-foreground">
            Cadastre e acompanhe todas as
            despesas de vocês.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
  <GenerateRecurringButton />

  <RecurringExpenseDialog
    options={options}
  />

  <InstallmentsDialog
    options={options}
  />

  <NewExpenseDialog
    options={options}
  />
</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total cadastrado
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CircleDollarSign className="size-5" />
            </div>
          </div>
        </article>

        <article className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pendente
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatCurrency(pending)}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
              <ReceiptText className="size-5" />
            </div>
          </div>
        </article>
      </section>

      <ExpensesList
  expenses={expenses}
  options={options}
/>
    </div>
  );
}