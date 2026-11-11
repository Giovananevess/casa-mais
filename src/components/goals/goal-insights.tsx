import { CircleAlert, Lightbulb, Sparkles } from "lucide-react";

import type { GoalInsight } from "@/types/goals";

export function GoalInsights({ insights }: { insights: GoalInsight[] }) {
  return (
    <article className="bg-card rounded-3xl border p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
          <Lightbulb className="size-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Insights</h2>

          <p className="text-muted-foreground text-sm">Orientações calculadas pelo Casa+.</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.type === "warning" ? CircleAlert : Sparkles;

          return (
            <div key={`${insight.title}-${index}`} className="bg-muted/20 rounded-2xl border p-4">
              <div className="flex gap-3">
                <Icon className="text-primary mt-0.5 size-4" />

                <div>
                  <p className="font-medium">{insight.title}</p>

                  <p className="text-muted-foreground mt-1 text-sm">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
