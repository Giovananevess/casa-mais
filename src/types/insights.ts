export type FinancialInsightType =
  | "positive"
  | "warning"
  | "neutral";

export type FinancialInsight = {
  id: string;
  type: FinancialInsightType;
  title: string;
  description: string;
  href?: string;
};