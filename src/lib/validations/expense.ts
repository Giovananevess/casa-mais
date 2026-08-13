import { z } from "zod";

const optionalUuid = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().uuid().safeParse(value).success,
    "Identificador inválido."
  );

export const createExpenseSchema = z.object({
purchaseDate: z
  .string()
  .min(
    1,
    "Informe a data da compra."
  ),
  
  title: z
    .string()
    .trim()
    .min(2, "Informe o nome da conta.")
    .max(100, "Use no máximo 100 caracteres."),

  description: z
    .string()
    .trim()
    .max(300, "Use no máximo 300 caracteres.")
    .optional()
    .default(""),

  amount: z.coerce
    .number()
    .positive("O valor deve ser maior que zero.")
    .max(99999999, "O valor informado é muito alto."),

  dueDate: z
    .string()
    .min(1, "Informe a data de vencimento.")
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}T12:00:00`)),
      "Data inválida."
    ),

  categoryId: optionalUuid,

  accountId: optionalUuid,

  paidBy: z.string().uuid("Escolha quem realizou o pagamento."),

  status: z.enum(["pending", "paid"]),

  splitType: z.enum(["equal", "individual"]),

  expenseType: z.enum([
    "fixed",
    "variable",
    "installment",
  ]),

paymentMethod: z.enum([
  "cash",
  "pix",
  "debit_card",
  "credit_card",
  "meal_voucher",
  "food_voucher",
  "bank_transfer",
  "other",
]),

  notes: z
    .string()
    .trim()
    .max(500, "Use no máximo 500 caracteres.")
    .optional()
    .default(""),
});

export type CreateExpenseInput =
  z.infer<typeof createExpenseSchema>;



export const updateExpenseSchema =
  createExpenseSchema.extend({
    expenseId: z.string().uuid(),
  });

export const installmentExpenseSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).default(""),
  totalAmount: z.coerce.number().positive(),
  installments: z.coerce.number().int().min(2).max(120),
  firstDueDate: z.string().min(1),
  categoryId: optionalUuid,
  accountId: optionalUuid,
  paidBy: z.string().uuid(),
  splitType: z.enum(["equal", "individual"]),
  paymentMethod: z.string().trim().max(50).default(""),
  notes: z.string().trim().max(500).default(""),
});

export const recurringExpenseSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).default(""),
  defaultAmount: z.coerce.number().positive(),
  dueDay: z.coerce.number().int().min(1).max(31),
  startDate: z.string().min(1),
  endDate: z.string().default(""),
  categoryId: optionalUuid,
  accountId: optionalUuid,
  paidBy: z.string().uuid(),
  splitType: z.enum(["equal", "individual"]),
  paymentMethod: z.string().trim().max(50).default(""),
  notes: z.string().trim().max(500).default(""),
});