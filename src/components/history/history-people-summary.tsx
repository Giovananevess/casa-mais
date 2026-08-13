import {
  BadgeCheck,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";

import type {
  HistoryPersonSummary,
} from "@/types/history";

type HistoryPeopleSummaryProps = {
  people: HistoryPersonSummary[];
};

export function HistoryPeopleSummary({
  people,
}: HistoryPeopleSummaryProps) {
  const hasPayments = people.some(
    (person) => person.amount > 0
  );

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Participação
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Pagamentos por pessoa
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Quanto cada pessoa pagou no período.
        </p>
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
          {people.map(
            (person, index) => (
              <div key={person.userId}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full border bg-muted font-semibold">
                      {person.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(
                          (part) =>
                            part[0]
                        )
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {person.name}
                        </p>

                        {index === 0 &&
                          person.amount >
                            0 && (
                            <BadgeCheck className="size-4 text-primary" />
                          )}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {person.count} pagamento(s)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(
                        person.amount
                      )}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {person.percentage.toFixed(
                        0
                      )}
                      %
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(
                        person.percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </article>
  );
}