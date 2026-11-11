import { describe, expect, it } from "vitest";

import { createHistorySearchParams, normalizeHistoryFilters } from "@/lib/history";

const UUID = "4f9c2b1e-8a3d-4c6f-9b2e-1d5a7c3e9f00";

describe("normalizeHistoryFilters", () => {
  it("aplica padrões seguros a parâmetros inválidos", () => {
    const filters = normalizeHistoryFilters({
      status: "hack",
      type: "nope",
      sort: "drop table",
      page: "-3",
      pageSize: "1000",
      category: "not-a-uuid",
      member: "' or 1=1",
    });

    expect(filters).toMatchObject({
      status: "all",
      expenseType: "all",
      sort: "newest",
      page: 1,
      pageSize: 12,
      categoryId: "all",
      memberId: "all",
    });
  });

  it("aceita filtros válidos", () => {
    const filters = normalizeHistoryFilters({
      start: "2026-01-01",
      end: "2026-03-31",
      status: "overdue",
      category: UUID,
      pageSize: "24",
      search: "  aluguel  ",
    });

    expect(filters).toMatchObject({
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      status: "overdue",
      categoryId: UUID,
      pageSize: 24,
      search: "aluguel",
    });
  });

  it("nunca deixa o fim antes do início", () => {
    const filters = normalizeHistoryFilters({ start: "2026-05-10", end: "2026-01-01" });
    expect(filters.endDate).toBe("2026-05-10");
  });

  it("ignora datas impossíveis", () => {
    const filters = normalizeHistoryFilters({ start: "2026-02-31" });
    expect(filters.startDate).not.toBe("2026-02-31");
  });
});

describe("createHistorySearchParams", () => {
  it("omite valores padrão da URL e faz ida e volta", () => {
    const filters = normalizeHistoryFilters({ start: "2026-01-01", end: "2026-01-31" });
    const params = createHistorySearchParams(filters, { status: "paid", page: 2 });

    expect(params.toString()).toBe("start=2026-01-01&end=2026-01-31&status=paid&page=2");
    expect(normalizeHistoryFilters(Object.fromEntries(params))).toMatchObject({
      status: "paid",
      page: 2,
    });
  });
});
