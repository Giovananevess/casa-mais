export const RECEIPTS_BUCKET = "receipts";

export const MAX_ATTACHMENT_SIZE = 6 * 1024 * 1024;

export const ACCEPTED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AttachmentMimeType = (typeof ACCEPTED_ATTACHMENT_TYPES)[number];

export function isAcceptedAttachmentType(type: string): type is AttachmentMimeType {
  return (ACCEPTED_ATTACHMENT_TYPES as readonly string[]).includes(type);
}

/** Remove acentos e caracteres problemáticos de um nome de arquivo. */
export function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(-120);
}
