export type DashboardSummary = {
  household_id: string;
  reference_month: string;

  summary: {
    income: number;
    expenses: number;
    paid: number;
    pending: number;
    balance: number;
    savings: number;
    paid_percentage: number;
  };

  upcoming_expenses: {
    id: string;
    title: string;
    amount: number;
    due_date: string;
    status: "pending" | "paid" | "overdue" | "cancelled";
    category: string | null;
    category_icon: string | null;
  }[];

  payments_by_person: {
    user_id: string;
    name: string;
    amount: number;
    percentage: number;
  }[];
};

export type DashboardTrendItem = {
  month: string;
  income: number;
  expenses: number;
};

export type DashboardMovementExpense = {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  display_status: "pending" | "paid" | "overdue";
  paid_by: string | null;
  category: { name: string; icon: string | null } | null;
  paid_by_profile: { name: string } | null;
};

export type DashboardMovementIncome = {
  id: string;
  title: string;
  amount: number;
  income_date: string;
  income_type: string;
};

export type DashboardMonthMovements = {
  month: string;
  expenses: DashboardMovementExpense[];
  income: DashboardMovementIncome[];
};

export type DashboardDetailKind = "balance" | "paid" | "pending" | "savings";
