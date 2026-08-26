import {
  createClient,
} from "@/lib/supabase/server";

import type {
  MoneyBox,
  MoneyBoxTransaction,
} from "@/types/money-boxes";

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

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

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

  const {
    data: membership,
  } = await supabase
    .from(
      "household_members"
    )
    .select(
      "household_id"
    )
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();

  if (!membership) {
    throw new Error(
      "Casa não encontrada."
    );
  }

  return {
    supabase,

    householdId:
      membership.household_id,
  };
}

export async function getMoneyBoxes():
Promise<MoneyBox[]> {
  const {
    supabase,
    householdId,
  } = await getContext();

  const {
  data,
  error,
} = await supabase
  .from("money_boxes")
  .select(`
    id,
    household_id,
    name,
    owner_user_id,
    description,
    target_amount,
    goal_id,
    is_active,

    owner:profiles!money_boxes_owner_user_id_fkey (
      name
    )
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
    "created_at",
    {
      ascending: true,
    }
  );

  if (error) {
    throw new Error(
      `Erro ao carregar caixinhas: ${error.message}`
    );
  }

  const result =
    await Promise.all(
      (data ?? []).map(
        async (item) => {
          const {
            data: balanceData,
            error: balanceError,
          } = await supabase.rpc(
            "get_money_box_balance",
            {
              p_money_box_id:
                item.id,
            }
          );

          if (balanceError) {
            throw new Error(
              balanceError.message
            );
          }

          const owner =
            firstRelation<{
              name: string;
            }>(item.owner);

          const balance =
            Number(
              balanceData ?? 0
            );

          const target =
            item.target_amount
              ? Number(
                  item.target_amount
                )
              : null;

          return {
            id: item.id,

            household_id:
              item.household_id,

            name:
              item.name,

            owner_user_id:
              item.owner_user_id,

            owner_name:
              owner?.name ??
              null,

            description:
              item.description,

            target_amount:
              target,

            goal_id: item.goal_id,
            goal_name: null,

            balance,

            progress:
              target &&
              target > 0
                ? Math.min(
                    100,
                    (
                      balance /
                      target
                    ) * 100
                  )
                : null,

            is_active:
              item.is_active,
          };
        }
      )
    );

  return result;
}

export async function getMoneyBoxTransactions(
  moneyBoxId: string
): Promise<MoneyBoxTransaction[]> {
  const {
    supabase,
    householdId,
  } = await getContext();

  const {
    data,
    error,
  } = await supabase
    .from(
      "money_box_transactions"
    )
    .select(`
      id,
      money_box_id,
      user_id,
      account_id,
      transaction_type,
      amount,
      description,
      transaction_date,
      created_at,

      profile:profiles!money_box_transactions_user_id_fkey (
        name
      ),

      account:accounts!money_box_transactions_account_id_fkey (
        name
      )
    `)
    .eq(
      "household_id",
      householdId
    )
    .eq(
      "money_box_id",
      moneyBoxId
    )
    .order(
      "transaction_date",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Erro ao carregar movimentações: ${error.message}`
    );
  }

  return (
    data ?? []
  ).map((item) => {
    const profile =
      firstRelation<{
        name: string;
      }>(item.profile);

    const account =
      firstRelation<{
        name: string;
      }>(item.account);

    return {
      id:
        item.id,

      money_box_id:
        item.money_box_id,

      user_id:
        item.user_id,

      user_name:
        profile?.name ??
        "Usuário",

      account_id:
        item.account_id,

      account_name:
        account?.name ??
        null,

      transaction_type:
        item.transaction_type as
          | "deposit"
          | "withdrawal",

      amount:
        Number(item.amount),

      description:
        item.description,

      transaction_date:
        item.transaction_date,

      created_at:
        item.created_at,
    };
  });
}