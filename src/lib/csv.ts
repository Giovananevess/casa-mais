/**
 * Geração de CSV compatível com o Excel em pt-BR
 * (separador `;`, decimal com vírgula e BOM UTF-8 para acentos).
 */

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function escapeCsvValue(value: unknown) {
  let text = String(value ?? "");

  // Evita injeção de fórmulas ao abrir o arquivo em planilhas.
  if (FORMULA_PREFIX.test(text) && Number.isNaN(Number(text.replace(",", ".")))) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function formatCsvAmount(value: number) {
  return Number(value).toFixed(2).replace(".", ",");
}

export function toCsv(headers: string[], rows: unknown[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(";"));
  return `﻿${lines.join("\r\n")}`;
}
