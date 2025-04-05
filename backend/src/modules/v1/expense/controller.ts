/**
 * Expense Controller
 * 
 * This controller handles CRUD operations for expense entries.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Expense from "../../../models/Expense";
import Category from "../../../models/Category";
import Department from "../../../models/Department";

/**
 * Get all expense entries
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all expense entries
 */
const getAllExpenses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { yearMonth, category, department, type, startDate, endDate } = req.query;
    
    // Build query
    const query: any = {};
    
    if (yearMonth) {
      query.yearMonth = yearMonth;
    } else if (startDate && endDate) {
      // If date range is provided, find all yearMonth values in the range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid date format"
        );
      }
      
      const startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
      const endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
      
      query.yearMonth = { $gte: startYearMonth, $lte: endYearMonth };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (type) {
      query.type = type;
    }
    
    const expenses = await Expense.find(query)
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ yearMonth: -1 });
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense entries retrieved successfully", 
      expenses
    );
  } catch (err) {
    console.error("Error in getAllExpenses:", err);
    return next(err);
  }
};

/**
 * Get expense by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with expense data
 */
const getExpenseById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findById(id)
      .populate('category', 'name')
      .populate('department', 'name');
    
    if (!expense) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Expense entry not found"
      );
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense entry retrieved successfully", 
      expense
    );
  } catch (err) {
    console.error("Error in getExpenseById:", err);
    return next(err);
  }
};

/**
 * Create a new expense entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created expense entry
 */
const createExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { amount, yearMonth, category, department, type } = req.body;
    
    // Validate yearMonth format
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid yearMonth format. Use YYYY-MM"
      );
    }
    
    // Validate category
    const categoryExists = await Category.findById(category);
    
    if (!categoryExists) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid category"
      );
    }
    
    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      
      if (!departmentExists) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid department"
        );
      }
    }
    
    // Validate expense type
    const validTypes = ["R&D", "marketing", "salary", "Misc", "operational"];
    if (!validTypes.includes(type)) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Invalid expense type. Must be one of: ${validTypes.join(', ')}`
      );
    }
    
    const expense = await Expense.create({
      amount,
      yearMonth,
      category,
      department,
      type
    });
    
    // Populate references for response
    await expense.populate('category', 'name');
    if (department) {
      await expense.populate('department', 'name');
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.Created, 
      responseStatus.SUCCESS, 
      "Expense entry created successfully", 
      expense
    );
  } catch (err) {
    console.error("Error in createExpense:", err);
    return next(err);
  }
};

/**
 * Update an expense entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated expense entry
 */
const updateExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { amount, yearMonth, category, department, type } = req.body;
    
    // Check if expense entry exists
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Expense entry not found"
      );
    }
    
    // Validate yearMonth format if provided
    if (yearMonth && !/^\d{4}-\d{2}$/.test(yearMonth)) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid yearMonth format. Use YYYY-MM"
      );
    }
    
    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      
      if (!categoryExists) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid category"
        );
      }
    }
    
    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      
      if (!departmentExists) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid department"
        );
      }
    }
    
    // Validate expense type if provided
    if (type) {
      const validTypes = ["R&D", "marketing", "salary", "Misc", "operational"];
      if (!validTypes.includes(type)) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          `Invalid expense type. Must be one of: ${validTypes.join(', ')}`
        );
      }
    }
    
    // Update expense entry
    if (amount !== undefined) expense.amount = amount;
    if (yearMonth) expense.yearMonth = yearMonth;
    if (category) expense.category = category;
    
    // Handle department (can be null)
    if (department === null) {
      expense.department = undefined;
    } else if (department) {
      expense.department = department;
    }
    
    if (type) expense.type = type;
    
    await expense.save();
    
    // Populate references for response
    await expense.populate('category', 'name');
    if (expense.department) {
      await expense.populate('department', 'name');
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense entry updated successfully", 
      expense
    );
  } catch (err) {
    console.error("Error in updateExpense:", err);
    return next(err);
  }
};

/**
 * Delete an expense entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    // Check if expense entry exists
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Expense entry not found"
      );
    }
    
    await expense.deleteOne();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense entry deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteExpense:", err);
    return next(err);
  }
};

/**
 * Get expense summary by month
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with monthly expense summary
 */
const getExpenseSummaryByMonth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Both startDate and endDate are required"
      );
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid date format"
      );
    }
    
    const startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
    const endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Aggregate expenses by month
    const monthlySummary = await Expense.aggregate([
      {
        $match: {
          yearMonth: { $gte: startYearMonth, $lte: endYearMonth }
        }
      },
      {
        $group: {
          _id: "$yearMonth",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          yearMonth: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense summary retrieved successfully", 
      monthlySummary
    );
  } catch (err) {
    console.error("Error in getExpenseSummaryByMonth:", err);
    return next(err);
  }
};

/**
 * Get expense summary by type
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with expense summary by type
 */
const getExpenseSummaryByType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Both startDate and endDate are required"
      );
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid date format"
      );
    }
    
    const startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
    const endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Aggregate expenses by type
    const typeSummary = await Expense.aggregate([
      {
        $match: {
          yearMonth: { $gte: startYearMonth, $lte: endYearMonth }
        }
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense summary by type retrieved successfully", 
      typeSummary
    );
  } catch (err) {
    console.error("Error in getExpenseSummaryByType:", err);
    return next(err);
  }
};

/**
 * Get expense summary by department
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with expense summary by department
 */
const getExpenseSummaryByDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Both startDate and endDate are required"
      );
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid date format"
      );
    }
    
    const startYearMonth = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
    const endYearMonth = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Aggregate expenses by department
    const departmentSummary = await Expense.aggregate([
      {
        $match: {
          yearMonth: { $gte: startYearMonth, $lte: endYearMonth },
          department: { $exists: true, $ne: null }
        }
      },
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
          departmentName: { $first: "$departmentInfo.name" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: "$_id",
          departmentName: 1,
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Expense summary by department retrieved successfully", 
      departmentSummary
    );
  } catch (err) {
    console.error("Error in getExpenseSummaryByDepartment:", err);
    return next(err);
  }
};

export default {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummaryByMonth,
  getExpenseSummaryByType,
  getExpenseSummaryByDepartment
};
