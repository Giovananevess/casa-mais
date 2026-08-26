"use client";

import { useEffect } from "react";

export function FinancialAutomationTrigger() {
  useEffect(() => {
    async function process() {
      try {
        await fetch(
          "/api/finance/process",
          {
            method: "POST",
          }
        );
      } catch (error) {
        console.error(
          "Erro ao executar automações:",
          error
        );
      }
    }

    process();
  }, []);

  return null;
}