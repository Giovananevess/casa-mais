import { createClient } from "@/lib/supabase/server";

import type {
  TimelineEvent,
  TimelineGroup,
} from "@/types/timeline";

/*
 * O Supabase às vezes infere relacionamentos
 * aninhados como objeto e às vezes como array.
 *
 * Essa função garante que sempre trabalhemos
 * com apenas um objeto.
 */
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

async function getHouseholdContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: membership, error } =
    await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao consultar a casa: ${error.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "O usuário não pertence a uma casa."
    );
  }

  return {
    supabase,
    householdId: membership.household_id,
  };
}

function getDateLabel(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();

  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const normalizedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference = Math.round(
    (normalizedToday.getTime() -
      normalizedDate.getTime()) /
    86_400_000
  );

  if (difference === 0) {
    return "Hoje";
  }

  if (difference === 1) {
    return "Ontem";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

export async function getTimeline(
  limit = 30
): Promise<TimelineGroup[]> {
  const { supabase, householdId } =
    await getHouseholdContext();

const [
  expensesResult,
  paymentsResult,
  contributionsResult,
  historyResult,
] = await Promise.all([
  supabase
    .from("expenses")
    .select(`
      id,
      title,
      amount,
      status,
      created_at,
      category:categories!expenses_category_id_fkey (
        name
      ),
      created_by_profile:profiles!expenses_created_by_fkey (
        name
      )
    `)
    .eq("household_id", householdId)
    .neq("status", "cancelled")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit),

  supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_date,
      expense:expenses!payments_expense_id_fkey (
        id,
        title,
        household_id
      ),
      profile:profiles!payments_user_id_fkey (
        name
      )
    `)
    .order("payment_date", {
      ascending: false,
    })
    .limit(limit),

  supabase
    .from("goal_contributions")
    .select(`
      id,
      amount,
      contribution_date,
      goal:goals!goal_contributions_goal_id_fkey (
        id,
        name,
        household_id
      ),
      profile:profiles!goal_contributions_user_id_fkey (
        name
      )
    `)
    .eq("household_id", householdId)
    .order("contribution_date", {
      ascending: false,
    })
    .limit(limit),

  supabase
    .from("goal_history")
    .select(`
      id,
      event_type,
      created_at,
      goal:goals!goal_history_goal_id_fkey (
        id,
        name,
        household_id
      ),
      profile:profiles!goal_history_user_id_fkey (
        name
      )
    `)
    .eq("household_id", householdId)
    .eq("event_type", "completed")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit),
]);
  if (expensesResult.error) {
    throw new Error(
      `Erro ao carregar contas da Timeline: ${expensesResult.error.message}`
    );
  }

  if (paymentsResult.error) {
    throw new Error(
      `Erro ao carregar pagamentos da Timeline: ${paymentsResult.error.message}`
    );
  }

  if (contributionsResult.error) {
    throw new Error(
      `Erro ao carregar aportes da Timeline: ${contributionsResult.error.message}`
    );
  }

  if (historyResult.error) {
    throw new Error(
      `Erro ao carregar histórico de metas: ${historyResult.error.message}`
    );
  }

  const events: TimelineEvent[] = [];

  /*
   * ========================================
   * CONTAS CADASTRADAS
   * ========================================
   */

  for (const expense of
    expensesResult.data ?? []) {
    const category = firstRelation<{
      name: string;
    }>(expense.category);

    const creator = firstRelation<{
      name: string;
    }>(expense.created_by_profile);

    events.push({
      id: `expense-${expense.id}`,

      type: "expense_created",

      title: expense.title,

      description:
        category?.name ??
        "Conta cadastrada",

      amount: Number(expense.amount),

      date: expense.created_at,

      userName: creator?.name ?? null,

      metadata: {
        expenseId: expense.id,
        category: category?.name ?? null,
        status: expense.status,
      },
    });
  }

  /*
   * ========================================
   * PAGAMENTOS
   * ========================================
   */

  for (const payment of
    paymentsResult.data ?? []) {
    const expense =
      firstRelation<{
        id: string;
        title: string;
        household_id: string;
      }>(payment.expense);

    const profile =
      firstRelation<{
        name: string;
      }>(payment.profile);

    /*
     * Como payments não possui household_id,
     * confirmamos através da despesa.
     */
    if (
      !expense ||
      expense.household_id !== householdId
    ) {
      continue;
    }

    events.push({
      id: `payment-${payment.id}`,

      type: "expense_paid",

      title: expense.title,

      description:
        "Pagamento realizado",

      amount: Number(payment.amount),

      date: `${payment.payment_date}T12:00:00`,

      userName: profile?.name ?? null,

      metadata: {
        expenseId: expense.id,
        status: "paid",
      },
    });
  }

  /*
   * ========================================
   * APORTES DAS METAS
   * ========================================
   */

  for (const contribution of
    contributionsResult.data ?? []) {
    const goal =
      firstRelation<{
        id: string;
        name: string;
        household_id: string;
      }>(contribution.goal);

    const profile =
      firstRelation<{
        name: string;
      }>(contribution.profile);

    if (
      !goal ||
      goal.household_id !== householdId
    ) {
      continue;
    }

    events.push({
      id: `contribution-${contribution.id}`,

      type: "goal_contribution",

      title: goal.name,

      description:
        "Aporte realizado",

      amount: Number(
        contribution.amount
      ),

      date:
        `${contribution.contribution_date}T12:00:00`,

      userName: profile?.name ?? null,

      metadata: {
        goalId: goal.id,
      },
    });
  }

  /*
   * ========================================
   * METAS CONCLUÍDAS
   * ========================================
   */

  for (const history of
    historyResult.data ?? []) {
    const goal =
      firstRelation<{
        id: string;
        name: string;
        household_id: string;
      }>(history.goal);

    const profile =
      firstRelation<{
        name: string;
      }>(history.profile);

    if (
      !goal ||
      goal.household_id !== householdId
    ) {
      continue;
    }

    events.push({
      id: `goal-completed-${history.id}`,

      type: "goal_completed",

      title: goal.name,

      description:
        "Meta concluída 🎉",

      amount: null,

      date: history.created_at,

      userName: profile?.name ?? null,

      metadata: {
        goalId: goal.id,
      },
    });
  }

  /*
   * ========================================
   * ORDENAR TODA A TIMELINE
   * ========================================
   */

  events.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  const selected =
    events.slice(0, limit);

  /*
   * ========================================
   * AGRUPAR POR DIA
   * ========================================
   */

  const groups = new Map<
    string,
    TimelineEvent[]
  >();

  for (const event of selected) {
    const key = new Date(event.date)
      .toISOString()
      .slice(0, 10);

    const current =
      groups.get(key) ?? [];

    current.push(event);

    groups.set(key, current);
  }

  /*
   * ========================================
   * RETORNO
   * ========================================
   */

  return Array.from(
    groups.entries()
  ).map(([date, groupEvents]) => ({
    date,

    label: getDateLabel(
      `${date}T12:00:00`
    ),

    events: groupEvents,
  }));
}