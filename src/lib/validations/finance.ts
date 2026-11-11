import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(2),

  accountType: z.enum([
    "checking",
    "savings",
    "cash",
    "credit_card",
    "meal_voucher",
    "food_voucher",
  ]),

  institution: z.string().trim().default(""),

  ownerUserId: z.string().uuid().nullable().optional(),

  initialBalance: z.coerce.number().default(0),

  closingDay: z.coerce.number().int().min(1).max(31).nullable().optional(),

  dueDay: z.coerce.number().int().min(1).max(31).nullable().optional(),

  autoPayment: z.boolean(),

  autoPaymentAccountId: z.string().uuid().nullable().optional(),
});

export const incomeSchema = z.object({
  userId: z.string().uuid(),

  accountId: z.string().uuid().nullable().optional(),

  incomeType: z.enum([
    "salary",
    "meal_voucher",
    "food_voucher",
    "bonus",
    "freelance",
    "commission",
    "other",
  ]),

  description: z.string().trim().min(2),

  amount: z.coerce.number().positive(),

  receivedDate: z.string().min(1),

  recurring: z.boolean(),

  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
});

export const creditCardSettingsSchema = z
  .object({
    cardId: z.uuid(),
    closingDay: z.number().int().min(1, "Dia inválido.").max(31, "Dia inválido."),
    dueDay: z.number().int().min(1, "Dia inválido.").max(31, "Dia inválido."),
    autoPayment: z.boolean(),
    autoPaymentAccountId: z.uuid().nullable(),
  })
  .refine((value) => !value.autoPayment || value.autoPaymentAccountId, {
    message: "Selecione a conta que fará o pagamento automático.",
    path: ["autoPaymentAccountId"],
  });

export const recurringIncomeSettingsSchema = z.object({
  recurringIncomeId: z.uuid(),
  amount: z.number().positive("Informe um valor válido."),
  dayOfMonth: z.number().int().min(1, "Informe um dia válido.").max(31, "Informe um dia válido."),
  isActive: z.boolean(),
});

export const financePreferencesSchema = z.object({
  autoProcessFinances: z.boolean(),
  separateBenefitsFromCash: z.boolean(),
});

export const creditCardInvoiceSchema = z.object({
  creditCardId: z.uuid("Selecione o cartão."),
  referenceMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Selecione o mês da fatura."),
  amount: z.number().positive("Informe um valor válido para a fatura.").max(99_999_999),
});
