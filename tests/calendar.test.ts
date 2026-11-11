import { describe, expect, it } from "vitest";

import { createCalendarDays, getMonthDateRange, normalizeMonthValue } from "@/lib/calendar";
import type { CalendarExpense } from "@/types/calendar";

describe("createCalendarDays", () => {
  it("monta a grade começando na segunda-feira", () => {
    // Novembro/2026 começa num domingo → 6 dias do mês anterior antes.
    const days = createCalendarDays("2026-11", []);

    expect(days[0].date).toBe("2026-10-26");
    expect(days[0].isCurrentMonth).toBe(false);
    expect(days[6].date).toBe("2026-11-01");
    expect(days.length % 7).toBe(0);
  });

  it("usa 6 semanas apenas quando necessário", () => {
    expect(createCalendarDays("2026-11", [])).toHaveLength(42); // 6 + 30 = 36 dias
    expect(createCalendarDays("2026-02", [])).toHaveLength(35); // começa na segunda
  });

  it("agrupa as contas pelo dia de vencimento", () => {
    const expenses = [
      { id: "a", due_date: "2026-11-10" },
      { id: "b", due_date: "2026-11-10" },
      { id: "c", due_date: "2026-11-20" },
    ] as unknown as CalendarExpense[];

    const days = createCalendarDays("2026-11", expenses);
    const day10 = days.find((day) => day.date === "2026-11-10");

    expect(day10?.expenses.map((expense) => expense.id)).toEqual(["a", "b"]);
  });
});

describe("helpers de mês", () => {
  it("retorna intervalo semiaberto para a consulta", () => {
    expect(getMonthDateRange("2026-12")).toEqual({
      startDate: "2026-12-01",
      endDate: "2027-01-01",
    });
  });

  it("normaliza valores inválidos para o mês atual", () => {
    expect(normalizeMonthValue("2026-05")).toBe("2026-05");
    expect(normalizeMonthValue("lixo")).toMatch(/^\d{4}-\d{2}$/);
    expect(normalizeMonthValue("1999-01")).not.toBe("1999-01");
  });
});
