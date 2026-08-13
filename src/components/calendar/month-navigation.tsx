import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  changeMonth,
  getCurrentMonthString,
  getMonthLabel,
} from "@/lib/calendar";

type MonthNavigationProps = {
  referenceMonth: string;
};

export function MonthNavigation({
  referenceMonth,
}: MonthNavigationProps) {
  const previousMonth = changeMonth(
    referenceMonth,
    -1
  );

  const nextMonth = changeMonth(
    referenceMonth,
    1
  );

  const currentMonth =
    getCurrentMonthString();

  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-primary">
          Agenda da casa
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Calendário financeiro
        </h1>

        <p className="mt-2 text-muted-foreground">
          Visualize contas, parcelas e
          vencimentos em um único lugar.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          render={
            <Link
              href={`/calendario?month=${previousMonth}`}
              aria-label="Mês anterior"
            />
          }
        >
          <ChevronLeft />
        </Button>

        <div className="flex h-10 min-w-52 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium shadow-sm">
          <CalendarDays className="size-4 text-muted-foreground" />

          {getMonthLabel(referenceMonth)}
        </div>

        <Button
          variant="outline"
          size="icon"
          render={
            <Link
              href={`/calendario?month=${nextMonth}`}
              aria-label="Próximo mês"
            />
          }
        >
          <ChevronRight />
        </Button>

        {referenceMonth !== currentMonth && (
          <Button
            variant="outline"
            render={
              <Link
                href={`/calendario?month=${currentMonth}`}
              />
            }
          >
            Hoje
          </Button>
        )}
      </div>
    </section>
  );
}