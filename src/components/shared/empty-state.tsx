import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed bg-muted/20 px-6 text-center",
        compact ? "min-h-52 py-8" : "min-h-72 py-12",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-background/80 via-transparent to-muted/30" />

      <div className="relative">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-background text-muted-foreground shadow-sm">
          <Icon className="size-6" />
        </div>

        <h3 className="mt-5 font-semibold tracking-tight">
          {title}
        </h3>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}