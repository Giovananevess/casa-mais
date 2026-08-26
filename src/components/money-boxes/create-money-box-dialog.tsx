"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  PiggyBank,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import {
  createMoneyBoxAction,
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
  GoalMember,
} from "@/types/goals";

type GoalOption = {
  id: string;
  title: string;
};

type CreateMoneyBoxDialogProps = {
  members: GoalMember[];
  goals: GoalOption[];
};

function parseCurrency(
  value: string
): number | null {
  if (!value.trim()) {
    return null;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(
    normalized
  );

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

export function CreateMoneyBoxDialog({
  members,
  goals,
}: CreateMoneyBoxDialogProps) {
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
    name,
    setName,
  ] = useState("");

  const [
    ownerUserId,
    setOwnerUserId,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    targetAmount,
    setTargetAmount,
  ] = useState("");

  const [
    goalId,
    setGoalId,
  ] = useState("");

  function resetForm() {
    setName("");
    setOwnerUserId("");
    setDescription("");
    setTargetAmount("");
    setGoalId("");
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

    console.log(
      "[CAIXINHA] submit disparado"
    );

    if (!name.trim()) {
      toast.error(
        "Informe o nome da caixinha."
      );
      return;
    }

    let amount: number | null =
      null;

    if (targetAmount.trim()) {
      amount =
        parseCurrency(
          targetAmount
        );

      if (amount === null) {
        toast.error(
          "Informe um valor-alvo válido."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name:
          name.trim(),

        ownerUserId:
          ownerUserId || null,

        description:
          description.trim() ||
          null,

        targetAmount:
          amount,

        goalId:
          goalId || null,
      };

      console.log(
        "[CAIXINHA] payload:",
        payload
      );

      const result =
        await createMoneyBoxAction(
          payload
        );

      console.log(
        "[CAIXINHA] resultado:",
        result
      );

      if (!result.success) {
        toast.error(
          result.message
        );
        return;
      }

      toast.success(
        result.message ||
        "Caixinha criada com sucesso."
      );

      setOpen(false);
      resetForm();

      router.refresh();
    } catch (error) {
      console.error(
        "[CAIXINHA] erro inesperado:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a caixinha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() =>
          setOpen(true)
        }
      >
        <Plus className="size-4" />

        Nova caixinha
      </Button>

      <Dialog
        open={open}
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PiggyBank className="size-5" />
            </div>

            <DialogTitle>
              Nova caixinha
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>
                Nome
              </Label>

              <Input
                placeholder="Ex.: Reserva de Emergência"
                value={name}
                onChange={(
                  event
                ) =>
                  setName(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Responsável
              </Label>

              <select
                value={
                  ownerUserId
                }
                onChange={(
                  event
                ) =>
                  setOwnerUserId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="">
                  Compartilhada
                </option>

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
                Descrição
              </Label>

              <Input
                placeholder="Opcional"
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
              />
            </div>

            <div className="space-y-2">
              <Label>
                Valor-alvo
              </Label>

              <Input
                placeholder="Ex.: 10.000,00"
                inputMode="decimal"
                value={
                  targetAmount
                }
                onChange={(
                  event
                ) =>
                  setTargetAmount(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Vincular a uma meta
              </Label>

              <select
                value={goalId}
                onChange={(
                  event
                ) =>
                  setGoalId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="">
                  Nenhuma
                </option>

                {goals.map(
                  (goal) => (
                    <option
                      key={goal.id}
                      value={goal.id}
                    >
                      {goal.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar caixinha"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}