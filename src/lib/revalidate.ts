import "server-only";

import { revalidatePath } from "next/cache";

const AREAS = {
  expenses: ["/dashboard", "/contas", "/calendario", "/historico"],
  finance: [
    "/dashboard",
    "/contas",
    "/receitas",
    "/contas-financeiras",
    "/historico",
    "/calendario",
    "/configuracoes",
  ],
  goals: ["/metas", "/dashboard", "/calendario"],
  moneyBoxes: ["/caixinhas", "/dashboard", "/contas-financeiras"],
  settings: ["/configuracoes", "/contas-financeiras", "/receitas", "/dashboard"],
} as const;

export type RevalidationArea = keyof typeof AREAS;

/** Revalida todas as rotas afetadas pelas áreas informadas (sem duplicatas). */
export function revalidateAreas(...areas: RevalidationArea[]) {
  const paths = new Set(areas.flatMap((area) => AREAS[area]));
  paths.forEach((path) => revalidatePath(path));
}
