import {
  getHouseholdContext,
} from "@/services/household-context";

import type {
  DashboardSummary,
  DashboardTrendItem,
} from "@/types/dashboard";

export async function getDashboardSummary(
  referenceMonth?: string
): Promise<DashboardSummary> {
  const {
    supabase,
  } = await getHouseholdContext();

  const selectedMonth =
    referenceMonth ??
    new Date()
      .toISOString()
      .slice(0, 10);

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_dashboard_summary",
    {
      selected_month:
        selectedMonth,
    }
  );

  if (error) {
    throw new Error(
      `Erro ao carregar o dashboard: ${error.message}`
    );
  }

  return data as DashboardSummary;
}

export async function getDashboardTrend():
Promise<DashboardTrendItem[]> {
  const {
    supabase,
    householdId,
  } = await getHouseholdContext();

  const today =
    new Date();

  const startDate =
    new Date(
      today.getFullYear(),
      today.getMonth() - 5,
      1
    );

  const endDate =
    new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

  const startDateString =
    startDate
      .toISOString()
      .slice(0, 10);

  const endDateString =
    endDate
      .toISOString()
      .slice(0, 10);

  const [
    expensesResult,
    incomeResult,
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select(`
        amount,
        due_date,
        status
      `)
      .eq(
        "household_id",
        householdId
      )
      .gte(
        "due_date",
        startDateString
      )
      .lte(
        "due_date",
        endDateString
      )
      .neq(
        "status",
        "cancelled"
      ),

    supabase
      .from("income")
      .select(`
        amount,
        income_date,
        is_received
      `)
      .eq(
        "household_id",
        householdId
      )
      .gte(
        "income_date",
        startDateString
      )
      .lte(
        "income_date",
        endDateString
      )
      .eq(
        "is_received",
        true
      ),
  ]);

  if (
    expensesResult.error
  ) {
    throw new Error(
      `Erro ao carregar despesas: ${expensesResult.error.message}`
    );
  }

  if (
    incomeResult.error
  ) {
    throw new Error(
      `Erro ao carregar receitas: ${incomeResult.error.message}`
    );
  }

  const expenses =
    expensesResult.data ??
    [];

  const income =
    incomeResult.data ??
    [];

  const months =
    Array.from(
      {
        length: 6,
      },
      (
        _,
        index
      ) => {
        const date =
          new Date(
            today.getFullYear(),
            today.getMonth() -
              5 +
              index,
            1
          );

        return {
          year:
            date.getFullYear(),

          monthIndex:
            date.getMonth(),

          key:
            `${date.getFullYear()}-${String(
              date.getMonth() +
                1
            ).padStart(
              2,
              "0"
            )}`,

          label:
            new Intl
              .DateTimeFormat(
                "pt-BR",
                {
                  month:
                    "short",
                }
              )
              .format(
                date
              )
              .replace(
                ".",
                ""
              ),

          income:
            0,

          expenses:
            0,
        };
      }
    );

  const monthMap =
    new Map(
      months.map(
        (month) => [
          month.key,
          month,
        ]
      )
    );

  for (
    const expense
    of expenses
  ) {
    const date =
      new Date(
        `${expense.due_date}T12:00:00`
      );

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() +
          1
      ).padStart(
        2,
        "0"
      )}`;

    const month =
      monthMap.get(
        key
      );

    if (month) {
      month.expenses +=
        Number(
          expense.amount
        );
    }
  }

  for (
    const item
    of income
  ) {
    const date =
      new Date(
        `${item.income_date}T12:00:00`
      );

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() +
          1
      ).padStart(
        2,
        "0"
      )}`;

    const month =
      monthMap.get(
        key
      );

    if (month) {
      month.income +=
        Number(
          item.amount
        );
    }
  }

  return months.map(
    (item) => ({
      month:
        item.label,

      income:
        item.income,

      expenses:
        item.expenses,
    })
  );
}