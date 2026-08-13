import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type CardTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

type SummaryCardTrend = {
  value: number;
  favorable: boolean;
  label: string;
};

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: CardTone;
  trend?: SummaryCardTrend | null;
  className?: string;
};

const toneStyles: Record<
  CardTone,
  {
    icon: string;
    glow: string;
  }
> = {
  neutral: {
    icon: "bg-muted text-foreground",
    glow: "bg-foreground/5",
  },
  success: {
    icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    glow: "bg-emerald-500/10",
  },
  warning: {
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    glow: "bg-amber-500/10",
  },
  danger: {
    icon: "bg-red-500/10 text-red-700 dark:text-red-300",
    glow: "bg-red-500/10",
  },
  info: {
    icon: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    glow: "bg-blue-500/10",
  },
};

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
  trend,
  className,
}: SummaryCardProps) {
  const styles = toneStyles[tone];

  const TrendIcon =
    trend && trend.value > 0
      ? ArrowUpRight
      : trend && trend.value < 0
        ? ArrowDownRight
        : Minus;

  return (
    <article
      className={cn(
        "group relative isolate overflow-hidden rounded-3xl border bg-card p-5 shadow-sm",
        "transition duration-300 ease-out",
        "hover:-translate-y-1 hover:border-foreground/10 hover:shadow-xl hover:shadow-black/5",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 -z-10 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
          styles.glow
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-3 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
            styles.icon
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-6 min-h-10">
        {trend ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                trend.favorable
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-500/10 text-red-700 dark:text-red-300"
              )}
            >
              <TrendIcon className="size-3.5" />

              {Math.abs(trend.value).toFixed(1)}%
            </span>

            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Minus className="size-3.5" />
              Sem histórico
            </span>
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}