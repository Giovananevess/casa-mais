import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  createHistorySearchParams,
} from "@/lib/history";

import type {
  HistoryFilters,
} from "@/types/history";

type HistoryPaginationProps = {
  filters: HistoryFilters;
  currentPage: number;
  totalPages: number;
  totalRows: number;
};

export function HistoryPagination({
  filters,
  currentPage,
  totalPages,
  totalRows,
}: HistoryPaginationProps) {
  const previous =
    createHistorySearchParams(
      filters,
      {
        page: Math.max(
          currentPage - 1,
          1
        ),
      }
    );

  const next =
    createHistorySearchParams(
      filters,
      {
        page: Math.min(
          currentPage + 1,
          totalPages
        ),
      }
    );

  const start =
    totalRows === 0
      ? 0
      : (currentPage - 1) *
          filters.pageSize +
        1;

  const end =
    Math.min(
      currentPage *
        filters.pageSize,
      totalRows
    );

  return (
    <section className="flex flex-col justify-between gap-4 rounded-2xl border bg-card px-4 py-3 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        Exibindo {start}–{end} de{" "}
        {totalRows} lançamento(s)
      </p>

      <div className="flex items-center gap-3">
        <p className="text-sm">
          Página {currentPage} de{" "}
          {totalPages}
        </p>

        <Button
          nativeButton={false}
          variant="outline"
          size="icon"
          disabled={
            currentPage <= 1
          }
          render={
            currentPage > 1 ? (
              <Link
                href={`/historico?${previous.toString()}`}
                aria-label="Página anterior"
              />
            ) : (
              <span
                aria-hidden="true"
              />
            )
          }
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Button
          nativeButton={false}
          variant="outline"
          size="icon"
          disabled={
            currentPage >=
            totalPages
          }
          render={
            currentPage <
            totalPages ? (
              <Link
                href={`/historico?${next.toString()}`}
                aria-label="Próxima página"
              />
            ) : (
              <span
                aria-hidden="true"
              />
            )
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}