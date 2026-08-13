import { notFound } from "next/navigation";

import { ContributionChart } from "@/components/goals/contribution-chart";
import { ContributionRanking } from "@/components/goals/contribution-ranking";
import { GoalDetailsHero } from "@/components/goals/goal-details-hero";
import { GoalInsights } from "@/components/goals/goal-insights";
import { GoalTimeline } from "@/components/goals/goal-timeline";
import { formatCurrency } from "@/lib/currency";
import { getGoalDetails } from "@/services/goals";

import type { GoalDetails } from "@/types/goals";
type GoalPageProps = {
  params: Promise<{
    goalId: string;
  }>;
};

export default async function GoalPage({
  params,
}: GoalPageProps) {
  const { goalId } = await params;

  let details: GoalDetails;

  try {
    details = await getGoalDetails(goalId);
  } catch {
    notFound();
  }

  const { goal } = details;

  return (
    <div className="space-y-6 pb-8">
      <GoalDetailsHero
        goal={goal}
        members={details.members}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Valor guardado
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(goal.current_amount)}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Ainda falta
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(goal.remaining_amount)}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Aporte mensal necessário
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {goal.monthly_required === null
              ? "Sem prazo"
              : formatCurrency(goal.monthly_required)}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Dias restantes
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {goal.days_remaining === null
              ? "—"
              : Math.max(goal.days_remaining, 0)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ContributionChart data={details.chart} />
        <ContributionRanking ranking={details.ranking} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <GoalInsights insights={details.insights} />
        <GoalTimeline history={details.history} />
      </section>
    </div>
  );
}