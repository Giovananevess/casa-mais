import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Heart,
  House,
  Plane,
  Shield,
  Target,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/goals";

const icons = {
  target: Target,
  plane: Plane,
  house: House,
  car: Car,
  shield: Shield,
  heart: Heart,
};

const colors: Record<
  string,
  {
    background: string;
    text: string;
    progress: string;
  }
> = {
  emerald: {
    background: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    progress: "bg-emerald-500",
  },
  blue: {
    background: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    progress: "bg-blue-500",
  },
  violet: {
    background: "bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
    progress: "bg-violet-500",
  },
  amber: {
    background: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    progress: "bg-amber-500",
  },
  rose: {
    background: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    progress: "bg-rose-500",
  },
};

export function GoalCard({
  goal,
}: {
  goal: Goal;
}) {
  const Icon =
    icons[
    goal.icon as keyof typeof icons
    ] ?? Target;

  const theme =
    colors[goal.color] ??
    colors.emerald;

  return (
    <Link
      href={`/metas/${goal.id}`}
      className="group block rounded-3xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl",
            theme.background,
            theme.text
          )}
        >
          <Icon className="size-5" />
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {goal.status === "completed"
            ? "Concluída"
            : goal.priority === "high"
              ? "Alta prioridade"
              : "Em andamento"}
        </span>
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {goal.name}
      </h2>

      {goal.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {goal.description}
        </p>
      )}

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(
              goal.current_amount
            )}
          </span>

          <span className="font-semibold">
            {(goal.progress ?? 0).toFixed(0)}%
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              theme.progress
            )}
            style={{
              width: `${Math.min(
                100,
                Math.max(0, goal.progress ?? 0)
              )}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Meta de{" "}
          {formatCurrency(
            goal.target_amount
          )}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />

          {goal.target_date
            ? new Intl.DateTimeFormat(
              "pt-BR",
              {
                month: "short",
                year: "numeric",
              }
            ).format(
              new Date(
                `${goal.target_date}T12:00:00`
              )
            )
            : "Sem prazo"}
        </div>

        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function GoalsList({
  goals,
}: {
  goals: Goal[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}