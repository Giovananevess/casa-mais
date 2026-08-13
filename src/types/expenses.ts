export type ExpenseStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled";

export type ExpenseType =
  | "fixed"
  | "variable"
  | "installment";

export type ExpenseSplitType =
  | "equal"
  | "individual";

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string | null;
};

export type FinancialAccount = {
  id: string;
  name: string;
  account_type: string;
};

export type HouseholdMember = {
  user_id: string;
  name: string;
  email: string;
};

export type ExpenseFormOptions = {
  categories: ExpenseCategory[];
  accounts: FinancialAccount[];
  members: HouseholdMember[];
};

export type ExpenseListItem = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string;
  status: ExpenseStatus;
  expense_type: ExpenseType;
  split_type: ExpenseSplitType;
  payment_method: string | null;
  notes: string | null;
  paid_at: string | null;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  is_recurring: boolean;
  household_id: string;
  attachments: ExpenseAttachment[];

  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;

  account: {
    id: string;
    name: string;
  } | null;

  paid_by_profile: {
    id: string;
    name: string;
  } | null;
};


export type ExpenseAttachment = {
  id: string;
  expense_id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type RecurringExpenseListItem = {
  id: string;
  title: string;
  default_amount: number;
  due_day: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};