"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

function refreshMoneyBoxes() {
  revalidatePath(
    "/caixinhas"
  );

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/contas-financeiras"
  );
}

export async function createMoneyBoxAction(
  input: {
    name: string;
    ownerUserId:
    | string
    | null;

    description:
    | string
    | null;

    targetAmount:
    | number
    | null;

    goalId:
    | string
    | null;
  }
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      success: false as const,
      message:
        "Usuário não autenticado.",
    };
  }

  const {
    data: membership,
    error: membershipError,
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

  if (
    membershipError ||
    !membership
  ) {
    return {
      success: false as const,
      message:
        membershipError?.message ??
        "Casa não encontrada.",
    };
  }

  if (
    !input.name.trim()
  ) {
    return {
      success: false as const,
      message:
        "Informe o nome da caixinha.",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "money_boxes"
    )
    .insert({
      household_id:
        membership.household_id,

      name:
        input.name.trim(),

      owner_user_id:
        input.ownerUserId,

      description:
        input.description,

      target_amount:
        input.targetAmount,

      goal_id:
        input.goalId,

      created_by:
        user.id,

      is_active:
        true,
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "Erro Supabase money_boxes:",
      error
    );

    return {
      success: false as const,
      message:
        error.message,
    };
  }

  refreshMoneyBoxes();

  return {
    success: true as const,

    message:
      "Caixinha criada com sucesso.",

    id:
      data.id,
  };
}
export async function moveMoneyBoxAction(
  input: {
    moneyBoxId: string;
    userId: string;
    accountId:
    | string
    | null;
    transactionType:
    | "deposit"
    | "withdrawal";
    amount: number;
    description:
    | string
    | null;
    transactionDate: string;
  }
) {
  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "move_money_box",
    {
      p_money_box_id:
        input.moneyBoxId,

      p_user_id:
        input.userId,

      p_account_id:
        input.accountId,

      p_transaction_type:
        input.transactionType,

      p_amount:
        input.amount,

      p_description:
        input.description,

      p_transaction_date:
        input.transactionDate,
    }
  );

  if (error) {
    console.error(
      "Erro Supabase move_money_box:",
      error
    );

    return {
      success: false as const,
      message:
        error.message,
    };
  }

  revalidatePath("/caixinhas");
  revalidatePath(
    `/caixinhas/${input.moneyBoxId}`
  );
  revalidatePath("/dashboard");
  revalidatePath(
    "/contas-financeiras"
  );

  return {
    success: true as const,

    message:
      input.transactionType ===
        "deposit"
        ? "Dinheiro adicionado à caixinha."
        : "Dinheiro retirado da caixinha.",
  };
}