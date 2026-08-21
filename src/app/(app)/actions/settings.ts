"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function refreshSettings() {
  revalidatePath(
    "/configuracoes"
  );

  revalidatePath(
    "/contas-financeiras"
  );

  revalidatePath(
    "/receitas"
  );

  revalidatePath(
    "/dashboard"
  );
}

export async function updateCreditCardAction(
  input: {
    cardId: string;
    closingDay: number;
    dueDay: number;
    autoPayment: boolean;
    autoPaymentAccountId:
      | string
      | null;
  }
) {
  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("accounts")
      .update({
        closing_day:
          input.closingDay,

        due_day:
          input.dueDay,

        auto_payment:
          input.autoPayment,

        auto_payment_account_id:
          input.autoPayment
            ? input.autoPaymentAccountId
            : null,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        input.cardId
      );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshSettings();

  return {
    success: true as const,
    message:
      "Cartão atualizado.",
  };
}

export async function updateRecurringIncomeAction(
  input: {
    recurringIncomeId: string;
    amount: number;
    dayOfMonth: number;
    isActive: boolean;
  }
) {
  const supabase =
    await createClient();

  if (
    input.amount <= 0
  ) {
    return {
      success: false as const,
      message:
        "Informe um valor válido.",
    };
  }

  if (
    input.dayOfMonth < 1 ||
    input.dayOfMonth > 31
  ) {
    return {
      success: false as const,
      message:
        "Informe um dia válido.",
    };
  }

  const { error } =
    await supabase
      .from("recurring_income")
      .update({
        amount:
          input.amount,

        day_of_month:
          input.dayOfMonth,

        is_active:
          input.isActive,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        input.recurringIncomeId
      );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshSettings();

  return {
    success: true as const,
    message:
      "Receita recorrente atualizada.",
  };
}


export async function updateFinancePreferencesAction(
  input: {
    autoProcessFinances: boolean;
    separateBenefitsFromCash: boolean;
  }
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false as const,
      message:
        "Usuário não autenticado.",
    };
  }

  const { data: membership } =
    await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!membership) {
    return {
      success: false as const,
      message:
        "Casa não encontrada.",
    };
  }

  const { error } =
    await supabase
      .from(
        "household_finance_settings"
      )
      .upsert(
        {
          household_id:
            membership.household_id,

          auto_process_finances:
            input.autoProcessFinances,

          separate_benefits_from_cash:
            input
              .separateBenefitsFromCash,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "household_id",
        }
      );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshSettings();

  return {
    success: true as const,
    message:
      "Preferências atualizadas.",
  };
}