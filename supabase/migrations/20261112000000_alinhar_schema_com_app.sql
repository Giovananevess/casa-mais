-- =====================================================================
-- Casa+ · Alinha o schema com o que o app envia e adiciona proteções.
--
-- Seguro para rodar mais de uma vez. Não apaga dados. Passos que
-- dependem do estado dos dados (unicidade, NOT NULL) só são aplicados
-- se os dados permitirem; caso contrário emitem um NOTICE explicando.
--
-- Rode no SQL Editor do Supabase (ou `npx supabase db push`).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Tipos de conta: o app oferece Vale-refeição e Vale-alimentação,
--    mas o CHECK atual rejeita esses valores (erro 23514 ao criar).
-- ---------------------------------------------------------------------
alter table public.accounts drop constraint if exists accounts_account_type_check;
alter table public.accounts add constraint accounts_account_type_check
  check (account_type = any (array[
    'checking', 'savings', 'credit_card', 'cash', 'investment', 'other',
    'meal_voucher', 'food_voucher'
  ]::text[]));

-- ---------------------------------------------------------------------
-- 2. Tipos de receita: o app envia meal_voucher, food_voucher e
--    commission, que o CHECK atual não aceita.
-- ---------------------------------------------------------------------
alter table public.income drop constraint if exists income_income_type_check;
alter table public.income add constraint income_income_type_check
  check (income_type = any (array[
    'salary', 'freelance', 'bonus', 'refund', 'investment', 'other',
    'meal_voucher', 'food_voucher', 'commission'
  ]::text[]));

alter table public.recurring_income drop constraint if exists recurring_income_income_type_check;
alter table public.recurring_income add constraint recurring_income_income_type_check
  check (income_type = any (array[
    'salary', 'freelance', 'bonus', 'refund', 'investment', 'other',
    'meal_voucher', 'food_voucher', 'commission'
  ]::text[])) not valid; -- tabela não tinha CHECK: vale só para novas linhas

-- Dias de cartão sempre válidos.
alter table public.accounts drop constraint if exists accounts_card_days_check;
alter table public.accounts add constraint accounts_card_days_check
  check (
    (closing_day is null or closing_day between 1 and 31)
    and (due_day is null or due_day between 1 and 31)
  ) not valid;

-- ---------------------------------------------------------------------
-- 3. Categorias: hoje o nome é único no banco inteiro, então duas casas
--    não conseguem ter "Mercado". Passa a ser único por casa (as
--    categorias globais, com household_id nulo, continuam únicas entre si).
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from public.categories
    group by household_id, lower(name) having count(*) > 1
  ) then
    raise notice 'categories: há nomes repetidos na mesma casa; unicidade por casa NÃO alterada.';
  else
    alter table public.categories drop constraint if exists categories_name_key;
    create unique index if not exists categories_household_name_key
      on public.categories (
        coalesce(household_id, '00000000-0000-0000-0000-000000000000'::uuid),
        lower(name)
      );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 4. Membros: o app assume uma casa por usuário (getSessionContext usa
--    maybeSingle). Um segundo vínculo derrubaria todas as páginas.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from public.household_members
    group by household_id, user_id having count(*) > 1
  ) then
    create unique index if not exists household_members_household_user_key
      on public.household_members (household_id, user_id);
  end if;

  if exists (
    select 1 from public.household_members group by user_id having count(*) > 1
  ) then
    raise notice 'household_members: há usuários em mais de uma casa; índice único por usuário NÃO criado.';
  else
    create unique index if not exists household_members_user_key
      on public.household_members (user_id);
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 5. Toda conta precisa pertencer a uma casa (o RLS depende disso).
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from public.expenses where household_id is null) then
    raise notice 'expenses: existem linhas sem household_id; NOT NULL NÃO aplicado. Corrija-as e rode de novo.';
  else
    alter table public.expenses alter column household_id set not null;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. Índices. O Postgres não indexa chaves estrangeiras sozinho, e todas
--    as telas filtram por casa + data.
-- ---------------------------------------------------------------------
create index if not exists expenses_household_due_date_idx
  on public.expenses (household_id, due_date desc);
create index if not exists expenses_household_status_idx
  on public.expenses (household_id, status);
create index if not exists expenses_installment_group_idx
  on public.expenses (installment_group_id) where installment_group_id is not null;
create index if not exists expenses_recurring_expense_idx
  on public.expenses (recurring_expense_id) where recurring_expense_id is not null;
create index if not exists expenses_credit_card_idx
  on public.expenses (credit_card_id) where credit_card_id is not null;

create index if not exists income_household_date_idx
  on public.income (household_id, income_date desc);
create index if not exists accounts_household_idx
  on public.accounts (household_id) where is_active;
create index if not exists attachments_expense_idx
  on public.attachments (expense_id);
create index if not exists attachments_household_path_idx
  on public.attachments (household_id, file_path);
create index if not exists payments_expense_idx
  on public.payments (expense_id);
create index if not exists expense_splits_expense_idx
  on public.expense_splits (expense_id);
create index if not exists goals_household_idx
  on public.goals (household_id);
create index if not exists goal_contributions_goal_idx
  on public.goal_contributions (goal_id, contribution_date desc);
create index if not exists goal_history_goal_idx
  on public.goal_history (goal_id, created_at desc);
create index if not exists money_boxes_household_idx
  on public.money_boxes (household_id);
create index if not exists money_box_transactions_box_idx
  on public.money_box_transactions (money_box_id, transaction_date desc);
create index if not exists recurring_expenses_household_idx
  on public.recurring_expenses (household_id) where is_active;
create index if not exists recurring_income_household_idx
  on public.recurring_income (household_id) where is_active;

commit;
