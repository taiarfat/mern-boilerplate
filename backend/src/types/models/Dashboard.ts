/**
 * Dashboard Model Types
 * 
 * This file contains type definitions for the dashboard-related models.
 */

import { Document } from 'mongoose';
import { InsightType } from '../../models/AIInsight';

/**
 * Employee document interface
 */
export interface IEmployee extends Document {
  employeeName: string;
  employeeEmail: string;
  employeePassword: string;
  employeeGender: string;
  employeeDob: Date;
  employeeRole: string[];
  department: string;
  position: string;
  salary: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Department document interface
 */
export interface IDepartment extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category document interface
 */
export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project document interface
 */
export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  type: string;
  status: string;
  team: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Income document interface
 */
export interface IIncome extends Document {
  amount: number;
  yearMonth: string;
  category: string;
  project?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Expense document interface
 */
export interface IExpense extends Document {
  amount: number;
  department?: string;
  yearMonth: string;
  category: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AIInsight document interface
 */
export interface IAIInsight extends Document {
  insightType: InsightType;
  department?: string;
  category?: string;
  startDate: Date;
  endDate: Date;
  content: any;
  parameters: Record<string, any>;
  parameterHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard data response interface
 */
export interface DashboardData {
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
    activeProjects: number;
    employeeCount: number;
  };
  departmentMetrics: Array<{
    department: string;
    employeeCount: number;
    totalSalary: number;
    activeProjects: number;
  }>;
  monthlyData: Array<{
    yearMonth: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  expensesByType: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
  insights: Array<{
    type: InsightType;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }>;
}
