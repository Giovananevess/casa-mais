"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Layers3,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

import type {
  ExpenseListItem,
} from "@/types/expenses";

type InstallmentGroupCardProps = {
  installments: ExpenseListItem[];
};

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  const date = new Date(
    `${value}T12:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(date)
    .replace(".", "");
}

function getRelationName(
  relation:
    | { name?: string | null }
    | { name?: string | null }[]
    | null
    | undefined
) {
  if (!relation) {
    return null;
  }

  if (
    Array.isArray(
      relation
    )
  ) {
    return (
      relation[0]?.name ??
      null
    );
  }

  return relation.name ?? null;
}

function getInstallmentStatus(
  expense: ExpenseListItem
) {
  if (
    expense.status === "paid"
  ) {
    return "paid";
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const dueDate =
    new Date(
      `${expense.due_date}T00:00:00`
    );

  if (
    expense.status ===
      "pending" &&
    dueDate < today
  ) {
    return "overdue";
  }

  return expense.status;
}

export function InstallmentGroupCard({
  installments,
}: InstallmentGroupCardProps) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const data =
    useMemo(() => {
      const sorted =
        [...installments].sort(
          (
            a,
            b
          ) =>
            Number(
              a.installment_number ??
                0
            ) -
            Number(
              b.installment_number ??
                0
            )
        );

      const first =
        sorted[0];

      if (!first) {
        return null;
      }

      const paid =
        sorted.filter(
          (item) =>
            item.status ===
            "paid"
        );

      const pending =
        sorted.filter(
          (item) => {
            const status =
              getInstallmentStatus(
                item
              );

            return (
              status ===
                "pending" ||
              status ===
                "overdue"
            );
          }
        );

      const nextInstallment =
        pending[0] ??
        sorted[
          sorted.length - 1
        ];

      const totalAmount =
        sorted.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.amount
            ),
          0
        );

      const paidAmount =
        paid.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.amount
            ),
          0
        );

      const totalInstallments =
        Number(
          first.installment_total ??
            sorted.length
        );

      const paidCount =
        paid.length;

      const remainingCount =
        Math.max(
          totalInstallments -
            paidCount,
          0
        );

      const percentage =
        totalInstallments > 0
          ? Math.min(
              100,
              (
                paidCount /
                totalInstallments
              ) * 100
            )
          : 0;

      const categoryName =
        getRelationName(
          first.category
        );

      const accountName =
        getRelationName(
          first.account
        );

      return {
        sorted,
        first,
        nextInstallment,
        totalAmount,
        paidAmount,
        totalInstallments,
        paidCount,
        remainingCount,
        percentage,
        categoryName,
        accountName,
      };
    }, [installments]);

  if (!data) {
    return null;
  }

  const {
    sorted,
    first,
    nextInstallment,
    totalAmount,
    paidAmount,
    totalInstallments,
    paidCount,
    remainingCount,
    percentage,
    categoryName,
    accountName,
  } = data;

  const currentNumber =
    Number(
      nextInstallment
        ?.installment_number ??
        totalInstallments
    );

  const currentAmount =
    Number(
      nextInstallment
        ?.amount ??
        0
    );

  const allPaid =
    remainingCount === 0;

  return (
    <article className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
              <Layers3 className="size-5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">
                {first.title}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {categoryName && (
                  <span>
                    {categoryName}
                  </span>
                )}

                {accountName && (
                  <>
                    <span>
                      •
                    </span>

                    <span>
                      {accountName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={
              allPaid
                ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
            }
          >
            {allPaid ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Clock3 className="size-3.5" />
            )}

            {allPaid
              ? "Concluída"
              : "Em andamento"}
          </div>
        </div>

        {/* Valor total */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Valor total da compra
          </p>

          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatCurrency(
              totalAmount
            )}
          </p>
        </div>

        {/* Parcela atual */}
        {!allPaid && (
          <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Próxima parcela
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {currentNumber}/
                  {totalInstallments}
                  {" · "}
                  {formatCurrency(
                    currentAmount
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />

                {formatDate(
                  nextInstallment
                    ?.due_date
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progresso */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Progresso do parcelamento
            </span>

            <span className="font-medium">
              {paidCount}/
              {totalInstallments}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width:
                  `${percentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {paidCount} paga
              {paidCount !== 1
                ? "s"
                : ""}
            </span>

            <span>
              {remainingCount} restante
              {remainingCount !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">
              Já pago
            </p>

            <p className="mt-1 font-semibold">
              {formatCurrency(
                paidAmount
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">
              Falta pagar
            </p>

            <p className="mt-1 font-semibold">
              {formatCurrency(
                Math.max(
                  0,
                  totalAmount -
                    paidAmount
                )
              )}
            </p>
          </div>
        </div>

        {/* Botão expandir */}
        <div className="mt-6 border-t pt-5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setExpanded(
                (current) =>
                  !current
              )
            }
          >
            <ReceiptText className="size-4" />

            {expanded
              ? "Ocultar parcelas"
              : "Ver todas as parcelas"}

            {expanded ? (
              <ChevronUp className="ml-auto size-4" />
            ) : (
              <ChevronDown className="ml-auto size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Lista das parcelas */}
      {expanded && (
        <div className="border-t bg-muted/20 px-6 py-5">
          <div className="space-y-2">
            {sorted.map(
              (
                installment
              ) => {
                const status =
                  getInstallmentStatus(
                    installment
                  );

                return (
                  <div
                    key={
                      installment.id
                    }
                    className="flex flex-col justify-between gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          status ===
                          "paid"
                            ? "flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                            : status ===
                              "overdue"
                            ? "flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600"
                            : "flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
                        }
                      >
                        {status ===
                        "paid" ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Clock3 className="size-4" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">
                          Parcela{" "}
                          {
                            installment.installment_number
                          }
                          /
                          {
                            installment.installment_total
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Vencimento{" "}
                          {formatDate(
                            installment.due_date
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="font-semibold">
                        {formatCurrency(
                          Number(
                            installment.amount
                          )
                        )}
                      </p>

                      <span
                        className={
                          status ===
                          "paid"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : status ===
                              "overdue"
                            ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {status ===
                        "paid"
                          ? "Paga"
                          : status ===
                            "overdue"
                          ? "Atrasada"
                          : "Pendente"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </article>
  );
}