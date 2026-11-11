"use server";

import { revalidatePath } from "next/cache";

import { dbError, fail, invalid, ok, uuid, withSession, type ActionResult } from "@/lib/actions";
import { revalidateAreas } from "@/lib/revalidate";
import { goalContributionSchema, goalSchema, updateGoalSchema } from "@/lib/validations/goals";

function refreshGoalPages(goalId?: string) {
  revalidateAreas("goals");
  if (goalId) revalidatePath(`/metas/${goalId}`);
}

const nullable = (value: string | undefined | null) => value || null;

export async function createGoalAction(input: unknown): Promise<ActionResult<{ goalId: string }>> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da meta.");

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { data, error } = await supabase.rpc("create_household_goal", {
      p_name: values.name,
      p_description: nullable(values.description),
      p_icon: values.icon,
      p_color: values.color,
      p_target_amount: values.targetAmount,
      p_initial_amount: values.initialAmount,
      p_target_date: nullable(values.targetDate),
      p_priority: values.priority,
    });

    if (error) return dbError(error, "Não foi possível criar a meta.");

    const goalId = String(data);
    refreshGoalPages(goalId);
    return ok("Meta criada com sucesso.", { goalId });
  });
}

export async function updateGoalAction(input: unknown): Promise<ActionResult> {
  const parsed = updateGoalSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados informados.");

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("update_household_goal", {
      p_goal_id: values.goalId,
      p_name: values.name,
      p_description: nullable(values.description),
      p_icon: values.icon,
      p_color: values.color,
      p_target_amount: values.targetAmount,
      p_target_date: nullable(values.targetDate),
      p_priority: values.priority,
      p_status: values.status,
    });

    if (error) return dbError(error, "Não foi possível atualizar a meta.");

    refreshGoalPages(values.goalId);
    return ok("Meta atualizada.");
  });
}

type ContributionRpcResult = {
  contribution_id: string;
  current_amount: number;
  completed: boolean;
};

export async function addGoalContributionAction(
  input: unknown,
): Promise<ActionResult<{ completed: boolean; currentAmount: number }>> {
  const parsed = goalContributionSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados do aporte.");

  const values = parsed.data;

  return withSession(async ({ supabase }) => {
    const { data, error } = await supabase.rpc("add_goal_contribution", {
      p_goal_id: values.goalId,
      p_user_id: values.userId,
      p_amount: values.amount,
      p_contribution_date: values.contributionDate,
      p_notes: nullable(values.notes),
      p_source_type: values.sourceType,
      p_income_id: values.incomeId || null,
    });

    if (error) return dbError(error, "Não foi possível registrar o aporte.");

    refreshGoalPages(values.goalId);

    const result = (data ?? {}) as Partial<ContributionRpcResult>;
    const completed = Boolean(result.completed);

    return ok(completed ? "Meta concluída! 🎉" : "Aporte registrado.", {
      completed,
      currentAmount: Number(result.current_amount ?? 0),
    });
  });
}

export async function deleteGoalContributionAction(
  contributionId: string,
  goalId: string,
): Promise<ActionResult> {
  if (!uuid.safeParse(contributionId).success || !uuid.safeParse(goalId).success) {
    return fail("Aporte inválido.");
  }

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("delete_goal_contribution", {
      p_contribution_id: contributionId,
    });

    if (error) return dbError(error, "Não foi possível remover o aporte.");

    refreshGoalPages(goalId);
    return ok("Aporte removido.");
  });
}

export async function cancelGoalAction(goalId: string): Promise<ActionResult> {
  if (!uuid.safeParse(goalId).success) return fail("Meta inválida.");

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("cancel_household_goal", { p_goal_id: goalId });

    if (error) return dbError(error, "Não foi possível cancelar a meta.");

    refreshGoalPages(goalId);
    return ok("Meta cancelada.");
  });
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult> {
  if (!uuid.safeParse(goalId).success) return fail("Meta inválida.");

  return withSession(async ({ supabase }) => {
    const { error } = await supabase.rpc("delete_household_goal", { p_goal_id: goalId });

    if (error) return dbError(error, "Não foi possível excluir a meta.");

    refreshGoalPages();
    return ok("Meta excluída definitivamente.");
  });
}
