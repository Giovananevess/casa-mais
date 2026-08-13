import { HistoryCategoryChart } from "@/components/history/history-category-chart";
import { HistoryFiltersComponent } from "@/components/history/history-filters";
import { HistoryList } from "@/components/history/history-list";
import { HistoryPagination } from "@/components/history/history-pagination";
import { HistoryPeopleSummary } from "@/components/history/history-people-summary";
import { HistorySummary } from "@/components/history/history-summary";

import {
  normalizeHistoryFilters,
} from "@/lib/history";

import {
  getHistoryData,
} from "@/services/history";

type HistoryPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  const parameters = await searchParams;

  const filters =
    normalizeHistoryFilters(parameters);

  const history =
    await getHistoryData(filters);

  return (
    <div className="space-y-8 pb-8">
      <section>
        <p className="text-sm font-medium text-primary">
          Análise financeira
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Histórico e relatórios
        </h1>

        <p className="mt-2 text-muted-foreground">
          Consulte movimentações anteriores,
          compare categorias e exporte seus dados.
        </p>
      </section>

      <HistoryFiltersComponent
        filters={history.filters}
        options={history.options}
      />

      <HistorySummary
        summary={history.summary}
      />

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <HistoryCategoryChart
          categories={
            history.categoriesSummary
          }
        />

        <HistoryPeopleSummary
          people={history.peopleSummary}
        />
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold">
              Lançamentos
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Resultados correspondentes aos filtros.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {history.totalRows} resultado(s)
          </p>
        </div>

        <HistoryList
          expenses={history.expenses}
          options={history.options}
        />
      </section>

      <HistoryPagination
        filters={history.filters}
        currentPage={
          history.currentPage
        }
        totalPages={
          history.totalPages
        }
        totalRows={history.totalRows}
      />
    </div>
  );
}