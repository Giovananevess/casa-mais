"use server";

import type { z } from "zod";

import { dbError, fail, invalid, ok, withSession, type ActionResult } from "@/lib/actions";
import { belongsToHousehold, isHouseholdMember } from "@/lib/auth/ownership";
import { revalidateAreas } from "@/lib/revalidate";
import { accountSchema, creditCardInvoiceSchema, incomeSchema } from "@/lib/validations/finance";

const BENEFIT_TYPES = new Set(["meal_voucher", "food_voucher"]);

export async function createFinancialAccountAction(input: unknown): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da conta.");

  const values = parsed.data;
  const isCreditCard = values.accountType === "credit_card";

  if (isCreditCard && (!values.closingDay || !values.dueDay)) {
    return fail("Informe o dia de fechamento e o dia de vencimento do cartão.");
  }

  if (isCreditCard && values.autoPayment && !values.autoPaymentAccountId) {
    return fail("Selecione a conta que fará o pagamento automático do cartão.");
  }

  return withSession(async (context) => {
    const { supabase, user, householdId } = context;

    if (values.ownerUserId && !(await isHouseholdMember(context, values.ownerUserId))) {
      return fail("O titular precisa ser um membro da casa.");
    }

    if (isCreditCard && values.autoPayment && values.autoPaymentAccountId) {
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

    const { error } = await supabase.from("accounts").insert({
      household_id: householdId,
      name: values.name,
      account_type: values.accountType,
      institution: values.institution || null,
      owner_user_id: values.ownerUserId || null,
      initial_balance: values.initialBalance,
      current_balance: values.initialBalance,
      closing_day: isCreditCard ? values.closingDay : null,
      due_day: isCreditCard ? values.dueDay : null,
      auto_payment: isCreditCard ? values.autoPayment : false,
      auto_payment_account_id:
        isCreditCard && values.autoPayment ? values.autoPaymentAccountId || null : null,
      is_benefit: BENEFIT_TYPES.has(values.accountType),
      is_active: true,
      created_by: user.id,
    });

    if (error) return dbError(error, "Não foi possível criar a conta financeira.");

    revalidateAreas("finance");
    return ok("Conta financeira criada com sucesso.");
  });
}

export async function createIncomeAction(input: unknown): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da receita.");

  const values = parsed.data;
  const isBenefit = BENEFIT_TYPES.has(values.incomeType);

  return withSession(async (context) => {
    const { supabase } = context;

    const [memberOk, accountOk] = await Promise.all([
      isHouseholdMember(context, values.userId),
      values.accountId ? belongsToHousehold(context, "accounts", values.accountId) : true,
    ]);

    if (!memberOk) return fail("Quem recebeu precisa ser um membro da casa.");
    if (!accountOk) return fail("Conta financeira não encontrada.");

    let recurringIncomeId: string | null = null;

    if (values.recurring) {
      const { data, error } = await supabase.rpc("create_recurring_income", {
        p_user_id: values.userId,
        p_account_id: values.accountId || null,
        p_income_type: values.incomeType,
        p_description: values.description,
        p_amount: values.amount,
        p_day_of_month: values.dayOfMonth ?? Number(values.receivedDate.slice(8, 10)),
        p_is_benefit: isBenefit,
        p_start_date: values.receivedDate,
        p_end_date: null,
      });

      if (error?.code === "23505") {
        return fail(
          "Já existe uma receita recorrente igual para essa pessoa. Edite a recorrência em Configurações.",
        );
      }

      if (error) return dbError(error, "Não foi possível criar a receita recorrente.");

      recurringIncomeId = data ? String(data) : null;
    }

    const { error } = await supabase.rpc("create_household_income", {
      p_user_id: values.userId,
      p_account_id: values.accountId || null,
      p_income_type: values.incomeType,
      p_description: values.description,
      p_amount: values.amount,
      p_received_date: values.receivedDate,
      p_is_benefit: isBenefit,
      p_recurring_income_id: recurringIncomeId,
    });

    if (error) return dbError(error, "Não foi possível cadastrar a receita.");

    revalidateAreas("finance");
    return ok(
      values.recurring
        ? "Receita cadastrada e recorrência mensal criada."
        : "Receita cadastrada com sucesso.",
    );
  });
}

export async function createCreditCardInvoiceAction(
  input: z.input<typeof creditCardInvoiceSchema>,
): Promise<ActionResult<{ expenseId: string | null }>> {
  const parsed = creditCardInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revise os dados da fatura.");
  }

  const values = parsed.data;

  return withSession(async (context) => {
    if (!(await belongsToHousehold(context, "accounts", values.creditCardId))) {
      return fail("Cartão não encontrado.");
    }

    const { data, error } = await context.supabase.rpc("create_credit_card_invoice", {
      p_credit_card_id: values.creditCardId,
      p_reference_month: `${values.referenceMonth}-01`,
      p_amount: values.amount,
    });

    if (error) return dbError(error, "Não foi possível cadastrar a fatura.");

    revalidateAreas("expenses");
    return ok("Fatura cadastrada com sucesso.", { expenseId: data ? String(data) : null });
  });
}
