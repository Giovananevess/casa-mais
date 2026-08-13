import { getIncomeForMonth } from "@/services/finance";
import { getFinancialAccounts } from "@/services/finance";
import { getGoalMembers } from "@/services/goals";
import { formatCurrency } from "@/lib/currency";
import { CreateIncomeDialog } from "@/components/finance/create-income-dialog";

export default async function IncomePage() {


  const [
    income,
    accounts,
    members,
  ] = await Promise.all([
    getIncomeForMonth(),
    getFinancialAccounts(),
    getGoalMembers(),
  ]);

  const cashIncome =
    income
      .filter(
        (item) =>
          !item.is_benefit
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const benefits =
    income
      .filter(
        (item) =>
          item.is_benefit
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  return (
    <div className="space-y-8 pb-8">
      <section>
        <p className="text-sm font-medium text-primary">
          Entradas
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          Receitas
        </h1>

        <p className="mt-2 text-muted-foreground">
          Salários, benefícios e
          outras entradas da casa.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Dinheiro recebido
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              cashIncome
            )}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Benefícios
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              benefits
            )}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total recebido
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              cashIncome +
              benefits
            )}
          </p>
        </article>
      </section>

      <section className="space-y-3">
        {income.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between rounded-2xl border bg-card p-4"
          >
            <div>
              <p className="font-medium">
                {item.description}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.profile?.name}
              </p>
            </div>

            <p className="font-semibold">
              +
              {formatCurrency(
                item.amount
              )}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
