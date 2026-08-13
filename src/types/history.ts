import type {
  ExpenseFormOptions,
  ExpenseListItem,
  ExpenseStatus,
  ExpenseType,
} from "@/types/expenses";

export type HistoryStatusFilter =
  | "all"
  | ExpenseStatus;

export type HistoryTypeFilter =
  | "all"
  | ExpenseType
  | "recurring";

export type HistorySort =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest"
  | "title";

export type HistoryFilters = {
  startDate: string;
  endDate: string;
  search: string;
  status: HistoryStatusFilter;
  categoryId: string;
  memberId: string;
  expenseType: HistoryTypeFilter;
  sort: HistorySort;
  page: number;
  pageSize: number;
};

export type HistoryExpense = ExpenseListItem & {
  display_status: ExpenseStatus;
};

export type HistorySummary = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  cancelled: number;

  totalCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  cancelledCount: number;

  averageExpense: number;
  highestExpense: number;
  paidPercentage: number;
};

export type HistoryCategorySummary = {
  categoryId: string | null;
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
};

export type HistoryPersonSummary = {
  userId: string;
  name: string;
  amount: number;
  count: number;
  percentage: number;
};

export type HistoryPageData = {
  expenses: HistoryExpense[];
  summary: HistorySummary;
  categoriesSummary: HistoryCategorySummary[];
  peopleSummary: HistoryPersonSummary[];
  options: ExpenseFormOptions;

  totalRows: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;

  filters: HistoryFilters;
};