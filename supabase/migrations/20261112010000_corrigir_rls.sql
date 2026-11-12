-- =====================================================================
-- Casa+ · Corrige políticas de acesso (RLS) que deixavam dados abertos
-- para QUALQUER usuário autenticado, de qualquer casa.
--
-- Seguro para rodar mais de uma vez. Não apaga dados.
-- Depende da função public.is_household_member(uuid), que já existe.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. payments: era "true" → qualquer usuário lia, editava e apagava
--    pagamentos de todas as casas. Passa a valer pela casa da conta.
-- ---------------------------------------------------------------------
alter table public.payments enable row level security;
drop policy if exists "Authenticated users can manage payments" on public.payments;
drop policy if exists "Members can manage payments" on public.payments;
create policy "Members can manage payments" on public.payments
  for all to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = payments.expense_id
        and public.is_household_member(e.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = payments.expense_id
        and public.is_household_member(e.household_id)
    )
  );

-- ---------------------------------------------------------------------
-- 2. expense_splits: mesmo problema ("true"). Mesma correção.
-- ---------------------------------------------------------------------
alter table public.expense_splits enable row level security;
drop policy if exists "Authenticated users can manage expense splits" on public.expense_splits;
drop policy if exists "Members can manage expense splits" on public.expense_splits;
create policy "Members can manage expense splits" on public.expense_splits
  for all to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and public.is_household_member(e.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and public.is_household_member(e.household_id)
    )
  );

-- ---------------------------------------------------------------------
-- 3. monthly_settlements: "true" e sem household_id. O app não usa esta
--    tabela; fica restrita a quem é pagador ou recebedor do acerto.
-- ---------------------------------------------------------------------
alter table public.monthly_settlements enable row level security;
drop policy if exists "Authenticated users can manage settlements" on public.monthly_settlements;
drop policy if exists "Participants can manage settlements" on public.monthly_settlements;
create policy "Participants can manage settlements" on public.monthly_settlements
  for all to authenticated
  using ((select auth.uid()) in (payer_id, receiver_id))
  with check ((select auth.uid()) in (payer_id, receiver_id));

-- ---------------------------------------------------------------------
-- 4. money_boxes: não tinha nenhuma política listada. Garante RLS ligado
--    e acesso só aos membros da casa.
-- ---------------------------------------------------------------------
alter table public.money_boxes enable row level security;
drop policy if exists "Members can manage money boxes" on public.money_boxes;
create policy "Members can manage money boxes" on public.money_boxes
  for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- ---------------------------------------------------------------------
-- 5. categories: "true" → via-se as categorias personalizadas de todas
--    as casas. Agora: globais (household_id nulo) + as da própria casa.
-- ---------------------------------------------------------------------
drop policy if exists "Authenticated users can view categories" on public.categories;
drop policy if exists "Members can view categories" on public.categories;
create policy "Members can view categories" on public.categories
  for select to authenticated
  using (household_id is null or public.is_household_member(household_id));

-- ---------------------------------------------------------------------
-- 6. profiles: "true" → qualquer usuário via nome e foto de todos.
--    Agora: o próprio perfil + o de quem mora na mesma casa.
-- ---------------------------------------------------------------------
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can view housemates profiles" on public.profiles;
create policy "Users can view housemates profiles" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.household_members other
      where other.user_id = profiles.id
        and public.is_household_member(other.household_id)
    )
  );

-- ---------------------------------------------------------------------
-- 7. Garante RLS ligado em todas as tabelas do app (sem efeito nas que
--    já estão; trava qualquer tabela que tenha ficado aberta).
-- ---------------------------------------------------------------------
alter table public.accounts enable row level security;
alter table public.attachments enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.goal_history enable row level security;
alter table public.goals enable row level security;
alter table public.household_finance_settings enable row level security;
alter table public.household_members enable row level security;
alter table public.households enable row level security;
alter table public.income enable row level security;
alter table public.money_box_transactions enable row level security;
alter table public.profiles enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.recurring_income enable row level security;

-- Índice para a checagem por conta usada em payments/expense_splits.
create index if not exists payments_expense_idx on public.payments (expense_id);
create index if not exists expense_splits_expense_idx on public.expense_splits (expense_id);
create index if not exists household_members_user_idx on public.household_members (user_id);

commit;
