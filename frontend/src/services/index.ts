import { AnomalyResponse } from '../types/Anomaly';
import { DepartmentResponse } from '../types/Department';
import { RevenueExpensesRequest, RevenueExpensesResponse } from '../types/Expenses';
import { HeadCountResponse } from '../types/HeadCount';
import { IncomeCategoryResponse } from '../types/IncomeCategory';
import api from './api';

export const getDepartments = async (): Promise<DepartmentResponse> => {
  const response = await api.get('/departments');
  return response.data;
};

export const getIncomeCategories = async (): Promise<IncomeCategoryResponse> => {
  const response = await api.get('/categories');
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
  categoryId,
  projectType,
}: RevenueExpensesRequest): Promise<RevenueExpensesResponse> => {
  const response = await api.get('/dashboard/charts/expenses', {
    params: { department, groupBy, period, categoryId, projectType },
  });
  return response.data;
};

export const getRevenue = async ({
  department,
  groupBy,
  period,
  categoryId,
  projectType,
}: RevenueExpensesRequest): Promise<RevenueExpensesResponse> => {
  const response = await api.get('/dashboard/charts/revenue', {
    params: { department, groupBy, period, categoryId, projectType },
  });
  return response.data;
};

export const getAnomalies = async (): Promise<AnomalyResponse> => {
  const response = await api.get('/dashboard/revenue-drop-alert');
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getIncome = async () => {
  const response = await api.get('/income');
  return response.data;
};

export const getExpensesList = async () => {
  const response = await api.get('/expenses');
  return response.data;
};
