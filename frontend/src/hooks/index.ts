import { useQuery } from '@tanstack/react-query';
import {
  getAnomalies,
  getDepartments,
  getEmployees,
  getExpenses,
  getExpensesList,
  getHeadcount,
  getIncome,
  getIncomeCategories,
  getProjects,
  getRevenue,
} from '../services';
import { RevenueExpensesRequest } from '../types/Expenses';

export const useGetDepartments = () => {
  return useQuery({ queryKey: ['departments'], queryFn: getDepartments });
};

export const useGetIncomeCategories = () => {
  return useQuery({ queryKey: ['income-categories'], queryFn: getIncomeCategories });
};

export const useGetHeadcount = ({ period, groupBy }: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['headcount', { period, groupBy }],
    queryFn: () => getHeadcount({ period, groupBy }),
  });
};

export const useGetExpenses = ({
  department,
  groupBy,
  period,
  categoryId,
  projectType,
}: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['expenses', { department, groupBy, period, categoryId, projectType }],
    queryFn: () => getExpenses({ department, groupBy, period, categoryId, projectType }),
  });
};

export const useGetRevenue = ({
  department,
  groupBy,
  period,
  categoryId,
  projectType,
}: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['revenue', { department, groupBy, period, categoryId, projectType }],
    queryFn: () => getRevenue({ department, groupBy, period, categoryId, projectType }),
  });
};

export const useGetAnomalies = () => {
  return useQuery({ queryKey: ['anomalies'], queryFn: getAnomalies });
};

export const useGetEmployees = () => {
  return useQuery({ queryKey: ['employees'], queryFn: getEmployees });
};

export const useGetProjects = () => {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects });
};

export const useGetIncome = () => {
  return useQuery({ queryKey: ['income'], queryFn: getIncome });
};

export const useGetExpensesList = () => {
  return useQuery({ queryKey: ['expenses-list'], queryFn: getExpensesList });
};
