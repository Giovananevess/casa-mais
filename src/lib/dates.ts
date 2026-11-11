/**
 * Utilitários de data do Casa+.
 *
 * Toda data "de calendário" (vencimento, recebimento, mês de referência)
 * é tratada como string `YYYY-MM-DD` ou `YYYY-MM`, sem horário, e o
 * "hoje" é sempre calculado no fuso da casa — não no fuso do servidor,
 * que em produção costuma ser UTC.
 */

export const APP_TIME_ZONE = "America/Sao_Paulo";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function fromParts(year: number, monthIndex: number, day: number) {
  // Date.UTC normaliza estouros (ex.: mês 13 → janeiro do ano seguinte).
  const date = new Date(Date.UTC(year, monthIndex, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function parse(value: string) {
  const [year, month, day = 1] = value.split("-").map(Number);
  return { year, month, day };
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const { year, month, day } = parse(value);
  return fromParts(year, month - 1, day) === value;
}

export function isIsoMonth(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_MONTH.test(value)) return false;
  const { month } = parse(value);
  return month >= 1 && month <= 12;
}

/** Data de hoje (`YYYY-MM-DD`) no fuso da aplicação. */
export function todayISO(now: Date = new Date()) {
  return isoFormatter.format(now);
}

/** Converte um instante (timestamp) para a data local da aplicação. */
export function toLocalISODate(value: string | Date) {
  return isoFormatter.format(typeof value === "string" ? new Date(value) : value);
}

/** Mês atual (`YYYY-MM`) no fuso da aplicação. */
export function currentMonth(now: Date = new Date()) {
  return todayISO(now).slice(0, 7);
}

export function addDays(date: string, amount: number) {
  const { year, month, day } = parse(date);
  return fromParts(year, month - 1, day + amount);
}

/** Soma meses a um `YYYY-MM`. */
export function addMonths(month: string, amount: number) {
  const { year, month: m } = parse(month);
  return fromParts(year, m - 1 + amount, 1).slice(0, 7);
}

export function firstDayOfMonth(month: string) {
  return `${month.slice(0, 7)}-01`;
}

export function lastDayOfMonth(month: string) {
  const { year, month: m } = parse(month);
  return fromParts(year, m, 0);
}

/** Intervalo fechado [primeiro dia, último dia] do mês. */
export function monthRange(month: string) {
  return { startDate: firstDayOfMonth(month), endDate: lastDayOfMonth(month) };
}

/** Dia da semana (0 = domingo) de uma data `YYYY-MM-DD`. */
export function weekday(date: string) {
  const { year, month, day } = parse(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatDateBR(date: string) {
  const { year, month, day } = parse(date);
  return `${pad(day)}/${pad(month)}/${year}`;
}

export function formatMonthLabel(month: string) {
  const { year, month: m } = parse(month);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, m - 1, 1)));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Diferença em dias entre duas datas `YYYY-MM-DD` (to - from). */
export function daysBetween(from: string, to: string) {
  const a = parse(from);
  const b = parse(to);
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000,
  );
}
