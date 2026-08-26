import {
  CalendarDays,
  CreditCard,
  Landmark,
  ShieldCheck,
} from "lucide-react";

export function CreditCardHelp() {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <CreditCard className="size-5" />

        <h2 className="text-xl font-semibold">
          Entenda como funciona o cartão
        </h2>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
            <CalendarDays className="size-5" />
          </div>

          <h3 className="mt-3 font-semibold">
            1. Fechamento
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            As compras até o dia do
            fechamento entram na fatura
            daquele ciclo.
          </p>

          <span className="mt-3 inline-block rounded-lg bg-violet-500/10 px-2 py-1 text-xs text-violet-700">
            Ex.: fecha dia 05
          </span>
        </div>

        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <CalendarDays className="size-5" />
          </div>

          <h3 className="mt-3 font-semibold">
            2. Vencimento
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            A fatura vence no dia
            configurado para o cartão.
          </p>

          <span className="mt-3 inline-block rounded-lg bg-blue-500/10 px-2 py-1 text-xs text-blue-700">
            Ex.: vence dia 12
          </span>
        </div>

        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="size-5" />
          </div>

          <h3 className="mt-3 font-semibold">
            3. Auto Payment
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Quando estiver ativo,
            o Casa+ baixa a fatura
            automaticamente no dia
            seguinte ao vencimento.
          </p>

          <span className="mt-3 inline-block rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700">
            Ex.: vence 12 → paga 13
          </span>
        </div>

        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Landmark className="size-5" />
          </div>

          <h3 className="mt-3 font-semibold">
            4. Conta pagadora
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            O valor da fatura é
            descontado da conta escolhida
            para pagar o cartão.
          </p>

          <span className="mt-3 inline-block rounded-lg bg-amber-500/10 px-2 py-1 text-xs text-amber-700">
            Ex.: Conta da casa
          </span>
        </div>
      </div>

      <div className="mt-7 border-t pt-5 text-center text-sm text-muted-foreground">
        O Casa+ cuida do ciclo automaticamente
        para vocês não precisarem lembrar
        de marcar a fatura como paga.
      </div>
    </section>
  );
}