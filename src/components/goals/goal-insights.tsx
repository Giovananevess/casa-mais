import {
  CircleAlert,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import type {
  GoalInsight,
} from "@/types/goals";

export function GoalInsights({
  insights,
}: {
  insights: GoalInsight[];
}) {
  return (
    <article className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Lightbulb className="size-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Insights
          </h2>

          <p className="text-sm text-muted-foreground">
            Orientações calculadas pelo Casa+.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {insights.map(
          (insight, index) => {
            const Icon =
              insight.type === "warning"
                ? CircleAlert
                : Sparkles;

            return (
              <div
                key={`${insight.title}-${index}`}
                className="rounded-2xl border bg-muted/20 p-4"
              >
                <div className="flex gap-3">
                  <Icon className="mt-0.5 size-4 text-primary" />

                  <div>
                    <p className="font-medium">
                      {insight.title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </article>
  );
}