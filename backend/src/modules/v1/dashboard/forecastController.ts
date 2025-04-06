/**
 * Dashboard Forecast Controller
 *
 * This controller handles requests for forecast data,
 * including revenue and expense forecasts with AI-generated insights.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Income from "../../../models/Income";
import Expense from "../../../models/Expense";
import Employee from "../../../models/Employee";
import Project from "../../../models/Project";
import Department from "../../../models/Department";
import Category from "../../../models/Category";
import AIService from "../../../services/aiService";
import { InsightType } from "../../../models/AIInsight";
import { getDateRange, generateMonthsArray, groupMonthsByQuarter } from "../../../utils/dateRangeHelper";
import mongoose from "mongoose";

// Initialize AI service
const aiService = new AIService(process.env.AI_API_ENDPOINT || 'http://localhost:11434/api/generate');

/**
 * Get revenue forecast data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with revenue forecast data
 */
export const getRevenueForecast = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const {
      period = 'last-year',
      department,
      category,
      projectType,
      groupBy = 'month',
      customStartDate,
      customEndDate
    } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Build query for income data
    const incomeQuery: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    // Apply filters
    let departmentName = null;
    let categoryName = null;
    let projectTypeName = projectType as string || null;

    // If projectType is specified, filter by project type
    if (projectType) {
      // Find projects of the specified type
      const projects = await Project.find({ type: projectType }).select('_id');
      const projectIds = projects.map(p => p._id);

      // Add project filter to query
      if (projectIds.length > 0) {
        incomeQuery.project = { $in: projectIds };
      }
    }

    // If department is specified, calculate department's contribution
    if (department) {
      // Get department name
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;

      // Get all employees in the department
      const departmentEmployees = await Employee.find({ department }).select('_id');
      const departmentEmployeeIds = departmentEmployees.map(emp => emp._id.toString());

      // Get all projects with income in the date range
      const projectsWithIncome = await Income.distinct('project', incomeQuery);

      // Filter out null projects
      const validProjectIds = projectsWithIncome.filter(id => id !== null);

      // Get project details with team members
      const projectFilter: any = {
        _id: { $in: validProjectIds }
      };

      // Add project type filter if specified
      if (projectType) {
        projectFilter.type = projectType;
      }

      const projects = await Project.find(projectFilter).select('_id team');

      // Create a map to store department income by month
      const departmentIncomeByMonth: Record<string, number> = {};

      // Get all months in the range
      const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

      // Initialize all months with zero
      allMonths.forEach(month => {
        departmentIncomeByMonth[month] = 0;
      });

      // For each project, calculate the department's contribution
      for (const project of projects) {
        // Get all team members for this project
        const projectTeamIds = project.team.map(id => id.toString());

        // Count department employees in this project
        const departmentEmployeesInProject = projectTeamIds.filter(id =>
          departmentEmployeeIds.includes(id)
        ).length;

        // If no department employees in this project, skip
        if (departmentEmployeesInProject === 0) continue;

        // Calculate the proportion of department employees in the project
        const totalProjectEmployees = projectTeamIds.length;
        const departmentProportion = departmentEmployeesInProject / totalProjectEmployees;

        // Get income for this project by month
        const projectIncomeData = await Income.aggregate([
          {
            $match: {
              yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth },
              project: project._id
            }
          },
          {
            $group: {
              _id: "$yearMonth",
              total: { $sum: "$amount" }
            }
          }
        ]);

        // Add proportional income to department totals
        projectIncomeData.forEach(item => {
          const month = item._id;
          const projectIncome = item.total;
          const departmentIncome = projectIncome * departmentProportion;

          departmentIncomeByMonth[month] = (departmentIncomeByMonth[month] || 0) + departmentIncome;
        });
      }

      // Round all values to whole numbers
      Object.keys(departmentIncomeByMonth).forEach(month => {
        departmentIncomeByMonth[month] = Math.round(departmentIncomeByMonth[month]);
      });

      // Format data for AI
      let chartData;
      if (groupBy === 'quarter') {
        // Group by quarter
        const quarterGroups = groupMonthsByQuarter(allMonths);

        chartData = Object.entries(quarterGroups).map(([quarter, months]) => {
          const total = months.reduce((sum, month) => sum + (departmentIncomeByMonth[month] || 0), 0);
          return { label: quarter, value: total };
        });
      } else {
        // Group by month (default)
        chartData = allMonths.map(month => ({
          label: month,
          value: departmentIncomeByMonth[month] || 0
        }));
      }

      // Get forecast from AI
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      const forecast = await aiService.getInsight({
        type: InsightType.FORECAST,
        topic: 'revenue',
        data: chartData,
        groupBy: groupBy as string
      }, fullUrl);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        responseStatus.SUCCESS,
        "Revenue forecast retrieved successfully",
        {
          ...forecast,
          period: period as string,
          groupBy: groupBy as string,
          department: departmentName,
          projectType: projectTypeName,
          category: categoryName,
          dateRange: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
    }

    // If category is specified, filter by category
    if (category) {
      // Get category name
      const categoryDoc = await Category.findById(category);
      categoryName = categoryDoc?.name;

      // Add category filter to query
      incomeQuery.category = category;
    }

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Aggregate income data by month
    const incomeData = await Income.aggregate([
      { $match: incomeQuery },
      {
        $group: {
          _id: "$yearMonth",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map of month to total
    const incomeByMonth: Record<string, number> = {};

    incomeData.forEach(item => {
      incomeByMonth[item._id] = item.total;
    });

    // Fill in missing months with zero
    allMonths.forEach(month => {
      if (!incomeByMonth[month]) {
        incomeByMonth[month] = 0;
      }
    });

    // Format data for AI
    let chartData;
    if (groupBy === 'quarter') {
      // Group by quarter
      const quarterGroups = groupMonthsByQuarter(allMonths);

      chartData = Object.entries(quarterGroups).map(([quarter, months]) => {
        const total = months.reduce((sum, month) => sum + (incomeByMonth[month] || 0), 0);
        return { label: quarter, value: total };
      });
    } else {
      // Group by month (default)
      chartData = allMonths.map(month => ({
        label: month,
        value: incomeByMonth[month] || 0
      }));
    }

    // Get forecast from AI
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const forecast = await aiService.getInsight({
      type: InsightType.FORECAST,
      topic: 'revenue',
      data: chartData,
      groupBy: groupBy as string
    }, fullUrl);

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Revenue forecast retrieved successfully",
      {
        ...forecast,
        period: period as string,
        groupBy: groupBy as string,
        department: departmentName,
        projectType: projectTypeName,
        category: categoryName,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getRevenueForecast:", err);
    return next(err);
  }
};

/**
 * Get expense forecast data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with expense forecast data
 */
export const getExpenseForecast = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const {
      period = 'last-year',
      department,
      category,
      groupBy = 'month',
      customStartDate,
      customEndDate
    } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Build query for expense data
    const expenseQuery: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    // Apply filters
    let departmentName = null;
    let categoryName = null;

    // If department is specified, filter by department
    if (department) {
      // Get department name
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;

      // Add department filter to query
      expenseQuery.department = new mongoose.Types.ObjectId(department as string);
    }

    // If category is specified, filter by category
    if (category) {
      // Get category name
      const categoryDoc = await Category.findById(category);
      categoryName = categoryDoc?.name;

      // Add category filter to query
      expenseQuery.category = new mongoose.Types.ObjectId(category as string);
    }

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Aggregate expense data by month
    const expenseData = await Expense.aggregate([
      { $match: expenseQuery },
      {
        $group: {
          _id: "$yearMonth",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map of month to total
    const expenseByMonth: Record<string, number> = {};

    expenseData.forEach(item => {
      expenseByMonth[item._id] = item.total;
    });

    // Fill in missing months with zero
    allMonths.forEach(month => {
      if (!expenseByMonth[month]) {
        expenseByMonth[month] = 0;
      }
    });

    // Get expense breakdown by type
    const expenseBreakdown = await Expense.aggregate([
      { $match: expenseQuery },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          type: "$_id",
          total: 1,
          _id: 0
        }
      }
    ]);

    // Calculate total expenses
    const totalExpenses = Object.values(expenseByMonth).reduce((sum, value) => sum + value, 0);

    // Calculate percentages for expense breakdown
    const expenseBreakdownWithPercentages = expenseBreakdown.map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0
    }));

    // Format data for AI
    let chartData;
    if (groupBy === 'quarter') {
      // Group by quarter
      const quarterGroups = groupMonthsByQuarter(allMonths);

      chartData = Object.entries(quarterGroups).map(([quarter, months]) => {
        const total = months.reduce((sum, month) => sum + (expenseByMonth[month] || 0), 0);
        return { label: quarter, value: total };
      });
    } else {
      // Group by month (default)
      chartData = allMonths.map(month => ({
        label: month,
        value: expenseByMonth[month] || 0
      }));
    }

    // Get forecast from AI
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const forecast = await aiService.getInsight({
      type: InsightType.FORECAST,
      topic: 'expense',
      data: {
        chartData,
        expenseBreakdown: expenseBreakdownWithPercentages
      },
      groupBy: groupBy as string
    }, fullUrl);

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Expense forecast retrieved successfully",
      {
        ...forecast,
        period: period as string,
        groupBy: groupBy as string,
        department: departmentName,
        category: categoryName,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getExpenseForecast:", err);
    return next(err);
  }
};

export default {
  getRevenueForecast,
  getExpenseForecast
};
