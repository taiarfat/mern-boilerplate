import { DepartmentResponse } from '../types/Department';
import { RevenueExpensesRequest, RevenueExpensesResponse } from '../types/Expenses';
import { HeadCountResponse } from '../types/HeadCount';
import api from './api';

export const getDepartments = async (): Promise<DepartmentResponse> => {
  const response = await api.get('/departments');
  return response.data;
};

export const getHeadcount = async ({
  period,
  groupBy,
}: RevenueExpensesRequest): Promise<HeadCountResponse> => {
  const response = await api.get('/dashboard/charts/headcount', {
    params: { period, groupBy },
  });
  return response.data;
};

export const getExpenses = async ({
  department,
  groupBy,
  period,
}: RevenueExpensesRequest): Promise<RevenueExpensesResponse> => {
  const response = await api.get('/dashboard/charts/expenses', {
    params: { department, groupBy, period },
  });
  return response.data;
};

export const getRevenue = async ({
  department,
  groupBy,
  period,
}: RevenueExpensesRequest): Promise<RevenueExpensesResponse> => {
  const response = await api.get('/dashboard/charts/revenue', {
    params: { department, groupBy, period },
  });
  return response.data;
};
