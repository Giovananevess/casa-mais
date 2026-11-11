"use server";

import { z } from "zod";

import { dbError, fail, invalid, ok, uuid, withSession, type ActionResult } from "@/lib/actions";
import { ACCEPTED_ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE, RECEIPTS_BUCKET } from "@/lib/attachments";
import { revalidateAreas } from "@/lib/revalidate";

const SIGNED_URL_TTL_SECONDS = 300;

const registerSchema = z.object({
  expenseId: uuid,
  fileName: z.string().trim().min(1).max(255),
  filePath: z.string().trim().min(1).max(500),
  mimeType: z.enum(ACCEPTED_ATTACHMENT_TYPES, "Envie um arquivo PDF, JPG, PNG ou WEBP."),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_ATTACHMENT_SIZE, "O arquivo deve ter no máximo 6 MB."),
});

/**
 * Registra no banco um comprovante que o navegador já enviou ao Storage.
 * O `household_id` é sempre derivado da sessão — nunca do cliente — e o
 * caminho do arquivo precisa estar dentro da pasta da própria conta.
 */
export async function registerAttachmentAction(
  input: z.input<typeof registerSchema>,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error, "Arquivo inválido.");

  const values = parsed.data;

  return withSession(async ({ supabase, user, householdId }) => {
    const expectedPrefix = `${householdId}/${values.expenseId}/`;

    if (!values.filePath.startsWith(expectedPrefix) || values.filePath.includes("..")) {
      return fail("Caminho do arquivo inválido.");
    }

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", values.expenseId)
      .eq("household_id", householdId)
      .maybeSingle();

    if (expenseError) return dbError(expenseError, "Não foi possível validar a conta.");
    if (!expense) return fail("Conta não encontrada.");

    const { error } = await supabase.from("attachments").insert({
      household_id: householdId,
      expense_id: values.expenseId,
      uploaded_by: user.id,
      file_name: values.fileName,
      file_path: values.filePath,
      mime_type: values.mimeType,
      file_size: values.fileSize,
    });

    if (error) return dbError(error, "Não foi possível registrar o comprovante.");

    revalidateAreas("expenses");
    return ok("Comprovante enviado.");
  });
}

export async function deleteAttachmentAction(attachmentId: string): Promise<ActionResult> {
  if (!uuid.safeParse(attachmentId).success) return fail("Comprovante inválido.");

  return withSession(async ({ supabase, householdId }) => {
    const { data: attachment, error: findError } = await supabase
      .from("attachments")
      .select("id, file_path")
      .eq("id", attachmentId)
      .eq("household_id", householdId)
      .maybeSingle();

    if (findError) return dbError(findError, "Não foi possível localizar o comprovante.");
    if (!attachment) return fail("Comprovante não encontrado.");

    // Remove o registro primeiro: um arquivo órfão no Storage é inofensivo,
    // já um registro apontando para um arquivo inexistente quebra a tela.
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachment.id)
      .eq("household_id", householdId);

    if (error) return dbError(error, "Não foi possível remover o comprovante.");

    const { error: storageError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([attachment.file_path]);

    if (storageError) {
      console.error("[action] arquivo do comprovante não removido do storage", storageError);
    }

    revalidateAreas("expenses");
    return ok("Comprovante removido.");
  });
}

export async function getAttachmentUrlAction(
  filePath: string,
): Promise<ActionResult<{ signedUrl: string }>> {
  if (typeof filePath !== "string" || !filePath) return fail("Comprovante inválido.");

  return withSession(async ({ supabase, householdId }) => {
    const { data: attachment, error: findError } = await supabase
      .from("attachments")
      .select("file_path")
      .eq("file_path", filePath)
      .eq("household_id", householdId)
      .maybeSingle();

    if (findError) return dbError(findError, "Não foi possível localizar o comprovante.");
    if (!attachment) return fail("Comprovante não encontrado.");

    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .createSignedUrl(attachment.file_path, SIGNED_URL_TTL_SECONDS);

    if (error || !data) return fail("Não foi possível abrir o comprovante.");

    return ok("Link gerado.", { signedUrl: data.signedUrl });
  });
}
