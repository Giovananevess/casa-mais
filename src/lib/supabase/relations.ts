/**
 * O PostgREST pode devolver relacionamentos aninhados como objeto
 * ou como array, dependendo de como a FK foi inferida. Esta função
 * normaliza para um único objeto (ou null).
 */
export function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
