"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarSync,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { createRecurringExpenseAction } from "@/app/(app)/actions/expenses";
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

type RecurringExpenseDialogProps = {
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

export function RecurringExpenseDialog({
  options,
}: RecurringExpenseDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [defaultAmount, setDefaultAmount] =
    useState("");
  const [dueDay, setDueDay] = useState("10");
  const [startDate, setStartDate] =
    useState(getToday());
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] =
    useState(options.categories[0]?.id ?? "");
  const [accountId, setAccountId] =
    useState(options.accounts[0]?.id ?? "");
  const [paidBy, setPaidBy] = useState(
    options.members[0]?.user_id ?? ""
  );
  const [splitType, setSplitType] =
    useState<ExpenseSplitType>("equal");
  const [paymentMethod, setPaymentMethod] =
    useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);

    const result =
      await createRecurringExpenseAction({
        title,
        description,
        defaultAmount:
          parseCurrencyInput(defaultAmount),
        dueDay: Number(dueDay),
        startDate,
        endDate,
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
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <CalendarSync />
        Conta recorrente
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarSync className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Nova conta recorrente
            </DialogTitle>

            <DialogDescription>
              Use para internet, aluguel, academia,
              assinatura ou outra despesa mensal.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-3 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome da conta</Label>

                <Input
                  placeholder="Ex.: Internet"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Valor padrão</Label>

                <Input
                  inputMode="decimal"
                  placeholder="139,90"
                  value={defaultAmount}
                  onChange={(event) =>
                    setDefaultAmount(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Dia do vencimento</Label>

                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(event) =>
                    setDueDay(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data inicial</Label>

                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data final</Label>

                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Deixe vazio para continuar sem prazo final.
                </p>
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

                <Input
                  placeholder="Ex.: débito automático"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />
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
                    Criando recorrência...
                  </>
                ) : (
                  <>
                    <Plus />
                    Criar conta recorrente
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