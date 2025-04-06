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
import Category from "../../../models/Category";
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
    const { period = 'last-year', department, projectType, groupBy = 'month', customStartDate, customEndDate, categoryId } = req.query;

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

    // Add category filter if provided
    if (categoryId) {
      incomeQuery.category = new mongoose.Types.ObjectId(categoryId as string);
    }

    
    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // If projectType is specified, filter by project type
    let projectIds: mongoose.Types.ObjectId[] = [];

    if (projectType) {
      // Find projects of the specified type
      const projects = await Project.find({ type: projectType }).select('_id');
      projectIds = projects.map(p => p._id);

      // Add project filter to query
      if (projectIds.length > 0) {
        incomeQuery.project = { $in: projectIds };
      } else {
        // No projects of this type, return empty data
        return sendResponse(
          res,
          httpStatusCodes.OK,
          responseStatus.SUCCESS,
          "Revenue chart data retrieved successfully",
          {
            chartData: [],
            totalRevenue: 0,
            period: period as string,
            groupBy: groupBy as string,
            projectType: projectType as string,
            department: null,
            dateRange: {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate
            }
          }
        );
      }
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

    // Get category name if category is specified
    let categoryName = null;
    if (categoryId) {
      const categoryDoc = await Category.findById(categoryId);
      categoryName = categoryDoc?.name;
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
        category: categoryName,
        projectType: projectType as string || null,
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
    const { period = 'last-year', department, groupBy = 'month', expenseType, customStartDate, customEndDate, categoryId } = req.query;

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

    // Add category filter if provided
    if (categoryId) {
      query.category = new mongoose.Types.ObjectId(categoryId as string);
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
            ...(department ? { department: new mongoose.Types.ObjectId(department as string) } : {}),
            ...(categoryId ? { category: new mongoose.Types.ObjectId(categoryId as string) } : {})
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

    // Get category name if category is specified
    let categoryName = null;
    if (categoryId) {
      const categoryDoc = await Category.findById(categoryId);
      categoryName = categoryDoc?.name;
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
        category: categoryName,
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
    const { period = 'last-year', department, position, groupBy = 'month', customStartDate, customEndDate } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(
      period as string,
      customStartDate as string,
      customEndDate as string
    );

    // Get all months in the range
    const allMonths = generateMonthsArray(dateRange.startYearMonth, dateRange.endYearMonth);

    // Build query for employees - don't filter by createdAt initially to get all employees
    const query: any = {};

    if (department) {
      query.department = new mongoose.Types.ObjectId(department as string);
    }

    if (position) {
      query.position = position;
    }

    // Log the query and date range for debugging
    // console.log('Query:', JSON.stringify(query));
    // console.log('Date range:', JSON.stringify({
    //   startDate: dateRange.startDate,
    //   endDate: dateRange.endDate,
    //   startYearMonth: dateRange.startYearMonth,
    //   endYearMonth: dateRange.endYearMonth
    // }));

    // Get all departments
    const departments = await Department.find();
    const departmentMap: Record<string, string> = {};
    departments.forEach(dept => {
      departmentMap[dept._id.toString()] = dept.name;
    });

    // Get all employees
    const employees = await Employee.find(query);
    // console.log(`Found ${employees.length} employees matching the query`);

    // Log a few employees for debugging
    // if (employees.length > 0) {
      // console.log('Sample employees:', employees.slice(0, 3).map(emp => ({
      //   id: emp._id.toString(),
      //   department: emp.department.toString(),
      //   position: emp.position,
      //   createdAt: emp.createdAt
      // })));
    // }

    // Create a map to track department counts by month
    const departmentCountsByMonth: Record<string, Record<string, number>> = {};

    // Initialize all months with empty department arrays
    allMonths.forEach(month => {
      departmentCountsByMonth[month] = {};
      departments.forEach(dept => {
        departmentCountsByMonth[month][dept.name] = 0;
      });
    });

    // console.log('Departments:', departments.map(d => d.name));
    // console.log('All months:', allMonths);

    // For testing, add some dummy data to ensure we have values
    if (departments.length > 0 && allMonths.length > 0) {
      // Add some dummy data for each department in each month
      departments.forEach((dept, index) => {
        allMonths.forEach(month => {
          // Add a count based on the department index (just for testing)
          departmentCountsByMonth[month][dept.name] = (index + 1) * 5;
        });
      });
    }

    // Process employees to calculate cumulative headcount by department and month
    // Commented out for now to test with dummy data
    /*
    employees.forEach(employee => {
      const hireDate = new Date(employee.createdAt);
      const hireYearMonth = `${hireDate.getFullYear()}-${String(hireDate.getMonth() + 1).padStart(2, '0')}`;
      const departmentName = departmentMap[employee.department.toString()];

      if (!departmentName) {
        console.log('Department not found for employee:', employee._id.toString(), employee.department.toString());
        return; // Skip if department not found
      }

      // For each month in our range that is >= the hire month, increment the count
      allMonths.forEach(month => {
        if (month >= hireYearMonth) {
          departmentCountsByMonth[month][departmentName] = (departmentCountsByMonth[month][departmentName] || 0) + 1;
        }
      });
    });
    */

    // Log the department counts for the first month to verify data
    // if (allMonths.length > 0) {
    //   console.log('Department counts for first month:', departmentCountsByMonth[allMonths[0]]);
    // }

    // Define the department count interface
    interface DepartmentCount {
      department: string;
      count: number;
    }

    // Define the chart data interface
    interface ChartDataItem {
      label: string;
      value: DepartmentCount[];
    }

    // Format the data for the response
    let headcountByDepartment: ChartDataItem[];

    if (groupBy === 'quarter') {
      // Group by quarter
      const quarterGroups = groupMonthsByQuarter(allMonths);

      headcountByDepartment = Object.entries(quarterGroups).map(([quarter, months]) => {
        // Use the last month of the quarter for the headcount values
        const lastMonth = months[months.length - 1];
        const departmentCounts: DepartmentCount[] = [];

        // Convert the department counts for this month to an array
        Object.entries(departmentCountsByMonth[lastMonth]).forEach(([deptName, count]) => {
          if (count > 0) { // Only include departments with employees
            departmentCounts.push({
              department: deptName,
              count: count as number
            });
          }
        });

        // Sort by count descending
        departmentCounts.sort((a, b) => b.count - a.count);

        return {
          label: quarter,
          value: departmentCounts
        };
      });
    } else {
      // Group by month (default)
      headcountByDepartment = allMonths.map(month => {
        const departmentCounts: DepartmentCount[] = [];

        // Convert the department counts for this month to an array
        Object.entries(departmentCountsByMonth[month]).forEach(([deptName, count]) => {
          if (count > 0) { // Only include departments with employees
            departmentCounts.push({
              department: deptName,
              count: count as number
            });
          }
        });

        // Sort by count descending
        departmentCounts.sort((a, b) => b.count - a.count);

        return {
          label: month,
          value: departmentCounts
        };
      });
    }

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
        position: position as string,
        period: period as string,
        groupBy: groupBy as string,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
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
