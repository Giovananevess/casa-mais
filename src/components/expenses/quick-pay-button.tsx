"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { setExpenseStatusAction } from "@/app/(app)/actions/expenses";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuickPayButtonProps = {
  expenseId: string;
  title: string;
  paidBy?: string | null;
  /** Chamado assim que o usuário clica, para atualizações otimistas. */
  onPaid?: () => void;
  /** Chamado se o pagamento falhar ou for desfeito. */
  onReverted?: () => void;
  className?: string;
  size?: "sm" | "xs";
};

/**
 * Marca uma conta como paga com um clique e oferece "Desfazer" no aviso.
 * A action já revalida o dashboard, então a tela se atualiza sozinha.
 */
export function QuickPayButton({
  expenseId,
  title,
  paidBy,
  onPaid,
  onReverted,
  className,
  size = "sm",
}: QuickPayButtonProps) {
  const [isPending, startTransition] = useTransition();

  function undo() {
    startTransition(async () => {
      const result = await setExpenseStatusAction(expenseId, "pending");

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      onReverted?.();
      toast.success(`"${title}" voltou para pendente.`);
    });
  }

  function pay(event: React.MouseEvent) {
    // O botão costuma ficar dentro de itens clicáveis.
    event.stopPropagation();
    event.preventDefault();

    onPaid?.();

    startTransition(async () => {
      const result = await setExpenseStatusAction(expenseId, "paid", paidBy ?? undefined);

      if (!result.success) {
        onReverted?.();
        toast.error(result.message);
        return;
      }

      toast.success(`"${title}" marcada como paga.`, {
        action: { label: "Desfazer", onClick: undo },
      });
    });
  }

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      disabled={isPending}
      onClick={pay}
      className={cn(
        "rounded-full hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300",
        className,
      )}
      aria-label={`Marcar "${title}" como paga`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Check />}
      Pagar
    </Button>
  );
}
