import { getSessionContext } from "@/lib/auth/session";
import { todayISO } from "@/lib/dates";
import { getExpenseFormOptions } from "@/services/expenses";

import type { ExpenseListItem, ExpenseStatus } from "@/types/expenses";

import type {
  HistoryCategorySummary,
  HistoryExpense,
  HistoryFilters,
  HistoryPageData,
  HistoryPersonSummary,
  HistorySummary,
} from "@/types/history";

const expenseSelect = `
  id,
  household_id,
  title,
  description,
  amount,
  purchase_date,
  due_date,
  status,
  expense_type,
  split_type,
  payment_method,
  notes,
  paid_at,
  auto_paid,
  is_recurring,
  installment_group_id,
  installment_number,
  installment_total,

  category:categories (
    id,
    name,
    icon
  ),

  account:accounts!expenses_account_id_fkey (
    id,
    name,
    account_type
  ),

  paid_by_profile:profiles!expenses_paid_by_fkey (
    id,
    name
  ),

  attachments (
    id,
    expense_id,
    file_name,
    file_path,
    mime_type,
    file_size,
    created_at
  )
`;

const getTodayString = todayISO;

function getDisplayStatus(expense: ExpenseListItem): ExpenseStatus {
  if (expense.status === "pending" && expense.due_date < getTodayString()) {
    return "overdue";
  }

  return expense.status;
}

function normalizeExpense(expense: unknown): HistoryExpense {
  const normalized = {
    ...(expense as ExpenseListItem),
    amount: Number((expense as ExpenseListItem).amount),
  };

  return {
    ...normalized,
    display_status: getDisplayStatus(normalized),
  };
}

/**
 * Subconjunto da API do query builder do Supabase usado pelos filtros.
 * Tipar estruturalmente evita `any` sem acoplar ao tipo genérico do PostgREST.
 */
interface FilterableQuery<Q> {
  gte(column: string, value: string): Q;
  lte(column: string, value: string): Q;
  lt(column: string, value: string): Q;
  eq(column: string, value: string | boolean): Q;
  ilike(column: string, pattern: string): Q;
}

interface SortableQuery<Q> {
  order(column: string, options: { ascending: boolean }): Q;
}

/** Escapa curingas do LIKE para que a busca seja literal. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function applyHistoryFilters<Q extends FilterableQuery<Q>>(
  query: Q,
  filters: HistoryFilters,
): Q {
  let filtered = query.gte("due_date", filters.startDate).lte("due_date", filters.endDate);

  /*
   * O status atrasado é calculado porque
   * o banco pode continuar armazenando pending.
   */
  if (filters.status !== "all" && filters.status !== "overdue") {
    filtered = filtered.eq("status", filters.status);
  }

  if (filters.status === "overdue") {
    filtered = filtered.eq("status", "pending").lt("due_date", getTodayString());
  }

  if (filters.categoryId !== "all") {
    filtered = filtered.eq("category_id", filters.categoryId);
  }

  if (filters.memberId !== "all") {
    filtered = filtered.eq("paid_by", filters.memberId);
  }

  if (filters.expenseType !== "all" && filters.expenseType !== "recurring") {
    filtered = filtered.eq("expense_type", filters.expenseType);
  }

  if (filters.expenseType === "recurring") {
    filtered = filtered.eq("is_recurring", true);
  }

  if (filters.search) {
    filtered = filtered.ilike("title", `%${escapeLike(filters.search)}%`);
  }

  return filtered;
}

export function applySort<Q extends SortableQuery<Q>>(query: Q, filters: HistoryFilters): Q {
  if (filters.sort === "oldest") {
    return query
      .order("due_date", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });
  }

  if (filters.sort === "highest") {
    return query
      .order("amount", {
        ascending: false,
      })
      .order("due_date", {
        ascending: false,
      });
  }

  if (filters.sort === "lowest") {
    return query
      .order("amount", {
        ascending: true,
      })
      .order("due_date", {
        ascending: false,
      });
  }

  if (filters.sort === "title") {
    return query
      .order("title", {
        ascending: true,
      })
      .order("due_date", {
        ascending: false,
      });
  }

  return query
    .order("due_date", {
      ascending: false,
    })
    .order("id", {
      ascending: false,
    });
}

