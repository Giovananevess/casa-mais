import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2),

  accountType: z.enum([
    "checking",
    "savings",
    "cash",
    "credit_card",
    "meal_voucher",
    "food_voucher",
  ]),

  institution: z
    .string()
    .trim()
    .default(""),

  ownerUserId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  initialBalance: z.coerce
    .number()
    .default(0),

  closingDay: z.coerce
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional(),

  dueDay: z.coerce
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional(),

  autoPayment: z.boolean(),

  autoPaymentAccountId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
});

export const incomeSchema = z.object({
  userId: z.string().uuid(),

  accountId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  incomeType: z.enum([
    "salary",
    "meal_voucher",
    "food_voucher",
    "bonus",
    "freelance",
    "commission",
    "other",
  ]),

  description: z
    .string()
    .trim()
    .min(2),

  amount: z.coerce
    .number()
    .positive(),

  receivedDate: z.string().min(1),

  recurring: z.boolean(),

  dayOfMonth: z.coerce
    .number()
    .int()
    .min(1)
    .max(31)
    .optional(),
});