import { useQuery } from '@tanstack/react-query';
import { getDepartments, getExpenses, getHeadcount, getRevenue } from '../services';
import { RevenueExpensesRequest } from '../types/Expenses';

export const useGetDepartments = () => {
  return useQuery({ queryKey: ['departments'], queryFn: getDepartments });
};

export const useGetHeadcount = ({ period, groupBy }: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['headcount', { period, groupBy }],
    queryFn: () => getHeadcount({ period, groupBy }),
  });
};

export const useGetExpenses = ({ department, groupBy, period }: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['expenses', { department, groupBy, period }],
    queryFn: () => getExpenses({ department, groupBy, period }),
  });
};

export const useGetRevenue = ({ department, groupBy, period }: RevenueExpensesRequest) => {
  return useQuery({
    queryKey: ['revenue', { department, groupBy, period }],
    queryFn: () => getRevenue({ department, groupBy, period }),
  });
};
