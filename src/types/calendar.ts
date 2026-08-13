import type {
  ExpenseFormOptions,
  ExpenseListItem,
  ExpenseStatus,
} from "@/types/expenses";

export type CalendarExpense = ExpenseListItem & {
  display_status: ExpenseStatus;
};

export type CalendarMonthSummary = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  expenseCount: number;
  paidCount: number;
};

export type CalendarPageData = {
  expenses: CalendarExpense[];
  options: ExpenseFormOptions;
  summary: CalendarMonthSummary;
  referenceMonth: string;
};

export type CalendarDayItem = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  expenses: CalendarExpense[];
};