import {
  getHouseholdContext,
} from "@/services/household-context";

import type {
  ExpenseFormOptions,
  ExpenseListItem,
} from "@/types/expenses";

function firstRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined
): T | null {
  if (!value) {
    return null;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return (
      value[0] ??
      null
    );
  }

  return value;
}

export async function getExpenseFormOptions():
Promise<ExpenseFormOptions> {
  const {
    supabase,
    householdId,
  } =
    await getHouseholdContext();

  const [
    categoriesResult,
    accountsResult,
    membersResult,
  ] = await Promise.all([
    /*
     * Categorias
     */
    supabase
      .from(
        "categories"
      )
      .select(`
        id,
        name,
        icon
      `)
      .or(
        `household_id.eq.${householdId},household_id.is.null`
      )
      .in(
        "category_type",
        [
          "expense",
          "both",
        ]
      )
      .order(
        "name"
      ),

    /*
     * Contas financeiras
     */
    supabase
      .from(
        "accounts"
      )
      .select(`
        id,
        name,
        account_type
      `)
      .eq(
        "household_id",
        householdId
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "name"
      ),

    /*
     * Membros
     *
     * Já carregamos o profile aqui.
     * Não precisamos fazer outra query
     * depois.
     */
    supabase
      .from(
        "household_members"
      )
      .select(`
        user_id,

        profile:profiles!household_members_user_id_fkey (
          id,
          name
        )
      `)
      .eq(
        "household_id",
        householdId
      ),
  ]);

  if (
    categoriesResult.error
  ) {
    throw new Error(
      `Erro ao consultar categorias: ${categoriesResult.error.message}`
    );
  }

  if (
    accountsResult.error
  ) {
    throw new Error(
      `Erro ao consultar contas: ${accountsResult.error.message}`
    );
  }

  if (
    membersResult.error
  ) {
    throw new Error(
      `Erro ao consultar membros: ${membersResult.error.message}`
    );
  }

  return {
    categories:
      (
        categoriesResult.data ??
        []
      ).map(
        (
          category
        ) => ({
          id:
            category.id,

          name:
            category.name,

          icon:
            category.icon,
        })
      ),

    accounts:
      (
        accountsResult.data ??
        []
      ).map(
        (
          account
        ) => ({
          id:
            account.id,

          name:
            account.name,

          account_type:
            account.account_type,
        })
      ),

    members:
      (
        membersResult.data ??
        []
      ).map(
        (
          member
        ) => {
          const profile =
            firstRelation<{
              id:
                string;

              name:
                string;
            }>(
              member.profile
            );

          return {
            user_id:
              member.user_id,

            name:
              profile?.name ??
              "Usuário",

            email:
              "",
          };
        }
      ),
  };
}

export async function getExpenses():
Promise<ExpenseListItem[]> {
  const {
    supabase,
    householdId,
  } =
    await getHouseholdContext();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "expenses"
      )
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
      .eq(
        "household_id",
        householdId
      )
      .neq(
        "status",
        "cancelled"
      )
      .order(
        "due_date",
        {
          ascending:
            false,
        }
      );

  if (error) {
    throw new Error(
      `Erro ao carregar contas: ${error.message}`
    );
  }

  return (
    data ??
    []
  ).map(
    (
      expense
    ) => ({
      ...expense,

      amount:
        Number(
          expense.amount
        ),
    })
  ) as unknown as ExpenseListItem[];
}