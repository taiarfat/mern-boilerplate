/**
 * Dashboard Analytics Controller
 *
 * This controller handles requests for dashboard analytics data,
 * including revenue, expenses, and headcount charts with filtering.
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
import { getDateRange, generateMonthsArray, groupMonthsByQuarter } from "../../../utils/dateRangeHelper";
import mongoose from "mongoose";

/**
 * Get revenue chart data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with revenue chart data
 */
export const getRevenueChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period = 'last-year', department, groupBy = 'month', customStartDate, customEndDate } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Build query
    const query: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Aggregate income data by month
    const incomeData = await Income.aggregate([
      { $match: query },
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

    // Format response based on groupBy parameter
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

    // If department is specified, calculate department's contribution
    if (department) {
      // Get all employees in the department
      const departmentEmployees = await Employee.find({ department }).select('_id');
      const departmentEmployeeIds = departmentEmployees.map(emp => emp._id.toString());

      // Get all projects with income in the date range
      const projectsWithIncome = await Income.distinct('project', query);

      // Filter out null projects
      const validProjectIds = projectsWithIncome.filter(id => id !== null);

      // Get project details with team members
      const projects = await Project.find({
        _id: { $in: validProjectIds }
      }).select('_id team');

      // Create a map to store department income by month
      const departmentIncomeByMonth: Record<string, number> = {};

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
              ...query,
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

      // Add department data to chart data
      if (groupBy === 'quarter') {
        const quarterGroups = groupMonthsByQuarter(allMonths);

        const departmentChartData = Object.entries(quarterGroups).map(([quarter, months]) => {
          const total = months.reduce((sum, month) => sum + (departmentIncomeByMonth[month] || 0), 0);
          return { label: quarter, value: total };
        });

        // Combine both datasets
        chartData = chartData.map((item, index) => ({
          ...item,
          departmentValue: departmentChartData[index]?.value || 0
        }));
      } else {
        chartData = chartData.map(item => ({
          ...item,
          departmentValue: departmentIncomeByMonth[item.label] || 0
        }));
      }
    }

    // Calculate totals
    const totalRevenue = Object.values(incomeByMonth).reduce((sum, value) => sum + value, 0);

    // Get department name if department is specified
    let departmentName = null;
    if (department) {
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;
    }

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Revenue chart data retrieved successfully",
      {
        chartData,
        totalRevenue,
        period: period as string,
        groupBy: groupBy as string,
        department: departmentName,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getRevenueChartData:", err);
    return next(err);
  }
};

/**
 * Get expenses chart data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with expenses chart data
 */
export const getExpensesChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period = 'last-year', department, groupBy = 'month', expenseType, customStartDate, customEndDate } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Build query
    const query: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    if (department) {
      query.department = new mongoose.Types.ObjectId(department as string);
    }

    if (expenseType) {
      query.type = expenseType;
    }

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Aggregate expense data by month
    const expenseData = await Expense.aggregate([
      { $match: query },
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

    // Format response based on groupBy parameter
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

    // If expense type is not specified, get breakdown by type
    let expenseBreakdown = null;

    if (!expenseType) {
      expenseBreakdown = await Expense.aggregate([
        {
          $match: {
            yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth },
            ...(department ? { department: new mongoose.Types.ObjectId(department as string) } : {})
          }
        },
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
    }

    // Calculate totals
    const totalExpenses = Object.values(expenseByMonth).reduce((sum, value) => sum + value, 0);

    // Get department name if department is specified
    let departmentName = null;
    if (department) {
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;
    }

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Expenses chart data retrieved successfully",
      {
        chartData,
        totalExpenses,
        expenseBreakdown,
        period: period as string,
        groupBy: groupBy as string,
        department: departmentName,
        expenseType: expenseType as string,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getExpensesChartData:", err);
    return next(err);
  }
};

/**
 * Get headcount chart data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with headcount chart data
 */
export const getHeadcountChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { department, position } = req.query;

    // Build query
    const query: any = {};

    if (department) {
      query.department = new mongoose.Types.ObjectId(department as string);
    }

    if (position) {
      query.position = position;
    }

    // Get headcount by department
    const headcountByDepartment = await Employee.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo"
        }
      },
      {
        $unwind: "$departmentInfo"
      },
      {
        $group: {
          _id: "$department",
          department: { $first: "$departmentInfo.name" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get headcount by position
    const headcountByPosition = await Employee.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          position: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate total headcount
    const totalHeadcount = await Employee.countDocuments(query);

    // Get department name if department is specified
    let departmentName = null;
    if (department) {
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;
    }

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Headcount chart data retrieved successfully",
      {
        headcountByDepartment,
        headcountByPosition,
        totalHeadcount,
        department: departmentName,
        position: position as string
      }
    );
  } catch (err) {
    console.error("Error in getHeadcountChartData:", err);
    return next(err);
  }
};

/**
 * Get profit and loss chart data
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with profit and loss chart data
 */
