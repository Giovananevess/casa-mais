"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { createIncomeAction } from "@/app/(app)/actions/finance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  FinancialAccount,
} from "@/types/finance";

import type {
  GoalMember,
} from "@/types/goals";

function getToday() {
  const now = new Date();

  return new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, 10);
}

function parseCurrency(
  value: string
) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function CreateIncomeDialog({
  accounts,
  members,
}: {
  accounts: FinancialAccount[];
  members: GoalMember[];
}) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [userId, setUserId] =
    useState(
      members[0]?.user_id ?? ""
    );

  const [
    incomeType,
    setIncomeType,
  ] = useState("salary");

  const [
    description,
    setDescription,
  ] = useState("Salário");

  const [amount, setAmount] =
    useState("");

  const [accountId, setAccountId] =
    useState("");

  const [
    receivedDate,
    setReceivedDate,
  ] = useState(getToday());

  const [recurring, setRecurring] =
    useState(true);

  const availableAccounts =
    accounts.filter((account) => {
      if (
        incomeType === "meal_voucher"
      ) {
        return (
          account.account_type ===
          "meal_voucher"
        );
      }

      if (
        incomeType === "food_voucher"
      ) {
        return (
          account.account_type ===
          "food_voucher"
        );
      }

      return [
        "checking",
        "savings",
        "cash",
      ].includes(
        account.account_type
      );
    });

  function handleTypeChange(
    value: string
  ) {
    setIncomeType(value);
    setAccountId("");

    if (value === "salary") {
      setDescription("Salário");
    }

    if (
      value === "meal_voucher"
    ) {
      setDescription(
        "Vale-refeição"
      );
    }

    if (
      value === "food_voucher"
    ) {
      setDescription(
        "Vale-alimentação"
      );
    }

    if (value === "bonus") {
      setDescription("Bônus");
    }

    if (
      value === "freelance"
    ) {
      setDescription("Freelance");
    }

    if (
      value === "commission"
    ) {
      setDescription("Comissão");
    }

    if (value === "other") {
      setDescription("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    const result =
      await createIncomeAction({
        userId,

        accountId:
          accountId || null,

        incomeType,

        description,

        amount:
          parseCurrency(amount),

        receivedDate,

        recurring,

        dayOfMonth: Number(
          receivedDate.slice(8, 10)
        ),
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

    setAmount("");
    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        onClick={() =>
          setOpen(true)
        }
      >
        <Plus />
        Nova receita
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Banknote className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Nova receita
            </DialogTitle>

            <DialogDescription>
              Registre salários,
              benefícios e outras
              entradas da casa.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-3 space-y-5"
          >
            <div className="space-y-2">
              <Label>
                Quem recebeu
              </Label>

              <select
                value={userId}
                onChange={(event) =>
                  setUserId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {members.map(
                  (member) => (
                    <option
                      key={
                        member.user_id
                      }
                      value={
                        member.user_id
                      }
                    >
                      {member.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Tipo de receita
              </Label>

              <select
                value={incomeType}
                onChange={(event) =>
                  handleTypeChange(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="salary">
                  Salário
                </option>

                <option value="meal_voucher">
                  Vale-refeição
                </option>

                <option value="food_voucher">
                  Vale-alimentação
                </option>

                <option value="bonus">
                  Bônus
                </option>

                <option value="freelance">
                  Freelance
                </option>

                <option value="commission">
                  Comissão
                </option>

                <option value="other">
                  Outros
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Descrição
              </Label>

              <Input
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Ex.: Salário agosto"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>

              <Input
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="4.500,00"
                inputMode="decimal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Conta destino
              </Label>

              <select
                value={accountId}
                onChange={(event) =>
                  setAccountId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">
                  Sem conta
                </option>

                {availableAccounts.map(
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

            <div className="space-y-2">
              <Label>
                Data de recebimento
              </Label>

              <Input
                type="date"
                value={receivedDate}
                onChange={(event) =>
                  setReceivedDate(
                    event.target.value
                  )
                }
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border p-4">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(event) =>
                  setRecurring(
                    event.target
                      .checked
                  )
                }
                className="mt-1"
              />

              <div>
                <p className="text-sm font-medium">
                  Repetir todo mês
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Ideal para salário,
                  vale-refeição e
                  vale-alimentação.
                </p>
              </div>
            </label>

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Banknote />
                    Salvar receita
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}