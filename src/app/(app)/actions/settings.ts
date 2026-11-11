"use server";

import type { z } from "zod";

import { dbError, fail, invalid, ok, withSession, type ActionResult } from "@/lib/actions";
import { revalidateAreas } from "@/lib/revalidate";
import {
  creditCardSettingsSchema,
  financePreferencesSchema,
  recurringIncomeSettingsSchema,
} from "@/lib/validations/finance";

export async function updateCreditCardAction(
  input: z.input<typeof creditCardSettingsSchema>,
): Promise<ActionResult> {
  const parsed = creditCardSettingsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados do cartão.");

  const values = parsed.data;

  return withSession(async ({ supabase, householdId }) => {
    if (values.autoPayment && values.autoPaymentAccountId) {
      const { data: payer, error: payerError } = await supabase
        .from("accounts")
        .select("account_type, is_active")
        .eq("id", values.autoPaymentAccountId)
        .eq("household_id", householdId)
        .maybeSingle();

      if (payerError) return dbError(payerError, "Não foi possível validar a conta pagadora.");
      if (!payer || !payer.is_active) return fail("A conta de pagamento automático é inválida.");
      if (payer.account_type === "credit_card") {
        return fail("A conta pagadora não pode ser outro cartão de crédito.");
      }
    }

    const { data, error } = await supabase
      .from("accounts")
      .update({
        closing_day: values.closingDay,
        due_day: values.dueDay,
        auto_payment: values.autoPayment,
        auto_payment_account_id: values.autoPayment ? values.autoPaymentAccountId : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", values.cardId)
      .eq("household_id", householdId)
      .eq("account_type", "credit_card")
      .select("id");

    if (error) return dbError(error, "Não foi possível atualizar o cartão.");
    if (!data?.length) return fail("Cartão não encontrado.");

    revalidateAreas("settings");
    return ok("Cartão atualizado.");
  });
}

export async function updateRecurringIncomeAction(
  input: z.input<typeof recurringIncomeSettingsSchema>,
): Promise<ActionResult> {
  const parsed = recurringIncomeSettingsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da receita recorrente.");

  const values = parsed.data;

  return withSession(async ({ supabase, householdId }) => {
    const { data, error } = await supabase
      .from("recurring_income")
      .update({
        amount: values.amount,
        day_of_month: values.dayOfMonth,
        is_active: values.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", values.recurringIncomeId)
      .eq("household_id", householdId)
      .select("id");

    if (error) return dbError(error, "Não foi possível atualizar a receita recorrente.");
    if (!data?.length) return fail("Receita recorrente não encontrada.");

    revalidateAreas("settings");
    return ok("Receita recorrente atualizada.");
  });
}

export async function updateFinancePreferencesAction(
  input: z.input<typeof financePreferencesSchema>,
): Promise<ActionResult> {
  const parsed = financePreferencesSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Preferências inválidas.");

  const values = parsed.data;

  return withSession(async ({ supabase, householdId }) => {
    const { error } = await supabase.from("household_finance_settings").upsert(
      {
        household_id: householdId,
        auto_process_finances: values.autoProcessFinances,
        separate_benefits_from_cash: values.separateBenefitsFromCash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "household_id" },
    );

    if (error) return dbError(error, "Não foi possível salvar as preferências.");

    revalidateAreas("settings");
    return ok("Preferências atualizadas.");
  });
}