function calculateSummary(expenses: HistoryExpense[]): HistorySummary {
  const summary: HistorySummary = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,

    totalCount: expenses.length,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    cancelledCount: 0,

    averageExpense: 0,
    highestExpense: 0,
    paidPercentage: 0,
  };

  for (const expense of expenses) {
    const amount = Number(expense.amount);

    if (expense.display_status !== "cancelled") {
      summary.total += amount;
    }

    summary.highestExpense = Math.max(summary.highestExpense, amount);

    if (expense.display_status === "paid") {
      summary.paid += amount;
      summary.paidCount += 1;
    }

    if (expense.display_status === "pending") {
      summary.pending += amount;
      summary.pendingCount += 1;
    }

    if (expense.display_status === "overdue") {
      summary.overdue += amount;
      summary.overdueCount += 1;
    }

    if (expense.display_status === "cancelled") {
      summary.cancelled += amount;
      summary.cancelledCount += 1;
    }
  }

  const validExpenses = expenses.filter((expense) => expense.display_status !== "cancelled");

  summary.averageExpense = validExpenses.length > 0 ? summary.total / validExpenses.length : 0;

  const payableCount = summary.paidCount + summary.pendingCount + summary.overdueCount;

  summary.paidPercentage = payableCount > 0 ? (summary.paidCount / payableCount) * 100 : 0;

  return summary;
}

function calculateCategorySummary(expenses: HistoryExpense[]): HistoryCategorySummary[] {
  const validExpenses = expenses.filter((expense) => expense.display_status !== "cancelled");

  const total = validExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const grouped = new Map<string, HistoryCategorySummary>();

  for (const expense of validExpenses) {
    const categoryId = expense.category?.id ?? null;

    const key = categoryId ?? "uncategorized";

    const existing = grouped.get(key);

    if (existing) {
      existing.amount += Number(expense.amount);
      existing.count += 1;
      continue;
    }

    grouped.set(key, {
      categoryId,
      categoryName: expense.category?.name ?? "Sem categoria",
      amount: Number(expense.amount),
      count: 1,
      percentage: 0,
    });
  }

  return Array.from(grouped.values())
    .map((category) => ({
      ...category,
      percentage: total > 0 ? (category.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function calculatePeopleSummary(
  expenses: HistoryExpense[],
  members: {
    user_id: string;
    name: string;
  }[],
): HistoryPersonSummary[] {
  const validExpenses = expenses.filter((expense) => expense.display_status === "paid");

  const totalPaid = validExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return members
    .map((member) => {
      const memberExpenses = validExpenses.filter(
        (expense) => expense.paid_by_profile?.id === member.user_id,
      );

      const amount = memberExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      return {
        userId: member.user_id,
        name: member.name,
        amount,
        count: memberExpenses.length,
        percentage: totalPaid > 0 ? (amount / totalPaid) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export async function getHistoryData(filters: HistoryFilters): Promise<HistoryPageData> {
  const { supabase, householdId } = await getSessionContext();

  const options = await getExpenseFormOptions();

  /*
   * Consulta completa do período para
   * indicadores e relatórios.
   */
  let reportQuery = supabase.from("expenses").select(expenseSelect).eq("household_id", householdId);

  reportQuery = applyHistoryFilters(reportQuery, filters);

  reportQuery = applySort(reportQuery, filters);

  const { data: reportRows, error: reportError } = await reportQuery;

  if (reportError) {
    throw new Error(`Erro ao carregar o relatório: ${reportError.message}`);
  }

  const allExpenses = (reportRows ?? []).map(normalizeExpense);

  // A consulta acima já traz todo o período filtrado e ordenado,
  // então a página atual é recortada em memória (uma ida ao banco a menos).
  const totalRows = allExpenses.length;
  const totalPages = Math.max(Math.ceil(totalRows / filters.pageSize), 1);
  const currentPage = Math.min(filters.page, totalPages);
  const start = (currentPage - 1) * filters.pageSize;
  const expenses = allExpenses.slice(start, start + filters.pageSize);

  return {
    expenses,
    summary: calculateSummary(allExpenses),

    categoriesSummary: calculateCategorySummary(allExpenses),

    peopleSummary: calculatePeopleSummary(allExpenses, options.members),

    options,

    totalRows,
    totalPages,
    currentPage,
    pageSize: filters.pageSize,
    filters,
  };
}

const EXPORT_SELECT = `
  title,
  description,
  amount,
  due_date,
  status,
  expense_type,
  split_type,
  payment_method,
  is_recurring,
  installment_number,
  installment_total,
  category:categories ( name ),
  account:accounts!expenses_account_id_fkey ( name ),
  paid_by_profile:profiles!expenses_paid_by_fkey ( name )
`;

/** Linhas do histórico para exportação, com os mesmos filtros da tela. */
export async function getHistoryExportRows(filters: HistoryFilters): Promise<HistoryExpense[]> {
  const { supabase, householdId } = await getSessionContext();

  let query = supabase.from("expenses").select(EXPORT_SELECT).eq("household_id", householdId);
  query = applyHistoryFilters(query, filters);
  query = applySort(query, filters);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao exportar o histórico: ${error.message}`);
  }

  return (data ?? []).map(normalizeExpense);
}
