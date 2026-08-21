import { createClient } from "@/lib/supabase/server";

export async function runFinancialAutomations() {
  const supabase = await createClient();

  const today = new Date();

  const referenceMonth =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      incomesGenerated: 0,
      paymentsProcessed: 0,
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
      "Erro ao buscar household:",
      membershipError
    );

    return {
      incomesGenerated: 0,
      paymentsProcessed: 0,
    };
  }

  if (!membership) {
    return {
      incomesGenerated: 0,
      paymentsProcessed: 0,
    };
  }

  const {
    data: preferences,
    error: preferencesError,
  } = await supabase
    .from("household_finance_settings")
    .select("auto_process_finances")
    .eq(
      "household_id",
      membership.household_id
    )
    .maybeSingle();

  if (preferencesError) {
    console.error(
      "Erro ao carregar preferências financeiras:",
      preferencesError
    );
  }

  /*
   * Se ainda não existir registro de preferências,
   * consideramos automação ligada por padrão.
   */
  if (
    preferences &&
    !preferences.auto_process_finances
  ) {
    return {
      incomesGenerated: 0,
      paymentsProcessed: 0,
    };
  }

  const [
    recurringIncome,
    autoPayments,
  ] = await Promise.all([
    supabase.rpc(
      "generate_recurring_incomes",
      {
        p_reference_month:
          referenceMonth,
      }
    ),

    supabase.rpc(
      "process_credit_card_auto_payments"
    ),
  ]);

  if (recurringIncome.error) {
    console.error(
      "Erro ao gerar receitas recorrentes:",
      recurringIncome.error
    );
  }

  if (autoPayments.error) {
    console.error(
      "Erro ao processar pagamentos automáticos:",
      autoPayments.error
    );
  }

  return {
    incomesGenerated: Number(
      recurringIncome.data ?? 0
    ),

    paymentsProcessed: Number(
      autoPayments.data ?? 0
    ),
  };
}