import { BadgeCheck, UsersRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";

import type { HistoryPersonSummary } from "@/types/history";

type HistoryPeopleSummaryProps = {
  people: HistoryPersonSummary[];
};

export function HistoryPeopleSummary({ people }: HistoryPeopleSummaryProps) {
  const hasPayments = people.some((person) => person.amount > 0);

  return (
    <article className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
          Participação
        </p>

        <h2 className="mt-2 text-xl font-semibold">Pagamentos por pessoa</h2>

        <p className="text-muted-foreground mt-1 text-sm">Quanto cada pessoa pagou no período.</p>
      </div>

      {!hasPayments ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum pagamento encontrado"
          description="Os pagamentos por pessoa aparecerão aqui."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 space-y-6">
          {people.map((person, index) => (
            <div key={person.userId}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-11 items-center justify-center rounded-full border font-semibold">
                    {person.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{person.name}</p>

                      {index === 0 && person.amount > 0 && (
                        <BadgeCheck className="text-primary size-4" />
                      )}
                    </div>

                    <p className="text-muted-foreground mt-1 text-xs">
                      {person.count} pagamento(s)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(person.amount)}</p>

                  <p className="text-muted-foreground mt-1 text-xs">
                    {person.percentage.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(person.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
