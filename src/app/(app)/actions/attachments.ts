"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function registerAttachmentAction(input: {
  expenseId: string;
  householdId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false as const,
      message: "Sessão expirada.",
    };
  }

  const { error } = await supabase
    .from("attachments")
    .insert({
      household_id: input.householdId,
      expense_id: input.expenseId,
      uploaded_by: user.id,
      file_name: input.fileName,
      file_path: input.filePath,
      mime_type: input.mimeType,
      file_size: input.fileSize,
    });

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  revalidatePath("/contas");
  revalidatePath("/dashboard");

  return {
    success: true as const,
    message: "Comprovante enviado.",
  };
}

export async function deleteAttachmentAction(
  attachmentId: string
) {
  const supabase = await createClient();

  const { data: attachment, error: findError } =
    await supabase
      .from("attachments")
      .select("file_path")
      .eq("id", attachmentId)
      .single();

  if (findError || !attachment) {
    return {
      success: false as const,
      message: "Comprovante não encontrado.",
    };
  }

  const { error: storageError } =
    await supabase.storage
      .from("receipts")
      .remove([attachment.file_path]);

  if (storageError) {
    return {
      success: false as const,
      message: storageError.message,
    };
  }

  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  revalidatePath("/contas");

  return {
    success: true as const,
    message: "Comprovante removido.",
  };
}

export async function getAttachmentUrlAction(
  filePath: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(filePath, 300);

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  return {
    success: true as const,
    signedUrl: data.signedUrl,
  };
}