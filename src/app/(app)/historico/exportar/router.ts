import { createClient } from "@/lib/supabase/server";
import {
  normalizeHistoryFilters,
} from "@/lib/history";
import type { ExpenseListItem } from "@/types/expenses";

function escapeCsvValue(
  value: unknown
) {
  const text = String(
    value ?? ""
  );

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

function formatCsvDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    new Date(`${value}T12:00:00`)
  );
}

function formatCsvAmount(
  value: number
) {
  return Number(value)
    .toFixed(2)
    .replace(".", ",");
}

export async function GET(
  request: Request
) {
  const url = new URL(request.url);

  const parameters =
    Object.fromEntries(
      url.searchParams.entries()
    );

  const filters =
    normalizeHistoryFilters(parameters);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      "Não autorizado.",
      {
        status: 401,
      }
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

  if (
    membershipError ||
    !membership
  ) {
    return new Response(
      "Casa não encontrada.",
      {
        status: 403,
      }
    );
  }

  let query = supabase
    .from("expenses")
    .select(`
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
      category:categories (
        name
      ),
      account:accounts (
        name
      ),
      paid_by_profile:profiles!expenses_paid_by_fkey (
        name
      )
    `)
    .eq(
      "household_id",
      membership.household_id
    )
    .gte(
      "due_date",
      filters.startDate
    )
    .lte(
      "due_date",
      filters.endDate
    );

  if (
    filters.status !== "all" &&
    filters.status !== "overdue"
  ) {
    query = query.eq(
      "status",
      filters.status
    );
  }

  if (filters.status === "overdue") {
    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    query = query
      .eq("status", "pending")
      .lt("due_date", today);
  }

  if (
    filters.categoryId !== "all"
  ) {
    query = query.eq(
      "category_id",
      filters.categoryId
    );
  }

  if (
    filters.memberId !== "all"
  ) {
    query = query.eq(
      "paid_by",
      filters.memberId
    );
  }

  if (
    filters.expenseType !== "all" &&
    filters.expenseType !== "recurring"
  ) {
    query = query.eq(
      "expense_type",
      filters.expenseType
    );
  }

  if (
    filters.expenseType ===
    "recurring"
  ) {
    query = query.eq(
      "is_recurring",
      true
    );
  }

  if (filters.search) {
    query = query.ilike(
      "title",
      `%${filters.search}%`
    );
  }

  query = query.order(
    "due_date",
    {
      ascending: false,
    }
  );

  const { data, error } =
    await query;

  if (error) {
    return new Response(
      error.message,
      {
        status: 500,
      }
    );
  }

  const expenses =
    (data ?? []) as unknown as ExpenseListItem[];

  const headers = [
    "Nome",
    "Descrição",
    "Valor",
    "Vencimento",
    "Situação",
    "Tipo",
    "Divisão",
    "Categoria",
    "Conta financeira",
    "Responsável",
    "Forma de pagamento",
    "Recorrente",
    "Parcela",
  ];

  const rows = expenses.map(
    (expense) => [
      expense.title,
      expense.description ?? "",
      formatCsvAmount(
        Number(expense.amount)
      ),
      formatCsvDate(
        expense.due_date
      ),
      expense.status,
      expense.expense_type,
      expense.split_type,
      expense.category?.name ?? "",
      expense.account?.name ?? "",
      expense.paid_by_profile?.name ??
        "",
      expense.payment_method ?? "",
      expense.is_recurring
        ? "Sim"
        : "Não",
      expense.installment_number &&
      expense.installment_total
        ? `${expense.installment_number}/${expense.installment_total}`
        : "",
    ]
  );

  /*
   * BOM UTF-8 ajuda o Excel do Windows
   * a reconhecer acentos corretamente.
   */
  const csv = [
    headers
      .map(escapeCsvValue)
      .join(";"),

    ...rows.map((row) =>
      row
        .map(escapeCsvValue)
        .join(";")
    ),
  ].join("\r\n");

  const fileName =
    `casa-mais-historico-${filters.startDate}-${filters.endDate}.csv`;

  return new Response(
    `\uFEFF${csv}`,
    {
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="${fileName}"`,

        "Cache-Control":
          "private, no-store",
      },
    }
  );
}