import "server-only";

import type { SessionContext } from "@/lib/auth/session";

type Context = Pick<SessionContext, "supabase" | "householdId">;

/**
 * Confere se um registro pertence à casa da sessão. Usado como defesa em
 * profundidade antes de gravar IDs vindos do navegador — o RLS do banco
 * continua sendo a barreira principal.
 */
export async function belongsToHousehold(
  { supabase, householdId }: Context,
  table: "accounts" | "goals" | "money_boxes" | "recurring_income" | "expenses",
  id: string,
) {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function isHouseholdMember({ supabase, householdId }: Context, userId: string) {
  const { data, error } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
