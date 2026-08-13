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