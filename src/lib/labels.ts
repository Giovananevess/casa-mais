import type { ExpenseSplitType, ExpenseStatus, ExpenseType } from "@/types/expenses";

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending: "Pendente",
  paid: "Paga",
  overdue: "Atrasada",
  cancelled: "Cancelada",
};

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  fixed: "Fixa",
  variable: "Variável",
  installment: "Parcelada",
};

export const SPLIT_TYPE_LABELS: Record<ExpenseSplitType, string> = {
  equal: "Dividida igualmente",
  individual: "Individual",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "Pix",
  debit_card: "Cartão de débito",
  credit_card: "Cartão de crédito",
  meal_voucher: "Vale-refeição",
  food_voucher: "Vale-alimentação",
  bank_transfer: "Transferência",
  other: "Outro",
};

export function labelFor(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return "";
  return map[value] ?? value;
}
