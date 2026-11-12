import { addMonths, currentMonth } from "@/lib/dates";
import { getSessionContext } from "@/lib/auth/session";
import { CircleDollarSign, Clock3, PiggyBank, WalletCards } from "lucide-react";

import { MoneyBoxSummary } from "@/components/dashboard/money-box-summary";

import { getMoneyBoxes } from "@/services/money-boxes";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { PaymentsByPerson } from "@/components/dashboard/payments-by-person";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { UpcomingExpenses } from "@/components/dashboard/upcoming-expenses";
import { FinancialTimeline } from "@/components/dashboard/financial-timeline";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { measure } from "@/lib/performance";
import { FinancialAutomationTrigger } from "@/components/finance/financial-automation-trigger";

import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";

import { formatCurrency } from "@/lib/currency";

import { getExpenseFormOptions } from "@/services/expenses";
import { getDashboardSummary, getDashboardTrend, getMonthMovements } from "@/services/dashboard";
import { SummaryDetailSheet } from "@/components/dashboard/summary-detail-sheet";
import { getTimeline } from "@/services/timeline";
import { getFinancialInsights } from "@/services/insights";

function calculateVariation(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return null;
  }

  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

export default async function DashboardPage() {
  const { supabase, user } = await getSessionContext();
  const month = currentMonth();

  const [
    profile,
    currentDashboard,
    previousDashboard,
    trend,
    expenseOptions,
    timeline,
    insights,
    moneyBoxes,
    movements,
  ] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    measure("Dashboard atual", () => getDashboardSummary(month)),
    measure("Dashboard anterior", () => getDashboardSummary(addMonths(month, -1))),
    measure("Dashboard trend", () => getDashboardTrend()),
    measure("Expense options", () => getExpenseFormOptions()),
    measure("Timeline", () => getTimeline(20)),
    measure("Financial insights", () => getFinancialInsights()),
    measure("Money boxes", () => getMoneyBoxes()),
    measure("Month movements", () => getMonthMovements(month)),
  ]);

  const name = profile.data?.name ?? user.email?.split("@")[0] ?? "Usuário";

  const summary = currentDashboard.summary;
  const previousSummary = previousDashboard.summary;

  const totals = {
    income: Number(summary.income),
    expenses: Number(summary.expenses),
    paid: Number(summary.paid),
    pending: Number(summary.pending),
    balance: Number(summary.balance),
    savings: Number(summary.savings),
  };

  const previous = {
    balance: Number(previousSummary.balance),
    paid: Number(previousSummary.paid),
    pending: Number(previousSummary.pending),
    savings: Number(previousSummary.savings),
  };

  const trendFor = (key: keyof typeof previous, higherIsBetter: boolean) => {
    const value = calculateVariation(totals[key], previous[key]);
    if (value === null) return null;

    return {
      value,
      favorable: higherIsBetter ? totals[key] >= previous[key] : totals[key] <= previous[key],
      label: "comparado ao mês anterior",
    };
  };

  const cards = [
    {
      kind: "balance",
      title: "Saldo do mês",
      value: totals.balance,
      description: "Receitas menos as contas já pagas.",
      icon: WalletCards,
      tone: totals.balance >= 0 ? "success" : "danger",
      trend: trendFor("balance", true),
    },
    {
      kind: "paid",
      title: "Total pago",
      value: totals.paid,
      description: "Despesas concluídas durante o mês.",
      icon: CircleDollarSign,
      tone: "info",
      trend: trendFor("paid", true),
    },
    {
      kind: "pending",
      title: "Total pendente",
      value: totals.pending,
      description: "Contas pendentes ou atrasadas.",
      icon: Clock3,
      tone: totals.pending > 0 ? "warning" : "success",
      trend: trendFor("pending", false),
    },
    {
      kind: "savings",
      title: "Economia",
      value: totals.savings,
      description: "Receitas menos todas as despesas.",
      icon: PiggyBank,
      tone: totals.savings >= 0 ? "success" : "danger",
      trend: trendFor("savings", true),
    },
  ] as const;

  return (
    <div className="space-y-6 pb-8">
      <FinancialAutomationTrigger />

      <section className="flex justify-end">
        <NewExpenseDialog options={expenseOptions} />
      </section>
      <DashboardHero
        name={name}
        referenceMonth={currentDashboard.reference_month}
        income={Number(summary.income)}
        expenses={Number(summary.expenses)}
        paid={Number(summary.paid)}
        pending={Number(summary.pending)}
        balance={Number(summary.balance)}
        savings={Number(summary.savings)}
        paidPercentage={Number(summary.paid_percentage)}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryDetailSheet
            key={card.kind}
            kind={card.kind}
            movements={movements}
            totals={totals}
            currentUserId={user.id}
          >
            <SummaryCard
              interactive
              title={card.title}
              value={formatCurrency(card.value)}
              description={card.description}
              icon={card.icon}
              tone={card.tone}
              trend={card.trend}
              className="h-full"
            />
          </SummaryDetailSheet>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <MonthlyChart data={trend} />

        <UpcomingExpenses expenses={currentDashboard.upcoming_expenses} currentUserId={user.id} />
      </section>

      <PaymentsByPerson people={currentDashboard.payments_by_person} />

      <MoneyBoxSummary boxes={moneyBoxes} />

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <FinancialTimeline groups={timeline} />

        <FinancialInsights insights={insights} />
      </section>
    </div>
  );
}
