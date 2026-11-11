import { Clock } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import type { GoalHistoryItem } from "@/types/goals";

export function GoalTimeline({ history }: { history: GoalHistoryItem[] }) {
  return (
    <article className="bg-card rounded-3xl border p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
          <Clock className="size-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Histórico</h2>

          <p className="text-muted-foreground text-sm">Eventos relacionados à meta.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{item.description}</p>

              <p className="text-muted-foreground mt-1 text-xs">
                {item.profile?.name ?? "Sistema"} —{" "}
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(item.created_at))}
              </p>
            </div>

            {item.amount ? (
              <div className="font-medium whitespace-nowrap">
                {formatCurrency(Number(item.amount))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
