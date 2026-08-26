import { NextResponse } from "next/server";

import {
  runFinancialAutomations,
} from "@/services/financial-automations";

export async function POST() {
  try {
    const result =
      await runFinancialAutomations();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Erro ao processar automações:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado.",
      },
      {
        status: 500,
      }
    );
  }
}