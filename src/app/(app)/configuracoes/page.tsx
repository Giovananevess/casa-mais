import { CreditCardsSettings } from "@/components/settings/credit-cards-settings";
import { FinancePreferencesCard } from "@/components/settings/finance-preferences";
import { HouseholdMembersCard } from "@/components/settings/household-members-card";
import { RecurringIncomeSettings } from "@/components/settings/recurring-income-settings";

import { getFinancialAccounts } from "@/services/finance";
import { getSettingsPageData } from "@/services/settings";

export default async function SettingsPage() {
  const [
    settings,
    accounts,
  ] = await Promise.all([
    getSettingsPageData(),
    getFinancialAccounts(),
  ]);

  return (
    <div className="space-y-8 pb-8">
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
      />

      <RecurringIncomeSettings
        income={
          settings.recurringIncome
        }
      />
    </div>
  );
}