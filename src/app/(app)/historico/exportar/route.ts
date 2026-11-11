import { AuthError } from "@/lib/auth/session";
import { toCsv, formatCsvAmount } from "@/lib/csv";
import { formatDateBR } from "@/lib/dates";
import { normalizeHistoryFilters } from "@/lib/history";
import {
  EXPENSE_STATUS_LABELS,
  EXPENSE_TYPE_LABELS,
  labelFor,
  PAYMENT_METHOD_LABELS,
  SPLIT_TYPE_LABELS,
} from "@/lib/labels";
import { getHistoryExportRows } from "@/services/history";

const HEADERS = [
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = normalizeHistoryFilters(Object.fromEntries(searchParams.entries()));

  try {
    const expenses = await getHistoryExportRows(filters);

    const rows = expenses.map((expense) => [
      expense.title,
      expense.description ?? "",
      formatCsvAmount(expense.amount),
      formatDateBR(expense.due_date),
      labelFor(EXPENSE_STATUS_LABELS, expense.display_status),
      labelFor(EXPENSE_TYPE_LABELS, expense.expense_type),
      labelFor(SPLIT_TYPE_LABELS, expense.split_type),
      expense.category?.name ?? "",
      expense.account?.name ?? "",
      expense.paid_by_profile?.name ?? "",
      labelFor(PAYMENT_METHOD_LABELS, expense.payment_method),
      expense.is_recurring ? "Sim" : "Não",
      expense.installment_number && expense.installment_total
        ? `${expense.installment_number}/${expense.installment_total}`
        : "",
    ]);

    const fileName = `casa-mais-historico-${filters.startDate}-${filters.endDate}.csv`;

    return new Response(toCsv(HEADERS, rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response(error.message, {
        status: error.reason === "unauthenticated" ? 401 : 403,
      });
    }

    console.error("[export] falha ao exportar histórico", error);
    return new Response("Não foi possível exportar o histórico.", { status: 500 });
  }
}
