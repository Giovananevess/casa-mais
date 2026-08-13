import { getDashboardSummary } from "@/services/dashboard";
import { getGoals } from "@/services/goals";

import type {
  FinancialInsight,
} from "@/types/insights";

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}

function getPreviousMonth(
  referenceMonth: string
) {
  const [year, month] =
    referenceMonth
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 2,
      1
    )
  );

  return date
    .toISOString()
    .slice(0, 10);
}

export async function getFinancialInsights():
Promise<FinancialInsight[]> {
  const current =
    await getDashboardSummary();

  const previousMonth =
    getPreviousMonth(
      current.reference_month
    );

  const [previous, goals] =
    await Promise.all([
      getDashboardSummary(
        previousMonth
      ),
      getGoals(),
    ]);

  const insights:
    FinancialInsight[] = [];

  const currentSummary =
    current.summary;

  const previousSummary =
    previous.summary;

  if (
    Number(currentSummary.pending) >
    0
  ) {
    insights.push({
      id: "pending",
      type: "warning",
      title: "Contas aguardando pagamento",
      description:
        `Ainda existem ${formatCurrency(
          Number(
            currentSummary.pending
          )
        )} em contas pendentes neste mês.`,
      href: "/calendario",
    });
  }

  if (
    Number(
      currentSummary.paid_percentage
    ) >= 80
  ) {
    insights.push({
      id: "paid-progress",
      type: "positive",
      title: "Mês bem encaminhado",
      description:
        `Vocês já pagaram ${Number(
          currentSummary
            .paid_percentage
        ).toFixed(
          0
        )}% das despesas deste mês.`,
      href: "/contas",
    });
  }

  const currentExpenses =
    Number(
      currentSummary.expenses
    );

  const previousExpenses =
    Number(
      previousSummary.expenses
    );

  if (
    previousExpenses > 0
  ) {
    const variation =
      ((currentExpenses -
        previousExpenses) /
        previousExpenses) *
      100;

    if (variation >= 10) {
      insights.push({
        id: "expenses-up",
        type: "warning",
        title: "Despesas aumentaram",
        description:
          `Os gastos estão ${variation.toFixed(
            0
          )}% acima do mês anterior.`,
        href: "/historico",
      });
    }

    if (variation <= -10) {
      insights.push({
        id: "expenses-down",
        type: "positive",
        title: "Despesas diminuíram",
        description:
          `Os gastos estão ${Math.abs(
            variation
          ).toFixed(
            0
          )}% menores que no mês anterior.`,
        href: "/historico",
      });
    }
  }

  const featuredGoal =
    goals
      .filter(
        (goal) =>
          goal.status === "active"
      )
      .sort(
        (a, b) =>
          b.percentage -
          a.percentage
      )[0];

  if (featuredGoal) {
    if (
      featuredGoal.percentage >= 75
    ) {
      insights.push({
        id: `goal-${featuredGoal.id}`,
        type: "positive",
        title: `${featuredGoal.name} está perto`,
        description:
          `A meta já chegou a ${featuredGoal.percentage.toFixed(
            0
          )}%. Faltam ${formatCurrency(
            featuredGoal.remaining_amount
          )}.`,
        href: `/metas/${featuredGoal.id}`,
      });
    } else if (
      featuredGoal.monthly_required !==
      null
    ) {
      insights.push({
        id: `goal-month-${featuredGoal.id}`,
        type: "neutral",
        title: "Planejamento da meta",
        description:
          `Para concluir ${featuredGoal.name} no prazo, reservem cerca de ${formatCurrency(
            featuredGoal.monthly_required
          )} por mês.`,
        href: `/metas/${featuredGoal.id}`,
      });
    }
  }

  if (
    Number(
      currentSummary.savings
    ) > 0
  ) {
    insights.push({
      id: "savings",
      type: "positive",
      title: "Saldo positivo",
      description:
        `A diferença entre receitas e despesas do mês está positiva em ${formatCurrency(
          Number(
            currentSummary.savings
          )
        )}.`,
    });
  }

  return insights.slice(0, 5);
}