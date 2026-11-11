# Banco de dados (Supabase)

O schema do banco **ainda não está versionado** neste repositório. Isso é a
próxima prioridade: sem ele, não dá para recriar o projeto do zero nem
revisar as políticas de segurança (RLS) junto com o código.

## Como versionar o schema atual

Com a [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started):

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db dump --schema public,storage -f supabase/schema.sql
```

Depois disso, novas mudanças devem virar migrations
(`npx supabase migration new nome-da-mudanca`).

## Contrato esperado pelo app

Levantado a partir do código (`src/services`, `src/app/(app)/actions`).

### Tabelas

`household_members` (e a tabela de casas que ela referencia) · · `profiles` · `categories` · `accounts` ·
`expenses` · `payments` · `attachments` · `income` · `recurring_income` ·
`household_finance_settings` · `goals` · `goal_contributions` · `goal_history` ·
`money_boxes` · `money_box_transactions`

Toda tabela com `household_id` **precisa** de RLS limitando leitura e escrita
aos membros da casa (`household_members.user_id = auth.uid()`).

### Funções (RPC)

| Domínio    | Funções                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contas     | `create_household_expense`, `update_household_expense`, `set_expense_status`, `cancel_household_expense`, `delete_household_expense`, `create_installment_expenses`, `create_recurring_expense`, `generate_recurring_expenses` |
| Cartões    | `create_credit_card_invoice`, `process_credit_card_auto_payments`                                                                                                                                  |
| Receitas   | `create_household_income`, `create_recurring_income`, `generate_recurring_incomes`                                                                                                                 |
| Metas      | `create_household_goal`, `update_household_goal`, `cancel_household_goal`, `delete_household_goal`, `add_goal_contribution`, `delete_goal_contribution`                                             |
| Caixinhas  | `move_money_box`                                                                                                                                                                                   |
| Dashboard  | `get_dashboard_summary`                                                                                                                                                                            |

Funções `security definer` devem validar internamente que os IDs recebidos
pertencem à casa de `auth.uid()` e definir `set search_path = public`.
Mensagens de erro para o usuário devem usar `raise exception` (código `P0001`),
que o app repassa como estão; os demais erros viram mensagens genéricas.

### Storage

Bucket privado `receipts`, com arquivos em `{household_id}/{expense_id}/{arquivo}`.
A política de storage deve permitir acesso apenas quando o primeiro segmento do
caminho for a casa do usuário, por exemplo:

```sql
(storage.foldername(name))[1] in (
  select household_id::text from public.household_members where user_id = auth.uid()
)
```

## Checklist de segurança

Rode no SQL Editor para ver tabelas do schema `public` **sem** RLS ativo:

```sql
select tablename from pg_tables
where schemaname = 'public' and not rowsecurity;
```

E funções `security definer` sem `search_path` fixo:

```sql
select p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and not exists (
    select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'
  );
```
