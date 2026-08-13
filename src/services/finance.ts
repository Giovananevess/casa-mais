import { createClient } from "@/lib/supabase/server";

import type {
  FinancialAccount,
  IncomeItem,
} from "@/types/finance";

async function getContext() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const { data: membership } =
    await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

  if (!membership) {
    throw new Error(
      "Casa não encontrada."
    );
  }

  return {
    supabase,
    user,
    householdId:
      membership.household_id,
  };
}

export async function getFinancialAccounts():
Promise<FinancialAccount[]> {
  const {
    supabase,
    householdId,
  } = await getContext();

  const { data, error } =
    await supabase
      .from("accounts")
      .select("*")
      .eq(
        "household_id",
        householdId
      )
      .eq("is_active", true)
      .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(
    (account) => ({
      ...account,

      initial_balance:
        Number(
          account.initial_balance
        ),

      current_balance:
        Number(
          account.current_balance
        ),
    })
  ) as FinancialAccount[];
}


export async function getIncomeForMonth(
  month?: string
): Promise<IncomeItem[]> {
  const {
    supabase,
    householdId,
  } = await getContext();

  const reference =
    month ??
    new Date()
      .toISOString()
      .slice(0, 7);

  const start =
    `${reference}-01`;

  const [year, monthNumber] =
    reference
      .split("-")
      .map(Number);

  const next = new Date(
    Date.UTC(
      year,
      monthNumber,
      1
    )
  )
    .toISOString()
    .slice(0, 10);

  const { data, error } =
    await supabase
      .from("income")
      .select(`
        id,
        user_id,
        account_id,
        income_type,
        description,
        amount,
        received_date,
        is_benefit,
        is_recurring,

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
      .gte(
        "received_date",
        start
      )
      .lt(
        "received_date",
        next
      )
      .order(
        "received_date",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(
    (item) => ({
      ...item,
      amount: Number(item.amount),
    })
  ) as unknown as IncomeItem[];
}