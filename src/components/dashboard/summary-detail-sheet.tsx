"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  PartyPopper,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import { QuickPayButton } from "@/components/expenses/quick-pay-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/currency";
import { daysBetween, formatDateBR, formatMonthLabel, monthRange, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type {
  DashboardDetailKind,
  DashboardMonthMovements,
  DashboardMovementExpense,
} from "@/types/dashboard";

type Totals = {
  income: number;
  expenses: number;
  paid: number;
  pending: number;
  balance: number;
  savings: number;
};

type SummaryDetailSheetProps = {
  kind: DashboardDetailKind;
  movements: DashboardMonthMovements;
  totals: Totals;
  currentUserId: string;
  /** O card que abre o painel. */
  children: ReactNode;
};

const COPY: Record<DashboardDetailKind, { title: string; description: string }> = {
  balance: {
    title: "Saldo do mês",
    description: "Tudo o que entrou menos as contas que já foram pagas.",
  },
  paid: {
    title: "Contas pagas",
    description: "O que já foi quitado neste mês e quem pagou.",
  },
  pending: {
    title: "Contas em aberto",
    description: "Pendentes e atrasadas. Marque como paga direto daqui.",
  },
  savings: {
    title: "Economia do mês",
    description: "Receitas menos todas as despesas do mês, pagas ou não.",
  },
};

function dueLabel(dueDate: string) {
  const diff = daysBetween(todayISO(), dueDate);

  if (diff === 0) return "Vence hoje";
  if (diff === 1) return "Vence amanhã";
  if (diff < 0) return `${Math.abs(diff)} dia(s) em atraso`;
  return `Vence em ${formatDateBR(dueDate).slice(0, 5)}`;
}

function historyHref(month: string, status?: "paid" | "pending") {
  const { startDate, endDate } = monthRange(month);
  const params = new URLSearchParams({ start: startDate, end: endDate });
  if (status) params.set("status", status);
  return `/historico?${params.toString()}`;
}

export function SummaryDetailSheet({
  kind,
  movements,
  totals,
  currentUserId,
  children,
}: SummaryDetailSheetProps) {
  const copy = COPY[kind];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className="focus-visible:ring-ring block w-full cursor-pointer rounded-3xl text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={`Ver detalhes: ${copy.title}`}
          />
        }
      >
        {children}
      </SheetTrigger>

      <SheetContent className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="bg-background/95 sticky top-0 z-10 border-b p-5 pr-12 backdrop-blur">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
            {formatMonthLabel(movements.month)}
          </p>
          <SheetTitle className="text-xl font-semibold tracking-tight">{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-5">
          {kind === "pending" && (
            <PendingDetails movements={movements} total={totals.pending} userId={currentUserId} />
          )}
          {kind === "paid" && <PaidDetails movements={movements} total={totals.paid} />}
          {kind === "balance" && <BalanceDetails movements={movements} totals={totals} />}
          {kind === "savings" && <SavingsDetails movements={movements} totals={totals} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------------------------------------------------------
 * Blocos reutilizáveis
 * ------------------------------------------------------------------------ */

function BigNumber({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="bg-muted/40 rounded-2xl p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tracking-tight", tone)}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function Formula({
  rows,
  result,
}: {
  rows: [string, number, "+" | "−"][];
  result: [string, number];
}) {
  return (
    <div className="space-y-2 rounded-2xl border p-4 text-sm">
      {rows.map(([label, value, sign]) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            <span className="inline-block w-4 font-mono">{sign}</span>
            {label}
          </span>
          <span className="font-medium tabular-nums">{formatCurrency(value)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 border-t pt-2 font-semibold">
        <span>
          <span className="inline-block w-4 font-mono">=</span>
          {result[0]}
        </span>
        <span
          className={cn(
            "tabular-nums",
            result[1] >= 0
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-700 dark:text-red-300",
          )}
        >
          {formatCurrency(result[1])}
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="text-muted-foreground mt-6 mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase">
      {children}
      {count !== undefined && (
        <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-[0.7rem] tracking-normal">
          {count}
        </span>
      )}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      variant="outline"
      className="mt-6 w-full rounded-full"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {children}
      <ArrowRight />
    </Button>
  );
}

function ExpenseRow({
  expense,
  action,
  meta,
}: {
  expense: DashboardMovementExpense;
  action?: ReactNode;
  meta: ReactNode;
}) {
  const overdue = expense.display_status === "overdue";
  const paid = expense.display_status === "paid";

  return (
    <li className="bg-background/40 animate-in fade-in slide-in-from-right-2 flex items-center gap-3 rounded-2xl border p-3 duration-300">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          paid && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          overdue && "bg-red-500/10 text-red-700 dark:text-red-300",
          !paid && !overdue && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        )}
      >
        {paid ? (
          <CheckCircle2 className="size-5" />
        ) : overdue ? (
          <CircleAlert className="size-5" />
        ) : (
          <CalendarClock className="size-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{meta}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-sm font-semibold tabular-nums">{formatCurrency(expense.amount)}</p>
        {action}
      </div>
    </li>
  );
}

/* --------------------------------------------------------------------------
 * Conteúdo de cada card
 * ------------------------------------------------------------------------ */

function PendingDetails({
  movements,
  total,
  userId,
}: {
  movements: DashboardMonthMovements;
  total: number;
  userId: string;
}) {
  const open = useMemo(
    () =>
      movements.expenses
        .filter((expense) => expense.display_status !== "paid")
        // Atrasadas primeiro, depois por vencimento.
        .sort((a, b) =>
          a.display_status === b.display_status
            ? a.due_date.localeCompare(b.due_date)
            : a.display_status === "overdue"
              ? -1
              : 1,
        ),
    [movements.expenses],
  );

  // Esconde na hora a conta que acabou de ser paga. Se a action falhar
  // ou o usuário desfizer, ela volta; se der certo, o servidor já a remove.
  const [paidIds, setPaidIds] = useState<ReadonlySet<string>>(() => new Set());

  const visible = open.filter((expense) => !paidIds.has(expense.id));
  const overdueCount = visible.filter((expense) => expense.display_status === "overdue").length;

  const toggle = (id: string, paid: boolean) =>
    setPaidIds((current) => {
      const next = new Set(current);
      if (paid) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <BigNumber label="Em aberto" value={total} tone="text-amber-700 dark:text-amber-300" />
        <div className="bg-muted/40 rounded-2xl p-4">
          <p className="text-muted-foreground text-xs">Atrasadas</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tracking-tight",
              overdueCount > 0 && "text-red-700 dark:text-red-300",
            )}
          >
            {overdueCount}
          </p>
        </div>
      </div>

      <SectionTitle count={visible.length}>Para pagar</SectionTitle>

      {visible.length === 0 ? (
        <EmptyState
          compact
          icon={PartyPopper}
          title="Tudo pago neste mês"
          description="Nenhuma conta pendente ou atrasada com vencimento neste mês."
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              meta={
                <>
                  {expense.category?.name ?? "Sem categoria"} ·{" "}
                  <span
                    className={cn(
                      expense.display_status === "overdue" &&
                        "font-medium text-red-700 dark:text-red-300",
                    )}
                  >
                    {dueLabel(expense.due_date)}
                  </span>
                </>
              }
              action={
                <QuickPayButton
                  size="xs"
                  expenseId={expense.id}
                  title={expense.title}
                  paidBy={expense.paid_by ?? userId}
                  onPaid={() => toggle(expense.id, true)}
                  onReverted={() => toggle(expense.id, false)}
                />
              }
            />
          ))}
        </ul>
      )}

      <FooterLink href={historyHref(movements.month, "pending")}>Ver no histórico</FooterLink>
    </>
  );
}

function PaidDetails({ movements, total }: { movements: DashboardMonthMovements; total: number }) {
  const paid = movements.expenses
    .filter((expense) => expense.display_status === "paid")
    .sort((a, b) => (b.paid_at ?? b.due_date).localeCompare(a.paid_at ?? a.due_date));

  const byPerson = Object.entries(
    paid.reduce<Record<string, number>>((acc, expense) => {
      const name = expense.paid_by_profile?.name ?? "Sem responsável";
      acc[name] = (acc[name] ?? 0) + expense.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <BigNumber label="Total pago" value={total} tone="text-emerald-700 dark:text-emerald-300" />

      {byPerson.length > 0 && (
        <>
          <SectionTitle>Quem pagou</SectionTitle>
          <ShareBars items={byPerson} />
        </>
      )}

      <SectionTitle count={paid.length}>Contas pagas</SectionTitle>

      {paid.length === 0 ? (
        <EmptyState
          compact
          icon={ReceiptText}
          title="Nenhuma conta paga ainda"
          description="Quando uma conta for marcada como paga, ela aparece aqui."
        />
      ) : (
        <ul className="space-y-2">
          {paid.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              meta={
                <>
                  {expense.paid_by_profile?.name ?? "Sem responsável"} ·{" "}
                  {formatDateBR((expense.paid_at ?? expense.due_date).slice(0, 10)).slice(0, 5)}
                </>
              }
            />
          ))}
        </ul>
      )}

      <FooterLink href={historyHref(movements.month, "paid")}>Ver no histórico</FooterLink>
    </>
  );
}

function BalanceDetails({
  movements,
  totals,
}: {
  movements: DashboardMonthMovements;
  totals: Totals;
}) {
  return (
    <>
      <Formula
        rows={[
          ["Receitas", totals.income, "+"],
          ["Contas pagas", totals.paid, "−"],
        ]}
        result={["Saldo", totals.balance]}
      />

      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
        Ainda há {formatCurrency(totals.pending)} em contas em aberto. Se todas forem pagas, sobram{" "}
        <strong className="text-foreground">{formatCurrency(totals.savings)}</strong>.
      </p>

      <SectionTitle count={movements.income.length}>Receitas do mês</SectionTitle>

      {movements.income.length === 0 ? (
        <EmptyState
          compact
          icon={TrendingUp}
          title="Nenhuma receita no mês"
          description="Cadastre salários, vales e extras para acompanhar o saldo."
        />
      ) : (
        <ul className="space-y-2">
          {movements.income.map((item) => (
            <li
              key={item.id}
              className="bg-background/40 flex items-center gap-3 rounded-2xl border p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDateBR(item.income_date).slice(0, 5)}
                </p>
              </div>
              <p className="text-sm font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                +{formatCurrency(item.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <FooterLink href="/receitas">Ir para receitas</FooterLink>
    </>
  );
}

function SavingsDetails({
  movements,
  totals,
}: {
  movements: DashboardMonthMovements;
  totals: Totals;
}) {
  const byCategory = Object.entries(
    movements.expenses.reduce<Record<string, number>>((acc, expense) => {
      const name = expense.category?.name ?? "Sem categoria";
      acc[name] = (acc[name] ?? 0) + expense.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <Formula
        rows={[
          ["Receitas", totals.income, "+"],
          ["Todas as despesas", totals.expenses, "−"],
        ]}
        result={["Economia", totals.savings]}
      />

      {totals.income > 0 && (
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
          {totals.savings >= 0
            ? `Vocês estão guardando ${((totals.savings / totals.income) * 100).toFixed(0)}% do que entrou.`
            : `As despesas passaram as receitas em ${formatCurrency(Math.abs(totals.savings))}.`}
        </p>
      )}

      <SectionTitle count={byCategory.length}>Para onde foi o dinheiro</SectionTitle>

      {byCategory.length === 0 ? (
        <EmptyState
          compact
          icon={ReceiptText}
          title="Nenhuma despesa no mês"
          description="As despesas cadastradas aparecem aqui agrupadas por categoria."
        />
      ) : (
        <ShareBars items={byCategory} />
      )}

      <FooterLink href={historyHref(movements.month)}>Ver histórico do mês</FooterLink>
    </>
  );
}

function ShareBars({ items }: { items: [string, number][] }) {
  const total = items.reduce((sum, [, value]) => sum + value, 0) || 1;

  return (
    <ul className="space-y-3">
      {items.map(([label, value]) => {
        const percentage = (value / total) * 100;

        return (
          <li key={label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{label}</span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {formatCurrency(value)} · {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
