import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { GoalsList } from "@/components/goals/goals-list";
import { formatCurrency } from "@/lib/currency";
import { getGoals } from "@/services/goals";

export default async function GoalsPage() {
  const goals = await getGoals();

  const active = goals.filter(
    (goal) =>
      goal.status === "active" ||
      goal.status === "paused"
  );

  const completed = goals.filter(
    (goal) =>
      goal.status === "completed"
  );

  const targetTotal = active.reduce(
    (sum, goal) =>
      sum + goal.target_amount,
    0
  );

  const currentTotal = active.reduce(
    (sum, goal) =>
      sum + goal.current_amount,
    0
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Planejamento do casal
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Metas financeiras
          </h1>

          <p className="mt-2 text-muted-foreground">
            Transformem planos e sonhos em
            objetivos acompanháveis.
          </p>
        </div>

        <CreateGoalDialog />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Guardado nas metas
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(currentTotal)}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total planejado
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(targetTotal)}
          </p>
        </article>

        <article className="rounded-3xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Metas concluídas
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {completed.length}
          </p>
        </article>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          Em andamento
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Objetivos que ainda estão sendo construídos.
        </p>

        <div className="mt-5">
          <GoalsList goals={active} />
        </div>
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">
            Conquistas
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Metas que vocês já concluíram.
          </p>

          <div className="mt-5">
            <GoalsList
              goals={completed}
            />
          </div>
        </section>
      )}
    </div>
  );
}