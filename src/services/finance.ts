import {
  getHouseholdContext,
} from "@/services/household-context";

import type {
  FinancialAccount,
  IncomeItem,
} from "@/types/finance";

/*
 * =====================================================
 * CONTAS FINANCEIRAS
 * =====================================================
 */

export async function getFinancialAccounts():
Promise<FinancialAccount[]> {
  const {
    supabase,
    householdId,
  } = await getHouseholdContext();

  const {
    data,
    error,
  } = await supabase
    .from("accounts")
    .select(`
      id,
      household_id,
      name,
      account_type,
      institution,
      owner_user_id,
      initial_balance,
      current_balance,
      closing_day,
      due_day,
      auto_payment,
      auto_payment_account_id,
      is_benefit,
      is_active,
      created_at,
      updated_at
    `)
    .eq(
      "household_id",
      householdId
    )
    .eq(
      "is_active",
      true
    )
    .order("name");

  if (error) {
    throw new Error(
      `Erro ao carregar contas financeiras: ${error.message}`
    );
  }

  return (
    data ?? []
  ).map((account) => ({
    ...account,

    initial_balance:
      Number(
        account.initial_balance ??
        0
      ),

    current_balance:
      Number(
        account.current_balance ??
        0
      ),
  })) as FinancialAccount[];
}

/*
 * =====================================================
 * RECEITAS DO MÊS
 * =====================================================
 */

export async function getIncomeForMonth(
  month?: string
): Promise<IncomeItem[]> {
  const {
    supabase,
    householdId,
  } = await getHouseholdContext();

  /*
   * Formato:
   * 2026-08
   */
  const reference =
    month ??
    new Date()
      .toISOString()
      .slice(0, 7);

  /*
   * A tabela income já possui
   * reference_month.
   *
   * Portanto é mais simples e
   * eficiente consultar diretamente
   * por ela do que fazer:
   *
   * received_date >= início
   * received_date < próximo mês
   */
  const referenceMonth =
    `${reference}-01`;

  const {
    data,
    error,
  } = await supabase
    .from("income")
    .select(`
      id,
      household_id,
      user_id,
      account_id,
      income_type,
      description,
      amount,
      received_date,
      reference_month,
      is_received,
      is_benefit,
      is_recurring,
      recurring_income_id,

      profile:profiles!income_user_id_fkey (
        id,
        name
      ),

      account:accounts!income_account_id_fkey (
        id,
        name
      )
    `)
    .eq(
      "household_id",
      householdId
    )
    .eq(
      "reference_month",
      referenceMonth
    )
    .eq(
      "is_received",
      true
    )
    .order(
      "received_date",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Erro ao carregar receitas: ${error.message}`
    );
  }

  return (
    data ?? []
  ).map((item) => ({
    ...item,

    amount:
      Number(
        item.amount
      ),
  })) as unknown as IncomeItem[];
}