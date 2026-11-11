import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  currentMonth,
  daysBetween,
  formatDateBR,
  formatMonthLabel,
  isIsoDate,
  isIsoMonth,
  lastDayOfMonth,
  monthRange,
  todayISO,
  weekday,
} from "@/lib/dates";

describe("todayISO", () => {
  it("usa o fuso de São Paulo, não o do servidor", () => {
    // 23h30 em São Paulo (UTC-3) já é o dia seguinte em UTC.
    const lateNight = new Date("2026-11-11T02:30:00Z");
    expect(todayISO(lateNight)).toBe("2026-11-10");
    expect(currentMonth(new Date("2026-12-01T01:00:00Z"))).toBe("2026-11");
  });
});

describe("aritmética de meses", () => {
  it("vira o ano corretamente", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-06", -5)).toBe("2026-01");
  });

  it("calcula o último dia do mês, inclusive em ano bissexto", () => {
    expect(lastDayOfMonth("2026-02")).toBe("2026-02-28");
    expect(lastDayOfMonth("2028-02")).toBe("2028-02-29");
    expect(lastDayOfMonth("2026-04")).toBe("2026-04-30");
    expect(monthRange("2026-12")).toEqual({ startDate: "2026-12-01", endDate: "2026-12-31" });
  });
});

describe("dias", () => {
  it("soma dias atravessando meses", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("calcula diferença em dias", () => {
    expect(daysBetween("2026-11-11", "2026-11-11")).toBe(0);
    expect(daysBetween("2026-11-11", "2026-12-11")).toBe(30);
    expect(daysBetween("2026-11-11", "2026-11-10")).toBe(-1);
  });

  it("sabe o dia da semana", () => {
    expect(weekday("2026-11-11")).toBe(3); // quarta-feira
    expect(weekday("2026-11-01")).toBe(0); // domingo
  });
});

describe("validação e formatação", () => {
  it("rejeita datas impossíveis", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("2026-11-11")).toBe(true);
    expect(isIsoMonth("2026-00")).toBe(false);
    expect(isIsoMonth("2026-12")).toBe(true);
  });

  it("formata no padrão brasileiro", () => {
    expect(formatDateBR("2026-03-07")).toBe("07/03/2026");
    expect(formatMonthLabel("2026-03")).toBe("Março de 2026");
  });
});
