"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
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
  FinancialAccount,
} from "@/types/finance";

import type {
  GoalMember,
} from "@/types/goals";

type CreateAccountDialogProps = {
  members: GoalMember[];
  existingAccounts: FinancialAccount[];

  defaultAccountType?: string;
  triggerLabel?: string;
};

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

export function CreateAccountDialog({
  members,
  existingAccounts,
  defaultAccountType = "checking",
  triggerLabel = "Nova conta",
}: CreateAccountDialogProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [
    accountType,
    setAccountType,
  ] = useState(
    defaultAccountType
  );

  const [
    institution,
    setInstitution,
  ] = useState("");

  const [
    initialBalance,
    setInitialBalance,
  ] = useState("0");

  const [
    ownerUserId,
    setOwnerUserId,
  ] = useState(
    members[0]?.user_id ?? ""
  );

  const [
    closingDay,
    setClosingDay,
  ] = useState("5");

  const [
    dueDay,
    setDueDay,
  ] = useState("12");

  const [
    autoPayment,
    setAutoPayment,
  ] = useState(false);

  const [
    autoPaymentAccountId,
    setAutoPaymentAccountId,
  ] = useState("");

  const paymentAccounts =
    existingAccounts.filter(
      (account) =>
        account.account_type ===
          "checking" ||
        account.account_type ===
          "savings"
    );

  const isCreditCard =
    accountType ===
    "credit_card";

  function resetForm() {
    setName("");
    setAccountType(
      defaultAccountType
    );
    setInstitution("");
    setInitialBalance("0");

    setOwnerUserId(
      members[0]?.user_id ?? ""
    );

    setClosingDay("5");
    setDueDay("12");

    setAutoPayment(false);

    setAutoPaymentAccountId(
      ""
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

  function handleAccountTypeChange(
    value: string
  ) {
    setAccountType(value);

    /*
     * Ao sair de cartão,
     * limpa configurações específicas.
     */
    if (
      value !==
      "credit_card"
    ) {
      setAutoPayment(false);
      setAutoPaymentAccountId(
        ""
      );
    }
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error(
        "Informe o nome da conta."
      );
      return;
    }

    if (!ownerUserId) {
      toast.error(
        "Selecione o responsável."
      );
      return;
    }

    if (isCreditCard) {
      const closing =
        Number(closingDay);

      const due =
        Number(dueDay);

      if (
        closing < 1 ||
        closing > 31
      ) {
        toast.error(
          "Informe um dia de fechamento válido."
        );
        return;
      }

      if (
        due < 1 ||
        due > 31
      ) {
        toast.error(
          "Informe um dia de vencimento válido."
        );
        return;
      }

      if (
        autoPayment &&
        !autoPaymentAccountId
      ) {
        toast.error(
          "Selecione a conta usada para pagar a fatura."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const result =
        await createFinancialAccountAction(
          {
            name:
              name.trim(),

            accountType,

            institution:
              institution.trim(),

            ownerUserId:
              ownerUserId ||
              null,

            initialBalance:
              isCreditCard
                ? 0
                : parseCurrency(
                    initialBalance
                  ),

            closingDay:
              isCreditCard
                ? Number(
                    closingDay
                  )
                : null,

            dueDay:
              isCreditCard
                ? Number(dueDay)
                : null,

            autoPayment:
              isCreditCard
                ? autoPayment
                : false,

            autoPaymentAccountId:
              isCreditCard &&
              autoPayment
                ? autoPaymentAccountId ||
                  null
                : null,
          }
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
        "Erro ao salvar conta:",
        error
      );

      toast.error(
        "Não foi possível salvar a conta."
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

        {triggerLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            {isCreditCard && (
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                <CreditCard className="size-5" />
              </div>
            )}

            <DialogTitle>
              {isCreditCard
                ? "Novo cartão"
                : "Nova conta financeira"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>
                Nome
              </Label>

              <Input
                placeholder={
                  isCreditCard
                    ? "Ex.: Nubank Renato"
                    : "Ex.: Conta da casa"
                }
                value={name}
                onChange={(
                  event
                ) =>
                  setName(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Tipo
              </Label>

              <select
                value={
                  accountType
                }
                onChange={(
                  event
                ) =>
                  handleAccountTypeChange(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                    event.target
                      .value
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
                      {
                        member.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Instituição
              </Label>

              <Input
                placeholder={
                  isCreditCard
                    ? "Ex.: Nubank"
                    : "Ex.: Inter"
                }
                value={
                  institution
                }
                onChange={(
                  event
                ) =>
                  setInstitution(
                    event.target
                      .value
                  )
                }
              />
            </div>

            {!isCreditCard && (
              <div className="space-y-2">
                <Label>
                  Saldo inicial
                </Label>

                <Input
                  value={
                    initialBalance
                  }
                  onChange={(
                    event
                  ) =>
                    setInitialBalance(
                      event.target
                        .value
                    )
                  }
                  placeholder="0,00"
                  inputMode="decimal"
                />
              </div>
            )}

            {isCreditCard && (
              <>
                <div className="border-t pt-5">
                  <div>
                    <h3 className="font-semibold">
                      Ciclo da fatura
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure o
                      fechamento e o
                      vencimento do
                      cartão.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                        onChange={(
                          event
                        ) =>
                          setClosingDay(
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <p className="text-xs text-muted-foreground">
                        Compras após
                        este dia vão
                        para a próxima
                        fatura.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Vence dia
                      </Label>

                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={
                          dueDay
                        }
                        onChange={(
                          event
                        ) =>
                          setDueDay(
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <p className="text-xs text-muted-foreground">
                        Dia em que a
                        fatura vence.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-5">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
                    <input
                      type="checkbox"
                      checked={
                        autoPayment
                      }
                      onChange={(
                        event
                      ) => {
                        const checked =
                          event
                            .target
                            .checked;

                        setAutoPayment(
                          checked
                        );

                        if (
                          !checked
                        ) {
                          setAutoPaymentAccountId(
                            ""
                          );
                        }
                      }}
                      className="mt-1"
                    />

                    <div>
                      <p className="font-medium">
                        Pagamento
                        automático
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Após o
                        vencimento,
                        o Casa+
                        considera a
                        fatura paga
                        automaticamente.
                      </p>
                    </div>
                  </label>

                  {autoPayment && (
                    <div className="mt-4 space-y-2">
                      <Label>
                        Conta usada
                        para pagar a
                        fatura
                      </Label>

                      <select
                        value={
                          autoPaymentAccountId
                        }
                        onChange={(
                          event
                        ) =>
                          setAutoPaymentAccountId(
                            event
                              .target
                              .value
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">
                          Selecione...
                        </option>

                        {paymentAccounts.map(
                          (
                            account
                          ) => (
                            <option
                              key={
                                account.id
                              }
                              value={
                                account.id
                              }
                            >
                              {
                                account.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      {paymentAccounts.length ===
                        0 && (
                        <p className="text-xs text-amber-600">
                          Cadastre
                          primeiro uma
                          conta corrente
                          ou poupança
                          para usar no
                          pagamento
                          automático.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={
                  loading
                }
                onClick={() =>
                  handleOpenChange(
                    false
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    Salvando...
                  </>
                ) : (
                  <>
                    {isCreditCard && (
                      <CreditCard className="size-4" />
                    )}

                    {isCreditCard
                      ? "Salvar cartão"
                      : "Salvar conta"}
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