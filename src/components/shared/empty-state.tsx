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
        "bg-muted/20 relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed px-6 text-center",
        compact ? "min-h-52 py-8" : "min-h-72 py-12",
        className,
      )}
    >
      <div className="from-background/80 to-muted/30 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent" />

      <div className="relative">
        <div className="bg-background text-muted-foreground mx-auto flex size-14 items-center justify-center rounded-2xl border shadow-sm">
          <Icon className="size-6" />
        </div>

        <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>

        <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
