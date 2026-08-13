import type {
  CalendarDayItem,
  CalendarExpense,
} from "@/types/calendar";

export function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function normalizeMonthValue(
  value?: string
) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return getCurrentMonthString();
  }

  const [year, month] = value
    .split("-")
    .map(Number);

  if (
    year < 2000 ||
    year > 2100 ||
    month < 1 ||
    month > 12
  ) {
    return getCurrentMonthString();
  }

  return value;
}

export function getMonthDateRange(
  monthValue: string
) {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  const start = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month, 1);

  return {
    startDate: getLocalDateString(start),
    endDate: getLocalDateString(nextMonth),
  };
}

export function getMonthLabel(
  monthValue: string
) {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  const label = new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    }
  ).format(new Date(year, month - 1, 1));

  return (
    label.charAt(0).toUpperCase() +
    label.slice(1)
  );
}

export function changeMonth(
  monthValue: string,
  amount: number
) {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1 + amount,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function createCalendarDays(
  monthValue: string,
  expenses: CalendarExpense[]
): CalendarDayItem[] {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  const firstDay = new Date(
    year,
    month - 1,
    1
  );

  const lastDay = new Date(
    year,
    month,
    0
  );

  /*
   * Converte domingo = 0 para uma semana
   * iniciando na segunda-feira.
   */
  const leadingDays =
    firstDay.getDay() === 0
      ? 6
      : firstDay.getDay() - 1;

  const gridStart = new Date(
    year,
    month - 1,
    1 - leadingDays
  );

  const totalUsedDays =
    leadingDays + lastDay.getDate();

  /*
   * Exibe sempre 5 ou 6 semanas completas.
   */
  const totalGridDays =
    totalUsedDays <= 35 ? 35 : 42;

  const today = getLocalDateString(
    new Date()
  );

  const expensesByDate = new Map<
    string,
    CalendarExpense[]
  >();

  for (const expense of expenses) {
    const current =
      expensesByDate.get(expense.due_date) ??
      [];

    current.push(expense);

    expensesByDate.set(
      expense.due_date,
      current
    );
  }

  return Array.from(
    { length: totalGridDays },
    (_, index) => {
      const date = new Date(gridStart);

      date.setDate(
        gridStart.getDate() + index
      );

      const dateValue =
        getLocalDateString(date);

      return {
        date: dateValue,
        dayNumber: date.getDate(),
        isCurrentMonth:
          date.getMonth() === month - 1,
        isToday: dateValue === today,
        expenses:
          expensesByDate.get(dateValue) ??
          [],
      };
    }
  );
}