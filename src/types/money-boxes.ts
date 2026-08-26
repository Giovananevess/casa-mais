export type MoneyBox = {
  id: string;
  household_id: string;

  name: string;

  owner_user_id:
    | string
    | null;

  owner_name:
    | string
    | null;

  description:
    | string
    | null;

  target_amount:
    | number
    | null;

  goal_id:
    | string
    | null;

  goal_name:
    | string
    | null;

  balance: number;

  progress: number | null;

  is_active: boolean;
};

export type MoneyBoxTransaction = {
  id: string;

  money_box_id: string;

  user_id: string;
  user_name: string;

  account_id:
    | string
    | null;

  account_name:
    | string
    | null;

  transaction_type:
    | "deposit"
    | "withdrawal";

  amount: number;

  description:
    | string
    | null;

  transaction_date: string;

  created_at: string;
};