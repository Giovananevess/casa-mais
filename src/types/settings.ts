export type SettingsMember = {
  user_id: string;
  name: string;
  email: string | null;
};

export type SettingsCreditCard = {
  id: string;
  name: string;
  institution: string | null;
  owner_user_id: string | null;

  closing_day: number | null;
  due_day: number | null;

  auto_payment: boolean;
  auto_payment_account_id: string | null;

  payment_account_name: string | null;
  owner_name: string | null;
};

export type RecurringIncomeSetting = {
  id: string;

  user_id: string;
  user_name: string;

  account_id: string | null;
  account_name: string | null;

  income_type: string;
  description: string;

  amount: number;

  day_of_month: number;

  is_benefit: boolean;
  is_active: boolean;
};

export type FinancePreferences = {
  auto_process_finances: boolean;
  separate_benefits_from_cash: boolean;
};

export type SettingsPageData = {
  members: SettingsMember[];
  cards: SettingsCreditCard[];
  recurringIncome: RecurringIncomeSetting[];
  preferences: FinancePreferences;
};