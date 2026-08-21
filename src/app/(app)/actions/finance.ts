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
  revalidatePath("/configuracoes");
}

/*
 * =====================================================
 * CRIAR CONTA FINANCEIRA
 * =====================================================
 */

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
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false as const,
      message:
        "Sua sessão expirou. Entre novamente.",
    };
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
    console.error(
      "Erro ao buscar casa:",
      membershipError
    );

    return {
      success: false as const,
      message:
        membershipError.message,
    };
  }

  if (!membership) {
    return {
      success: false as const,
      message:
        "Casa não encontrada.",
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
            "credit_card" &&
            values.autoPayment
            ? values.autoPaymentAccountId ||
            null
            : null,

        is_benefit: isBenefit,

        is_active: true,
      });

  if (error) {
    console.error(
      "Erro ao criar conta financeira:",
      error
    );

    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinance();

  return {
    success: true as const,
    message:
      "Conta financeira criada com sucesso.",
  };
}

/*
 * =====================================================
 * CRIAR RECEITA
 * =====================================================
 */

export async function createIncomeAction(

  input: unknown
) {
  const validation =
    incomeSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message:
        "Revise os dados da receita.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false as const,
      message:
        "Sua sessão expirou. Entre novamente.",
    };
  }

  const isBenefit = [
    "meal_voucher",
    "food_voucher",
  ].includes(values.incomeType);

  /*
   * =====================================================
   * 1. CRIA A REGRA DE RECORRÊNCIA
   * =====================================================
   *
   * day_of_month pertence SOMENTE
   * à tabela recurring_income.
   */

  let recurringIncomeId: string | null = null;

  if (values.recurring) {
    const {
      data: recurringData,
      error: recurringError,
    } = await supabase.rpc(
      "create_recurring_income",
      {
        p_user_id:
          values.userId,

        p_account_id:
          values.accountId || null,

        p_income_type:
          values.incomeType,

        p_description:
          values.description,

        p_amount:
          values.amount,

        p_day_of_month:
          values.dayOfMonth ??
          Number(
            values.receivedDate.slice(
              8,
              10
            )
          ),

        p_is_benefit:
          isBenefit,

        p_start_date:
          values.receivedDate,

        p_end_date: null,
      }
    );

    if (recurringError) {
      console.error(
        "Erro ao criar receita recorrente:",
        recurringError
      );

      if (
        recurringError.code === "23505"
      ) {
        return {
          success: false as const,
          message:
            "Já existe uma receita recorrente igual para essa pessoa. Edite a recorrência em Configurações.",
        };
      }

      return {
        success: false as const,
        message:
          recurringError.message,
      };
    }

    recurringIncomeId =
      recurringData
        ? String(recurringData)
        : null;
  }

  /*
   * =====================================================
   * 2. CRIA A RECEITA DESTE MÊS
   * =====================================================
   *
   * NÃO envia day_of_month.
   */

  const {
    error: incomeError,
  } = await supabase.rpc(
    "create_household_income",
    {
      p_user_id:
        values.userId,

      p_account_id:
        values.accountId || null,

      p_income_type:
        values.incomeType,

      p_description:
        values.description,

      p_amount:
        values.amount,

      p_received_date:
        values.receivedDate,

      p_is_benefit:
        isBenefit,

      p_recurring_income_id:
        recurringIncomeId,
    }
  );

  if (incomeError) {
    console.error(
      "Erro ao criar receita:",
      incomeError
    );

    return {
      success: false as const,
      message:
        incomeError.message,
    };
  }

  refreshFinance();

  return {
    success: true as const,

    message:
      values.recurring
        ? "Receita cadastrada e recorrência mensal criada."
        : "Receita cadastrada com sucesso.",
  };
}