/**
 * Department Controller
 * 
 * This controller handles CRUD operations for departments.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Department from "../../../models/Department";

/**
 * Get all departments
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all departments
 */
const getAllDepartments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const departments = await Department.find();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Departments retrieved successfully", 
      departments
    );
  } catch (err) {
    console.error("Error in getAllDepartments:", err);
    return next(err);
  }
};

/**
 * Get department by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with department data
 */
const getDepartmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    
    if (!department) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Department not found"
      );
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Department retrieved successfully", 
      department
    );
  } catch (err) {
    console.error("Error in getDepartmentById:", err);
    return next(err);
  }
};

/**
 * Create a new department
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created department
 */
const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    
    if (existingDepartment) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Department with this name already exists"
      );
    }
    
    const department = await Department.create({ name });
    
    return sendResponse(
      res, 
      httpStatusCodes.Created, 
      responseStatus.SUCCESS, 
      "Department created successfully", 
      department
    );
  } catch (err) {
    console.error("Error in createDepartment:", err);
    return next(err);
  }
};

/**
 * Update a department
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated department
 */
const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if department exists
    const department = await Department.findById(id);
    
    if (!department) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Department not found"
      );
    }
    
    // Check if name is valid (in the enum)
    if (!["node", "react", "angular", "python", "marketing", "hr"].includes(name)) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Invalid department name"
      );
    }
    
    // Check if another department with the same name exists
    const existingDepartment = await Department.findOne({ name, _id: { $ne: id } });
    
    if (existingDepartment) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Department with this name already exists"
      );
    }
    
    department.name = name;
    await department.save();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Department updated successfully", 
      department
    );
  } catch (err) {
    console.error("Error in updateDepartment:", err);
    return next(err);
  }
};

/**
 * Delete a department
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    // Check if department exists
    const department = await Department.findById(id);
    
    if (!department) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Department not found"
      );
    }
    
    // Check if department is being used by employees
    const Employee = require('../../../models/Employee').default;
    const employeeCount = await Employee.countDocuments({ department: id });
    
    if (employeeCount > 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Cannot delete department as it is associated with ${employeeCount} employees`
      );
    }
    
    // Check if department is being used by expenses
    const Expense = require('../../../models/Expense').default;
    const expenseCount = await Expense.countDocuments({ department: id });
    
    if (expenseCount > 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Cannot delete department as it is associated with ${expenseCount} expenses`
      );
    }
    
    await department.deleteOne();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Department deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteDepartment:", err);
    return next(err);
  }
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
