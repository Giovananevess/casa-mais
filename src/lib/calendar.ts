import {
  addDays,
  addMonths,
  currentMonth,
  firstDayOfMonth,
  formatMonthLabel,
  isIsoMonth,
  lastDayOfMonth,
  todayISO,
  weekday,
} from "@/lib/dates";
import type { CalendarDayItem, CalendarExpense } from "@/types/calendar";

export { todayISO as getTodayString, currentMonth as getCurrentMonthString } from "@/lib/dates";

export function normalizeMonthValue(value?: string) {
  if (!isIsoMonth(value)) {
    return currentMonth();
  }

  const year = Number(value.slice(0, 4));

  return year >= 2000 && year <= 2100 ? value : currentMonth();
}

/** Intervalo semiaberto [início do mês, início do mês seguinte). */
export function getMonthDateRange(monthValue: string) {
  return {
    startDate: firstDayOfMonth(monthValue),
    endDate: firstDayOfMonth(addMonths(monthValue, 1)),
  };
}

export const getMonthLabel = formatMonthLabel;

export const changeMonth = addMonths;

export function createCalendarDays(
  monthValue: string,
  expenses: CalendarExpense[],
): CalendarDayItem[] {
  const firstDay = firstDayOfMonth(monthValue);
  const daysInMonth = Number(lastDayOfMonth(monthValue).slice(8, 10));

  // Semana começando na segunda-feira (domingo = 0 vira 6).
  const firstWeekday = weekday(firstDay);
  const leadingDays = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const gridStart = addDays(firstDay, -leadingDays);

  // Exibe sempre 5 ou 6 semanas completas.
  const totalGridDays = leadingDays + daysInMonth <= 35 ? 35 : 42;

  const today = todayISO();

  const expensesByDate = new Map<string, CalendarExpense[]>();

  for (const expense of expenses) {
    const current = expensesByDate.get(expense.due_date) ?? [];

    current.push(expense);

    expensesByDate.set(expense.due_date, current);
  }

  return Array.from({ length: totalGridDays }, (_, index) => {
    const dateValue = addDays(gridStart, index);

    return {
      date: dateValue,
      dayNumber: Number(dateValue.slice(8, 10)),
      isCurrentMonth: dateValue.startsWith(monthValue),
      isToday: dateValue === today,
      expenses: expensesByDate.get(dateValue) ?? [],
    };
  });
}
