"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createIncomeAction } from "@/app/(app)/actions/finance";
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

  const [userId, setUserId] =
    useState(
      members[0]?.user_id ?? ""
    );

  const [incomeType, setIncomeType] =
    useState("salary");

  const [description, setDescription] =
    useState("Salário");

  const [amount, setAmount] =
    useState("");

  const [accountId, setAccountId] =
    useState("");

  const [receivedDate, setReceivedDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [recurring, setRecurring] =
    useState(true);

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const result =
      await createIncomeAction({
        userId,
        accountId:
          accountId || null,

        incomeType,

        description,

        amount: Number(
          amount
            .replace(/\./g, "")
            .replace(",", ".")
        ),

        receivedDate,

        recurring,

        dayOfMonth: Number(
          receivedDate.slice(8, 10)
        ),
      });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
      >
        Nova receita
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nova receita
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div>
              <Label>Pessoa</Label>

              <select
                value={userId}
                onChange={(e) =>
                  setUserId(
                    e.target.value
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

            <div>
              <Label>Tipo</Label>

              <select
                value={incomeType}
                onChange={(e) =>
                  setIncomeType(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
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

            <Input
              placeholder="Descrição"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

            <Input
              placeholder="Valor"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
            />

            <div>
              <Label>
                Conta destino
              </Label>

              <select
                value={accountId}
                onChange={(e) =>
                  setAccountId(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="">
                  Nenhuma
                </option>

                {accounts.map(
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

            <Input
              type="date"
              value={receivedDate}
              onChange={(e) =>
                setReceivedDate(
                  e.target.value
                )
              }
            />

            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) =>
                  setRecurring(
                    e.target.checked
                  )
                }
              />

              Repetir todos os meses
            </label>

            <Button className="w-full">
              Salvar receita
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}