import Link from "next/link";
import {
  CheckCircle2,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/currency";

import type {
  TimelineEvent,
  TimelineGroup,
} from "@/types/timeline";

function getIcon(
  event: TimelineEvent
) {
  if (
    event.type ===
    "expense_paid"
  ) {
    return CheckCircle2;
  }

  if (
    event.type ===
    "goal_contribution"
  ) {
    return PiggyBank;
  }

  if (
    event.type ===
    "goal_completed"
  ) {
    return Sparkles;
  }

  if (
    event.type ===
    "income"
  ) {
    return CircleDollarSign;
  }

  return Plus;
}

function getHref(
  event: TimelineEvent
) {
  if (event.metadata.goalId) {
    return `/metas/${event.metadata.goalId}`;
  }

  if (event.metadata.expenseId) {
    return "/contas";
  }

  return null;
}

export function FinancialTimeline({
  groups,
}: {
  groups: TimelineGroup[];
}) {
  if (groups.length === 0) {
    return (
      <article className="rounded-3xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Atividade recente
        </h2>

        <EmptyState
          icon={Sparkles}
          title="Nenhuma atividade ainda"
          description="Os acontecimentos financeiros da casa aparecerão aqui."
          className="mt-6"
        />
      </article>
    );
  }

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Timeline
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Atividade recente
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          O que aconteceu recentemente
          nas finanças da casa.
        </p>
      </div>

      <div className="mt-7 space-y-8">
        {groups.map((group) => (
          <section key={group.date}>
            <p className="text-sm font-semibold">
              {group.label}
            </p>

            <div className="mt-4 space-y-1">
              {group.events.map(
                (event) => {
                  const Icon =
                    getIcon(event);

                  const href =
                    getHref(event);

                  const content = (
                    <div className="group flex items-start gap-4 rounded-2xl px-2 py-3 transition hover:bg-muted/40">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {event.title}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {event.description}

                              {event.userName
                                ? ` · ${event.userName}`
                                : ""}
                            </p>
                          </div>

                          {event.amount !==
                            null && (
                            <p className="shrink-0 font-semibold">
                              {event.type ===
                              "goal_contribution"
                                ? "+"
                                : ""}
                              {formatCurrency(
                                event.amount
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  if (!href) {
                    return (
                      <div key={event.id}>
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={event.id}
                      href={href}
                    >
                      {content}
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}