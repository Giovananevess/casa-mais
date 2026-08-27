export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "credit_card"
  | "meal_voucher"
  | "food_voucher";

export type PaymentMethod =
  | "cash"
  | "pix"
  | "debit_card"
  | "credit_card"
  | "meal_voucher"
  | "food_voucher"
  | "bank_transfer"
  | "other";

export type FinancialAccount = {
  id: string;
  household_id: string;
  name: string;
  account_type: AccountType;
  institution: string | null;

  owner_user_id: string | null;

  closing_day: number | null;
  due_day: number | null;

  auto_payment: boolean;
  auto_payment_account_id: string | null;

  initial_balance: number;
  current_balance: number;

  is_benefit: boolean;
  is_active: boolean;
};

export type IncomeType =
  | "salary"
  | "meal_voucher"
  | "food_voucher"
  | "bonus"
  | "freelance"
  | "commission"
  | "other";

export type IncomeItem = {
  id: string;

  user_id: string;
  account_id: string | null;

  income_type: IncomeType;

  description: string;

  amount: number;

  received_date: string;

  is_benefit: boolean;
  is_recurring: boolean;

  profile: {
    id: string;
    name: string;
  } | null;

  account: {
    id: string;
    name: string;
  } | null;
};

export type CreditCardInvoiceOption = {
  id: string;
  name: string;

  owner_user_id:
    | string
    | null;

  closing_day:
    | number
    | null;

  due_day:
    | number
    | null;

  auto_payment: boolean;

  auto_payment_account_id:
    | string
    | null;
};

export type CreateCreditCardInvoiceInput = {
  creditCardId: string;
  referenceMonth: string;
  amount: number;
};