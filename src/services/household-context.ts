import { cache } from "react";

import {
  createClient,
} from "@/lib/supabase/server";

export const getHouseholdContext =
  cache(async () => {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      throw new Error(
        "Usuário não autenticado."
      );
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
      throw new Error(
        membershipError?.message ??
          "Casa não encontrada."
      );
    }

    return {
      supabase,
      user,
      householdId:
        membership.household_id,
    };
  });