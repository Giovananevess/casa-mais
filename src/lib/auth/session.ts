import "server-only";

import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type SessionContext = {
  supabase: SupabaseClient;
  user: User;
  householdId: string;
};

export class AuthError extends Error {
  constructor(
    message: string,
    readonly reason: "unauthenticated" | "no-household",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Resolve o usuário autenticado e a casa à qual ele pertence.
 * Memoizado por requisição via `cache`, então pode ser chamado
 * livremente em services, actions e route handlers.
 */
export const getSessionContext = cache(async (): Promise<SessionContext> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AuthError("Sua sessão expirou. Entre novamente para continuar.", "unauthenticated");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new AuthError("Você ainda não faz parte de nenhuma casa.", "no-household");
  }

  return {
    supabase,
    user,
    householdId: membership.household_id as string,
  };
});
