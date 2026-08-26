import {
  notFound,
} from "next/navigation";

import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import {
  formatCurrency,
} from "@/lib/currency";

import {
  getMoneyBoxes,
  getMoneyBoxTransactions,
} from "@/services/money-boxes";

export default async function MoneyBoxDetailPage({
  params,
}: {
  params:
    Promise<{
      moneyBoxId: string;
    }>;
}) {
  const {
    moneyBoxId,
  } = await params;

  const [
    boxes,
    transactions,
  ] = await Promise.all([
    getMoneyBoxes(),

    getMoneyBoxTransactions(
      moneyBoxId
    ),
  ]);

  const box =
    boxes.find(
      (item) =>
        item.id ===
        moneyBoxId
    );

  if (!box) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-10">
      <section>
        <p className="text-sm font-medium text-primary">
          Caixinha
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          {box.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {box.description ??
            "Histórico completo da reserva."}
        </p>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Saldo atual
        </p>

        <p className="mt-2 text-4xl font-semibold">
          {formatCurrency(
            box.balance
          )}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          Movimentações
        </h2>

        <div className="mt-4 space-y-3">
          {transactions.length ===
          0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
              Nenhuma movimentação
              ainda.
            </div>
          ) : (
            transactions.map(
              (
                transaction
              ) => {
                const deposit =
                  transaction
                    .transaction_type ===
                  "deposit";

                return (
                  <article
                    key={
                      transaction.id
                    }
                    className="flex items-center justify-between rounded-2xl border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                        {deposit ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">
                          {deposit
                            ? "Depósito"
                            : "Retirada"}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            transaction.user_name
                          }

                          {transaction.account_name
                            ? ` · ${transaction.account_name}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      {deposit
                        ? "+"
                        : "-"}

                      {formatCurrency(
                        transaction.amount
                      )}
                    </p>
                  </article>
                );
              }
            )
          )}
        </div>
      </section>
    </div>
  );
}