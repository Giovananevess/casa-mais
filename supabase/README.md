# Banco de dados (Supabase)

| Arquivo                                            | O que é                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `schema.sql`                                       | Referência das tabelas do schema `public` (exportado em 2026-11-12). Só leitura, não execute.    |
| `migrations/20261112000000_alinhar_schema_com_app.sql` | Corrige incompatibilidades entre banco e app e adiciona índices. **Precisa ser aplicada.**   |

Ainda faltam no repositório as **políticas de RLS, as funções (RPC), os triggers
e as políticas de storage**. Veja "Exportar o que falta" abaixo.

## Aplicar a migration

No painel do Supabase, em **SQL Editor**, cole o conteúdo do arquivo da migration
e rode. Ela:

1. Aceita `meal_voucher` e `food_voucher` em `accounts.account_type`. Sem isso,
   criar conta de Vale-refeição ou Vale-alimentação falha.
2. Aceita `meal_voucher`, `food_voucher` e `commission` em `income.income_type`
   e `recurring_income.income_type`. Sem isso, cadastrar essas receitas falha.
3. Torna o nome da categoria único **por casa** (antes era único no banco
   inteiro, então duas casas não podiam ter "Mercado").
4. Garante um vínculo por usuário em `household_members`, que é o que o app assume.
5. Torna `expenses.household_id` obrigatório, já que o RLS depende dele.
6. Cria índices para as consultas por casa e por data.

É segura para rodar mais de uma vez e não apaga dados. Se os dados atuais
impedirem os passos 3 a 5, ela pula esses passos e mostra um `NOTICE` dizendo o que corrigir.

## Exportar o que falta

Rode no SQL Editor e salve o resultado para versionar ou revisar.

Políticas de RLS:

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by tablename, policyname;
```

Tabelas sem RLS ativo:

```sql
select tablename from pg_tables where schemaname = 'public' and not rowsecurity;
```

Definição das funções:

```sql
select p.proname, p.prosecdef as security_definer, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
```

Se tiver a [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started),
um único comando exporta tudo:

```bash
npx supabase db dump --schema public,storage -f supabase/schema.sql
```

## Observações sobre o schema atual

- `expense_splits`, `monthly_settlements` e `recurring_expenses` não são lidas
  diretamente pelo app (`recurring_expenses` provavelmente é usada pelas RPCs de
  recorrência). `monthly_settlements` **não tem `household_id`**: se um dia for
  usada, precisa ganhar essa coluna para o RLS isolar as casas.
- Colunas duplicadas ou legadas: `accounts.owner_id` e `owner_user_id`,
  `income.received_by` e `user_id`, `income.income_date` e `received_date`,
  `expenses.receipt_path`, que foi substituída pela tabela `attachments`.
  Vale consolidar depois de confirmar quais as RPCs usam.
- Nenhuma chave estrangeira tem `on delete`. Excluir uma conta depende das RPCs
  removerem antes os anexos, pagamentos e divisões.

## Contrato esperado pelo app

Levantado a partir do código (`src/services`, `src/app/(app)/actions`).

### Tabelas

`households` · `household_members` · · `profiles` · `categories` · `accounts` ·
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

Funções `security definer` sem `search_path` fixo:

```sql
select p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and not exists (
    select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'
  );
```
