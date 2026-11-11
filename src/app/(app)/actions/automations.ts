"use server";

import { revalidateAreas } from "@/lib/revalidate";
import { runFinancialAutomations } from "@/services/financial-automations";

/**
 * Gera receitas recorrentes do mês e processa débitos automáticos de cartão.
 * É idempotente no banco, então pode ser chamada a cada visita ao dashboard.
 */
export async function runFinancialAutomationsAction() {
  const result = await runFinancialAutomations();
  const changed = result.incomesGenerated > 0 || result.paymentsProcessed > 0;

  if (changed) revalidateAreas("finance");

  return { ...result, changed };
}
