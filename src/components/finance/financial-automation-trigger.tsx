"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { runFinancialAutomationsAction } from "@/app/(app)/actions/automations";

/**
 * Dispara as automações financeiras uma vez por montagem e
 * atualiza a tela se algo novo foi gerado.
 */
export function FinancialAutomationTrigger() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    runFinancialAutomationsAction()
      .then((result) => {
        if (result.changed) router.refresh();
      })
      .catch((error) => console.error("Erro ao executar automações:", error));
  }, [router]);

  return null;
}
