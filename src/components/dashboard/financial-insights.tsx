import Link from "next/link";
import { ArrowRight, CircleAlert, Lightbulb, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import type { FinancialInsight } from "@/types/insights";

export function FinancialInsights({ insights }: { insights: FinancialInsight[] }) {
  return (
    <article className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
          <Lightbulb className="size-5" />
        </div>

        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
            Casa+ Insights
          </p>

          <h2 className="mt-1 text-xl font-semibold">Sugestões financeiras</h2>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed p-6 text-center">
          <Sparkles className="text-muted-foreground mx-auto size-6" />

          <p className="mt-3 font-medium">Tudo tranquilo por aqui</p>

          <p className="text-muted-foreground mt-1 text-sm">
            Conforme vocês usarem o Casa+, novos insights aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {insights.map((insight) => {
            const Icon = insight.type === "warning" ? CircleAlert : Sparkles;

            const content = (
              <div
                className={cn(
                  "group flex gap-3 rounded-2xl border p-4 transition",
                  insight.href && "hover:bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    insight.type === "positive" &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    insight.type === "warning" &&
                      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    insight.type === "neutral" && "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{insight.title}</p>

                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {insight.href && (
                  <ArrowRight className="text-muted-foreground mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            );

            return insight.href ? (
              <Link key={insight.id} href={insight.href}>
                {content}
              </Link>
            ) : (
              <div key={insight.id}>{content}</div>
            );
          })}
        </div>
      )}
    </article>
  );
}
