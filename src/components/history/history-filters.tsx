import {
  Download,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createHistorySearchParams,
  getDefaultHistoryPeriod,
} from "@/lib/history";

import type {
  ExpenseFormOptions,
} from "@/types/expenses";

import type {
  HistoryFilters,
} from "@/types/history";

type HistoryFiltersProps = {
  filters: HistoryFilters;
  options: ExpenseFormOptions;
};

export function HistoryFiltersComponent({
  filters,
  options,
}: HistoryFiltersProps) {
  const exportParams =
    createHistorySearchParams(filters, {
      page: 1,
    });

  const defaults =
    getDefaultHistoryPeriod();

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />

            <h2 className="font-semibold">
              Filtros do histórico
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Refine o período e os lançamentos exibidos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={
              <a
                href={`/historico?start=${defaults.startDate}&end=${defaults.endDate}`}
              />
            }
          >
            <RotateCcw />
            Limpar filtros
          </Button>

          <Button
            render={
              <a
                href={`/historico/exportar?${exportParams.toString()}`}
              />
            }
          >
            <Download />
            Exportar CSV
          </Button>
        </div>
      </div>

      <form
        action="/historico"
        method="get"
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="history-search">
            Pesquisar
          </Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="history-search"
              name="search"
              className="pl-10"
              defaultValue={filters.search}
              placeholder="Nome da conta..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-start">
            Data inicial
          </Label>

          <Input
            id="history-start"
            name="start"
            type="date"
            defaultValue={
              filters.startDate
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-end">
            Data final
          </Label>

          <Input
            id="history-end"
            name="end"
            type="date"
            defaultValue={
              filters.endDate
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-status">
            Situação
          </Label>

          <select
            id="history-status"
            name="status"
            defaultValue={filters.status}
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              Todas
            </option>

            <option value="paid">
              Pagas
            </option>

            <option value="pending">
              Pendentes
            </option>

            <option value="overdue">
              Atrasadas
            </option>

            <option value="cancelled">
              Canceladas
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-category">
            Categoria
          </Label>

          <select
            id="history-category"
            name="category"
            defaultValue={
              filters.categoryId
            }
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              Todas
            </option>

            {options.categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-member">
            Pessoa
          </Label>

          <select
            id="history-member"
            name="member"
            defaultValue={
              filters.memberId
            }
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              Todas
            </option>

            {options.members.map(
              (member) => (
                <option
                  key={member.user_id}
                  value={member.user_id}
                >
                  {member.name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-type">
            Tipo
          </Label>

          <select
            id="history-type"
            name="type"
            defaultValue={
              filters.expenseType
            }
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              Todos
            </option>

            <option value="variable">
              Variável
            </option>

            <option value="fixed">
              Fixa
            </option>

            <option value="installment">
              Parcelada
            </option>

            <option value="recurring">
              Recorrente
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-sort">
            Ordenar
          </Label>

          <select
            id="history-sort"
            name="sort"
            defaultValue={filters.sort}
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="newest">
              Mais recentes
            </option>

            <option value="oldest">
              Mais antigas
            </option>

            <option value="highest">
              Maior valor
            </option>

            <option value="lowest">
              Menor valor
            </option>

            <option value="title">
              Nome A–Z
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="history-page-size">
            Itens por página
          </Label>

          <select
            id="history-page-size"
            name="pageSize"
            defaultValue={
              String(filters.pageSize)
            }
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>

        <div className="flex items-end md:col-span-2">
          <Button
            type="submit"
            className="w-full"
          >
            <Filter />
            Aplicar filtros
          </Button>
        </div>
      </form>
    </section>
  );
}