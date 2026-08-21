"use client";

import {
  useState,
} from "react";
import {
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { updateCreditCardAction } from "@/app/(app)/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  FinancialAccount,
} from "@/types/finance";

import type {
  SettingsCreditCard,
} from "@/types/settings";

function CreditCardRow({
  card,
  paymentAccounts,
}: {
  card: SettingsCreditCard;

  paymentAccounts:
    FinancialAccount[];
}) {
  const [
    closingDay,
    setClosingDay,
  ] = useState(
    String(
      card.closing_day ?? 1
    )
  );

  const [
    dueDay,
    setDueDay,
  ] = useState(
    String(card.due_day ?? 10)
  );

  const [
    autoPayment,
    setAutoPayment,
  ] = useState(
    card.auto_payment
  );

  const [
    paymentAccountId,
    setPaymentAccountId,
  ] = useState(
    card.auto_payment_account_id ??
      ""
  );

  const [loading, setLoading] =
    useState(false);

  async function save() {
    setLoading(true);

    const result =
      await updateCreditCardAction(
        {
          cardId: card.id,

          closingDay:
            Number(closingDay),

          dueDay:
            Number(dueDay),

          autoPayment,

          autoPaymentAccountId:
            autoPayment
              ? paymentAccountId ||
                null
              : null,
        }
      );

    setLoading(false);

    if (!result.success) {
      toast.error(
        result.message
      );
      return;
    }

    toast.success(
      result.message
    );
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="size-4" />
        </div>

        <div>
          <p className="font-semibold">
            {card.name}
          </p>

          <p className="text-sm text-muted-foreground">
            {card.owner_name ??
              "Sem responsável"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Fecha dia
          </label>

          <Input
            className="mt-2"
            type="number"
            min={1}
            max={31}
            value={closingDay}
            onChange={(event) =>
              setClosingDay(
                event.target.value
              )
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Vence dia
          </label>

          <Input
            className="mt-2"
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(event) =>
              setDueDay(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          checked={autoPayment}
          onChange={(event) =>
            setAutoPayment(
              event.target.checked
            )
          }
          className="mt-1"
        />

        <div>
          <p className="text-sm font-medium">
            Pagamento automático
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Depois do vencimento,
            o Casa+ considera a
            fatura paga automaticamente.
          </p>
        </div>
      </label>

      {autoPayment && (
        <div className="mt-4">
          <label className="text-sm font-medium">
            Conta usada para pagar
          </label>

          <select
            value={paymentAccountId}
            onChange={(event) =>
              setPaymentAccountId(
                event.target.value
              )
            }
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">
              Selecione...
            </option>

            {paymentAccounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              )
            )}
          </select>
        </div>
      )}

      <Button
        className="mt-5"
        onClick={save}
        disabled={loading}
      >
        {loading && (
          <Loader2 className="animate-spin" />
        )}

        Salvar alterações
      </Button>
    </div>
  );
}

export function CreditCardsSettings({
  cards,
  accounts,
}: {
  cards: SettingsCreditCard[];

  accounts:
    FinancialAccount[];
}) {
  const paymentAccounts =
    accounts.filter(
      (account) =>
        account.account_type ===
          "checking" ||
        account.account_type ===
          "savings"
    );

  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="text-lg font-semibold">
        Cartões
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Fechamento, vencimento
        e pagamento automático.
      </p>

      <div className="mt-6 space-y-4">
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum cartão cadastrado.
          </p>
        ) : (
          cards.map((card) => (
            <CreditCardRow
              key={card.id}
              card={card}
              paymentAccounts={
                paymentAccounts
              }
            />
          ))
        )}
      </div>
    </section>
  );
}