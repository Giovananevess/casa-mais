"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  cancelExpenseAction,
  deleteExpenseAction,
  setExpenseStatusAction,
} from "@/app/(app)/actions/expenses";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type {
  ExpenseFormOptions,
  ExpenseListItem,
} from "@/types/expenses";

type ExpenseActionsProps = {
  expense: ExpenseListItem;
  options: ExpenseFormOptions;
};

export function ExpenseActions({
  expense,
  options,
}: ExpenseActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] =
    useState(false);

  async function changeStatus(
    status: "paid" | "pending"
  ) {
    setIsLoading(true);

    const result = await setExpenseStatusAction(
      expense.id,
      status,
      expense.paid_by_profile?.id ??
        options.members[0]?.user_id
    );

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function cancelExpense() {
    setIsLoading(true);

    const result = await cancelExpenseAction(
      expense.id
    );

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function deleteExpense() {
    setIsLoading(true);

    const result = await deleteExpenseAction(
      expense.id
    );

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {expense.status === "paid" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() =>
            changeStatus("pending")
          }
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RotateCcw />
          )}
          Voltar para pendente
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={isLoading}
          onClick={() => changeStatus("paid")}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <CheckCircle2 />
          )}
          Marcar como paga
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
            >
              <Ban />
              Cancelar
            </Button>
          }
        />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancelar esta conta?
            </AlertDialogTitle>

            <AlertDialogDescription>
              A conta não será apagada. Ela
              continuará disponível para fins
              de histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Voltar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={cancelExpense}
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="destructive"
              size="sm"
            >
              <Trash2 />
              Excluir
            </Button>
          }
        />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir definitivamente?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Esta ação removerá a conta,
              pagamentos, divisões e anexos
              vinculados. Ela não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Voltar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={deleteExpense}
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}