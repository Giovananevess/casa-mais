"use client";

import { useRef, useState } from "react";
import {
  Eye,
  FileUp,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteAttachmentAction,
  getAttachmentUrlAction,
  registerAttachmentAction,
} from "@/app/(app)/actions/attachments";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/cliente";
import type { ExpenseListItem } from "@/types/expenses";

type ExpenseAttachmentsProps = {
  expense: ExpenseListItem;
};

export function ExpenseAttachments({
  expense,
}: ExpenseAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] =
    useState(false);

  async function uploadFile(file: File) {
    if (file.size > 6 * 1024 * 1024) {
      toast.error(
        "O arquivo deve ter no máximo 6 MB."
      );
      return;
    }

    const acceptedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        "Envie um arquivo PDF, JPG, PNG ou WEBP."
      );
      return;
    }

    setIsUploading(true);

    const supabase = createClient();

    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    const filePath = [
      expense.household_id,
      expense.id,
      `${crypto.randomUUID()}-${safeName}`,
    ].join("/");

    const { error: uploadError } =
      await supabase.storage
        .from("receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (uploadError) {
      setIsUploading(false);
      toast.error(uploadError.message);
      return;
    }

    const result =
      await registerAttachmentAction({
        expenseId: expense.id,
        householdId: expense.household_id,
        fileName: file.name,
        filePath,
        mimeType: file.type,
        fileSize: file.size,
      });

    if (!result.success) {
      await supabase.storage
        .from("receipts")
        .remove([filePath]);

      setIsUploading(false);
      toast.error(result.message);
      return;
    }

    setIsUploading(false);
    toast.success(result.message);
    window.location.reload();
  }

  async function viewFile(filePath: string) {
    const result =
      await getAttachmentUrlAction(filePath);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    window.open(
      result.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function removeFile(
    attachmentId: string
  ) {
    const result =
      await deleteAttachmentAction(attachmentId);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    window.location.reload();
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            Comprovantes
          </p>

          <p className="text-xs text-muted-foreground">
            PDF ou imagem de até 6 MB.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <FileUp />
          )}
          Anexar
        </Button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              uploadFile(file);
            }

            event.target.value = "";
          }}
        />
      </div>

      {expense.attachments.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-5 text-center">
          <Paperclip className="mx-auto size-5 text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum comprovante anexado.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {expense.attachments.map(
            (attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <p className="min-w-0 truncate text-sm">
                  {attachment.file_name}
                </p>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      viewFile(
                        attachment.file_path
                      )
                    }
                    aria-label="Visualizar comprovante"
                  >
                    <Eye />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeFile(attachment.id)
                    }
                    aria-label="Remover comprovante"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}