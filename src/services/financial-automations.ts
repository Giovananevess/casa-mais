import { createClient } from "@/lib/supabase/server";

export async function runFinancialAutomations() {
  const supabase =
    await createClient();

  const today = new Date();

  const referenceMonth =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;

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
      "Erro recorrências:",
      recurringIncome.error
    );
  }

  if (autoPayments.error) {
    console.error(
      "Erro auto pagamento:",
      autoPayments.error
    );
  }

  return {
    incomesGenerated:
      Number(
        recurringIncome.data ?? 0
      ),

    paymentsProcessed:
      Number(
        autoPayments.data ?? 0
      ),
 
    };
}