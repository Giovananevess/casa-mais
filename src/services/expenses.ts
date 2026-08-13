import { createClient } from "@/lib/supabase/server";

import type {
  ExpenseFormOptions,
  ExpenseListItem,
} from "@/types/expenses";

export async function getExpenseFormOptions(): Promise<ExpenseFormOptions> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
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
    throw new Error(
      `Erro ao consultar a casa: ${membershipError.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "O usuário não pertence a uma casa."
    );
  }

  const householdId = membership.household_id;

  const [
    categoriesResult,
    accountsResult,
    membersResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon")
      .or(
        `household_id.eq.${householdId},household_id.is.null`
      )
      .in("category_type", ["expense", "both"])
      .order("name"),

    supabase
      .from("accounts")
      .select("id, name, account_type")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("household_members")
      .select(
        `
          user_id,
          profiles!household_members_user_id_fkey (
            name
          )
        `
      )
      .eq("household_id", householdId),
  ]);

  if (categoriesResult.error) {
    throw new Error(
      `Erro ao consultar categorias: ${categoriesResult.error.message}`
    );
  }

  if (accountsResult.error) {
    throw new Error(
      `Erro ao consultar contas: ${accountsResult.error.message}`
    );
  }

  if (membersResult.error) {
    throw new Error(
      `Erro ao consultar membros: ${membersResult.error.message}`
    );
  }

  const userIds =
    membersResult.data?.map(
      (member) => member.user_id
    ) ?? [];

  const { data: authProfiles } =
    await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

  const profileMap = new Map(
    (authProfiles ?? []).map((profile) => [
      profile.id,
      profile.name,
    ])
  );

  return {
    categories: (categoriesResult.data ?? []).map(
      (category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
      })
    ),

    accounts: (accountsResult.data ?? []).map(
      (account) => ({
        id: account.id,
        name: account.name,
        account_type: account.account_type,
      })
    ),

    members: (
      membersResult.data ?? []
    ).map((member) => ({
      user_id: member.user_id,
      name:
        profileMap.get(member.user_id) ??
        "Usuário",
      email: "",
    })),
  };
}

export async function getExpenses(): Promise<
  ExpenseListItem[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new Error(
      membershipError?.message ??
        "A casa do usuário não foi encontrada."
    );
  }

  const { data, error } = await supabase
  .from("expenses")
  .select(`
    id,
    household_id,
    title,
    description,
    amount,
    due_date,
    status,
    expense_type,
    split_type,
    payment_method,
    notes,
    paid_at,
    is_recurring,
    installment_group_id,
    installment_number,
    installment_total,
    category:categories (
      id,
      name,
      icon
    ),
    account:accounts!expenses_account_id_fkey (
      id,
      name
    ),
    paid_by_profile:profiles!expenses_paid_by_fkey (
      id,
      name
    ),
    attachments (
      id,
      expense_id,
      file_name,
      file_path,
      mime_type,
      file_size,
      created_at
    )
  `)
  .eq("household_id", membership.household_id)
  .neq("status", "cancelled")
  .order("due_date", {
    ascending: false,
  });

  if (error) {
    throw new Error(
      `Erro ao carregar contas: ${error.message}`
    );
  }

  return (data ?? []).map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  })) as unknown as ExpenseListItem[];
}