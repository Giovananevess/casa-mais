import {
  BadgeCheck,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";
import type { DashboardSummary } from "@/types/dashboard";

type PaymentsByPersonProps = {
  people: DashboardSummary["payments_by_person"];
};

export function PaymentsByPerson({
  people,
}: PaymentsByPersonProps) {
  const hasPayments = people.some(
    (person) => Number(person.amount) > 0
  );

  const leader = hasPayments ? people[0] : null;

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:shadow-lg hover:shadow-black/5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Divisão do casal
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Quem pagou mais
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Participação de cada pessoa nas contas pagas do mês.
          </p>
        </div>

        {leader && (
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="size-4" />
            {leader.name} está à frente
          </div>
        )}
      </div>

      {!hasPayments ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum pagamento registrado"
          description="Quando uma conta for marcada como paga, a participação de cada pessoa aparecerá aqui."
          compact
          className="mt-8"
        />
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {people.map((person, index) => {
            const percentage = Math.min(
              Math.max(Number(person.percentage), 0),
              100
            );

            return (
              <div
                key={person.user_id}
                className="rounded-2xl border bg-background/50 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                      {person.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium">
                        {person.name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(
                          Number(person.amount)
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-lg font-semibold">
                    {percentage.toFixed(0)}%
                  </p>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={
                      index === 0
                        ? "h-full rounded-full bg-primary transition-all duration-500"
                        : "h-full rounded-full bg-muted-foreground/50 transition-all duration-500"
                    }
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}