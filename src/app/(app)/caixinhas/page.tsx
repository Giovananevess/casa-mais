import Link from "next/link";

import {
  PiggyBank,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  CreateMoneyBoxDialog,
} from "@/components/money-boxes/create-money-box-dialog";

import {
  MoveMoneyBoxDialog,
} from "@/components/money-boxes/move-money-box-dialog";

import {
  formatCurrency,
} from "@/lib/currency";

import {
  getFinancialAccounts,
} from "@/services/finance";

import {
  getGoalMembers,
} from "@/services/goals";

import {
  getMoneyBoxes,
} from "@/services/money-boxes";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function MoneyBoxesPage() {
  const supabase =
    await createClient();

  const [
    boxes,
    members,
    accounts,
  ] = await Promise.all([
    getMoneyBoxes(),
    getGoalMembers(),
    getFinancialAccounts(),
  ]);

  const {
    data: goals,
  } = await supabase
    .from("goals")
    .select(
      "id, title"
    )
    .eq(
      "status",
      "active"
    )
    .order(
      "title"
    );

  const total =
    boxes.reduce(
      (
        sum,
        box
      ) =>
        sum +
        box.balance,
      0
    );

  return (
    <div className="space-y-8 pb-10">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Dinheiro reservado
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Caixinhas
          </h1>

          <p className="mt-2 text-muted-foreground">
            Separe dinheiro para
            reservas pessoais,
            emergências e objetivos.
          </p>
        </div>

        <CreateMoneyBoxDialog
          members={members}
          goals={
            goals ?? []
          }
        />
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Total reservado
        </p>

        <p className="mt-2 text-3xl font-semibold">
          {formatCurrency(
            total
          )}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Esse dinheiro está
          separado do saldo livre
          da casa.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map(
          (box) => (
            <article
              key={box.id}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {box.owner_user_id ? (
                    <UserRound className="size-5" />
                  ) : (
                    <ShieldCheck className="size-5" />
                  )}
                </div>

                <PiggyBank className="size-5 text-muted-foreground" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {box.name}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {box.owner_name ??
                  "Compartilhada"}
              </p>

              <p className="mt-5 text-3xl font-semibold">
                {formatCurrency(
                  box.balance
                )}
              </p>

              {box.target_amount && (
                <div className="mt-5">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progresso
                    </span>

                    <span>
                      {(
                        box.progress ??
                        0
                      ).toFixed(0)}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width:
                          `${box.progress ?? 0}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Meta{" "}
                    {formatCurrency(
                      box.target_amount
                    )}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <MoveMoneyBoxDialog
                  moneyBoxId={
                    box.id
                  }
                  type="deposit"
                  members={
                    members
                  }
                  accounts={
                    accounts
                  }
                />

                <MoveMoneyBoxDialog
                  moneyBoxId={
                    box.id
                  }
                  type="withdrawal"
                  members={
                    members
                  }
                  accounts={
                    accounts
                  }
                />

                <Link
                  href={
                    `/caixinhas/${box.id}`
                  }
                  className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium"
                >
                  Detalhes
                </Link>
              </div>
            </article>
          )
        )}
      </section>
    </div>
  );
}