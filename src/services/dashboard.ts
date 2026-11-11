import { cache } from "react";
import { addMonths, currentMonth, firstDayOfMonth, lastDayOfMonth } from "@/lib/dates";
import { getHouseholdContext } from "@/services/household-context";

import type { DashboardSummary, DashboardTrendItem } from "@/types/dashboard";

/**
 * Resumo de um mês (`YYYY-MM-01`). Memoizado por requisição: a página e
 * os insights pedem os mesmos meses, mas o banco é consultado uma vez só.
 */
const loadDashboardSummary = cache(async (selectedMonth: string): Promise<DashboardSummary> => {
  const { supabase } = await getHouseholdContext();

  const { data, error } = await supabase.rpc("get_dashboard_summary", {
    selected_month: selectedMonth,
  });

  if (error) {
    throw new Error(`Erro ao carregar o dashboard: ${error.message}`);
  }

  return data as DashboardSummary;
});

export function getDashboardSummary(referenceMonth?: string): Promise<DashboardSummary> {
  return loadDashboardSummary(firstDayOfMonth(referenceMonth ?? currentMonth()));
}

export async function getDashboardTrend(): Promise<DashboardTrendItem[]> {
  const { supabase, householdId } = await getHouseholdContext();

  const month = currentMonth();

  const startDateString = firstDayOfMonth(addMonths(month, -5));

  const endDateString = lastDayOfMonth(month);

  const [expensesResult, incomeResult] = await Promise.all([
    supabase
      .from("expenses")
      .select(
        `
        amount,
        due_date,
        status
      `,
      )
      .eq("household_id", householdId)
      .gte("due_date", startDateString)
      .lte("due_date", endDateString)
      .neq("status", "cancelled"),

    supabase
      .from("income")
      .select(
        `
        amount,
        income_date,
        is_received
      `,
      )
      .eq("household_id", householdId)
      .gte("income_date", startDateString)
      .lte("income_date", endDateString)
      .eq("is_received", true),
  ]);

  if (expensesResult.error) {
    throw new Error(`Erro ao carregar despesas: ${expensesResult.error.message}`);
  }

  if (incomeResult.error) {
    throw new Error(`Erro ao carregar receitas: ${incomeResult.error.message}`);
  }

  const expenses = expensesResult.data ?? [];

  const income = incomeResult.data ?? [];

  const months = Array.from(
    {
      length: 6,
    },
    (_, index) => {
      const key = addMonths(month, index - 5);

      return {
        key,

        label: new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          timeZone: "UTC",
        })
          .format(new Date(`${key}-15T12:00:00Z`))
          .replace(".", ""),

        income: 0,

        expenses: 0,
      };
    },
  );

  const monthMap = new Map(months.map((item) => [item.key, item]));

  for (const expense of expenses) {
    const bucket = monthMap.get(expense.due_date.slice(0, 7));

    if (bucket) {
      bucket.expenses += Number(expense.amount);
    }
  }

  for (const item of income) {
    const bucket = monthMap.get(item.income_date.slice(0, 7));

    if (bucket) {
      bucket.income += Number(item.amount);
    }
  }

  return months.map((item) => ({
    month: item.label,

    income: item.income,

    expenses: item.expenses,
  }));
}
