"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  accountSchema,
  incomeSchema,
} from "@/lib/validations/finance";

function refreshFinance() {
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/receitas");
  revalidatePath("/contas-financeiras");
  revalidatePath("/historico");
  revalidatePath("/calendario");
}

export async function createFinancialAccountAction(
  input: unknown
) {
  const validation =
    accountSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message:
        "Revise os dados da conta.",
    };
  }

  const values = validation.data;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false as const,
      message: "Sessão expirada.",
    };
  }

  const { data: membership } =
    await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

  if (!membership) {
    return {
      success: false as const,
      message: "Casa não encontrada.",
    };
  }

  const isBenefit = [
    "meal_voucher",
    "food_voucher",
  ].includes(values.accountType);

  const { error } =
    await supabase
      .from("accounts")
      .insert({
        household_id:
          membership.household_id,

        name: values.name,

        account_type:
          values.accountType,

        institution:
          values.institution || null,

        owner_user_id:
          values.ownerUserId || null,

        initial_balance:
          values.initialBalance,

        current_balance:
          values.initialBalance,

        closing_day:
          values.accountType ===
          "credit_card"
            ? values.closingDay
            : null,

        due_day:
          values.accountType ===
          "credit_card"
            ? values.dueDay
            : null,

        auto_payment:
          values.accountType ===
          "credit_card"
            ? values.autoPayment
            : false,

        auto_payment_account_id:
          values.accountType ===
          "credit_card"
            ? values.autoPaymentAccountId
            : null,

        is_benefit: isBenefit,

        is_active: true,
      });

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinance();

  return {
    success: true as const,
    message:
      "Conta financeira criada.",
  };
}

export async function createIncomeAction(
  input: unknown
) {
  const validation = incomeSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Revise os dados da receita.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false as const,
      message: "Sessão expirada.",
    };
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return {
      success: false as const,
      message: "Casa não encontrada.",
    };
  }

  const isBenefit = [
    "meal_voucher",
    "food_voucher",
  ].includes(values.incomeType);

  const { data, error } = await supabase
    .from("income")
    .insert({
      household_id: membership.household_id,
      user_id: values.userId,
      account_id: values.accountId || null,
      income_type: values.incomeType,
      description: values.description,
      amount: values.amount,
      received_date: values.receivedDate,
      is_benefit: isBenefit,
      is_recurring: values.recurring,
      day_of_month: values.dayOfMonth ?? null,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  // If an account was provided, update its current balance
  if (values.accountId) {
    const { data: account } = await supabase
      .from("accounts")
      .select("current_balance")
      .eq("id", values.accountId)
      .single();

    if (account) {
      const newBalance =
        Number(account.current_balance) + Number(values.amount);

      await supabase
        .from("accounts")
        .update({ current_balance: newBalance })
        .eq("id", values.accountId);
    }
  }

  refreshFinance();

  return {
    success: true as const,
    message: "Receita registrada.",
    incomeId: data?.id ?? null,
  };
}
