import { createClient } from "@/lib/supabase/server";

import type {
  Goal,
  GoalChartItem,
  GoalContribution,
  GoalDetails,
  GoalHistoryItem,
  GoalInsight,
  GoalMember,
  GoalRankingItem,
} from "@/types/goals";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${targetDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  return Math.ceil(
    (target.getTime() - today.getTime()) / 86_400_000
  );
}

function enrichGoal(goal: Goal): Goal {
  const targetAmount = toNumber(goal.target_amount);
  const currentAmount = toNumber(goal.current_amount);
  const initialAmount = toNumber(goal.initial_amount);

  const percentage =
    targetAmount > 0
      ? Math.min(
          100,
          (currentAmount / targetAmount) * 100
        )
      : 0;

  const remainingAmount = Math.max(
    0,
    targetAmount - currentAmount
  );

  const daysRemaining =
    getDaysRemaining(goal.target_date);

  const monthsRemaining =
    daysRemaining === null
      ? null
      : Math.max(
          1,
          Math.ceil(
            Math.max(daysRemaining, 0) / 30
          )
        );

  return {
    ...goal,
    target_amount: targetAmount,
    current_amount: currentAmount,
    initial_amount: initialAmount,

    percentage,
    progress: percentage,

    remaining_amount: remainingAmount,

    monthly_required:
      monthsRemaining === null
        ? null
        : remainingAmount / monthsRemaining,

    days_remaining: daysRemaining,
  };
}

function buildGoalInsights(
  goal: Goal,
  contributions: GoalContribution[]
): GoalInsight[] {
  const totalContributed = contributions.reduce(
    (sum, contribution) => sum + toNumber(contribution.amount),
    0
  );

  const contributionMonths = new Set(
    contributions
      .map((contribution) => contribution.contribution_date?.slice(0, 7))
      .filter((month): month is string => Boolean(month))
  ).size;

  const averageMonthly =
    contributionMonths > 0
      ? totalContributed / contributionMonths
      : 0;

  const remaining = Math.max(
    0,
    toNumber(goal.target_amount) - toNumber(goal.current_amount)
  );

  const progress =
    toNumber(goal.target_amount) > 0
      ? Math.min(
          100,
          (toNumber(goal.current_amount) /
            toNumber(goal.target_amount)) *
            100
        )
      : 0;

  const insights: GoalInsight[] = [];

  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  insights.push({
    type: progress >= 80 ? "positive" : progress >= 40 ? "neutral" : "warning",
    title: "Progresso da meta",
    description: `${progress.toFixed(0)}% alcançado`,
  });

  insights.push({
    type: averageMonthly > 0 ? "positive" : "neutral",
    title: "Contribuição média mensal",
    description:
      averageMonthly > 0
        ? `${currency.format(averageMonthly)} por mês`
        : "Ainda não há contribuições suficientes",
  });

  insights.push({
    type: remaining === 0 ? "positive" : "neutral",
    title: "Estimativa até a meta",
    description:
      averageMonthly > 0
        ? `Faltam aproximadamente ${Math.ceil(remaining / averageMonthly)} meses`
        : remaining === 0
        ? "Meta já alcançada"
        : "Sem estimativa (nenhuma contribuição mensal)",
  });

  return insights;
}

async function getGoalContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: membership, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    throw new Error(error?.message ?? "Casa não encontrada.");
  }

  return {
    supabase,
    householdId: membership.household_id,
  };
}

export async function getGoals(): Promise<Goal[]> {
  const { supabase, householdId } = await getGoalContext();

  const { data, error } = await supabase
    .from("goals")
    .select(`
      id,
      household_id,
      name,
      description,
      icon,
      color,
      target_amount,
      current_amount,
      initial_amount,
      target_date,
      priority,
      status,
      created_by,
      completed_at,
      created_at,
      updated_at
    `)
    .eq("household_id", householdId)
    .neq("status", "cancelled")
    .order("priority", { ascending: false })
    .order("target_date", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    throw new Error(`Erro ao carregar metas: ${error.message}`);
  }

  return (data ?? []).map((goal) =>
    enrichGoal({
      ...goal,
      target_amount: toNumber(goal.target_amount),
      current_amount: toNumber(goal.current_amount),
      initial_amount: toNumber(goal.initial_amount),
    } as Goal)
  );
}

