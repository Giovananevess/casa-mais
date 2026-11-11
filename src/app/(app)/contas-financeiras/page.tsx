import { CreditCard, Landmark, WalletCards } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { getGoalMembers } from "@/services/goals";
import { CreateAccountDialog } from "@/components/finance/create-account-dialog";
import { getFinancialAccounts } from "@/services/finance";
export default async function FinancialAccountsPage() {
  const [members, accounts] = await Promise.all([getGoalMembers(), getFinancialAccounts()]);

  return (
    <div className="space-y-8 pb-8">
      <section>
        <p className="text-primary text-sm font-medium">Organização financeira</p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Contas financeiras</h1>

        <p className="text-muted-foreground mt-2">
          Contas bancárias, cartões, dinheiro e benefícios.
        </p>
      </section>

      <section className="flex justify-end">
        <CreateAccountDialog members={members} existingAccounts={accounts} />{" "}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const Icon =
            account.account_type === "credit_card"
              ? CreditCard
              : account.account_type === "cash"
                ? WalletCards
                : Landmark;

          return (
            <article key={account.id} className="bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                  <Icon className="size-5" />
                </div>

                {account.auto_payment && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700">
                    Auto pagamento
                  </span>
                )}
              </div>

              <h2 className="mt-5 font-semibold">{account.name}</h2>

              {account.account_type !== "credit_card" && (
                <p className="mt-3 text-2xl font-semibold">
                  {formatCurrency(account.current_balance)}
                </p>
              )}

              {account.account_type === "credit_card" && (
                <div className="text-muted-foreground mt-4 text-sm">
                  <p>Fecha dia {account.closing_day}</p>

                  <p className="mt-1">Vence dia {account.due_day}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
