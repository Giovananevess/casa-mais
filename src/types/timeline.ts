export type TimelineEventType =
  | "expense_created"
  | "expense_paid"
  | "expense_pending"
  | "income"
  | "goal_contribution"
  | "goal_completed";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  amount: number | null;
  date: string;
  userName: string | null;

  metadata: {
    expenseId?: string;
    goalId?: string;
    category?: string | null;
    status?: string;
  };
};

export type TimelineGroup = {
  date: string;
  label: string;
  events: TimelineEvent[];
};