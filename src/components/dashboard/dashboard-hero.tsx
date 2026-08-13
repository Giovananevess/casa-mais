import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  name: string;
  referenceMonth: string;

  income: number;
  expenses: number;
  paid: number;
  pending: number;
  balance: number;
  savings: number;
  paidPercentage: number;
};

function getGreeting() {
  const currentHour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  );

  if (currentHour < 12) {
    return "Bom dia";
  }

  if (currentHour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function getMonthLabel(referenceMonth: string) {
  const date = new Date(`${referenceMonth}T12:00:00`);

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getFinancialMessage({
  income,
  expenses,
  pending,
  savings,
}: Pick<
  DashboardHeroProps,
  "income" | "expenses" | "pending" | "savings"
>) {
  const hasMovement = income > 0 || expenses > 0;

  if (!hasMovement) {
    return {
      title: "Sua vida financeira começa aqui",
      description:
        "Cadastre a primeira receita ou conta da casa para acompanhar o mês.",
      type: "empty" as const,
    };
  }

  if (savings > 0) {
    return {
      title: `Vocês economizaram ${formatCurrency(savings)} neste mês 🎉`,
      description:
        pending > 0
          ? `Ainda existem ${formatCurrency(
              pending
            )} em contas pendentes.`
          : "Todas as despesas do mês estão organizadas.",
      type: "positive" as const,
    };
  }

  if (pending > 0) {
    return {
      title: `${formatCurrency(pending)} ainda precisam de atenção`,
      description:
        "Acompanhe os próximos vencimentos para manter as contas em dia.",
      type: "warning" as const,
    };
  }

  return {
    title: "As movimentações do mês estão atualizadas",
    description:
      "Continue registrando as receitas e despesas para acompanhar a evolução.",
    type: "neutral" as const,
  };
}

export function DashboardHero({
  name,
  referenceMonth,
  income,
  expenses,
  paid,
  pending,
  balance,
  savings,
  paidPercentage,
}: DashboardHeroProps) {
  const greeting = getGreeting();
  const monthLabel = getMonthLabel(referenceMonth);

  const message = getFinancialMessage({
    income,
    expenses,
    pending,
    savings,
  });

  const hasMovement = income > 0 || expenses > 0;

  const safePaidPercentage = Math.min(
    Math.max(paidPercentage, 0),
    100
  );

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#151515] text-white shadow-xl shadow-black/5">
      {/* Elementos decorativos */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/[0.07] via-transparent to-transparent" />

        <div className="absolute -right-24 -top-32 size-96 rounded-full bg-white/[0.08] blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 size-[28rem] rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.25fr_0.75fr] xl:gap-12 xl:p-10">
        {/* Parte principal */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
              <Sparkles className="size-3.5" />
              Visão financeira da casa
            </span>

            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <CalendarDays className="size-4" />
              {monthLabel}
            </span>
          </div>

          <div className="mt-7">
            <p className="text-sm font-medium text-white/60">
              {greeting},
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {name} <span aria-hidden="true">👋</span>
            </h1>
          </div>

          <div className="mt-9">
            <p className="text-sm font-medium text-white/55">
              Saldo atual do mês
            </p>

            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {formatCurrency(balance)}
              </p>

              {hasMovement && (
                <span
                  className={cn(
                    "mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    savings >= 0
                      ? "bg-emerald-400/15 text-emerald-200"
                      : "bg-red-400/15 text-red-200"
                  )}
                >
                  {savings >= 0 ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}

                  {savings >= 0
                    ? "Saldo positivo"
                    : "Despesas acima da receita"}
                </span>
              )}
            </div>
          </div>

          <div
            className={cn(
              "mt-8 rounded-2xl border px-4 py-4 sm:px-5",
              message.type === "positive" &&
                "border-emerald-300/15 bg-emerald-300/[0.08]",
              message.type === "warning" &&
                "border-amber-300/15 bg-amber-300/[0.08]",
              message.type === "empty" &&
                "border-white/10 bg-white/[0.05]",
              message.type === "neutral" &&
                "border-white/10 bg-white/[0.05]"
            )}
          >
            <p className="font-medium text-white">
              {message.title}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-white/60">
              {message.description}
            </p>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/55">
                  Progresso das contas
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {safePaidPercentage.toFixed(0)}%
                </p>
              </div>

              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                <CheckCircle2 className="size-5" />
              </div>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Percentual de contas pagas"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={safePaidPercentage}
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500"
                style={{
                  width: `${safePaidPercentage}%`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/50">
              <span>
                Pago: {formatCurrency(paid)}
              </span>

              <span>
                Pendente: {formatCurrency(pending)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                <ArrowUpRight className="size-4" />
              </div>

              <p className="mt-4 text-xs text-white/50">
                Receitas
              </p>

              <p className="mt-1 truncate text-lg font-semibold">
                {formatCurrency(income)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                <ArrowDownRight className="size-4" />
              </div>

              <p className="mt-4 text-xs text-white/50">
                Despesas
              </p>

              <p className="mt-1 truncate text-lg font-semibold">
                {formatCurrency(expenses)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  {pending > 0 ? (
                    <Clock3 className="size-4" />
                  ) : (
                    <WalletCards className="size-4" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    Situação do mês
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {pending > 0
                      ? `${formatCurrency(
                          pending
                        )} aguardando pagamento`
                      : hasMovement
                        ? "Nenhuma conta pendente"
                        : "Nenhuma movimentação"}
                  </p>
                </div>
              </div>

              {pending === 0 && hasMovement && (
                <CheckCircle2 className="size-5 text-emerald-300" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}