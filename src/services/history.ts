import { createClient } from "@/lib/supabase/server";
import { getExpenseFormOptions } from "@/services/expenses";

import type {
  ExpenseListItem,
  ExpenseStatus,
} from "@/types/expenses";

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
  due_date,
  status,
  expense_type,
  split_type,
  payment_method,
  notes,
  paid_at,
  is_recurring,
  installment_group_id,
  installment_number,
  installment_total,
  category:categories (
    id,
    name,
    icon
  ),
  account:accounts (
    id,
    name
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

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDisplayStatus(
  expense: ExpenseListItem
): ExpenseStatus {
  if (
    expense.status === "pending" &&
    expense.due_date < getTodayString()
  ) {
    return "overdue";
  }

  return expense.status;
}

function normalizeExpense(
  expense: unknown
): HistoryExpense {
  const normalized = {
    ...(expense as ExpenseListItem),
    amount: Number(
      (expense as ExpenseListItem).amount
    ),
  };

  return {
    ...normalized,
    display_status:
      getDisplayStatus(normalized),
  };
}

async function getHouseholdId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao consultar a casa: ${error.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "O usuário não pertence a uma casa."
    );
  }

  return {
    supabase,
    householdId: membership.household_id,
  };
}

function applyHistoryFilters<
  T extends {
    gte: Function;
    lte: Function;
    eq: Function;
    ilike: Function;
  },
>(
  query: T,
  filters: HistoryFilters
): T {
  let filtered = query
    .gte("due_date", filters.startDate)
    .lte("due_date", filters.endDate);

  /*
   * O status atrasado é calculado porque
   * o banco pode continuar armazenando pending.
   */
  if (
    filters.status !== "all" &&
    filters.status !== "overdue"
  ) {
    filtered = filtered.eq(
      "status",
      filters.status
    );
  }

  if (filters.status === "overdue") {
    filtered = filtered
      .eq("status", "pending")
      .lt("due_date", getTodayString());
  }

  if (filters.categoryId !== "all") {
    filtered = filtered.eq(
      "category_id",
      filters.categoryId
    );
  }

  if (filters.memberId !== "all") {
    filtered = filtered.eq(
      "paid_by",
      filters.memberId
    );
  }

  if (
    filters.expenseType !== "all" &&
    filters.expenseType !== "recurring"
  ) {
    filtered = filtered.eq(
      "expense_type",
      filters.expenseType
    );
  }

  if (filters.expenseType === "recurring") {
    filtered = filtered.eq(
      "is_recurring",
      true
    );
  }

  if (filters.search) {
    filtered = filtered.ilike(
      "title",
      `%${filters.search}%`
    );
  }

  return filtered;
}

function applySort<T extends {
  order: Function;
}>(
  query: T,
  filters: HistoryFilters
): T {
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

function calculateSummary(
  expenses: HistoryExpense[]
): HistorySummary {
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

    if (
      expense.display_status !==
      "cancelled"
    ) {
      summary.total += amount;
    }

    summary.highestExpense = Math.max(
      summary.highestExpense,
      amount
    );

    if (
      expense.display_status === "paid"
    ) {
      summary.paid += amount;
      summary.paidCount += 1;
    }

    if (
      expense.display_status ===
      "pending"
    ) {
      summary.pending += amount;
      summary.pendingCount += 1;
    }

    if (
      expense.display_status ===
      "overdue"
    ) {
      summary.overdue += amount;
      summary.overdueCount += 1;
    }

    if (
      expense.display_status ===
      "cancelled"
    ) {
      summary.cancelled += amount;
      summary.cancelledCount += 1;
    }
  }

  const validExpenses = expenses.filter(
    (expense) =>
      expense.display_status !==
      "cancelled"
  );

  summary.averageExpense =
    validExpenses.length > 0
      ? summary.total /
        validExpenses.length
      : 0;

  const payableCount =
    summary.paidCount +
    summary.pendingCount +
    summary.overdueCount;

  summary.paidPercentage =
    payableCount > 0
      ? (summary.paidCount /
          payableCount) *
        100
      : 0;

  return summary;
}

