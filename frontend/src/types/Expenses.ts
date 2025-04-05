export type RevenueExpensesRequest = {
  department?: string;
  groupBy?: 'quarter' | 'month';
  period?: 'last-month' | 'last-quarter' | 'last-year';
};

export type RevenueExpenses = {
  label: string;
  value: number;
};

export type RevenueExpensesResponse = {
  chartData: RevenueExpenses[];
};
