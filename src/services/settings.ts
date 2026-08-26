import { createClient } from "@/lib/supabase/server";

import type {
  FinancePreferences,
  RecurringIncomeSetting,
  SettingsCreditCard,
  SettingsMember,
  SettingsPageData,
} from "@/types/settings";

function firstRelation<T>(
  value: T | T[] | null | undefined
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
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
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
    householdId:
      membership.household_id,
  };
}

export async function getSettingsPageData():
Promise<SettingsPageData> {
  const {
    supabase,
    householdId,
  } = await getContext();

  const [
    membersResult,
    cardsResult,
    recurringResult,
    preferencesResult,
  ] = await Promise.all([
    /*
     * =====================================================
     * MEMBROS DA CASA
     * =====================================================
     */
    supabase
      .from("household_members")
      .select(`
        user_id,

        profile:profiles (
          id,
          name
        )
      `)
      .eq(
        "household_id",
        householdId
      ),

    /*
     * =====================================================
     * CARTÕES
     * =====================================================
     */
    supabase
      .from("accounts")
      .select(`
        id,
        name,
        institution,
        owner_user_id,
        closing_day,
        due_day,
        auto_payment,
        auto_payment_account_id,

        owner:profiles!accounts_owner_user_id_fkey (
          name
        )
      `)
      .eq(
        "household_id",
        householdId
      )
      .eq(
        "account_type",
        "credit_card"
      )
      .eq(
        "is_active",
        true
      )
      .order("name"),

    /*
     * =====================================================
     * RECEITAS RECORRENTES
     * =====================================================
     */
    supabase
      .from("recurring_income")
      .select(`
        id,
        user_id,
        account_id,
        income_type,
        description,
        amount,
        day_of_month,
        is_benefit,
        is_active,

        profile:profiles!recurring_income_user_id_fkey (
          name
        ),

        account:accounts!recurring_income_account_id_fkey (
          name
        )
      `)
      .eq(
        "household_id",
        householdId
      )
      .order("description"),

    /*
     * =====================================================
     * PREFERÊNCIAS
     * =====================================================
     */
    supabase
      .from(
        "household_finance_settings"
      )
      .select(`
        auto_process_finances,
        separate_benefits_from_cash
      `)
      .eq(
        "household_id",
        householdId
      )
      .maybeSingle(),
  ]);

  /*
   * =====================================================
   * TRATAMENTO DE ERROS
   * =====================================================
   */

  if (membersResult.error) {
    throw new Error(
      `Erro ao carregar membros: ${membersResult.error.message}`
    );
  }

  if (cardsResult.error) {
    throw new Error(
      `Erro ao carregar cartões: ${cardsResult.error.message}`
    );
  }

  const paymentAccountIds = [
    ...new Set(
      (cardsResult.data ?? [])
        .map(
          (card) =>
            card.auto_payment_account_id
        )
        .filter(
          (id): id is string =>
            Boolean(id)
        )
    ),
  ];

  const paymentAccountsResult =
    paymentAccountIds.length > 0
      ? await supabase
          .from("accounts")
          .select("id, name")
          .eq(
            "household_id",
            householdId
          )
          .in("id", paymentAccountIds)
      : {
          data: [],
          error: null,
        };

  if (paymentAccountsResult.error) {
    throw new Error(
      `Erro ao carregar contas de pagamento: ${paymentAccountsResult.error.message}`
    );
  }

  const paymentAccountMap = new Map(
    (paymentAccountsResult.data ?? []).map(
      (account) => [account.id, account.name]
    )
  );

  if (recurringResult.error) {
    throw new Error(
      `Erro ao carregar receitas recorrentes: ${recurringResult.error.message}`
    );
  }

  if (preferencesResult.error) {
    throw new Error(
      `Erro ao carregar preferências: ${preferencesResult.error.message}`
    );
  }

  /*
   * =====================================================
   * MEMBROS
   * =====================================================
   */

  const members: SettingsMember[] =
    (membersResult.data ?? []).map(
      (item) => {
        const profile =
          firstRelation<{
            id: string;
            name: string;
          }>(item.profile);

        return {
          user_id:
            item.user_id,

          name:
            profile?.name ??
            "Usuário",

          email: null,
        };
      }
    );

  /*
   * =====================================================
   * CARTÕES
   * =====================================================
   */

  const cards: SettingsCreditCard[] =
  (cardsResult.data ?? []).map(
    (item) => {
      const owner =
        firstRelation<{
          name: string;
        }>(item.owner);

      return {
        id: item.id,

        name: item.name,

        institution:
          item.institution,

        owner_user_id:
          item.owner_user_id,

        closing_day:
          item.closing_day,

        due_day:
          item.due_day,

        auto_payment:
          item.auto_payment,

        auto_payment_account_id:
          item.auto_payment_account_id,

        owner_name:
          owner?.name ?? null,

        payment_account_name:
          item.auto_payment_account_id
            ? paymentAccountMap.get(
                item.auto_payment_account_id
              ) ?? null
            : null,
      };
    }
  );

  /*
   * =====================================================
   * RECEITAS RECORRENTES
   * =====================================================
   */

  const recurringIncome:
    RecurringIncomeSetting[] =
      (
        recurringResult.data ?? []
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

          income_type:
            item.income_type,

          description:
            item.description,

          amount:
            Number(item.amount),

          day_of_month:
            item.day_of_month,

          is_benefit:
            item.is_benefit,

          is_active:
            item.is_active,
        };
      });

  /*
   * =====================================================
   * PREFERÊNCIAS
   * =====================================================
   */

  const preferences:
    FinancePreferences =
      preferencesResult.data ?? {
        auto_process_finances:
          true,

        separate_benefits_from_cash:
          true,
      };

  return {
    members,
    cards,
    recurringIncome,
    preferences,
  };
}