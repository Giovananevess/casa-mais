import { cache } from "react";
import {
  addMonths,
  currentMonth,
  firstDayOfMonth,
  lastDayOfMonth,
  monthRange,
  todayISO,
} from "@/lib/dates";
import { firstRelation } from "@/lib/supabase/relations";
import { getHouseholdContext } from "@/services/household-context";

import type {
  DashboardMonthMovements,
  DashboardMovementExpense,
  DashboardSummary,
  DashboardTrendItem,
} from "@/types/dashboard";

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

/**
 * Contas e receitas do mês, usadas nos painéis de detalhe dos cards.
 * As contas são filtradas pelo vencimento (como no calendário).
 */
export async function getMonthMovements(
  month: string = currentMonth(),
): Promise<DashboardMonthMovements> {
  const { supabase, householdId } = await getHouseholdContext();
  const { startDate, endDate } = monthRange(month);
  const today = todayISO();

  const [expensesResult, incomeResult] = await Promise.all([
    supabase
      .from("expenses")
      .select(
        `
        id,
        title,
        amount,
        due_date,
        paid_at,
        status,
        paid_by,
        category:categories ( name, icon ),
        paid_by_profile:profiles!expenses_paid_by_fkey ( name )
      `,
      )
      .eq("household_id", householdId)
      .gte("due_date", startDate)
      .lte("due_date", endDate)
      .neq("status", "cancelled")
      .order("due_date", { ascending: true }),

    supabase
      .from("income")
      .select("id, title, amount, income_date, income_type")
      .eq("household_id", householdId)
      .gte("income_date", startDate)
      .lte("income_date", endDate)
      .order("income_date", { ascending: false }),
  ]);

  if (expensesResult.error) {
    throw new Error(`Erro ao carregar as contas do mês: ${expensesResult.error.message}`);
  }

  if (incomeResult.error) {
    throw new Error(`Erro ao carregar as receitas do mês: ${incomeResult.error.message}`);
  }

  const expenses = (expensesResult.data ?? []).map((row) => {
    const status = row.status as DashboardMovementExpense["status"];
    const isOverdue = status === "overdue" || (status === "pending" && row.due_date < today);

    return {
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      due_date: row.due_date,
      paid_at: row.paid_at,
      status,
      display_status: status === "paid" ? "paid" : isOverdue ? "overdue" : "pending",
      paid_by: row.paid_by,
      category: firstRelation(row.category),
      paid_by_profile: firstRelation(row.paid_by_profile),
    } satisfies DashboardMovementExpense;
  });

  const income = (incomeResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    income_date: row.income_date,
    income_type: row.income_type,
  }));

  return { month, expenses, income };
}
