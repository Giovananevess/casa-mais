import { CreateIncomeDialog } from "@/components/finance/create-income-dialog";
import { formatCurrency } from "@/lib/currency";
import {
  getFinancialAccounts,
  getIncomeForMonth,
} from "@/services/finance";
import { getGoalMembers } from "@/services/goals";

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

  const cashIncome = income
    .filter((item) => !item.is_benefit)
    .reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );

  const benefits = income
    .filter((item) => item.is_benefit)
    .reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );

  const total =
    cashIncome + benefits;

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Entradas da casa
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Receitas
          </h1>

          <p className="mt-2 text-muted-foreground">
            Salários, benefícios e
            outras entradas do mês.
          </p>
        </div>

        <CreateIncomeDialog
          accounts={accounts}
          members={members}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Receitas em dinheiro
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              cashIncome
            )}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Benefícios
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              benefits
            )}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total recebido
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(total)}
          </p>
        </article>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Entradas do mês
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Tudo o que foi recebido
            neste período.
          </p>
        </div>

        {income.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-10 text-center">
            <p className="font-medium">
              Nenhuma receita cadastrada
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre o primeiro salário,
              vale ou outra entrada do mês.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {income.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">
                    {item.description}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.profile?.name ??
                      "Sem pessoa"}{" "}
                    ·{" "}
                    {item.account?.name ??
                      "Sem conta"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-semibold">
                    +
                    {formatCurrency(
                      item.amount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.is_benefit
                      ? "Benefício"
                      : "Receita"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}