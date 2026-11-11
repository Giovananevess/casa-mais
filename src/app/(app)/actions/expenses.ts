"use server";

import { z } from "zod";

import { dbError, fail, invalid, ok, uuid, withSession, type ActionResult } from "@/lib/actions";
import { currentMonth, firstDayOfMonth } from "@/lib/dates";
import { revalidateAreas } from "@/lib/revalidate";
import {
  createExpenseSchema,
  installmentExpenseSchema,
  recurringExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validations/expense";

export type ExpenseActionResult = ActionResult;
export type CreateExpenseResult = ActionResult<{ expenseId: string }>;

const nullable = (value: string | undefined | null) => value || null;

export async function createExpenseAction(input: CreateExpenseInput): Promise<CreateExpenseResult> {
  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { data, error } = await supabase.rpc("create_household_expense", {
      p_title: values.title,
      p_description: nullable(values.description),
      p_amount: values.amount,
      p_due_date: values.dueDate,
      p_category_id: nullable(values.categoryId),
      p_account_id: nullable(values.accountId),
      p_paid_by: values.paidBy,
      p_status: values.status,
      p_split_type: values.splitType,
      p_expense_type: values.expenseType,
      p_payment_method: nullable(values.paymentMethod),
      p_notes: nullable(values.notes),
    });

    if (error) return dbError(error, "Não foi possível cadastrar a conta.");

    revalidateAreas("expenses");
    return ok("Conta cadastrada com sucesso.", { expenseId: String(data) });
  });
}

export async function updateExpenseAction(input: unknown): Promise<ExpenseActionResult> {
  const parsed = updateExpenseSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("update_household_expense", {
      p_expense_id: values.expenseId,
      p_title: values.title,
      p_description: nullable(values.description),
      p_amount: values.amount,
      p_due_date: values.dueDate,
      p_category_id: nullable(values.categoryId),
      p_account_id: nullable(values.accountId),
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_expense_type: values.expenseType,
      p_payment_method: nullable(values.paymentMethod),
      p_notes: nullable(values.notes),
    });

    if (error) return dbError(error, "Não foi possível atualizar a conta.");

    revalidateAreas("expenses");
    return ok("Conta atualizada com sucesso.");
  });
}

const setStatusSchema = z.object({
  expenseId: uuid,
  status: z.enum(["paid", "pending"]),
  paidBy: uuid.optional(),
});

export async function setExpenseStatusAction(
  expenseId: string,
  status: "paid" | "pending",
  paidBy?: string,
): Promise<ExpenseActionResult> {
  const parsed = setStatusSchema.safeParse({ expenseId, status, paidBy: paidBy || undefined });
  if (!parsed.success) return invalid(parsed.error, "Dados inválidos.");

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("set_expense_status", {
      p_expense_id: parsed.data.expenseId,
      p_status: parsed.data.status,
      p_paid_by: parsed.data.paidBy ?? null,
    });

    if (error) return dbError(error, "Não foi possível alterar a situação da conta.");

    revalidateAreas("expenses");
    return ok(status === "paid" ? "Conta marcada como paga." : "Conta voltou para pendente.");
  });
}

export async function cancelExpenseAction(
  expenseId: string,
  reason?: string,
): Promise<ExpenseActionResult> {
  const parsed = z
    .object({ expenseId: uuid, reason: z.string().trim().max(300).optional() })
    .safeParse({ expenseId, reason });
  if (!parsed.success) return invalid(parsed.error, "Dados inválidos.");

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("cancel_household_expense", {
      p_expense_id: parsed.data.expenseId,
      p_reason: nullable(parsed.data.reason),
    });

    if (error) return dbError(error, "Não foi possível cancelar a conta.");

    revalidateAreas("expenses");
    return ok("Conta cancelada.");
  });
}

export async function deleteExpenseAction(expenseId: string): Promise<ExpenseActionResult> {
  if (!uuid.safeParse(expenseId).success) return fail("Conta inválida.");

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("delete_household_expense", {
      p_expense_id: expenseId,
    });

    if (error) return dbError(error, "Não foi possível excluir a conta.");

    revalidateAreas("expenses");
    return ok("Conta excluída definitivamente.");
  });
}

export async function createInstallmentsAction(input: unknown): Promise<ExpenseActionResult> {
  const parsed = installmentExpenseSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados do parcelamento.");

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("create_installment_expenses", {
      p_title: values.title,
      p_description: nullable(values.description),
      p_total_amount: values.totalAmount,
      p_installments: values.installments,
      p_first_due_date: values.firstDueDate,
      p_category_id: nullable(values.categoryId),
      p_account_id: nullable(values.accountId),
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_payment_method: nullable(values.paymentMethod),
      p_notes: nullable(values.notes),
    });

    if (error) return dbError(error, "Não foi possível criar o parcelamento.");

    revalidateAreas("expenses");
    return ok("Parcelamento criado com sucesso.");
  });
}

export async function createRecurringExpenseAction(input: unknown): Promise<ExpenseActionResult> {
  const parsed = recurringExpenseSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da recorrência.");

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("create_recurring_expense", {
      p_title: values.title,
      p_description: nullable(values.description),
      p_default_amount: values.defaultAmount,
      p_due_day: values.dueDay,
      p_start_date: values.startDate,
      p_end_date: nullable(values.endDate),
      p_category_id: nullable(values.categoryId),
      p_account_id: nullable(values.accountId),
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_payment_method: nullable(values.paymentMethod),
      p_notes: nullable(values.notes),
    });

    if (error) return dbError(error, "Não foi possível criar a conta recorrente.");

    // Já gera a ocorrência do mês corrente; falhar aqui não invalida o cadastro.
    const { error: generateError } = await supabase.rpc("generate_recurring_expenses", {
      p_reference_month: firstDayOfMonth(currentMonth()),
    });

    if (generateError) {
      console.error("[action] falha ao gerar recorrência do mês", generateError);
    }

    revalidateAreas("expenses");
    return ok("Conta recorrente criada.");
  });
}

export async function generateRecurringExpensesAction(): Promise<ExpenseActionResult> {
  return withSession(async ({ supabase }) => {
    const { data, error } = await supabase.rpc("generate_recurring_expenses", {
      p_reference_month: firstDayOfMonth(currentMonth()),
    });

    if (error) return dbError(error, "Não foi possível gerar as contas recorrentes.");

    const generated = Number(data) || 0;

    revalidateAreas("expenses");
    return ok(
      generated === 0
        ? "Nenhuma nova conta precisava ser gerada."
        : `${generated} conta(s) recorrente(s) gerada(s).`,
    );
  });
}
