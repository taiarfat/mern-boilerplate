/**
 * Employee Controller
 *
 * This controller handles CRUD operations for employees.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Employee from "../../../models/Employee";
import Department from "../../../models/Department";
import {
  encryptPassword,
  comparePassword,
} from "../../../helpers/encryptPassword";

/**
 * Get all employees
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all employees
 */
const getAllEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { department, position } = req.query;

    // Build query
    const query: any = {};

    if (department) {
      query.department = department;
    }

    if (position) {
      query.position = position;
    }

    const employees = await Employee.find(query)
      .select("-employeePassword")
      .populate("department", "name")
      .sort({ employeeName: 1 });

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employees retrieved successfully",
      employees
    );
  } catch (err) {
    console.error("Error in getAllEmployees:", err);
    return next(err);
  }
};

/**
 * Get employee by ID
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with employee data
 */
const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .select("-employeePassword")
      .populate("department", "name");

    if (!employee) {
      return sendResponse(
        res,
        httpStatusCodes["Not Found"],
        responseStatus.ERROR,
        "Employee not found"
      );
    }

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employee retrieved successfully",
      employee
    );
  } catch (err) {
    console.error("Error in getEmployeeById:", err);
    return next(err);
  }
};

/**
 * Create a new employee
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created employee
 */
const createEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      employeeName,
      employeeEmail,
      employeePassword,
      employeeGender,
      employeeDob,
      employeeRole,
      department,
      position,
      salary,
    } = req.body;

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({ employeeEmail });

    if (existingEmployee) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        "Employee with this email already exists"
      );
    }

    // Validate department
    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        "Invalid department"
      );
    }

    // Validate position
    const validPositions = ["Software Engineer", "hr", "manager"];
    if (!validPositions.includes(position)) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        `Invalid position. Must be one of: ${validPositions.join(", ")}`
      );
    }

    // Validate gender
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(employeeGender)) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        `Invalid gender. Must be one of: ${validGenders.join(", ")}`
      );
    }

    // Validate roles
    const validRoles = ["admin", "emp"];
    if (!employeeRole.every((role: string) => validRoles.includes(role))) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        `Invalid role. Must be one or more of: ${validRoles.join(", ")}`
      );
    }

    // Hash password
    const hashedPassword = await encryptPassword(employeePassword);

    const employee = await Employee.create({
      employeeName,
      employeeEmail,
      employeePassword: hashedPassword,
      employeeGender,
      employeeDob: new Date(employeeDob),
      employeeRole,
      department,
      position,
      salary,
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    // @ts-ignore
    delete employeeResponse.employeePassword;

    // Populate department for response
    await employee.populate("department", "name");

    return sendResponse(
      res,
      httpStatusCodes.Created,
      responseStatus.SUCCESS,
      "Employee created successfully",
      employeeResponse
    );
  } catch (err) {
    console.error("Error in createEmployee:", err);
    return next(err);
  }
};

/**
 * Update an employee
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated employee
 */
const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      employeeName,
      employeeEmail,
      employeePassword,
      employeeGender,
      employeeDob,
      employeeRole,
      department,
      position,
      salary,
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(id);

    if (!employee) {
      return sendResponse(
        res,
        httpStatusCodes["Not Found"],
        responseStatus.ERROR,
        "Employee not found"
      );
    }

    // Check if email is being changed and if it's already in use
    if (employeeEmail && employeeEmail !== employee.employeeEmail) {
      const existingEmployee = await Employee.findOne({ employeeEmail });

      if (existingEmployee) {
        return sendResponse(
          res,
          httpStatusCodes["Bad Request"],
          responseStatus.ERROR,
          "Employee with this email already exists"
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

    // Validate position if provided
    if (position) {
      const validPositions = ["Software Engineer", "hr", "manager"];
      if (!validPositions.includes(position)) {
        return sendResponse(
          res,
          httpStatusCodes["Bad Request"],
          responseStatus.ERROR,
          `Invalid position. Must be one of: ${validPositions.join(", ")}`
        );
      }
    }

    // Validate gender if provided
    if (employeeGender) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(employeeGender)) {
        return sendResponse(
          res,
          httpStatusCodes["Bad Request"],
          responseStatus.ERROR,
          `Invalid gender. Must be one of: ${validGenders.join(", ")}`
        );
      }
    }

    // Validate roles if provided
    if (employeeRole) {
      const validRoles = ["admin", "emp"];
      if (!employeeRole.every((role: string) => validRoles.includes(role))) {
        return sendResponse(
          res,
          httpStatusCodes["Bad Request"],
          responseStatus.ERROR,
          `Invalid role. Must be one or more of: ${validRoles.join(", ")}`
        );
      }
    }

    // Update employee
    if (employeeName) employee.employeeName = employeeName;
    if (employeeEmail) employee.employeeEmail = employeeEmail;
    if (employeePassword)
      employee.employeePassword = await encryptPassword(employeePassword);
    if (employeeGender) employee.employeeGender = employeeGender;
    if (employeeDob) employee.employeeDob = new Date(employeeDob);
    if (employeeRole) employee.employeeRole = employeeRole;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (salary !== undefined) employee.salary = salary;

    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    // @ts-ignore
    delete employeeResponse.employeePassword;

    // Populate department for response
    await employee.populate("department", "name");

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employee updated successfully",
      employeeResponse
    );
  } catch (err) {
    console.error("Error in updateEmployee:", err);
    return next(err);
  }
};

/**
 * Delete an employee
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(id);

    if (!employee) {
      return sendResponse(
        res,
        httpStatusCodes["Not Found"],
        responseStatus.ERROR,
        "Employee not found"
      );
    }

    // Check if employee is part of any project
    const Project = require("../../../models/Project").default;
    const projectCount = await Project.countDocuments({ team: id });

    if (projectCount > 0) {
      return sendResponse(
        res,
        httpStatusCodes["Bad Request"],
        responseStatus.ERROR,
        `Cannot delete employee as they are part of ${projectCount} projects`
      );
    }

    await employee.deleteOne();

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employee deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteEmployee:", err);
    return next(err);
  }
};

/**
 * Get employee summary by department
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with employee summary by department
 */
const getEmployeeSummaryByDepartment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Aggregate employees by department
    const departmentSummary = await Employee.aggregate([
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
          departmentName: { $first: "$departmentInfo.name" },
          count: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          avgSalary: { $avg: "$salary" },
        },
      },
      {
        $project: {
          department: "$_id",
          departmentName: 1,
          count: 1,
          totalSalary: 1,
          avgSalary: { $round: ["$avgSalary", 2] },
          _id: 0,
        },
      },
    ]);

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employee summary by department retrieved successfully",
      departmentSummary
    );
  } catch (err) {
    console.error("Error in getEmployeeSummaryByDepartment:", err);
    return next(err);
  }
};

/**
 * Get employee summary by position
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with employee summary by position
 */
const getEmployeeSummaryByPosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Aggregate employees by position
    const positionSummary = await Employee.aggregate([
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          avgSalary: { $avg: "$salary" },
        },
      },
      {
        $project: {
          position: "$_id",
          count: 1,
          totalSalary: 1,
          avgSalary: { $round: ["$avgSalary", 2] },
          _id: 0,
        },
      },
    ]);

    return sendResponse(
      res,
      httpStatusCodes.OK,
      responseStatus.SUCCESS,
      "Employee summary by position retrieved successfully",
      positionSummary
    );
  } catch (err) {
    console.error("Error in getEmployeeSummaryByPosition:", err);
    return next(err);
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeSummaryByDepartment,
  getEmployeeSummaryByPosition,
};