function calculateCategorySummary(
  expenses: HistoryExpense[]
): HistoryCategorySummary[] {
  const validExpenses = expenses.filter(
    (expense) =>
      expense.display_status !==
      "cancelled"
  );

  const total = validExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const grouped = new Map<
    string,
    HistoryCategorySummary
  >();

  for (const expense of validExpenses) {
    const categoryId =
      expense.category?.id ?? null;

    const key =
      categoryId ?? "uncategorized";

    const existing = grouped.get(key);

    if (existing) {
      existing.amount += Number(
        expense.amount
      );
      existing.count += 1;
      continue;
    }

    grouped.set(key, {
      categoryId,
      categoryName:
        expense.category?.name ??
        "Sem categoria",
      amount: Number(expense.amount),
      count: 1,
      percentage: 0,
    });
  }

  return Array.from(grouped.values())
    .map((category) => ({
      ...category,
      percentage:
        total > 0
          ? (category.amount / total) * 100
          : 0,
    }))
    .sort(
      (a, b) => b.amount - a.amount
    );
}

function calculatePeopleSummary(
  expenses: HistoryExpense[],
  members: {
    user_id: string;
    name: string;
  }[]
): HistoryPersonSummary[] {
  const validExpenses = expenses.filter(
    (expense) =>
      expense.display_status === "paid"
  );

  const totalPaid = validExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  return members
    .map((member) => {
      const memberExpenses =
        validExpenses.filter(
          (expense) =>
            expense.paid_by_profile?.id ===
            member.user_id
        );

      const amount =
        memberExpenses.reduce(
          (sum, expense) =>
            sum +
            Number(expense.amount),
          0
        );

      return {
        userId: member.user_id,
        name: member.name,
        amount,
        count: memberExpenses.length,
        percentage:
          totalPaid > 0
            ? (amount / totalPaid) * 100
            : 0,
      };
    })
    .sort(
      (a, b) => b.amount - a.amount
    );
}

export async function getHistoryData(
  filters: HistoryFilters
): Promise<HistoryPageData> {
  const {
    supabase,
    householdId,
  } = await getHouseholdId();

  const options =
    await getExpenseFormOptions();

  /*
   * Consulta completa do período para
   * indicadores e relatórios.
   */
  let reportQuery = supabase
    .from("expenses")
    .select(expenseSelect)
    .eq("household_id", householdId);

  reportQuery = applyHistoryFilters(
    reportQuery,
    {
      ...filters,
      page: 1,
    }
  );

  reportQuery = applySort(
    reportQuery,
    filters
  );

  const {
    data: reportRows,
    error: reportError,
  } = await reportQuery;

  if (reportError) {
    throw new Error(
      `Erro ao carregar o relatório: ${reportError.message}`
    );
  }

  const allExpenses = (
    reportRows ?? []
  ).map(normalizeExpense);

  /*
   * A paginação é feita no banco para
   * a lista principal.
   */
  const start =
    (filters.page - 1) *
    filters.pageSize;

  const end =
    start + filters.pageSize - 1;

  let pageQuery = supabase
    .from("expenses")
    .select(expenseSelect, {
      count: "exact",
    })
    .eq("household_id", householdId);

  pageQuery = applyHistoryFilters(
    pageQuery,
    filters
  );

  pageQuery = applySort(
    pageQuery,
    filters
  );

  const {
    data: pageRows,
    count,
    error: pageError,
  } = await pageQuery.range(start, end);

  if (pageError) {
    throw new Error(
      `Erro ao carregar o histórico: ${pageError.message}`
    );
  }

  const totalRows = count ?? 0;

  const totalPages = Math.max(
    Math.ceil(
      totalRows / filters.pageSize
    ),
    1
  );

  const expenses = (
    pageRows ?? []
  ).map(normalizeExpense);

  return {
    expenses,
    summary:
      calculateSummary(allExpenses),

    categoriesSummary:
      calculateCategorySummary(
        allExpenses
      ),

    peopleSummary:
      calculatePeopleSummary(
        allExpenses,
        options.members
      ),

    options,

    totalRows,
    totalPages,
    currentPage: Math.min(
      filters.page,
      totalPages
    ),
    pageSize: filters.pageSize,
    filters,
  };
}