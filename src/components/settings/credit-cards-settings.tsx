"use client";

import { useState } from "react";
import {
  CreditCard,
  Ellipsis,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  updateCreditCardAction,
} from "@/app/(app)/actions/settings";

import {
  CreateAccountDialog,
} from "@/components/finance/create-account-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  FinancialAccount,
} from "@/types/finance";

import type {
  GoalMember,
} from "@/types/goals";

import type {
  SettingsCreditCard,
} from "@/types/settings";

function CardEditor({
  card,
  paymentAccounts,
}: {
  card: SettingsCreditCard;
  paymentAccounts: FinancialAccount[];
}) {
  const [editing, setEditing] =
    useState(false);

  const [closingDay, setClosingDay] =
    useState(
      String(card.closing_day ?? 5)
    );

  const [dueDay, setDueDay] =
    useState(
      String(card.due_day ?? 12)
    );

  const [autoPayment, setAutoPayment] =
    useState(card.auto_payment);

  const [
    paymentAccountId,
    setPaymentAccountId,
  ] = useState(
    card.auto_payment_account_id ?? ""
  );

  const [loading, setLoading] =
    useState(false);

  async function save() {
    setLoading(true);

    const result =
      await updateCreditCardAction({
        cardId: card.id,
        closingDay:
          Number(closingDay),
        dueDay:
          Number(dueDay),
        autoPayment,
        autoPaymentAccountId:
          autoPayment
            ? paymentAccountId || null
            : null,
      });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(
      "Cartão atualizado."
    );

    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
            <CreditCard className="size-5" />
          </div>

          <div>
            <p className="font-semibold">
              {card.name}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cartão de crédito
              {card.owner_name
                ? ` · ${card.owner_name}`
                : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">
              Fecha dia
            </p>

            <p className="mt-1 font-semibold text-violet-600">
              {String(
                card.closing_day ?? "-"
              ).padStart(2, "0")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Vence dia
            </p>

            <p className="mt-1 font-semibold text-blue-600">
              {String(
                card.due_day ?? "-"
              ).padStart(2, "0")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Auto Payment
            </p>

            <span
              className={
                card.auto_payment
                  ? "mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
                  : "mt-1 inline-flex rounded-full bg-muted px-2 py-1 text-xs"
              }
            >
              {card.auto_payment
                ? "Ativo"
                : "Desativado"}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setEditing(true)
          }
        >
          <Ellipsis className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="grid gap-4 sm:grid-cols-2">
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
            o Casa+ considera a fatura
            paga automaticamente.
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

      <div className="mt-5 flex gap-2">
        <Button
          onClick={save}
          disabled={loading}
        >
          {loading && (
            <Loader2 className="animate-spin" />
          )}

          Salvar alterações
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setEditing(false)
          }
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function CreditCardsSettings({
  cards,
  accounts,
  members,
}: {
  cards: SettingsCreditCard[];
  accounts: FinancialAccount[];
  members: GoalMember[];
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Cartões
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Fechamento, vencimento e
            pagamento automático.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus cartões de crédito
            e como as faturas são pagas.
          </p>
        </div>

        <CreateAccountDialog
          members={members}
          existingAccounts={accounts}
          defaultAccountType="credit_card"
          triggerLabel="Novo cartão"
        />
      </div>

      <div className="mt-6 space-y-4">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <CreditCard className="mx-auto size-6 text-muted-foreground" />

            <p className="mt-3 font-medium">
              Nenhum cartão cadastrado
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre seu primeiro cartão
              para controlar as faturas.
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <CardEditor
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