import { z } from "zod";

import { isIsoDate } from "@/lib/dates";

export const moneyBoxSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da caixinha.").max(80),
  ownerUserId: z.uuid().nullable(),
  description: z.string().trim().max(300).nullable(),
  targetAmount: z.number().positive("A meta deve ser maior que zero.").nullable(),
  goalId: z.uuid().nullable(),
});

export const moneyBoxMovementSchema = z.object({
  moneyBoxId: z.uuid(),
  userId: z.uuid("Escolha quem fez a movimentação."),
  accountId: z.uuid().nullable(),
  transactionType: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive("Informe um valor maior que zero.").max(99_999_999),
  description: z.string().trim().max(300).nullable(),
  transactionDate: z.string().refine(isIsoDate, "Data inválida."),
});
