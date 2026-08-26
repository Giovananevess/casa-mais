import {
  getHouseholdContext,
} from "@/services/household-context";

type FinancialAutomationResult = {
  incomesGenerated: number;
  paymentsProcessed: number;
};

function emptyResult():
FinancialAutomationResult {
  return {
    incomesGenerated: 0,
    paymentsProcessed: 0,
  };
}

export async function runFinancialAutomations():
Promise<FinancialAutomationResult> {
  try {
    const {
      supabase,
      householdId,
    } = await getHouseholdContext();

    const today =
      new Date();

    const referenceMonth =
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(
        2,
        "0"
      )}-01`;

    /*
     * =====================================================
     * PREFERÊNCIAS
     * =====================================================
     */

    const {
      data: preferences,
      error:
        preferencesError,
    } = await supabase
      .from(
        "household_finance_settings"
      )
      .select(
        "auto_process_finances"
      )
      .eq(
        "household_id",
        householdId
      )
      .maybeSingle();

    if (
      preferencesError
    ) {
      console.error(
        "Erro ao carregar preferências financeiras:",
        preferencesError
      );
    }

    /*
     * Se não existir configuração,
     * deixamos a automação ligada
     * por padrão.
     */
    if (
      preferences &&
      !preferences.auto_process_finances
    ) {
      return emptyResult();
    }

    /*
     * =====================================================
     * EXECUÇÃO PARALELA
     * =====================================================
     */

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

    /*
     * =====================================================
     * ERROS
     * =====================================================
     */

    if (
      recurringIncome.error
    ) {
      console.error(
        "Erro ao gerar receitas recorrentes:",
        recurringIncome.error
      );
    }

    if (
      autoPayments.error
    ) {
      console.error(
        "Erro ao processar pagamentos automáticos:",
        autoPayments.error
      );
    }

    /*
     * Não derrubamos o endpoint inteiro
     * se apenas uma automação falhar.
     */
    return {
      incomesGenerated:
        recurringIncome.error
          ? 0
          : Number(
              recurringIncome.data ??
              0
            ),

      paymentsProcessed:
        autoPayments.error
          ? 0
          : Number(
              autoPayments.data ??
              0
            ),
    };
  } catch (error) {
    /*
     * Como essa rotina roda pelo
     * /api/finance/process, não queremos
     * quebrar o Dashboard caso a sessão
     * tenha expirado ou aconteça outro
     * erro de contexto.
     */
    console.error(
      "Erro nas automações financeiras:",
      error
    );

    return emptyResult();
  }
}