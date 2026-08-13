"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validations/expense";
import {
  installmentExpenseSchema,
  recurringExpenseSchema,
  updateExpenseSchema,
} from "@/lib/validations/expense";

export type ExpenseActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export type CreateExpenseResult =
  | {
      success: true;
      expenseId: string;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createExpenseAction(
  input: CreateExpenseInput
): Promise<CreateExpenseResult> {
  const validation =
    createExpenseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        "Revise os campos destacados antes de continuar.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const { data, error } = await supabase.rpc(
    "create_household_expense",
    {
      p_title: values.title,
      p_description: values.description || null,
      p_amount: values.amount,
      p_due_date: values.dueDate,
      p_category_id: values.categoryId || null,
      p_account_id: values.accountId || null,
      p_paid_by: values.paidBy,
      p_status: values.status,
      p_split_type: values.splitType,
      p_expense_type: values.expenseType,
      p_payment_method:
        values.paymentMethod || null,
      p_notes: values.notes || null,
    }
  );

  if (error) {
    console.error(
      "Erro ao cadastrar despesa:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Não foi possível cadastrar a conta.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/calendario");
  revalidatePath("/historico");

  return {
    success: true,
    expenseId: String(data),
    message: "Conta cadastrada com sucesso.",
  };
}
function refreshFinancialPages() {
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/calendario");
  revalidatePath("/historico");
}

export async function updateExpenseAction(
  input: unknown
) {
  const validation =
    updateExpenseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Revise os campos informados.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "update_household_expense",
    {
      p_expense_id: values.expenseId,
      p_title: values.title,
      p_description: values.description || null,
      p_amount: values.amount,
      p_due_date: values.dueDate,
      p_category_id: values.categoryId || null,
      p_account_id: values.accountId || null,
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_expense_type: values.expenseType,
      p_payment_method:
        values.paymentMethod || null,
      p_notes: values.notes || null,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message: "Conta atualizada com sucesso.",
  };
}

export async function setExpenseStatusAction(
  expenseId: string,
  status: "paid" | "pending",
  paidBy?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "set_expense_status",
    {
      p_expense_id: expenseId,
      p_status: status,
      p_paid_by: paidBy || null,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message:
      status === "paid"
        ? "Conta marcada como paga."
        : "Conta voltou para pendente.",
  };
}

export async function cancelExpenseAction(
  expenseId: string,
  reason?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "cancel_household_expense",
    {
      p_expense_id: expenseId,
      p_reason: reason || null,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message: "Conta cancelada.",
  };
}

export async function deleteExpenseAction(
  expenseId: string
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "delete_household_expense",
    {
      p_expense_id: expenseId,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message: "Conta excluída definitivamente.",
  };
}

export async function createInstallmentsAction(
  input: unknown
) {
  const validation =
    installmentExpenseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Revise os dados do parcelamento.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "create_installment_expenses",
    {
      p_title: values.title,
      p_description: values.description || null,
      p_total_amount: values.totalAmount,
      p_installments: values.installments,
      p_first_due_date: values.firstDueDate,
      p_category_id: values.categoryId || null,
      p_account_id: values.accountId || null,
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_payment_method:
        values.paymentMethod || null,
      p_notes: values.notes || null,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message: "Parcelamento criado com sucesso.",
  };
}

export async function createRecurringExpenseAction(
  input: unknown
) {
  const validation =
    recurringExpenseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Revise os dados da recorrência.",
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "create_recurring_expense",
    {
      p_title: values.title,
      p_description: values.description || null,
      p_default_amount: values.defaultAmount,
      p_due_day: values.dueDay,
      p_start_date: values.startDate,
      p_end_date: values.endDate || null,
      p_category_id: values.categoryId || null,
      p_account_id: values.accountId || null,
      p_paid_by: values.paidBy,
      p_split_type: values.splitType,
      p_payment_method:
        values.paymentMethod || null,
      p_notes: values.notes || null,
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  await supabase.rpc(
    "generate_recurring_expenses",
    {
      p_reference_month:
        new Date().toISOString().slice(0, 10),
    }
  );

  refreshFinancialPages();

  return {
    success: true as const,
    message: "Conta recorrente criada.",
  };
}

export async function generateRecurringExpensesAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "generate_recurring_expenses",
    {
      p_reference_month:
        new Date().toISOString().slice(0, 10),
    }
  );

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  refreshFinancialPages();

  return {
    success: true as const,
    message:
      Number(data) === 0
        ? "Nenhuma nova conta precisava ser gerada."
        : `${data} conta(s) recorrente(s) gerada(s).`,
  };
}


