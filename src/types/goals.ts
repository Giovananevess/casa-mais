export type GoalStatus =
  | "active"
  | "completed"
  | "paused"
  | "cancelled";

export type GoalPriority =
  | "low"
  | "medium"
  | "high";

export type GoalMember = {
  user_id: string;
  name: string;
};

export type GoalContribution = {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  notes: string | null;
  source_type:
    | "manual"
    | "income"
    | "transfer"
    | "adjustment";
  created_at: string;

  profile: {
    id: string;
    name: string;
  } | null;
};

export type GoalHistoryItem = {
  id: string;
  goal_id: string;
  user_id: string | null;
  event_type: string;
  amount: number | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;

  profile: {
    id: string;
    name: string;
  } | null;
};

export type Goal = {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  target_amount: number;
  current_amount: number;
  initial_amount: number;
  target_date: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  percentage: number;
  progress: number;
  remaining_amount: number;
  days_remaining: number | null;
  monthly_required: number | null;
};

export type GoalRankingItem = {
  userId: string;
  name: string;
  amount: number;
  contributionCount: number;
  percentage: number;
};

export type GoalChartItem = {
  month: string;
  amount: number;
  accumulated: number;
};

export type GoalInsight = {
  type:
    | "positive"
    | "warning"
    | "neutral";
  title: string;
  description: string;
};

export type GoalDetails = {
  goal: Goal;
  contributions: GoalContribution[];
  history: GoalHistoryItem[];
  ranking: GoalRankingItem[];
  chart: GoalChartItem[];
  insights: GoalInsight[];
  members: GoalMember[];
};