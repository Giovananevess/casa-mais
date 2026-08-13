"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { generateRecurringExpensesAction } from "@/app/(app)/actions/expenses";
import { Button } from "@/components/ui/button";

export function GenerateRecurringButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);

    const result = await generateRecurringExpensesAction();

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      onClick={handleGenerate}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <CalendarSync />
      )}

      <span>Gerar recorrentes</span>
    </Button>
  );
}
