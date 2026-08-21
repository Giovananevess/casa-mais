"use client";

import { useState } from "react";
import {
  Loader2,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

import { updateFinancePreferencesAction } from "@/app/(app)/actions/settings";
import { Button } from "@/components/ui/button";

import type {
  FinancePreferences,
} from "@/types/settings";

export function FinancePreferencesCard({
  preferences,
}: {
  preferences:
    FinancePreferences;
}) {
  const [
    autoProcess,
    setAutoProcess,
  ] = useState(
    preferences
      .auto_process_finances
  );

  const [
    separateBenefits,
    setSeparateBenefits,
  ] = useState(
    preferences
      .separate_benefits_from_cash
  );

  const [loading, setLoading] =
    useState(false);

  async function save() {
    setLoading(true);

    const result =
      await updateFinancePreferencesAction(
        {
          autoProcessFinances:
            autoProcess,

          separateBenefitsFromCash:
            separateBenefits,
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
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Settings2 className="size-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Preferências
          </h2>

          <p className="text-sm text-muted-foreground">
            Comportamento automático
            do Casa+.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-start gap-3 rounded-2xl border p-4">
          <input
            type="checkbox"
            className="mt-1"
            checked={autoProcess}
            onChange={(event) =>
              setAutoProcess(
                event.target.checked
              )
            }
          />

          <div>
            <p className="font-medium">
              Processar finanças automaticamente
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Gera receitas recorrentes
              e processa cartões com
              pagamento automático.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border p-4">
          <input
            type="checkbox"
            className="mt-1"
            checked={
              separateBenefits
            }
            onChange={(event) =>
              setSeparateBenefits(
                event.target.checked
              )
            }
          />

          <div>
            <p className="font-medium">
              Separar benefícios do saldo
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              VR e VA não entram
              como dinheiro livre
              no cálculo financeiro.
            </p>
          </div>
        </label>
      </div>

      <Button
        className="mt-5"
        onClick={save}
        disabled={loading}
      >
        {loading && (
          <Loader2 className="animate-spin" />
        )}

        Salvar preferências
      </Button>
    </section>
  );
}