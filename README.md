# Casa+

Controle financeiro compartilhado para a casa: contas a pagar, parcelamentos,
faturas de cartão, receitas, metas, caixinhas e um painel com o resumo do mês,
tudo dividido entre os moradores.

## Funcionalidades

- **Dashboard**: saldo, total pago e pendente, economia do mês comparada ao mês anterior, tendência de 6 meses, próximos vencimentos, quanto cada pessoa pagou, linha do tempo e insights automáticos.
- **Contas**: contas fixas, variáveis, parceladas e recorrentes, com divisão igual ou individual, comprovantes anexados (PDF ou imagem) e fatura de cartão de crédito.
- **Calendário**: vencimentos do mês em grade semanal.
- **Histórico**: filtros por período, situação, categoria, pessoa e tipo, gráficos por categoria e exportação em CSV pronta para o Excel.
- **Receitas**: salário, vales e extras, inclusive recorrentes.
- **Contas financeiras e cartões**: saldos, dia de fechamento e vencimento, débito automático da fatura.
- **Metas e caixinhas**: aportes, progresso, previsão de conclusão e dinheiro reservado.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions, Turbopack)
- React 19, TypeScript, Tailwind CSS 4, componentes shadcn/Base UI
- [Supabase](https://supabase.com) (Postgres, Auth, Storage e RLS)
- zod (validação), react-hook-form, Recharts, date-fns
- Vitest (testes), ESLint e Prettier

## Rodando localmente

Requisitos: Node 20.9 ou mais recente e um projeto no Supabase com o schema do app.
Veja [`supabase/README.md`](supabase/README.md).

```bash
npm install
cp .env.example .env.local   # preencha URL e publishable key do Supabase
npm run dev
```

Acesse http://localhost:3000. Usuários são criados pelo Supabase Auth e
precisam estar em `household_members` para acessar o app.

## Scripts

| Comando                | O que faz                              |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | servidor de desenvolvimento            |
| `npm run build`        | build de produção                      |
| `npm run check`        | typecheck, lint e testes               |
| `npm test`             | testes unitários (Vitest)              |
| `npm run format`       | formata o código com Prettier          |

O CI (`.github/workflows/ci.yml`) roda formatação, typecheck, lint, testes e build a cada PR.

## Arquitetura

```
src/
├── app/
│   ├── (auth)/login            # tela pública
│   ├── (app)/                  # área autenticada (layout valida sessão e casa)
│   │   ├── actions/            # Server Actions (mutations)
│   │   ├── dashboard, contas, calendario, historico, receitas,
│   │   │   contas-financeiras, caixinhas, metas, configuracoes
│   │   └── error.tsx, loading.tsx
│   └── not-found.tsx
├── components/                 # UI por domínio + components/ui (shadcn)
├── services/                   # leituras no servidor (Server Components)
├── lib/
│   ├── auth/session.ts         # getSessionContext(): usuário + casa (cache por request)
│   ├── auth/ownership.ts       # checagens "este ID é da minha casa?"
│   ├── actions.ts              # withSession, ok/fail/invalid, dbError
│   ├── dates.ts                # datas no fuso America/Sao_Paulo
│   ├── revalidate.ts           # revalidação de rotas por área
│   └── validations/            # schemas zod
├── types/
└── proxy.ts                    # refresh da sessão e redirecionamentos
```

### Convenções

- **Leituras** ficam em `src/services` e usam `getSessionContext()`, que já resolve o usuário e a casa.
- **Escritas** são Server Actions em `src/app/(app)/actions` e seguem sempre o mesmo fluxo: validar com zod → `withSession` → checar a posse dos IDs vindos do cliente → gravar → `revalidateAreas(...)` → `ok()` ou `fail()`.
- O `household_id` **nunca** vem do navegador: ele sai sempre da sessão.
- Erros do banco passam por `dbError()`, que mostra ao usuário só mensagens seguras.
- Datas de calendário são strings `YYYY-MM-DD` e "hoje" vem de `todayISO()`. Não use `new Date().toISOString().slice(0, 10)`, que calcula o dia em UTC.
