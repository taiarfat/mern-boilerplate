/**
 * Dashboard Controller
 *
 * This controller handles requests for the executive dashboard,
 * including data aggregation, metrics, and AI-generated insights.
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
import AIService from "../../../services/aiService";
import { InsightType } from "../../../models/AIInsight";
import config from "../../../constants/config";

// Initialize AI service with API key from environment variables
const aiService = new AIService(config.AI_ENDPOINT);

/**
 * Get date range based on period
 * @param period - Period type (e.g., 'last_year', 'last_2_years', 'half_year', 'quarter')
 * @returns Object containing start and end dates
 */
const getDateRangeForPeriod = (period?: string): { start: Date; end: Date } => {
  const end = new Date();
  let start = new Date();

  switch (period) {
    case "last_year":
      start.setFullYear(end.getFullYear() - 1);
      start.setMonth(0, 1);
      break;
    case "last_2_years":
      start.setFullYear(end.getFullYear() - 2);
      start.setMonth(0, 1);
      break;
    case "half_year":
      start.setMonth(end.getMonth() - 6);
      break;
    case "quarter":
      start.setMonth(end.getMonth() - 3);
      break;
    default:
      // Default to current year
      start = new Date(end.getFullYear(), 0, 1);
  }

  return { start, end };
};

/**
 * Get dashboard summary data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with dashboard summary data
 */
const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { department, period, startDate, endDate } = req.query;

    // Get date range based on period or custom dates
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      const dateRange = getDateRangeForPeriod(period as string);
      start = dateRange.start;
      end = dateRange.end;
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        "Invalid date format"
      );
    }

    // Format dates for yearMonth query
    const startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    // Get total income
    const incomeQuery: any = {
      yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
    };

    const totalIncome = await Income.aggregate([
      { $match: incomeQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get total expenses
    const expenseQuery: any = {
      yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
    };

    if (department) {
      expenseQuery.department = department;
    }

    const totalExpenses = await Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get active projects count
    const projectQuery: any = {
      status: "active",
    };

    const activeProjects = await Project.countDocuments(projectQuery);

    // Get employee count
    const employeeQuery: any = {};

    if (department) {
      employeeQuery.department = department;
    }

    const employeeCount = await Employee.countDocuments(employeeQuery);

    // Get monthly data
    const monthlyData = await getMonthlyData(
      startYearMonth,
      endYearMonth,
      department as string
    );

    // Get department metrics
    const departmentMetrics = await getDepartmentMetrics();

    // Get expense breakdown by type
    const expensesByType = await getExpensesByType(
      startYearMonth,
      endYearMonth,
      department as string
    );

    // Get AI insights if API key is available
    let insights = [];
    let recommendations = [];

    try {
      // Get trend analysis
      const trendInsight = await aiService.getInsight(
        {
          type: InsightType.TREND,
          topic: "revenue",
          data: {},
        },
        req.baseUrl + req.url
      );

      // Get recommendations
      const recommendationInsight = await aiService.getInsight(
        {
          type: InsightType.RECOMMENDATION,
          topic: "revenue",
          data: {},
        },
        req.baseUrl + req.url
      );

      // Format insights
      insights = trendInsight.insights || [];
      recommendations = recommendationInsight.recommendations || [];
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      // Continue without insights if there's an error
    }

    // Prepare response data
    const dashboardData = {
      metrics: {
        totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
        totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        profit:
          (totalIncome.length > 0 ? totalIncome[0].total : 0) -
          (totalExpenses.length > 0 ? totalExpenses[0].total : 0),
        activeProjects,
        employeeCount,
      },
      departmentMetrics,
      monthlyData,
      expensesByType,
      insights,
      recommendations,
    };

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Dashboard data retrieved successfully",
      dashboardData
    );
  } catch (err) {
    console.error("Error in getDashboardSummary:", err);
    return next(err);
  }
};

/**
 * Get monthly income and expense data
 *
 * @param startYearMonth - Start year-month (YYYY-MM)
 * @param endYearMonth - End year-month (YYYY-MM)
 * @param department - Optional department ID
 * @returns Array of monthly data
 */
