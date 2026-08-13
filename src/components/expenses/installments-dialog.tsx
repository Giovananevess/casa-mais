"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Layers3,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { createInstallmentsAction } from "@/app/(app)/actions/expenses";
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
  ExpenseFormOptions,
  ExpenseSplitType,
} from "@/types/expenses";

type InstallmentsDialogProps = {
  options: ExpenseFormOptions;
};

function getToday() {
  const now = new Date();

  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, 10);
}

function parseCurrencyInput(value: string) {
  const parsed = Number(
    value
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export function InstallmentsDialog({
  options,
}: InstallmentsDialogProps) {
  const router = useRouter();

  const initialPaidBy =
    options.members[0]?.user_id ?? "";

  const initialCategory =
    options.categories[0]?.id ?? "";

  const initialAccount =
    options.accounts[0]?.id ?? "";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [totalAmount, setTotalAmount] =
    useState("");
  const [installments, setInstallments] =
    useState("2");
  const [firstDueDate, setFirstDueDate] =
    useState(getToday());
  const [categoryId, setCategoryId] =
    useState(initialCategory);
  const [accountId, setAccountId] =
    useState(initialAccount);
  const [paidBy, setPaidBy] =
    useState(initialPaidBy);
  const [splitType, setSplitType] =
    useState<ExpenseSplitType>("equal");
  const [paymentMethod, setPaymentMethod] =
    useState("");
  const [notes, setNotes] = useState("");

  const installmentPreview = useMemo(() => {
    const amount = parseCurrencyInput(totalAmount);
    const count = Number(installments);

    if (amount <= 0 || count < 2) {
      return 0;
    }

    return amount / count;
  }, [totalAmount, installments]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTotalAmount("");
    setInstallments("2");
    setFirstDueDate(getToday());
    setCategoryId(initialCategory);
    setAccountId(initialAccount);
    setPaidBy(initialPaidBy);
    setSplitType("equal");
    setPaymentMethod("");
    setNotes("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);

    const result = await createInstallmentsAction({
      title,
      description,
      totalAmount: parseCurrencyInput(totalAmount),
      installments: Number(installments),
      firstDueDate,
      categoryId,
      accountId,
      paidBy,
      splitType,
      paymentMethod,
      notes,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <Layers3 />
        Compra parcelada
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Layers3 className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Nova compra parcelada
            </DialogTitle>

            <DialogDescription>
              O Casa+ criará uma despesa para cada parcela,
              com vencimentos mensais.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-3 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="installment-title">
                  Nome da compra
                </Label>

                <Input
                  id="installment-title"
                  placeholder="Ex.: Geladeira"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-total">
                  Valor total
                </Label>

                <Input
                  id="installment-total"
                  inputMode="decimal"
                  placeholder="3.000,00"
                  value={totalAmount}
                  onChange={(event) =>
                    setTotalAmount(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-count">
                  Quantidade de parcelas
                </Label>

                <Input
                  id="installment-count"
                  type="number"
                  min={2}
                  max={120}
                  value={installments}
                  onChange={(event) =>
                    setInstallments(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-first-date">
                  Primeiro vencimento
                </Label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="installment-first-date"
                    type="date"
                    className="pl-10"
                    value={firstDueDate}
                    onChange={(event) =>
                      setFirstDueDate(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor aproximado por parcela</Label>

                <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3 text-sm font-medium">
                  {installmentPreview.toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>

                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                >
                  <option value="">
                    Sem categoria
                  </option>

                  {options.categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Conta financeira</Label>

                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={accountId}
                  onChange={(event) =>
                    setAccountId(event.target.value)
                  }
                >
                  <option value="">
                    Não informada
                  </option>

                  {options.accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>

                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={paidBy}
                  onChange={(event) =>
                    setPaidBy(event.target.value)
                  }
                >
                  {options.members.map((member) => (
                    <option
                      key={member.user_id}
                      value={member.user_id}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Divisão</Label>

                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={splitType}
                  onChange={(event) =>
                    setSplitType(
                      event.target
                        .value as ExpenseSplitType
                    )
                  }
                >
                  <option value="equal">
                    Dividir igualmente
                  </option>

                  <option value="individual">
                    Responsabilidade individual
                  </option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Forma de pagamento</Label>

                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    className="pl-10"
                    placeholder="Ex.: cartão de crédito"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>

                <Textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Observações</Label>

                <Textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
                    Criando parcelas...
                  </>
                ) : (
                  <>
                    <Plus />
                    Criar parcelamento
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