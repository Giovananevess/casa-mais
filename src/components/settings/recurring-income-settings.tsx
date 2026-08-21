"use client";

import { useState } from "react";
import {
  Banknote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { updateRecurringIncomeAction } from "@/app/(app)/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";

import type {
  RecurringIncomeSetting,
} from "@/types/settings";

function parseCurrency(
  value: string
) {
  const parsed = Number(
    value
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function IncomeRow({
  income,
}: {
  income:
    RecurringIncomeSetting;
}) {
  const [amount, setAmount] =
    useState(
      income.amount
        .toFixed(2)
        .replace(".", ",")
    );

  const [day, setDay] =
    useState(
      String(
        income.day_of_month
      )
    );

  const [active, setActive] =
    useState(
      income.is_active
    );

  const [loading, setLoading] =
    useState(false);

  async function save() {
    setLoading(true);

    const result =
      await updateRecurringIncomeAction({
        recurringIncomeId:
          income.id,

        amount:
          parseCurrency(amount),

        dayOfMonth:
          Number(day),

        isActive: active,
      });

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
          <Banknote className="size-4" />
        </div>

        <div>
          <p className="font-semibold">
            {income.description}
          </p>

          <p className="text-sm text-muted-foreground">
            {income.user_name}

            {income.account_name
              ? ` · ${income.account_name}`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Valor mensal
          </label>

          <Input
            className="mt-2"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Atual:{" "}
            {formatCurrency(
              income.amount
            )}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">
            Dia do recebimento
          </label>

          <Input
            className="mt-2"
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(event) =>
              setDay(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) =>
            setActive(
              event.target.checked
            )
          }
        />

        <span className="text-sm">
          Recorrência ativa
        </span>
      </label>

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

export function RecurringIncomeSettings({
  income,
}: {
  income:
    RecurringIncomeSetting[];
}) {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="text-lg font-semibold">
        Receitas recorrentes
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Salários e benefícios
        gerados todos os meses.
      </p>

      <div className="mt-6 space-y-4">
        {income.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma receita recorrente.
          </p>
        ) : (
          income.map((item) => (
            <IncomeRow
              key={item.id}
              income={item}
            />
          ))
        )}
      </div>
    </section>
  );
}