export const getProfitLossChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period = 'last-year', department, groupBy = 'month', customStartDate, customEndDate } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Build income query
    const incomeQuery: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    // Build expense query
    const expenseQuery: any = {
      yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth }
    };

    if (department) {
      expenseQuery.department = new mongoose.Types.ObjectId(department as string);

      // For income, we need to find projects associated with the department
      const departmentEmployees = await Employee.find({ department }).select('_id');
      const employeeIds = departmentEmployees.map(emp => emp._id);

      const departmentProjects = await Project.find({
        team: { $in: employeeIds }
      }).select('_id');

      const projectIds = departmentProjects.map(proj => proj._id);

      incomeQuery.project = { $in: projectIds };
    }

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

    // Create maps of month to total
    const incomeByMonth: Record<string, number> = {};
    const expenseByMonth: Record<string, number> = {};
    const profitByMonth: Record<string, number> = {};

    incomeData.forEach(item => {
      incomeByMonth[item._id] = item.total;
    });

    expenseData.forEach(item => {
      expenseByMonth[item._id] = item.total;
    });

    // Calculate profit for each month
    allMonths.forEach(month => {
      const income = incomeByMonth[month] || 0;
      const expense = expenseByMonth[month] || 0;
      profitByMonth[month] = income - expense;

      // Fill in missing months with zero
      if (!incomeByMonth[month]) incomeByMonth[month] = 0;
      if (!expenseByMonth[month]) expenseByMonth[month] = 0;
    });

    // Format response based on groupBy parameter
    let chartData;

    if (groupBy === 'quarter') {
      // Group by quarter
      const quarterGroups = groupMonthsByQuarter(allMonths);

      chartData = Object.entries(quarterGroups).map(([quarter, months]) => {
        const income = months.reduce((sum, month) => sum + (incomeByMonth[month] || 0), 0);
        const expense = months.reduce((sum, month) => sum + (expenseByMonth[month] || 0), 0);
        const profit = income - expense;

        return {
          label: quarter,
          income,
          expense,
          profit
        };
      });
    } else {
      // Group by month (default)
      chartData = allMonths.map(month => ({
        label: month,
        income: incomeByMonth[month] || 0,
        expense: expenseByMonth[month] || 0,
        profit: profitByMonth[month] || 0
      }));
    }

    // Calculate totals
    const totalIncome = Object.values(incomeByMonth).reduce((sum, value) => sum + value, 0);
    const totalExpense = Object.values(expenseByMonth).reduce((sum, value) => sum + value, 0);
    const totalProfit = totalIncome - totalExpense;

    // Get department name if department is specified
    let departmentName = null;
    if (department) {
      const departmentDoc = await Department.findById(department);
      departmentName = departmentDoc?.name;
    }

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Profit and loss chart data retrieved successfully",
      {
        chartData,
        totals: {
          income: totalIncome,
          expense: totalExpense,
          profit: totalProfit
        },
        period: period as string,
        groupBy: groupBy as string,
        department: departmentName,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getProfitLossChartData:", err);
    return next(err);
  }
};

/**
 * Get department performance comparison
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with department performance data
 */
export const getDepartmentPerformance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract query parameters
    const { period = 'last-year', customStartDate, customEndDate } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Get all departments
    const departments = await Department.find();

    // For each department, calculate:
    // 1. Revenue contribution
    // 2. Expenses
    // 3. Profit
    // 4. Headcount
    // 5. Projects count

    const departmentPerformance = await Promise.all(
      departments.map(async department => {
        // Get department employees
        const employees = await Employee.find({ department: department._id });
        const employeeIds = employees.map(emp => emp._id);
        const headcount = employees.length;

        // Get department projects
        const projects = await Project.find({
          team: { $in: employeeIds },
          status: 'active'
        });
        const projectIds = projects.map(proj => proj._id);
        const projectCount = projects.length;

        // Get department revenue (from projects)
        const incomeQuery = {
          yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth },
          project: { $in: projectIds }
        };

        const incomeData = await Income.aggregate([
          { $match: incomeQuery },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" }
            }
          }
        ]);

        const revenue = incomeData.length > 0 ? incomeData[0].total : 0;

        // Get department expenses
        const expenseQuery = {
          yearMonth: { $gte: dateRange.startYearMonth, $lte: dateRange.endYearMonth },
          department: department._id
        };

        const expenseData = await Expense.aggregate([
          { $match: expenseQuery },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" }
            }
          }
        ]);

        const expenses = expenseData.length > 0 ? expenseData[0].total : 0;

        // Calculate profit
        const profit = revenue - expenses;

        // Calculate average salary
        const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
        const avgSalary = headcount > 0 ? Math.round(totalSalary / headcount) : 0;

        return {
          department: department.name,
          departmentId: department._id,
          revenue,
          expenses,
          profit,
          headcount,
          projectCount,
          avgSalary
        };
      })
    );

    // Sort by profit (descending)
    departmentPerformance.sort((a, b) => b.profit - a.profit);

    // Calculate company totals
    const companyTotals = departmentPerformance.reduce(
      (totals, dept) => {
        totals.revenue += dept.revenue;
        totals.expenses += dept.expenses;
        totals.profit += dept.profit;
        totals.headcount += dept.headcount;
        totals.projectCount += dept.projectCount;
        return totals;
      },
      { revenue: 0, expenses: 0, profit: 0, headcount: 0, projectCount: 0 }
    );

    // Calculate percentages of total
    const departmentPerformanceWithPercentages = departmentPerformance.map(dept => ({
      ...dept,
      revenuePercentage: companyTotals.revenue > 0 ? Math.round((dept.revenue / companyTotals.revenue) * 100) : 0,
      expensesPercentage: companyTotals.expenses > 0 ? Math.round((dept.expenses / companyTotals.expenses) * 100) : 0,
      profitPercentage: companyTotals.profit > 0 ? Math.round((dept.profit / companyTotals.profit) * 100) : 0,
      headcountPercentage: companyTotals.headcount > 0 ? Math.round((dept.headcount / companyTotals.headcount) * 100) : 0
    }));

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Department performance data retrieved successfully",
      {
        departments: departmentPerformanceWithPercentages,
        companyTotals,
        period: period as string,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    );
  } catch (err) {
    console.error("Error in getDepartmentPerformance:", err);
    return next(err);
  }
};

export default {
  getRevenueChartData,
  getExpensesChartData,
  getHeadcountChartData,
  getProfitLossChartData,
  getDepartmentPerformance
};