const getMonthlyData = async (
  startYearMonth: string,
  endYearMonth: string,
  department?: string
): Promise<any[]> => {
  // Get monthly income
  const incomeQuery: any = {
    yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
  };

  const monthlyIncome = await Income.aggregate([
    { $match: incomeQuery },
    { $group: { _id: "$yearMonth", total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);

  // Get monthly expenses
  const expenseQuery: any = {
    yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
  };

  if (department) {
    expenseQuery.department = department;
  }

  const monthlyExpenses = await Expense.aggregate([
    { $match: expenseQuery },
    { $group: { _id: "$yearMonth", total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);

  // Combine income and expenses by month
  const monthlyData: any = {};

  monthlyIncome.forEach((item) => {
    if (!monthlyData[item._id]) {
      monthlyData[item._id] = {
        yearMonth: item._id,
        income: 0,
        expenses: 0,
        profit: 0,
      };
    }
    monthlyData[item._id].income = item.total;
    monthlyData[item._id].profit =
      monthlyData[item._id].income - monthlyData[item._id].expenses;
  });

  monthlyExpenses.forEach((item) => {
    if (!monthlyData[item._id]) {
      monthlyData[item._id] = {
        yearMonth: item._id,
        income: 0,
        expenses: 0,
        profit: 0,
      };
    }
    monthlyData[item._id].expenses = item.total;
    monthlyData[item._id].profit =
      monthlyData[item._id].income - monthlyData[item._id].expenses;
  });

  // Convert to array and sort by yearMonth
  return Object.values(monthlyData).sort((a: any, b: any) =>
    a.yearMonth.localeCompare(b.yearMonth)
  );
};

/**
 * Get department metrics
 *
 * @returns Array of department metrics
 */
const getDepartmentMetrics = async (): Promise<any[]> => {
  // Get employee count and salary by department
  const employeesByDepartment = await Employee.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $unwind: "$departmentInfo",
    },
    {
      $group: {
        _id: "$department",
        department: { $first: "$departmentInfo.name" },
        employeeCount: { $sum: 1 },
        totalSalary: { $sum: "$salary" },
      },
    },
  ]);

  // Get active projects by department
  const projectsByDepartment = await Project.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $lookup: {
        from: "employees",
        localField: "team",
        foreignField: "_id",
        as: "teamMembers",
      },
    },
    {
      $unwind: "$teamMembers",
    },
    {
      $group: {
        _id: "$teamMembers.department",
        projects: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        department: "$_id",
        activeProjects: { $size: "$projects" },
        _id: 0,
      },
    },
  ]);

  // Combine data
  const departmentMap: any = {};

  employeesByDepartment.forEach((item) => {
    departmentMap[item._id] = {
      department: item.department,
      employeeCount: item.employeeCount,
      totalSalary: item.totalSalary,
      activeProjects: 0,
    };
  });

  projectsByDepartment.forEach((item) => {
    if (departmentMap[item.department]) {
      departmentMap[item.department].activeProjects = item.activeProjects;
    }
  });

  return Object.values(departmentMap);
};

/**
 * Get expenses breakdown by type
 *
 * @param startYearMonth - Start year-month (YYYY-MM)
 * @param endYearMonth - End year-month (YYYY-MM)
 * @param department - Optional department ID
 * @returns Array of expense data by type
 */
const getExpensesByType = async (
  startYearMonth: string,
  endYearMonth: string,
  department?: string
): Promise<any[]> => {
  const expenseQuery: any = {
    yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
  };

  if (department) {
    expenseQuery.department = department;
  }

  // Get expenses by type
  const expensesByType = await Expense.aggregate([
    { $match: expenseQuery },
    { $group: { _id: "$type", amount: { $sum: "$amount" } } },
  ]);

  // Calculate total expenses
  const totalExpenses = expensesByType.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Calculate percentages
  return expensesByType.map((item) => ({
    type: item._id,
    amount: item.amount,
    percentage:
      totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0,
  }));
};

/**
 * Get AI-generated insights
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with AI-generated insights
 */
const getAIInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Extract query parameters
    const {
      startDate,
      endDate,
      department,
      category,
      insightType = InsightType.FORECAST,
    } = req.query;

    // Validate date parameters
    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        "Invalid date format"
      );
    }

    // Validate insight type
    if (!Object.values(InsightType).includes(insightType as InsightType)) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        "Invalid insight type"
      );
    }

    // Get AI insight
    const insight = await aiService.getInsight(
      {
        type: insightType as InsightType,
        topic: "revenue",
        data: {},
      },
      req.baseUrl + req.url
    );

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "AI insights retrieved successfully",
      insight
    );
  } catch (err) {
    console.error("Error in getAIInsights:", err);
    return next(err);
  }
};

/**
 * Generate sample data for testing
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const generateSampleData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Import dynamically to avoid loading in production
    const { generateAllSampleData } = await import(
      "../../../utils/sampleDataGenerator"
    );

    // Generate sample data
    await generateAllSampleData();

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Sample data generated successfully"
    );
  } catch (err) {
    console.error("Error in generateSampleData:", err);
    return next(err);
  }
};

/**
 * Get headcount metrics
 */
const getHeadcountMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { period, department } = req.query;
    const dateRange = getDateRangeForPeriod(period as string);

    // Build base query
    const query: any = {};
    if (department) {
      query.department = department;
    }

    // Get current headcount
    const currentHeadcount = await Employee.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          positions: { $addToSet: "$position" },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: "$departmentInfo",
      },
      {
        $project: {
          department: "$departmentInfo.name",
          headcount: "$count",
          averageSalary: { $divide: ["$totalSalary", "$count"] },
          positions: 1,
          _id: 0,
        },
      },
    ]);

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Headcount metrics retrieved successfully",
      {
        departments: currentHeadcount,
        totalHeadcount: currentHeadcount.reduce(
          (sum, dept) => sum + dept.headcount,
          0
        ),
      }
    );
  } catch (err) {
    console.error("Error in getHeadcountMetrics:", err);
    return next(err);
  }
};

/**
 * Get revenue anomaly predictions
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with predicted revenue anomalies and risks
 */
const getRevenueDropAlert = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period, startDate, endDate } = req.query;

    // Initialize variables for date range
    let startYearMonth: string | null = null;
    let endYearMonth: string | null = null;
    let start: Date | null = null;
    let end: Date | null = null;

    // Only apply date filters if any date-related parameters are provided
    if (period || (startDate && endDate)) {
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return sendResponse(
            res,
            httpStatusCodes["Bad Request"],
            responseStatus.ERROR,
            "Invalid date format"
          );
        }
      } else if (period) {
        const dateRange = getDateRangeForPeriod(period as string);
        start = dateRange.start;
        end = dateRange.end;
      }

      // Format dates for yearMonth query if dates are available
      if (start && end) {
        startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
        endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    }

    // Get AI insight for revenue anomaly
    const insight = await aiService.getInsight(
      {
        type: InsightType.ANOMALY,
        topic: "revenue",
        data: {
          // Only include date parameters if they are available
          ...(start && { startDate: start }),
          ...(end && { endDate: end }),
          ...(startYearMonth && { startYearMonth }),
          ...(endYearMonth && { endYearMonth }),
          // Flag to indicate if date filtering should be applied
          applyDateFilter: !!(period || (startDate && endDate))
        },
        additionalParams: {
          alertType: "drop",
          period: period as string || 'all-time'
        }
      },
      req.baseUrl + req.url
    );

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Revenue anomaly predictions retrieved successfully",
      insight
    );
  } catch (err) {
    console.error("Error in getRevenueDropAlert:", err);
    return next(err);
  }
};

/**
 * Get actionable business recommendations
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with actionable business recommendations
 */
const getActionableRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period, startDate, endDate, department, category } = req.query;

    // Initialize variables for date range
    let startYearMonth: string | null = null;
    let endYearMonth: string | null = null;
    let start: Date | null = null;
    let end: Date | null = null;

    // Only apply date filters if any date-related parameters are provided
    if (period || (startDate && endDate)) {
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return sendResponse(
            res,
            httpStatusCodes["Bad Request"],
            responseStatus.ERROR,
            "Invalid date format"
          );
        }
      } else if (period) {
        const dateRange = getDateRangeForPeriod(period as string);
        start = dateRange.start;
        end = dateRange.end;
      }

      // Format dates for yearMonth query if dates are available
      if (start && end) {
        startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
        endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    }

    // Get AI insight for actionable recommendations
    const recommendations = await aiService.getInsight(
      {
        type: InsightType.RECOMMENDATION,
        topic: "actionable",
        data: {
          // Only include date parameters if they are available
          ...(start && { startDate: start }),
          ...(end && { endDate: end }),
          ...(startYearMonth && { startYearMonth }),
          ...(endYearMonth && { endYearMonth }),
          ...(department && { department }),
          ...(category && { category }),
          // Flag to indicate if date filtering should be applied
          applyDateFilter: !!(period || (startDate && endDate))
        },
        additionalParams: {
          period: period as string || 'last-year'
        }
      },
      req.baseUrl + req.url
    );

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Actionable business recommendations retrieved successfully",
      recommendations
    );
  } catch (err) {
    console.error("Error in getActionableRecommendations:", err);
    return next(err);
  }
};

export default {
  getDashboardSummary,
  getAIInsights,
  generateSampleData,
  getHeadcountMetrics,
  getRevenueDropAlert,
  getActionableRecommendations,
};
