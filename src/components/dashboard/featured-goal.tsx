import Link from "next/link";
import {
  ArrowRight,
  Target,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types/goals";

export function FeaturedGoal({
  goal,
}: {
  goal: Goal | null;
}) {
  if (!goal) {
    return null;
  }

  return (
    <Link
      href={`/metas/${goal.id}`}
      className="group block rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Target className="size-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Meta em destaque
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {goal.name}
            </h2>
          </div>
        </div>

        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span>
            {formatCurrency(
              goal.current_amount
            )}
          </span>

          <span className="font-semibold">
            {goal.percentage.toFixed(0)}%
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${goal.percentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Faltam{" "}
          {formatCurrency(
            goal.remaining_amount
          )}{" "}
          para concluir.
        </p>
      </div>
    </Link>
  );
}