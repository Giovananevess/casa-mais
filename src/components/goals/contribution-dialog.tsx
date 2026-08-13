"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  PiggyBank,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { addGoalContributionAction } from "@/app/(app)/actions/goals";
import { GoalCelebration } from "@/components/goals/goal-celebration";
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
import { Textarea } from "@/components/ui/textarea";
import type {
  Goal,
  GoalMember,
} from "@/types/goals";

type ContributionDialogProps = {
  goal: Goal;
  members: GoalMember[];
};

function getToday() {
  const now = new Date();

  return new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, 10);
}

function parseCurrency(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function ContributionDialog({
  goal,
  members,
}: ContributionDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [
    celebrationOpen,
    setCelebrationOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [amount, setAmount] =
    useState("");

  const [userId, setUserId] =
    useState(
      members[0]?.user_id ?? ""
    );

  const [contributionDate, setContributionDate] =
    useState(getToday());

  const [notes, setNotes] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<
      Record<string, string[]>
    >({});

  function resetForm() {
    setAmount("");
    setContributionDate(getToday());
    setNotes("");
    setFieldErrors({});
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setFieldErrors({});

    const result =
      await addGoalContributionAction({
        goalId: goal.id,
        userId,
        amount: parseCurrency(amount),
        contributionDate,
        notes,
        sourceType: "manual",
        incomeId: null,
      });

    setLoading(false);

    if (!result.success) {
      setFieldErrors(
        result.fieldErrors ?? {}
      );

      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    setOpen(false);
    resetForm();

    if (result.completed) {
      setCelebrationOpen(true);
    }

    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={
          goal.status === "cancelled"
        }
      >
        <Plus />
        Adicionar aporte
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!loading) {
            setOpen(nextOpen);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PiggyBank className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Novo aporte
            </DialogTitle>

            <DialogDescription>
              Registre um valor guardado para a
              meta {goal.name}.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-3 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="goal-contribution-amount">
                Valor do aporte
              </Label>

              <Input
                id="goal-contribution-amount"
                inputMode="decimal"
                placeholder="500,00"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                disabled={loading}
                required
                autoFocus
              />

              {fieldErrors.amount?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.amount[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-contribution-member">
                Quem aportou
              </Label>

              <select
                id="goal-contribution-member"
                value={userId}
                onChange={(event) =>
                  setUserId(
                    event.target.value
                  )
                }
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {members.map((member) => (
                  <option
                    key={member.user_id}
                    value={member.user_id}
                  >
                    {member.name}
                  </option>
                ))}
              </select>

              {fieldErrors.userId?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.userId[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-contribution-date">
                Data do aporte
              </Label>

              <Input
                id="goal-contribution-date"
                type="date"
                value={contributionDate}
                onChange={(event) =>
                  setContributionDate(
                    event.target.value
                  )
                }
                disabled={loading}
                required
              />

              {fieldErrors
                .contributionDate?.[0] && (
                <p className="text-xs text-destructive">
                  {
                    fieldErrors
                      .contributionDate[0]
                  }
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-contribution-notes">
                Observação
              </Label>

              <Textarea
                id="goal-contribution-notes"
                placeholder="Ex.: parte do salário de agosto"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  loading ||
                  members.length === 0
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <PiggyBank />
                    Registrar aporte
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <GoalCelebration
        open={celebrationOpen}
        onOpenChange={
          setCelebrationOpen
        }
        goalName={goal.name}
      />
    </>
  );
}