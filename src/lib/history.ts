import type {
  HistoryFilters,
  HistorySort,
  HistoryStatusFilter,
  HistoryTypeFilter,
} from "@/types/history";
import { addMonths, currentMonth, firstDayOfMonth, isIsoDate, lastDayOfMonth } from "@/lib/dates";

export function getDefaultHistoryPeriod() {
  const month = currentMonth();

  return {
    startDate: firstDayOfMonth(addMonths(month, -5)),
    endDate: lastDayOfMonth(month),
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

function normalizeStatus(value?: string): HistoryStatusFilter {
  const allowed: HistoryStatusFilter[] = ["all", "pending", "paid", "overdue", "cancelled"];

  return allowed.includes(value as HistoryStatusFilter) ? (value as HistoryStatusFilter) : "all";
}

function normalizeType(value?: string): HistoryTypeFilter {
  const allowed: HistoryTypeFilter[] = ["all", "fixed", "variable", "installment", "recurring"];

  return allowed.includes(value as HistoryTypeFilter) ? (value as HistoryTypeFilter) : "all";
}

function normalizeSort(value?: string): HistorySort {
  const allowed: HistorySort[] = ["newest", "oldest", "highest", "lowest", "title"];

  return allowed.includes(value as HistorySort) ? (value as HistorySort) : "newest";
}

function normalizePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function normalizePageSize(value?: string) {
  const pageSize = Number(value);

  const allowed = [12, 24, 48];

  return allowed.includes(pageSize) ? pageSize : 12;
}

export function normalizeHistoryFilters(
  parameters: Record<string, string | string[] | undefined>,
): HistoryFilters {
  const defaults = getDefaultHistoryPeriod();

  const startDate =
    typeof parameters.start === "string" && isIsoDate(parameters.start)
      ? parameters.start
      : defaults.startDate;

  const endDate =
    typeof parameters.end === "string" && isIsoDate(parameters.end)
      ? parameters.end
      : defaults.endDate;

  return {
    startDate,
    endDate: endDate < startDate ? startDate : endDate,

    search: typeof parameters.search === "string" ? parameters.search.trim().slice(0, 100) : "",

    status: normalizeStatus(typeof parameters.status === "string" ? parameters.status : undefined),

    categoryId: isUuid(parameters.category) ? parameters.category : "all",

    memberId: isUuid(parameters.member) ? parameters.member : "all",

    expenseType: normalizeType(typeof parameters.type === "string" ? parameters.type : undefined),

    sort: normalizeSort(typeof parameters.sort === "string" ? parameters.sort : undefined),

    page: normalizePage(typeof parameters.page === "string" ? parameters.page : undefined),

    pageSize: normalizePageSize(
      typeof parameters.pageSize === "string" ? parameters.pageSize : undefined,
    ),
  };
}

export function createHistorySearchParams(
  filters: HistoryFilters,
  overrides: Partial<HistoryFilters> = {},
) {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();

  params.set("start", merged.startDate);
  params.set("end", merged.endDate);

  if (merged.search) {
    params.set("search", merged.search);
  }

  if (merged.status !== "all") {
    params.set("status", merged.status);
  }

  if (merged.categoryId !== "all") {
    params.set("category", merged.categoryId);
  }

  if (merged.memberId !== "all") {
    params.set("member", merged.memberId);
  }

  if (merged.expenseType !== "all") {
    params.set("type", merged.expenseType);
  }

  if (merged.sort !== "newest") {
    params.set("sort", merged.sort);
  }

  if (merged.page > 1) {
    params.set("page", String(merged.page));
  }

  if (merged.pageSize !== 12) {
    params.set("pageSize", String(merged.pageSize));
  }

  return params;
}
