import { createClient } from "@/lib/supabase/server";
import {
  getMonthDateRange,
  getLocalDateString,
} from "@/lib/calendar";
import { getExpenseFormOptions } from "@/services/expenses";

import type {
  CalendarExpense,
  CalendarMonthSummary,
  CalendarPageData,
} from "@/types/calendar";
import type {
  ExpenseListItem,
  ExpenseStatus,
} from "@/types/expenses";

function getDisplayStatus(
  expense: ExpenseListItem
): ExpenseStatus {
  if (
    expense.status === "pending" &&
    expense.due_date <
      getLocalDateString(new Date())
  ) {
    return "overdue";
  }

  return expense.status;
}

export async function getCalendarData(
  referenceMonth: string
): Promise<CalendarPageData> {
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
    error: membershipError,
  } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Erro ao consultar a casa: ${membershipError.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "O usuário não pertence a uma casa."
    );
  }

  const { startDate, endDate } =
    getMonthDateRange(referenceMonth);

  const [
    expensesResult,
    options,
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select(`
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
      `)
      .eq(
        "household_id",
        membership.household_id
      )
      .gte("due_date", startDate)
      .lt("due_date", endDate)
      .neq("status", "cancelled")
      .order("due_date", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    getExpenseFormOptions(),
  ]);

  if (expensesResult.error) {
    throw new Error(
      `Erro ao carregar calendário: ${expensesResult.error.message}`
    );
  }

  const expenses = (
    expensesResult.data ?? []
  ).map((expense) => {
    const normalized = {
      ...expense,
      amount: Number(expense.amount),
    } as unknown as ExpenseListItem;

    return {
      ...normalized,
      display_status:
        getDisplayStatus(normalized),
    };
  }) as CalendarExpense[];

  const summary =
    expenses.reduce<CalendarMonthSummary>(
      (current, expense) => {
        const amount =
          Number(expense.amount);

        current.total += amount;
        current.expenseCount += 1;

        if (
          expense.display_status ===
          "paid"
        ) {
          current.paid += amount;
          current.paidCount += 1;
        }

        if (
          expense.display_status ===
          "pending"
        ) {
          current.pending += amount;
        }

        if (
          expense.display_status ===
          "overdue"
        ) {
          current.overdue += amount;
        }

        return current;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        expenseCount: 0,
        paidCount: 0,
      }
    );

  return {
    expenses,
    options,
    summary,
    referenceMonth,
  };
}