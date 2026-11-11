import { describe, expect, it } from "vitest";

import { escapeCsvValue, formatCsvAmount, toCsv } from "@/lib/csv";

describe("csv", () => {
  it("escapa aspas e valores vazios", () => {
    expect(escapeCsvValue('Conta "luz"')).toBe('"Conta ""luz"""');
    expect(escapeCsvValue(null)).toBe('""');
  });

  it("neutraliza fórmulas de planilha", () => {
    expect(escapeCsvValue('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(escapeCsvValue("@SUM(A1)")).toBe('"\'@SUM(A1)"');
  });

  it("não altera números negativos", () => {
    expect(escapeCsvValue("-12,50")).toBe('"-12,50"');
  });

  it("usa vírgula decimal e BOM para o Excel", () => {
    expect(formatCsvAmount(1234.5)).toBe("1234,50");

    const csv = toCsv(["A", "B"], [["1", "2"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe('"A";"B"\r\n"1";"2"');
  });
});
