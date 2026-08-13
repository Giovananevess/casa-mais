import { z } from "zod";

export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da meta.")
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .default(""),

  icon: z
    .string()
    .trim()
    .min(1)
    .default("target"),

  color: z
    .string()
    .trim()
    .min(1)
    .default("emerald"),

  targetAmount: z.coerce
    .number()
    .positive("Informe um valor maior que zero."),

  initialAmount: z.coerce
    .number()
    .min(0)
    .default(0),

  targetDate: z
    .string()
    .default(""),

  priority: z.enum([
    "low",
    "medium",
    "high",
  ]),
});

export const updateGoalSchema =
  goalSchema.omit({
    initialAmount: true,
  }).extend({
    goalId: z.string().uuid(),
    status: z.enum([
      "active",
      "completed",
      "paused",
      "cancelled",
    ]),
  });

export const goalContributionSchema =
  z.object({
    goalId: z.string().uuid(),
    userId: z.string().uuid(),

    amount: z.coerce
      .number()
      .positive(
        "O aporte deve ser maior que zero."
      ),

    contributionDate: z
      .string()
      .min(1, "Informe a data."),

    notes: z
      .string()
      .trim()
      .max(300)
      .default(""),

    sourceType: z.enum([
      "manual",
      "income",
      "transfer",
      "adjustment",
    ]).default("manual"),

    incomeId: z
      .string()
      .uuid()
      .nullable()
      .optional(),
  });