import {
  CircleDollarSign,
  Clock3,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import { runFinancialAutomations } from "@/services/financial-automations";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { PaymentsByPerson } from "@/components/dashboard/payments-by-person";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { UpcomingExpenses } from "@/components/dashboard/upcoming-expenses";
import { formatCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";
import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";
import { getExpenseFormOptions } from "@/services/expenses";
import {
  getDashboardSummary,
  getDashboardTrend,
} from "@/services/dashboard";

import { FinancialTimeline } from "@/components/dashboard/financial-timeline";
import { FinancialInsights } from "@/components/dashboard/financial-insights";

import { getTimeline } from "@/services/timeline";
import { getFinancialInsights } from "@/services/insights";

function getPreviousMonth(
  referenceMonth: string
) {
  const [year, month] = referenceMonth
    .split("-")
    .map(Number);

  const previousMonth = new Date(
    Date.UTC(year, month - 2, 1)
  );

  return previousMonth.toISOString().slice(0, 10);
}

function calculateVariation(
  currentValue: number,
  previousValue: number
) {
  if (previousValue === 0) {
    return null;
  }

  return (
    ((currentValue - previousValue) /
      Math.abs(previousValue)) *
    100
  );
}

export default async function DashboardPage() {
  await runFinancialAutomations();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const name =
    profile?.name ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const currentDashboard =
  await getDashboardSummary();

  const previousMonth = getPreviousMonth(
    currentDashboard.reference_month
  );

  const [
    previousDashboard,
    trend,
    expenseOptions,
    timeline, 
    insights,
  ] = await Promise.all([
    getDashboardSummary(previousMonth),
    getDashboardTrend(),
    getExpenseFormOptions(),
    getTimeline(20),
    getFinancialInsights(),
  ]);

  const summary = currentDashboard.summary;
  const previousSummary =
    previousDashboard.summary;

  const balanceVariation = calculateVariation(
    Number(summary.balance),
    Number(previousSummary.balance)
  );

  const paidVariation = calculateVariation(
    Number(summary.paid),
    Number(previousSummary.paid)
  );

  const pendingVariation = calculateVariation(
    Number(summary.pending),
    Number(previousSummary.pending)
  );

  const savingsVariation = calculateVariation(
    Number(summary.savings),
    Number(previousSummary.savings)
  );

  return (
  <div className="space-y-6 pb-8">
    <section className="flex justify-end">
      <NewExpenseDialog
        options={expenseOptions}
      />
    </section>
      <DashboardHero
      name={name}
      referenceMonth={
        currentDashboard.reference_month
      }
      income={Number(summary.income)}
      expenses={Number(summary.expenses)}
      paid={Number(summary.paid)}
      pending={Number(summary.pending)}
      balance={Number(summary.balance)}
      savings={Number(summary.savings)}
      paidPercentage={Number(
        summary.paid_percentage
      )}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Saldo do mês"
          value={formatCurrency(
            Number(summary.balance)
          )}
          description="Receitas menos as contas já pagas."
          icon={WalletCards}
          tone={
            Number(summary.balance) >= 0
              ? "success"
              : "danger"
          }
          trend={
            balanceVariation === null
              ? null
              : {
                  value: balanceVariation,
                  favorable:
                    Number(summary.balance) >=
                    Number(previousSummary.balance),
                  label: "comparado ao mês anterior",
                }
          }
        />

        <SummaryCard
          title="Total pago"
          value={formatCurrency(
            Number(summary.paid)
          )}
          description="Despesas concluídas durante o mês."
          icon={CircleDollarSign}
          tone="info"
          trend={
            paidVariation === null
              ? null
              : {
                  value: paidVariation,
                  favorable:
                    Number(summary.paid) >=
                    Number(previousSummary.paid),
                  label: "comparado ao mês anterior",
                }
          }
        />

        <SummaryCard
          title="Total pendente"
          value={formatCurrency(
            Number(summary.pending)
          )}
          description="Contas pendentes ou atrasadas."
          icon={Clock3}
          tone={
            Number(summary.pending) > 0
              ? "warning"
              : "success"
          }
          trend={
            pendingVariation === null
              ? null
              : {
                  value: pendingVariation,
                  favorable:
                    Number(summary.pending) <=
                    Number(previousSummary.pending),
                  label: "comparado ao mês anterior",
                }
          }
        />

        <SummaryCard
          title="Economia"
          value={formatCurrency(
            Number(summary.savings)
          )}
          description="Receitas menos todas as despesas."
          icon={PiggyBank}
          tone={
            Number(summary.savings) >= 0
              ? "success"
              : "danger"
          }
          trend={
            savingsVariation === null
              ? null
              : {
                  value: savingsVariation,
                  favorable:
                    Number(summary.savings) >=
                    Number(previousSummary.savings),
                  label: "comparado ao mês anterior",
                }
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <MonthlyChart data={trend} />

        <UpcomingExpenses
          expenses={
            currentDashboard.upcoming_expenses
          }
        />
      </section>

      <PaymentsByPerson
        people={
          currentDashboard.payments_by_person
        }
      />
      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
  <FinancialTimeline groups={timeline} />

  <FinancialInsights insights={insights} />
</section>
    </div>
  );
}