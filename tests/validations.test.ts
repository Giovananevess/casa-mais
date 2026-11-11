import { describe, expect, it } from "vitest";

import { sanitizeFileName, isAcceptedAttachmentType } from "@/lib/attachments";
import { createExpenseSchema } from "@/lib/validations/expense";
import { creditCardInvoiceSchema, creditCardSettingsSchema } from "@/lib/validations/finance";
import { moneyBoxMovementSchema } from "@/lib/validations/money-boxes";

const UUID = "4f9c2b1e-8a3d-4c6f-9b2e-1d5a7c3e9f00";

describe("createExpenseSchema", () => {
  const base = {
    purchaseDate: "2026-11-01",
    title: "Internet",
    amount: "129.90",
    dueDate: "2026-11-10",
    categoryId: "",
    accountId: "",
    paidBy: UUID,
    status: "pending",
    splitType: "equal",
    expenseType: "fixed",
    paymentMethod: "pix",
  };

  it("converte o valor e aceita IDs opcionais vazios", () => {
    const result = createExpenseSchema.parse(base);
    expect(result.amount).toBe(129.9);
    expect(result.categoryId).toBe("");
  });

  it("rejeita valores negativos e IDs malformados", () => {
    expect(createExpenseSchema.safeParse({ ...base, amount: -1 }).success).toBe(false);
    expect(createExpenseSchema.safeParse({ ...base, categoryId: "x" }).success).toBe(false);
  });
});

describe("cartão de crédito", () => {
  it("exige conta pagadora quando há pagamento automático", () => {
    const result = creditCardSettingsSchema.safeParse({
      cardId: UUID,
      closingDay: 5,
      dueDay: 12,
      autoPayment: true,
      autoPaymentAccountId: null,
    });

    expect(result.success).toBe(false);
  });

  it("valida o mês da fatura", () => {
    const invoice = { creditCardId: UUID, amount: 500 };
    expect(
      creditCardInvoiceSchema.safeParse({ ...invoice, referenceMonth: "2026-13" }).success,
    ).toBe(false);
    expect(
      creditCardInvoiceSchema.safeParse({ ...invoice, referenceMonth: "2026-08" }).success,
    ).toBe(true);
  });
});

describe("caixinhas", () => {
  it("rejeita data inválida na movimentação", () => {
    const result = moneyBoxMovementSchema.safeParse({
      moneyBoxId: UUID,
      userId: UUID,
      accountId: null,
      transactionType: "deposit",
      amount: 10,
      description: null,
      transactionDate: "2026-02-30",
    });

    expect(result.success).toBe(false);
  });
});

describe("anexos", () => {
  it("limpa nomes de arquivo", () => {
    expect(sanitizeFileName("Comprovante ação nº 1.pdf")).toBe("Comprovante-acao-n-1.pdf");
    expect(sanitizeFileName("../../etc/passwd")).toBe("..-..-etc-passwd");
  });

  it("aceita só os tipos permitidos", () => {
    expect(isAcceptedAttachmentType("application/pdf")).toBe(true);
    expect(isAcceptedAttachmentType("text/html")).toBe(false);
  });
});
