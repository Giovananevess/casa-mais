"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  CalendarSync,
  Layers3,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";

import { CalendarEvent } from "@/components/calendar/calendar-event";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import { ExpenseAttachments } from "@/components/expenses/expense-attachments";
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { createCalendarDays } from "@/lib/calendar";
import { cn } from "@/lib/utils";

import type {
  CalendarExpense,
} from "@/types/calendar";
import type {
  ExpenseFormOptions,
  ExpenseStatus,
} from "@/types/expenses";

const weekDays = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
];

type CalendarViewProps = {
  referenceMonth: string;
  expenses: CalendarExpense[];
  options: ExpenseFormOptions;
};

type StatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "overdue"
  | "installment"
  | "recurring";

function getStatusLabel(
  status: ExpenseStatus
) {
  const labels: Record<
    ExpenseStatus,
    string
  > = {
    pending: "Pendente",
    paid: "Paga",
    overdue: "Atrasada",
    cancelled: "Cancelada",
  };

  return labels[status];
}

export function CalendarView({
  referenceMonth,
  expenses,
  options,
}: CalendarViewProps) {
  const [
    selectedExpense,
    setSelectedExpense,
  ] =
    useState<CalendarExpense | null>(
      null
    );

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [memberFilter, setMemberFilter] =
    useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const filteredExpenses =
    useMemo(() => {
      return expenses.filter((expense) => {
        if (
          statusFilter === "pending" &&
          expense.display_status !==
            "pending"
        ) {
          return false;
        }

        if (
          statusFilter === "paid" &&
          expense.display_status !== "paid"
        ) {
          return false;
        }

        if (
          statusFilter === "overdue" &&
          expense.display_status !==
            "overdue"
        ) {
          return false;
        }

        if (
          statusFilter ===
            "installment" &&
          !expense.installment_group_id
        ) {
          return false;
        }

        if (
          statusFilter === "recurring" &&
          !expense.is_recurring
        ) {
          return false;
        }

        if (
          memberFilter !== "all" &&
          expense.paid_by_profile?.id !==
            memberFilter
        ) {
          return false;
        }

        if (
          categoryFilter !== "all" &&
          expense.category?.id !==
            categoryFilter
        ) {
          return false;
        }

        return true;
      });
    }, [
      expenses,
      statusFilter,
      memberFilter,
      categoryFilter,
    ]);

  const days = useMemo(
    () =>
      createCalendarDays(
        referenceMonth,
        filteredExpenses
      ),
    [
      referenceMonth,
      filteredExpenses,
    ]
  );

  const selectedDueDate =
    selectedExpense
      ? new Intl.DateTimeFormat(
          "pt-BR",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        ).format(
          new Date(
            `${selectedExpense.due_date}T12:00:00`
          )
        )
      : "";

  return (
    <>
      <section className="rounded-3xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-semibold">
              Agenda mensal
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Clique em uma conta para
              visualizar os detalhes.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="h-10 rounded-xl border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
            >
              <option value="all">
                Todos os tipos
              </option>

              <option value="pending">
                Pendentes
              </option>

              <option value="paid">
                Pagas
              </option>

              <option value="overdue">
                Atrasadas
              </option>

              <option value="installment">
                Parceladas
              </option>

              <option value="recurring">
                Recorrentes
              </option>
            </select>

            <select
              className="h-10 rounded-xl border bg-background px-3 text-sm"
              value={memberFilter}
              onChange={(event) =>
                setMemberFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Todas as pessoas
              </option>

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

            <select
              className="h-10 rounded-xl border bg-background px-3 text-sm"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Todas as categorias
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
        </div>

        <div className="hidden grid-cols-7 border-b bg-muted/20 md:grid">
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-r px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendário desktop */}
        <div className="hidden grid-cols-7 md:grid">
          {days.map((day, index) => (
            <div
              key={day.date}
              className={cn(
                "min-h-36 border-b border-r p-2 last:border-r-0 xl:min-h-40",
                index % 7 === 6 &&
                  "border-r-0",
                !day.isCurrentMonth &&
                  "bg-muted/15"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                    day.isToday &&
                      "bg-primary text-primary-foreground",
                    !day.isToday &&
                      !day.isCurrentMonth &&
                      "text-muted-foreground/45"
                  )}
                >
                  {day.dayNumber}
                </span>

                {day.expenses.length >
                  0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {day.expenses.length}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                {day.expenses
                  .slice(0, 3)
                  .map((expense) => (
                    <CalendarEvent
                      key={expense.id}
                      expense={expense}
                      compact
                      onClick={() =>
                        setSelectedExpense(
                          expense
                        )
                      }
                    />
                  ))}

                {day.expenses.length > 3 && (
                  <button
                    type="button"
                    className="w-full px-2 py-1 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    +
                    {day.expenses.length -
                      3}{" "}
                    conta(s)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Agenda mobile */}
        <div className="divide-y md:hidden">
          {days
            .filter(
              (day) =>
                day.isCurrentMonth &&
                day.expenses.length > 0
            )
            .map((day) => (
              <div
                key={day.date}
                className="p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border text-sm font-semibold",
                      day.isToday &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {day.dayNumber}
                  </span>

                  <p className="text-sm font-medium">
                    {new Intl.DateTimeFormat(
                      "pt-BR",
                      {
                        weekday: "long",
                      }
                    ).format(
                      new Date(
                        `${day.date}T12:00:00`
                      )
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  {day.expenses.map(
                    (expense) => (
                      <CalendarEvent
                        key={expense.id}
                        expense={expense}
                        onClick={() =>
                          setSelectedExpense(
                            expense
                          )
                        }
                      />
                    )
                  )}
                </div>
              </div>
            ))}

          {filteredExpenses.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <ReceiptText className="size-8 text-muted-foreground" />

              <p className="mt-4 font-medium">
                Nenhuma conta encontrada
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Tente alterar os filtros ou
                cadastre uma nova conta.
              </p>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(selectedExpense)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExpense(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          {selectedExpense && (
            <>
              <DialogHeader>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ReceiptText className="size-5" />
                </div>

                <DialogTitle className="mt-4 text-2xl">
                  {selectedExpense.title}
                </DialogTitle>

                <DialogDescription>
                  Detalhes da conta selecionada.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-3 space-y-6">
                <section className="rounded-3xl border bg-muted/20 p-5">
                  <p className="text-sm text-muted-foreground">
                    Valor
                  </p>

                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {formatCurrency(
                      Number(
                        selectedExpense.amount
                      )
                    )}
                  </p>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Vencimento
                        </p>

                        <p className="mt-1 font-medium">
                          {selectedDueDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="mt-0.5 size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Responsável
                        </p>

                        <p className="mt-1 font-medium">
                          {selectedExpense
                            .paid_by_profile
                            ?.name ??
                            "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <WalletCards className="mt-0.5 size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Conta financeira
                        </p>

                        <p className="mt-1 font-medium">
                          {selectedExpense
                            .account?.name ??
                            "Não informada"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Situação
                      </p>

                      <p className="mt-1 font-medium">
                        {getStatusLabel(
                          selectedExpense
                            .display_status
                        )}
                      </p>
                    </div>
                  </div>

                  {(selectedExpense.is_recurring ||
                    selectedExpense.installment_number) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {selectedExpense.is_recurring && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                          <CalendarSync className="size-3.5" />
                          Recorrente
                        </span>
                      )}

                      {selectedExpense.installment_number &&
                        selectedExpense.installment_total && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                            <Layers3 className="size-3.5" />
                            Parcela{" "}
                            {
                              selectedExpense.installment_number
                            }
                            /
                            {
                              selectedExpense.installment_total
                            }
                          </span>
                        )}
                    </div>
                  )}
                </section>

                {selectedExpense.description && (
                  <section>
                    <p className="font-medium">
                      Descrição
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {
                        selectedExpense.description
                      }
                    </p>
                  </section>
                )}

                <section className="space-y-3 border-t pt-5">
                  <p className="font-medium">
                    Ações
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <EditExpenseDialog
                      expense={
                        selectedExpense
                      }
                      options={options}
                    />

                    <ExpenseActions
                      expense={
                        selectedExpense
                      }
                      options={options}
                    />
                  </div>
                </section>

                <section className="border-t pt-5">
                  <ExpenseAttachments
                    expense={
                      selectedExpense
                    }
                  />
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}