import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";

import { ContributionDialog } from "@/components/goals/contribution-dialog";
import { formatCurrency } from "@/lib/currency";
import type {
  Goal,
  GoalMember,
} from "@/types/goals";

export function GoalDetailsHero({
  goal,
  members,
}: {
  goal: Goal;
  members: GoalMember[];
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-[#151515] p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-white/55">
            Meta financeira
          </p>

          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">
            {goal.name}
          </h1>

          {goal.description && (
            <p className="mt-3 max-w-2xl text-white/60">
              {goal.description}
            </p>
          )}

          <div className="mt-8">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-4xl font-semibold">
                {formatCurrency(
                  goal.current_amount
                )}
              </p>

              <p className="pb-1 text-white/50">
                de{" "}
                {formatCurrency(
                  goal.target_amount
                )}
              </p>
            </div>

            <div className="mt-4 h-3 max-w-2xl overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-700"
                style={{
                  width: `${goal.percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-white/60">
              {goal.percentage.toFixed(1)}%
              concluída
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <ContributionDialog
            goal={goal}
            members={members}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <Target className="size-4 text-white/55" />

              <p className="mt-3 text-xs text-white/50">
                Falta
              </p>

              <p className="mt-1 font-semibold">
                {formatCurrency(
                  goal.remaining_amount
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              {goal.status === "completed" ? (
                <CheckCircle2 className="size-4 text-emerald-300" />
              ) : (
                <Clock3 className="size-4 text-white/55" />
              )}

              <p className="mt-3 text-xs text-white/50">
                Situação
              </p>

              <p className="mt-1 font-semibold">
                {goal.status === "completed"
                  ? "Concluída"
                  : "Em andamento"}
              </p>
            </div>
          </div>

          {goal.target_date && (
            <div className="flex items-center gap-2 text-sm text-white/55">
              <CalendarDays className="size-4" />

              Objetivo para{" "}
              {new Intl.DateTimeFormat(
                "pt-BR",
                {
                  month: "long",
                  year: "numeric",
                }
              ).format(
                new Date(
                  `${goal.target_date}T12:00:00`
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}