"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import {
  createExpenseAction,
  type CreateExpenseResult,
} from "@/app/(app)/actions/expenses";
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
  ExpenseType,
} from "@/types/expenses";

type NewExpenseDialogProps = {
  options: ExpenseFormOptions;
  buttonLabel?: string;
  className?: string;
};

type FormState = {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  categoryId: string;
  accountId: string;
  paidBy: string;
  status: "pending" | "paid";
  splitType: ExpenseSplitType;
  expenseType: ExpenseType;
  notes: string;
  purchaseDate: string;
  paymentMethod:
  | ""
  | "cash"
  | "pix"
  | "debit_card"
  | "credit_card"
  | "meal_voucher"
  | "food_voucher"
  | "bank_transfer"
  | "other";
};


function getToday() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
    now.getTimezoneOffset() * 60_000
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

function createInitialState(
  options: ExpenseFormOptions
): FormState {
  return {
    title: "",
    description: "",
    amount: "",
    dueDate: getToday(),
    categoryId:
      options.categories[0]?.id ?? "",
    accountId:
      options.accounts[0]?.id ?? "",
    paidBy:
      options.members[0]?.user_id ?? "",
    status: "pending",
    splitType: "equal",
    expenseType: "variable",
    paymentMethod: "other",
    notes: "",
    purchaseDate: getToday(),
  };
}

function parseCurrencyInput(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function NewExpenseDialog({
  options,
  buttonLabel = "Nova conta",
  className,
}: NewExpenseDialogProps) {
  const router = useRouter();

  const initialState = useMemo(
    () => createInitialState(options),
    [options]
  );

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [form, setForm] =
    useState<FormState>(initialState);
  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setFieldErrors({});
    }
  }, [initialState, open]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const copy = { ...current };
      delete copy[field];

      return copy;
    });
  }

  function getError(field: string) {
    return fieldErrors[field]?.[0];
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    let result: CreateExpenseResult;

    try {
        result = await createExpenseAction({
        title: form.title,
          purchaseDate: form.purchaseDate,
        description: form.description,
        amount: parseCurrencyInput(
          form.amount
        ),
        dueDate: form.dueDate,
        categoryId: form.categoryId,
        accountId: form.accountId,
        paidBy: form.paidBy,
        status: form.status,
        splitType: form.splitType,
        expenseType: form.expenseType,
        paymentMethod:
          form.paymentMethod === "" ? "other" : form.paymentMethod,
        notes: form.notes,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível cadastrar a conta."
      );

      setIsSubmitting(false);
      return;
    }

    if (!result.success) {
      setFieldErrors(
        result.fieldErrors ?? {}
      );

      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    toast.success(result.message);

    setOpen(false);
    setForm(initialState);
    setIsSubmitting(false);

    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus />
        {buttonLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isSubmitting) {
            setOpen(nextOpen);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ReceiptText className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Nova conta
            </DialogTitle>

            <DialogDescription>
              Cadastre uma despesa e defina
              como ela será dividida entre vocês.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-2 space-y-7"
            onSubmit={handleSubmit}
          >
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold">
                  Informações principais
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Informe o nome, o valor e o
                  vencimento da conta.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="expense-title">
                    Nome da conta
                  </Label>

                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="expense-title"
                      className="pl-10"
                      placeholder="Ex.: Energia, internet, mercado"
                      value={form.title}
                      onChange={(event) =>
                        updateField(
                          "title",
                          event.target.value
                        )
                      }
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>

                  {getError("title") && (
                    <p className="text-xs text-destructive">
                      {getError("title")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">
                    Valor
                  </Label>

                  <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="expense-amount"
                      className="pl-10"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(event) =>
                        updateField(
                          "amount",
                          event.target.value
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {getError("amount") && (
                    <p className="text-xs text-destructive">
                      {getError("amount")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-due-date">
                    Vencimento
                  </Label>

                  {form.paymentMethod !== "credit_card" && (
                    <Input
                      id="expense-due-date"
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        updateField(
                          "dueDate",
                          event.target.value
                        )
                      }
                    />
                  )}

                  {getError("dueDate") && (
                    <p className="text-xs text-destructive">
                      {getError("dueDate")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Forma de pagamento
                  </Label>

                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      updateField(
                        "paymentMethod",
                        event.target.value as FormState["paymentMethod"]
                      )
                    }
                    className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="cash">
                      Dinheiro
                    </option>

                    <option value="pix">
                      Pix
                    </option>

                    <option value="debit_card">
                      Cartão de débito
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

                    <option value="bank_transfer">
                      Transferência
                    </option>

                    <option value="other">
                      Outro
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-category">
                    Categoria
                  </Label>

                  <select
                    id="expense-category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.categoryId}
                    onChange={(event) =>
                      updateField(
                        "categoryId",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
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
                  <Label htmlFor="expense-account">
                    Conta financeira
                  </Label>

                  <div className="relative">
                    <WalletCards className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      id="expense-account"
                      className="flex h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.accountId}
                      onChange={(event) =>
                        updateField(
                          "accountId",
                          event.target.value
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <option value="">
                        Não informada
                      </option>

                      {options.accounts.map(
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
                  {form.paymentMethod === "credit_card" && (
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-sm font-medium">
                        Compra no cartão de crédito
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        O vencimento será calculado automaticamente
                        usando o dia de fechamento e o vencimento do
                        cartão selecionado.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="expense-description">
                    Descrição
                  </Label>

                  <Textarea
                    id="expense-description"
                    placeholder="Informações adicionais sobre a conta..."
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                  />

                  {getError("description") && (
                    <p className="text-xs text-destructive">
                      {getError("description")}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold">
                  Pagamento e divisão
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Defina quem pagou e como o
                  valor será dividido.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expense-paid-by">
                    Pago por
                  </Label>

                  <select
                    id="expense-paid-by"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    value={form.paidBy}
                    onChange={(event) =>
                      updateField(
                        "paidBy",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {options.members.map(
                      (member) => (
                        <option
                          key={member.user_id}
                          value={member.user_id}
                        >
                          {member.name}
                        </option>
                      )
                    )}
                  </select>

                  {getError("paidBy") && (
                    <p className="text-xs text-destructive">
                      {getError("paidBy")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-status">
                    Situação
                  </Label>

                  <select
                    id="expense-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as
                        | "pending"
                        | "paid"
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <option value="pending">
                      Pendente
                    </option>

                    <option value="paid">
                      Paga
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-split">
                    Divisão
                  </Label>

                  <div className="relative">
                    <UsersRound className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      id="expense-split"
                      className="flex h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      value={form.splitType}
                      onChange={(event) =>
                        updateField(
                          "splitType",
                          event.target
                            .value as ExpenseSplitType
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <option value="equal">
                        Dividir igualmente
                      </option>

                      <option value="individual">
                        Responsabilidade individual
                      </option>
                    </select>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {form.splitType === "equal"
                      ? "O valor será dividido igualmente entre os dois."
                      : "O valor ficará integralmente com quem realizou o pagamento."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-type">
                    Tipo de conta
                  </Label>

                  <select
                    id="expense-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    value={form.expenseType}
                    onChange={(event) =>
                      updateField(
                        "expenseType",
                        event.target
                          .value as ExpenseType
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <option value="variable">
                      Variável
                    </option>

                    <option value="fixed">
                      Fixa — lançamento único
                    </option>

                  </select>
                </div>

                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="expense-notes">
                    Observações
                  </Label>

                  <Textarea
                    id="expense-notes"
                    placeholder="Observações opcionais..."
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  options.members.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus />
                    Cadastrar conta
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