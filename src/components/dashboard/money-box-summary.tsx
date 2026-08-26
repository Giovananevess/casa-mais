import {
  PiggyBank,
} from "lucide-react";

import {
  formatCurrency,
} from "@/lib/currency";

import type {
  MoneyBox,
} from "@/types/money-boxes";

export function MoneyBoxSummary({
  boxes,
}: {
  boxes: MoneyBox[];
}) {
  const total =
    boxes.reduce(
      (
        sum,
        box
      ) =>
        sum +
        box.balance,
      0
    );

  if (
    boxes.length === 0
  ) {
    return null;
  }

  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PiggyBank className="size-5" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Dinheiro reservado
          </p>

          <p className="text-2xl font-semibold">
            {formatCurrency(
              total
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {boxes
          .slice(0, 3)
          .map(
            (box) => (
              <div
                key={
                  box.id
                }
                className="rounded-2xl bg-muted/40 p-4"
              >
                <p className="text-sm font-medium">
                  {
                    box.name
                  }
                </p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(
                    box.balance
                  )}
                </p>
              </div>
            )
          )}
      </div>
    </section>
  );
}