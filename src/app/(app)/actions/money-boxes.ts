"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { dbError, fail, invalid, ok, withSession, type ActionResult } from "@/lib/actions";
import { belongsToHousehold, isHouseholdMember } from "@/lib/auth/ownership";
import { revalidateAreas } from "@/lib/revalidate";
import { moneyBoxMovementSchema, moneyBoxSchema } from "@/lib/validations/money-boxes";

export async function createMoneyBoxAction(
  input: z.input<typeof moneyBoxSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = moneyBoxSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da caixinha.");

  const values = parsed.data;

  return withSession(async (context) => {
    if (values.ownerUserId && !(await isHouseholdMember(context, values.ownerUserId))) {
      return fail("O dono da caixinha precisa ser um membro da casa.");
    }

    if (values.goalId && !(await belongsToHousehold(context, "goals", values.goalId))) {
      return fail("Meta não encontrada.");
    }

    const { data, error } = await context.supabase
      .from("money_boxes")
      .insert({
        household_id: context.householdId,
        name: values.name,
        owner_user_id: values.ownerUserId,
        description: values.description || null,
        target_amount: values.targetAmount,
        goal_id: values.goalId,
        created_by: context.user.id,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) return dbError(error, "Não foi possível criar a caixinha.");

    revalidateAreas("moneyBoxes");
    return ok("Caixinha criada com sucesso.", { id: String(data.id) });
  });
}

export async function moveMoneyBoxAction(
  input: z.input<typeof moneyBoxMovementSchema>,
): Promise<ActionResult> {
  const parsed = moneyBoxMovementSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Revise os dados da movimentação.");

  const values = parsed.data;

  return withSession(async (context) => {
    const [boxOk, memberOk, accountOk] = await Promise.all([
      belongsToHousehold(context, "money_boxes", values.moneyBoxId),
      isHouseholdMember(context, values.userId),
      values.accountId ? belongsToHousehold(context, "accounts", values.accountId) : true,
    ]);

    if (!boxOk) return fail("Caixinha não encontrada.");
    if (!memberOk) return fail("Quem movimentou precisa ser um membro da casa.");
    if (!accountOk) return fail("Conta financeira não encontrada.");

    const { error } = await context.supabase.rpc("move_money_box", {
      p_money_box_id: values.moneyBoxId,
      p_user_id: values.userId,
      p_account_id: values.accountId,
      p_transaction_type: values.transactionType,
      p_amount: values.amount,
      p_description: values.description || null,
      p_transaction_date: values.transactionDate,
    });

    if (error) return dbError(error, "Não foi possível movimentar a caixinha.");

    revalidateAreas("moneyBoxes");
    revalidatePath(`/caixinhas/${values.moneyBoxId}`);

    return ok(
      values.transactionType === "deposit"
        ? "Dinheiro adicionado à caixinha."
        : "Dinheiro retirado da caixinha.",
    );
  });
}
