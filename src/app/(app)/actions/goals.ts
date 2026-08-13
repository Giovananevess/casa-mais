"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  goalContributionSchema,
  goalSchema,
  updateGoalSchema,
} from "@/lib/validations/goals";

function refreshGoalPages(goalId?: string) {
  revalidatePath("/metas");
  revalidatePath("/dashboard");
  revalidatePath("/calendario");

  if (goalId) {
    revalidatePath(`/metas/${goalId}`);
  }
}



export async function createGoalAction(
  input: unknown
) {
  const validation =
    goalSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message:
        "Revise os dados da meta.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { data, error } =
    await supabase.rpc(
      "create_household_goal",
      {
        p_name: values.name,
        p_description:
          values.description || null,
        p_icon: values.icon,
        p_color: values.color,
        p_target_amount:
          values.targetAmount,
        p_initial_amount:
          values.initialAmount,
        p_target_date:
          values.targetDate || null,
        p_priority: values.priority,
      }
    );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  const goalId = String(data);

  refreshGoalPages(goalId);

  return {
    success: true as const,
    goalId,
    message: "Meta criada com sucesso.",
  };
}

export async function updateGoalAction(
  input: unknown
) {
  const validation =
    updateGoalSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message:
        "Revise os dados informados.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "update_household_goal",
    {
      p_goal_id: values.goalId,
      p_name: values.name,
      p_description:
        values.description || null,
      p_icon: values.icon,
      p_color: values.color,
      p_target_amount:
        values.targetAmount,
      p_target_date:
        values.targetDate || null,
      p_priority: values.priority,
      p_status: values.status,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshGoalPages(values.goalId);

  return {
    success: true as const,
    message: "Meta atualizada.",
  };
}

export async function addGoalContributionAction(
  input: unknown
) {
  const validation =
    goalContributionSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message:
        "Revise os dados do aporte.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { data, error } =
    await supabase.rpc(
      "add_goal_contribution",
      {
        p_goal_id: values.goalId,
        p_user_id: values.userId,
        p_amount: values.amount,
        p_contribution_date:
          values.contributionDate,
        p_notes: values.notes || null,
        p_source_type:
          values.sourceType,
        p_income_id:
          values.incomeId || null,
      }
    );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshGoalPages(values.goalId);

  const result = data as {
    contribution_id: string;
    current_amount: number;
    completed: boolean;
  };

  return {
    success: true as const,
    message: result.completed
      ? "Meta concluída! 🎉"
      : "Aporte registrado.",
    completed: result.completed,
    currentAmount: Number(
      result.current_amount
    ),
  };
}

export async function deleteGoalContributionAction(
  contributionId: string,
  goalId: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "delete_goal_contribution",
    {
      p_contribution_id:
        contributionId,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshGoalPages(goalId);

  return {
    success: true as const,
    message: "Aporte removido.",
  };
}

export async function cancelGoalAction(
  goalId: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "cancel_household_goal",
    {
      p_goal_id: goalId,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshGoalPages(goalId);

  return {
    success: true as const,
    message: "Meta cancelada.",
  };
}

export async function deleteGoalAction(
  goalId: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "delete_household_goal",
    {
      p_goal_id: goalId,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshGoalPages();

  return {
    success: true as const,
    message:
      "Meta excluída definitivamente.",
  };
}