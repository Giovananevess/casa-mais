"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  accountSchema,
  incomeSchema,
} from "@/lib/validations/finance";

import {
  getHouseholdContext,
} from "@/services/household-context";

/*
 * =====================================================
 * REVALIDAÇÃO
 * =====================================================
 */

function refreshFinance() {
  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/contas"
  );

  revalidatePath(
    "/receitas"
  );

  revalidatePath(
    "/contas-financeiras"
  );

  revalidatePath(
    "/historico"
  );

  revalidatePath(
    "/calendario"
  );

  revalidatePath(
    "/configuracoes"
  );
}

/*
 * =====================================================
 * CRIAR CONTA FINANCEIRA
 * =====================================================
 */

export async function createFinancialAccountAction(
  input: unknown
) {
  const validation =
    accountSchema.safeParse(
      input
    );

  if (
    !validation.success
  ) {
    return {
      success:
        false as const,

      message:
        "Revise os dados da conta.",

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }

  const values =
    validation.data;

  try {
    const {
      supabase,
      user,
      householdId,
    } =
      await getHouseholdContext();

    const isBenefit =
      [
        "meal_voucher",
        "food_voucher",
      ].includes(
        values.accountType
      );

    /*
     * Se for cartão e auto pagamento
     * estiver ativado, exigimos uma
     * conta pagadora.
     */
    if (
      values.accountType ===
        "credit_card" &&
      values.autoPayment &&
      !values.autoPaymentAccountId
    ) {
      return {
        success:
          false as const,

        message:
          "Selecione a conta que fará o pagamento automático do cartão.",
      };
    }

    /*
     * Evita cartão pagando cartão.
     */
    if (
      values.accountType ===
        "credit_card" &&
      values.autoPaymentAccountId
    ) {
      const {
        data: paymentAccount,
        error:
          paymentAccountError,
      } = await supabase
        .from("accounts")
        .select(`
          id,
          account_type,
          household_id,
          is_active
        `)
        .eq(
          "id",
          values
            .autoPaymentAccountId
        )
        .eq(
          "household_id",
          householdId
        )
        .maybeSingle();

      if (
        paymentAccountError
      ) {
        return {
          success:
            false as const,

          message:
            paymentAccountError.message,
        };
      }

      if (
        !paymentAccount ||
        !paymentAccount.is_active
      ) {
        return {
          success:
            false as const,

          message:
            "A conta de pagamento automático é inválida.",
        };
      }

      if (
        paymentAccount.account_type ===
        "credit_card"
      ) {
        return {
          success:
            false as const,

          message:
            "A conta pagadora não pode ser outro cartão de crédito.",
        };
      }
    }

    const {
      error,
    } = await supabase
      .from("accounts")
      .insert({
        household_id:
          householdId,

        name:
          values.name.trim(),

        account_type:
          values.accountType,

        institution:
          values.institution
            ?.trim() ||
          null,

        owner_user_id:
          values.ownerUserId ||
          null,

        initial_balance:
          values.initialBalance,

        current_balance:
          values.initialBalance,

        closing_day:
          values.accountType ===
          "credit_card"
            ? values.closingDay
            : null,

        due_day:
          values.accountType ===
          "credit_card"
            ? values.dueDay
            : null,

        auto_payment:
          values.accountType ===
          "credit_card"
            ? values.autoPayment
            : false,

        auto_payment_account_id:
          values.accountType ===
            "credit_card" &&
          values.autoPayment
            ? values
                .autoPaymentAccountId ||
              null
            : null,

        is_benefit:
          isBenefit,

        is_active:
          true,

        /*
         * Só mantenha essa linha
         * se accounts tiver created_by.
         */
        created_by:
          user.id,
      });

    if (error) {
      console.error(
        "Erro ao criar conta financeira:",
        error
      );

      return {
        success:
          false as const,

        message:
          error.message,
      };
    }

    refreshFinance();

    return {
      success:
        true as const,

      message:
        "Conta financeira criada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro inesperado ao criar conta financeira:",
      error
    );

    return {
      success:
        false as const,

      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta financeira.",
    };
  }
}

/*
 * =====================================================
 * CRIAR RECEITA
 * =====================================================
 */

export async function createIncomeAction(
  input: unknown
) {
  const validation =
    incomeSchema.safeParse(
      input
    );

  if (
    !validation.success
  ) {
    return {
      success:
        false as const,

      message:
        "Revise os dados da receita.",

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }

  const values =
    validation.data;

  try {
    /*
     * Aqui podemos usar createClient
     * normalmente porque as RPCs usam
     * auth.uid().
     */
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return {
        success:
          false as const,

        message:
          "Sua sessão expirou. Entre novamente.",
      };
    }

    const isBenefit =
      [
        "meal_voucher",
        "food_voucher",
      ].includes(
        values.incomeType
      );

    let recurringIncomeId:
      | string
      | null =
      null;

    /*
     * =====================================================
     * 1. RECORRÊNCIA
     * =====================================================
     */

    if (
      values.recurring
    ) {
      const {
        data:
          recurringData,

        error:
          recurringError,
      } = await supabase.rpc(
        "create_recurring_income",
        {
          p_user_id:
            values.userId,

          p_account_id:
            values.accountId ||
            null,

          p_income_type:
            values.incomeType,

          p_description:
            values.description,

          p_amount:
            values.amount,

          p_day_of_month:
            values.dayOfMonth ??
            Number(
              values.receivedDate.slice(
                8,
                10
              )
            ),

          p_is_benefit:
            isBenefit,

          p_start_date:
            values.receivedDate,

          p_end_date:
            null,
        }
      );

      if (
        recurringError
      ) {
        console.error(
          "Erro ao criar receita recorrente:",
          recurringError
        );

        if (
          recurringError.code ===
          "23505"
        ) {
          return {
            success:
              false as const,

            message:
              "Já existe uma receita recorrente igual para essa pessoa. Edite a recorrência em Configurações.",
          };
        }

        return {
          success:
            false as const,

          message:
            recurringError.message,
        };
      }

      recurringIncomeId =
        recurringData
          ? String(
              recurringData
            )
          : null;
    }

    /*
     * =====================================================
     * 2. RECEITA DO MÊS
     * =====================================================
     */

    const {
      error:
        incomeError,
    } = await supabase.rpc(
      "create_household_income",
      {
        p_user_id:
          values.userId,

        p_account_id:
          values.accountId ||
          null,

        p_income_type:
          values.incomeType,

        p_description:
          values.description,

        p_amount:
          values.amount,

        p_received_date:
          values.receivedDate,

        p_is_benefit:
          isBenefit,

        p_recurring_income_id:
          recurringIncomeId,
      }
    );

    if (
      incomeError
    ) {
      console.error(
        "Erro ao criar receita:",
        incomeError
      );

      return {
        success:
          false as const,

        message:
          incomeError.message,
      };
    }

    refreshFinance();

    return {
      success:
        true as const,

      message:
        values.recurring
          ? "Receita cadastrada e recorrência mensal criada."
          : "Receita cadastrada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro inesperado ao cadastrar receita:",
      error
    );

    return {
      success:
        false as const,

      message:
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a receita.",
    };
  }
}

/*
 * =====================================================
 * CRIAR FATURA DE CARTÃO
 * =====================================================
 */

export async function createCreditCardInvoiceAction(
  input: {
    creditCardId:
      string;

    referenceMonth:
      string;

    amount:
      number;
  }
) {
  if (
    !input.creditCardId
  ) {
    return {
      success:
        false as const,

      message:
        "Selecione o cartão.",
    };
  }

  if (
    !input.referenceMonth
  ) {
    return {
      success:
        false as const,

      message:
        "Selecione o mês da fatura.",
    };
  }

  if (
    !Number.isFinite(
      input.amount
    ) ||
    input.amount <= 0
  ) {
    return {
      success:
        false as const,

      message:
        "Informe um valor válido para a fatura.",
    };
  }

  try {
    const {
      supabase,
    } =
      await getHouseholdContext();

    /*
     * Front manda:
     * 2026-08
     *
     * RPC recebe:
     * 2026-08-01
     */
    const referenceMonth =
      `${input.referenceMonth}-01`;

    const {
      data,
      error,
    } = await supabase.rpc(
      "create_credit_card_invoice",
      {
        p_credit_card_id:
          input.creditCardId,

        p_reference_month:
          referenceMonth,

        p_amount:
          input.amount,
      }
    );

    if (error) {
      console.error(
        "Erro ao criar fatura:",
        error
      );

      return {
        success:
          false as const,

        message:
          error.message,
      };
    }

    revalidatePath(
      "/contas"
    );

    revalidatePath(
      "/dashboard"
    );

    revalidatePath(
      "/calendario"
    );

    revalidatePath(
      "/historico"
    );

    return {
      success:
        true as const,

      message:
        "Fatura cadastrada com sucesso.",

      expenseId:
        data
          ? String(data)
          : null,
    };
  } catch (error) {
    console.error(
      "Erro inesperado ao criar fatura:",
      error
    );

    return {
      success:
        false as const,

      message:
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a fatura.",
    };
  }
}