export async function getGoalMembers(): Promise<GoalMember[]> {
  const { supabase, householdId } = await getGoalContext();

  const { data: members, error } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);

  if (error) {
    throw new Error(error.message);
  }

  const ids = (members ?? []).map((member) => member.user_id);
  if (ids.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", ids);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return (profiles ?? []).map((profile) => ({
    user_id: profile.id,
    name: profile.name,
  }));
}

function buildRanking(
  contributions: GoalContribution[],
  members: GoalMember[]
): GoalRankingItem[] {
  const total = contributions.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  return members
    .map((member) => {
      const memberContributions = contributions.filter(
        (item) => item.user_id === member.user_id
      );
      const amount = memberContributions.reduce(
        (sum, item) => sum + toNumber(item.amount),
        0
      );

      return {
        userId: member.user_id,
        name: member.name,
        amount,
        contributionCount: memberContributions.length,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

function buildChart(
  contributions: GoalContribution[]
): GoalChartItem[] {
  const monthly = new Map<string, number>();

  for (const contribution of contributions) {
    const key = contribution.contribution_date.slice(0, 7);
    monthly.set(
      key,
      (monthly.get(key) ?? 0) + toNumber(contribution.amount)
    );
  }

  let accumulated = 0;

  return Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthValue, amount]) => {
      accumulated += amount;
      const [year, month] = monthValue.split("-").map(Number);

      return {
        month: new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          year: "2-digit",
        })
          .format(new Date(year, month - 1, 1))
          .replace(".", ""),
        amount,
        accumulated,
      };
    });
}

export async function getGoalDetails(
  goalId: string
): Promise<GoalDetails> {
  const { supabase, householdId } = await getGoalContext();

  const [
    goalResult,
    contributionsResult,
    historyResult,
    members,
  ] = await Promise.all([
    supabase
      .from("goals")
      .select(`
        id,
        household_id,
        name,
        description,
        icon,
        color,
        target_amount,
        current_amount,
        initial_amount,
        target_date,
        priority,
        status,
        created_by,
        completed_at,
        created_at,
        updated_at
      `)
      .eq("id", goalId)
      .eq("household_id", householdId)
      .single(),
    supabase
      .from("goal_contributions")
      .select(`
        id,
        goal_id,
        user_id,
        amount,
        contribution_date,
        notes,
        source_type,
        created_at,
        profile:profiles!goal_contributions_user_id_fkey (
          id,
          name
        )
      `)
      .eq("goal_id", goalId)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_history")
      .select(`
        id,
        goal_id,
        user_id,
        event_type,
        amount,
        description,
        metadata,
        created_at,
        profile:profiles!goal_history_user_id_fkey (
          id,
          name
        )
      `)
      .eq("goal_id", goalId)
      .order("created_at", { ascending: false }),
    getGoalMembers(),
  ]);

  if (goalResult.error) throw new Error(goalResult.error.message);
  if (contributionsResult.error) {
    throw new Error(contributionsResult.error.message);
  }
  if (historyResult.error) {
    throw new Error(historyResult.error.message);
  }

  const goal = enrichGoal({
    ...goalResult.data,
    target_amount: toNumber(goalResult.data.target_amount),
    current_amount: toNumber(goalResult.data.current_amount),
    initial_amount: toNumber(goalResult.data.initial_amount),
  } as Goal);

  const contributions = (contributionsResult.data ?? []).map((item) => ({
    ...item,
    amount: toNumber(item.amount),
  })) as unknown as GoalContribution[];

  const history = (historyResult.data ?? []).map((item) => ({
    ...item,
    amount: item.amount === null ? null : toNumber(item.amount),
  })) as unknown as GoalHistoryItem[];

  return {
    goal,
    contributions,
    history,
    ranking: buildRanking(contributions, members),
    chart: buildChart(contributions),
    insights: buildGoalInsights(goal, contributions),
    members,
  };
}

export async function getFeaturedGoal(): Promise<Goal | null> {
  const goals = await getGoals();

  return (
    goals.find(
      (goal) => goal.status === "active" && goal.priority === "high"
    ) ??
    goals.find((goal) => goal.status === "active") ??
    null
  );
}