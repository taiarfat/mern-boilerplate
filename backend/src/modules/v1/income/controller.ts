/**
 * Income Controller
 * 
 * This controller handles CRUD operations for income entries.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Income from "../../../models/Income";
import Category from "../../../models/Category";
import Project from "../../../models/Project";

/**
 * Get all income entries
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all income entries
 */
const getAllIncomes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { yearMonth, category, project, startDate, endDate } = req.query;
    
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
    
    if (project) {
      query.project = project;
    }
    
    const incomes = await Income.find(query)
      .populate('category', 'name')
      .populate('project', 'name')
      .sort({ yearMonth: -1 });
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Income entries retrieved successfully", 
      incomes
    );
  } catch (err) {
    console.error("Error in getAllIncomes:", err);
    return next(err);
  }
};

/**
 * Get income by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with income data
 */
const getIncomeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const income = await Income.findById(id)
      .populate('category', 'name')
      .populate('project', 'name');
    
    if (!income) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Income entry not found"
      );
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Income entry retrieved successfully", 
      income
    );
  } catch (err) {
    console.error("Error in getIncomeById:", err);
    return next(err);
  }
};

/**
 * Create a new income entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created income entry
 */
const createIncome = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { amount, yearMonth, category, project } = req.body;
    
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
    
    // Validate project if provided
    if (project) {
      const projectExists = await Project.findById(project);
      
      if (!projectExists) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid project"
        );
      }
    }
    
    const income = await Income.create({
      amount,
      yearMonth,
      category,
      project
    });
    
    // Populate references for response
    await income.populate('category', 'name');
    if (project) {
      await income.populate('project', 'name');
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.Created, 
      responseStatus.SUCCESS, 
      "Income entry created successfully", 
      income
    );
  } catch (err) {
    console.error("Error in createIncome:", err);
    return next(err);
  }
};

/**
 * Update an income entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated income entry
 */
const updateIncome = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { amount, yearMonth, category, project } = req.body;
    
    // Check if income entry exists
    const income = await Income.findById(id);
    
    if (!income) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Income entry not found"
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
    
    // Validate project if provided
    if (project) {
      const projectExists = await Project.findById(project);
      
      if (!projectExists) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "Invalid project"
        );
      }
    }
    
    // Update income entry
    if (amount !== undefined) income.amount = amount;
    if (yearMonth) income.yearMonth = yearMonth;
    if (category) income.category = category;
    
    // Handle project (can be null)
    if (project === null) {
      income.project = undefined;
    } else if (project) {
      income.project = project;
    }
    
    await income.save();
    
    // Populate references for response
    await income.populate('category', 'name');
    if (income.project) {
      await income.populate('project', 'name');
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Income entry updated successfully", 
      income
    );
  } catch (err) {
    console.error("Error in updateIncome:", err);
    return next(err);
  }
};

/**
 * Delete an income entry
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteIncome = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    // Check if income entry exists
    const income = await Income.findById(id);
    
    if (!income) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Income entry not found"
      );
    }
    
    await income.deleteOne();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Income entry deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteIncome:", err);
    return next(err);
  }
};

/**
 * Get income summary by month
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with monthly income summary
 */
const getIncomeSummaryByMonth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
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
    
    // Aggregate income by month
    const monthlySummary = await Income.aggregate([
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
      "Income summary retrieved successfully", 
      monthlySummary
    );
  } catch (err) {
    console.error("Error in getIncomeSummaryByMonth:", err);
    return next(err);
  }
};

/**
 * Get income summary by category
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with category income summary
 */
const getIncomeSummaryByCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
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
    
    // Aggregate income by category
    const categorySummary = await Income.aggregate([
      {
        $match: {
          yearMonth: { $gte: startYearMonth, $lte: endYearMonth }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $group: {
          _id: "$category",
          categoryName: { $first: "$categoryInfo.name" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          categoryName: 1,
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
      "Income summary by category retrieved successfully", 
      categorySummary
    );
  } catch (err) {
    console.error("Error in getIncomeSummaryByCategory:", err);
    return next(err);
  }
};

export default {
  getAllIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummaryByMonth,
  getIncomeSummaryByCategory
};
