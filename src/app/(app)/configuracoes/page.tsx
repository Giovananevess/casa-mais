import {
  CreditCardsSettings,
} from "@/components/settings/credit-cards-settings";

import {
  CreditCardHelp,
} from "@/components/settings/credit-card-help";

import {
  FinancePreferencesCard,
} from "@/components/settings/finance-preferences";

import {
  HouseholdMembersCard,
} from "@/components/settings/household-members-card";

import {
  RecurringIncomeSettings,
} from "@/components/settings/recurring-income-settings";

import {
  getFinancialAccounts,
} from "@/services/finance";

import {
  getSettingsPageData,
} from "@/services/settings";

import {
  getGoalMembers,
} from "@/services/goals";

export default async function SettingsPage() {
  const [
    settings,
    accounts,
    members,
  ] = await Promise.all([
    getSettingsPageData(),
    getFinancialAccounts(),
    getGoalMembers(),
  ]);

  return (
    <div className="space-y-8 pb-10">
      <section>
        <p className="text-sm font-medium text-primary">
          Casa+
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Configurações
        </h1>

        <p className="mt-2 text-muted-foreground">
          Pessoas, cartões,
          receitas recorrentes e
          preferências financeiras.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <HouseholdMembersCard
          members={
            settings.members
          }
        />

        <FinancePreferencesCard
          preferences={
            settings.preferences
          }
        />
      </div>

      <CreditCardsSettings
        cards={settings.cards}
        accounts={accounts}
        members={members}
      />

      <CreditCardHelp />

      <RecurringIncomeSettings
        income={
          settings.recurringIncome
        }
      />
    </div>
  );
}