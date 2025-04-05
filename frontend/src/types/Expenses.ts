export type RevenueExpensesRequest = {
  department?: string;
  groupBy?: 'quarter' | 'month';
  period?: 'last-month' | 'last-quarter' | 'last-year';
  categoryId?: 'Software PVT' | 'System' | 'Product';
  projectType?: 'fixed' | 'dedicated';
};

export type RevenueExpenses = {
  label: string;
  value: number;
};

export type RevenueExpensesResponse = {
  chartData: RevenueExpenses[];
};
