"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { createFinancialAccountAction } from "@/app/(app)/actions/finance";
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

export function CreateAccountDialog({
  members,
}: {
  members: GoalMember[];
}) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [accountType, setAccountType] =
    useState("checking");

  const [institution, setInstitution] =
    useState("");

  const [initialBalance, setInitialBalance] =
    useState("0");

  const [ownerUserId, setOwnerUserId] =
    useState(
      members[0]?.user_id ?? ""
    );

  const [closingDay, setClosingDay] =
    useState("5");

  const [dueDay, setDueDay] =
    useState("12");

  const [autoPayment, setAutoPayment] =
    useState(false);

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);

    const result =
      await createFinancialAccountAction({
        name,
        accountType,
        institution,

        ownerUserId:
          ownerUserId || null,

        initialBalance:
          Number(
            initialBalance
              .replace(".", "")
              .replace(",", ".")
          ),

        closingDay:
          accountType ===
          "credit_card"
            ? Number(closingDay)
            : null,

        dueDay:
          accountType ===
          "credit_card"
            ? Number(dueDay)
            : null,

        autoPayment,

        autoPaymentAccountId:
          null,
      });

    setLoading(false);

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
        <Plus />
        Nova conta
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Nova conta financeira
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Nome</Label>

              <Input
                placeholder="Ex.: Nubank Renato"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>

              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="checking">
                  Conta corrente
                </option>

                <option value="savings">
                  Poupança
                </option>

                <option value="cash">
                  Dinheiro
                </option>

                <option value="credit_card">
                  Cartão de crédito
                </option>

                <option value="meal_voucher">
                  Vale-refeição
                </option>

                <option value="food_voucher">
                  Vale-alimentação
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>

              <select
                value={ownerUserId}
                onChange={(e) =>
                  setOwnerUserId(
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

            <div className="space-y-2">
              <Label>Instituição</Label>

              <Input
                placeholder="Ex.: Nubank"
                value={institution}
                onChange={(e) =>
                  setInstitution(
                    e.target.value
                  )
                }
              />
            </div>

            {accountType !==
              "credit_card" && (
              <div className="space-y-2">
                <Label>
                  Saldo inicial
                </Label>

                <Input
                  value={initialBalance}
                  onChange={(e) =>
                    setInitialBalance(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {accountType ===
              "credit_card" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Fecha dia
                    </Label>

                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={
                        closingDay
                      }
                      onChange={(e) =>
                        setClosingDay(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label>
                      Vence dia
                    </Label>

                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={dueDay}
                      onChange={(e) =>
                        setDueDay(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={autoPayment}
                    onChange={(e) =>
                      setAutoPayment(
                        e.target.checked
                      )
                    }
                  />

                  Pagamento automático
                </label>
              </>
            )}

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="animate-spin" />
              )}

              Salvar conta
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}