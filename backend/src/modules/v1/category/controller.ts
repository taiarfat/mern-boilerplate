/**
 * Category Controller
 * 
 * This controller handles CRUD operations for categories.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Category from "../../../models/Category";

/**
 * Get all categories
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all categories
 */
const getAllCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const categories = await Category.find();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Categories retrieved successfully", 
      {categories}
    );
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    return next(err);
  }
};

/**
 * Get category by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with category data
 */
const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Category not found"
      );
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Category retrieved successfully", 
      {category}
    );
  } catch (err) {
    console.error("Error in getCategoryById:", err);
    return next(err);
  }
};

/**
 * Create a new category
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created category
 */
const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    
    if (existingCategory) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Category with this name already exists"
      );
    }
    
    const category = await Category.create({ name });
    
    return sendResponse(
      res, 
      httpStatusCodes.Created, 
      responseStatus.SUCCESS, 
      "Category created successfully", 
      category
    );
  } catch (err) {
    console.error("Error in createCategory:", err);
    return next(err);
  }
};

/**
 * Update a category
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated category
 */
const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if category exists
    const category = await Category.findById(id);
    
    if (!category) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Category not found"
      );
    }
    
    // Check if name is valid (in the enum)
    if (!["Software PVT", "System", "Product"].includes(name)) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid category name"
      );
    }
    
    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
    
    if (existingCategory) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Category with this name already exists"
      );
    }
    
    category.name = name;
    await category.save();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Category updated successfully", 
      category
    );
  } catch (err) {
    console.error("Error in updateCategory:", err);
    return next(err);
  }
};

/**
 * Delete a category
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await Category.findById(id);
    
    if (!category) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Category not found"
      );
    }
    
    // Check if category is being used by incomes
    const Income = require('../../../models/Income').default;
    const incomeCount = await Income.countDocuments({ category: id });
    
    if (incomeCount > 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Cannot delete category as it is associated with ${incomeCount} income entries`
      );
    }
    
    // Check if category is being used by expenses
    const Expense = require('../../../models/Expense').default;
    const expenseCount = await Expense.countDocuments({ category: id });
    
    if (expenseCount > 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Cannot delete category as it is associated with ${expenseCount} expense entries`
      );
    }
    
    await category.deleteOne();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Category deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteCategory:", err);
    return next(err);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
