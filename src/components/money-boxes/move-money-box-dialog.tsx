"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  moveMoneyBoxAction,
} from "@/app/(app)/actions/money-boxes";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
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

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCurrency(
  value: string
) {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function MoveMoneyBoxDialog({
  moneyBoxId,
  type,
  members,
  accounts,
}: {
  moneyBoxId: string;

  type:
  | "deposit"
  | "withdrawal";

  members: GoalMember[];

  accounts: FinancialAccount[];
}) {
  const router = useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    userId,
    setUserId,
  ] = useState(
    members[0]?.user_id ?? ""
  );

  const [
    accountId,
    setAccountId,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState(
    getToday()
  );

  const isDeposit =
    type === "deposit";

  const availableAccounts =
    accounts.filter(
      (account) =>
        account.account_type ===
        "checking" ||
        account.account_type ===
        "savings" ||
        account.account_type ===
        "cash"
    );

  function resetForm() {
    setUserId(
      members[0]?.user_id ?? ""
    );

    setAccountId("");
    setAmount("");
    setDescription("");

    setDate(
      getToday()
    );
  }

  function handleOpenChange(
    value: boolean
  ) {
    setOpen(value);

    if (!value) {
      resetForm();
    }
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!userId) {
      toast.error(
        "Selecione a pessoa."
      );
      return;
    }

    const parsedAmount =
      parseCurrency(amount);

    if (parsedAmount <= 0) {
      toast.error(
        "Informe um valor válido."
      );
      return;
    }

    if (!date) {
      toast.error(
        "Informe a data."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        "[CAIXINHA] movimentação:",
        {
          moneyBoxId,
          userId,
          accountId:
            accountId || null,
          type,
          amount:
            parsedAmount,
          date,
        }
      );

      const result =
        await moveMoneyBoxAction({
          moneyBoxId,

          userId,

          accountId:
            accountId ||
            null,

          transactionType:
            type,

          amount:
            parsedAmount,

          description:
            description.trim() ||
            null,

          transactionDate:
            date,
        });

      console.log(
        "[CAIXINHA] resultado movimentação:",
        result
      );

      if (!result.success) {
        toast.error(
          result.message
        );
        return;
      }

      toast.success(
        result.message
      );

      setOpen(false);
      resetForm();

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao movimentar caixinha:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível movimentar a caixinha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={
          isDeposit
            ? "default"
            : "outline"
        }
        onClick={() =>
          setOpen(true)
        }
      >
        {isDeposit ? (
          <ArrowDownLeft className="size-4" />
        ) : (
          <ArrowUpRight className="size-4" />
        )}

        {isDeposit
          ? "Adicionar"
          : "Retirar"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isDeposit
                ? "Adicionar dinheiro"
                : "Retirar dinheiro"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>
                Pessoa
              </Label>

              <select
                value={userId}
                onChange={(
                  event
                ) =>
                  setUserId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
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
                {isDeposit
                  ? "Saiu de"
                  : "Enviar para"}
              </Label>

              <select
                value={
                  accountId
                }
                onChange={(
                  event
                ) =>
                  setAccountId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
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
                Valor
              </Label>

              <Input
                value={amount}
                onChange={(
                  event
                ) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="Ex.: 5.000,00"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Data
              </Label>

              <Input
                type="date"
                value={date}
                onChange={(
                  event
                ) =>
                  setDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Observação
              </Label>

              <Input
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Opcional"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Processando...
                </>
              ) : isDeposit ? (
                "Adicionar à caixinha"
              ) : (
                "Confirmar retirada"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}