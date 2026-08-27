"use client";

import {
  useState,
} from "react";

import {
  CreditCard,
  Loader2,
  Plus,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  createCreditCardInvoiceAction,
} from "@/app/(app)/actions/finance";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import type {
  CreditCardInvoiceOption,
} from "@/types/finance";

function currentMonth() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}`;
}

function parseCurrency(
  value: string
) {
  const normalized =
    value
      .trim()
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

  const parsed =
    Number(
      normalized
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

export function CreditCardInvoiceDialog({
  cards,
}: {
  cards:
    CreditCardInvoiceOption[];
}) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    cardId,
    setCardId,
  ] = useState(
    cards[0]?.id ?? ""
  );

  const [
    referenceMonth,
    setReferenceMonth,
  ] = useState(
    currentMonth()
  );

  const [
    amount,
    setAmount,
  ] = useState("");

  const selectedCard =
    cards.find(
      (card) =>
        card.id ===
        cardId
    );

  async function submit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedAmount =
      parseCurrency(
        amount
      );

    if (!cardId) {
      toast.error(
        "Selecione o cartão."
      );
      return;
    }

    if (
      parsedAmount <= 0
    ) {
      toast.error(
        "Informe o valor da fatura."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await createCreditCardInvoiceAction(
          {
            creditCardId:
              cardId,

            referenceMonth,

            amount:
              parsedAmount,
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
      setAmount("");

      router.refresh();
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Não foi possível cadastrar a fatura."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setOpen(true)
        }
      >
        <CreditCard className="size-4" />

        Nova fatura
      </Button>

      <Dialog
        open={open}
        onOpenChange={
          setOpen
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>

            <DialogTitle>
              Nova fatura de cartão
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>
                Cartão
              </Label>

              <select
                value={
                  cardId
                }
                onChange={(
                  event
                ) =>
                  setCardId(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                {cards.map(
                  (card) => (
                    <option
                      key={
                        card.id
                      }
                      value={
                        card.id
                      }
                    >
                      {
                        card.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Mês da fatura
              </Label>

              <Input
                type="month"
                value={
                  referenceMonth
                }
                onChange={(
                  event
                ) =>
                  setReferenceMonth(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Valor total
              </Label>

              <Input
                inputMode="decimal"
                placeholder="Ex.: 2.500,00"
                value={amount}
                onChange={(
                  event
                ) =>
                  setAmount(
                    event.target
                      .value
                  )
                }
              />
            </div>

            {selectedCard && (
              <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
                <p className="font-medium">
                  {
                    selectedCard.name
                  }
                </p>

                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>
                    Fecha dia{" "}
                    {selectedCard.closing_day ??
                      "—"}
                  </p>

                  <p>
                    Vence dia{" "}
                    {selectedCard.due_day ??
                      "—"}
                  </p>

                  <p>
                    Pagamento automático:{" "}
                    {selectedCard.auto_payment
                      ? "Ativado"
                      : "Desativado"}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                cards.length ===
                  0
              }
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Cadastrar fatura
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}