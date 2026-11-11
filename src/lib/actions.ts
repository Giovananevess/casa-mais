import "server-only";

import { z } from "zod";

import { AuthError, getSessionContext, type SessionContext } from "@/lib/auth/session";

export type FieldErrors = Record<string, string[]>;

export type ActionFailure = {
  success: false;
  message: string;
  fieldErrors?: FieldErrors;
};

export type ActionSuccess<T extends object = object> = {
  success: true;
  message: string;
} & T;

export type ActionResult<T extends object = object> = ActionSuccess<T> | ActionFailure;

export function ok(message: string): ActionSuccess;
export function ok<T extends object>(message: string, data: T): ActionSuccess<T>;
export function ok<T extends object>(message: string, data?: T) {
  return { success: true as const, message, ...(data ?? {}) };
}

export function fail(message: string, fieldErrors?: FieldErrors): ActionFailure {
  return fieldErrors ? { success: false, message, fieldErrors } : { success: false, message };
}

/** Converte um erro do zod em uma falha amigável. */
export function invalid(
  error: z.ZodError,
  message = "Revise os campos destacados.",
): ActionFailure {
  const entries = Object.entries(z.flattenError(error).fieldErrors as Record<string, unknown>);
  const fieldErrors: FieldErrors = {};

  for (const [field, messages] of entries) {
    if (Array.isArray(messages) && messages.length > 0) fieldErrors[field] = messages;
  }

  return fail(message, fieldErrors);
}

type PostgrestLikeError = { message: string; code?: string };

/**
 * Traduz erros comuns do Postgres/Supabase em mensagens
 * compreensíveis, sem vazar detalhes internos do banco.
 */
export function dbError(error: PostgrestLikeError, fallback: string): ActionFailure {
  console.error(`[action] ${fallback}`, error);

  switch (error.code) {
    case "23505":
      return fail("Já existe um registro igual a este.");
    case "23503":
      return fail("Este registro está vinculado a outro e não pode ser alterado assim.");
    case "23514":
      return fail("Algum valor informado é inválido.");
    case "42501":
      return fail("Você não tem permissão para fazer isso.");
    case "P0001":
      // `raise exception` disparado pelas funções do banco: mensagem já é amigável.
      return fail(error.message);
    default:
      return fail(fallback);
  }
}

/**
 * Executa uma server action garantindo sessão e casa válidas,
 * e transformando qualquer exceção em um `ActionFailure`.
 */
export async function withSession<T extends object>(
  handler: (context: SessionContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const context = await getSessionContext();
    return await handler(context);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.message);
    }

    console.error("[action] erro inesperado", error);
    return fail("Algo deu errado. Tente novamente em instantes.");
  }
}

export const uuid = z.uuid("Identificador inválido.");
