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
import Project from "../../../models/Project";
import Income from "../../../models/Income";
import { encryptPassword } from "../../../helpers/encryptPassword";

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
    const { department, position, category, projectType } = req.query;

    // Build query
    const query: any = {};

    if (department) {
      query.department = department;
    }

    if (position) {
      query.position = position;
    }

    // Direct category filter (employee's assigned category)
    if (category) {
      query.category = category;
    }

    // Handle category and projectType filters
    if (projectType) {
      // We need to find projects that match the criteria
      const projectQuery: any = {};

      projectQuery.type = projectType;

      // If we have projectType filter or both filters
      if (Object.keys(projectQuery).length > 0) {
        const projects = await Project.find(projectQuery);

        if (projects.length === 0) {
          // No projects match the criteria, return empty result
          return sendResponse(
            res,
            httpStatusCodes.OK,
            responseStatus.SUCCESS,
            "Employees retrieved successfully",
            []
          );
        }

        // Get all employee IDs from these projects
        const employeeIds = new Set();

        projects.forEach((project) => {
          project.team.forEach((empId) => {
            employeeIds.add(empId.toString());
          });
        });

        // Add employee filter to query
        if (employeeIds.size > 0) {
          query._id = { $in: Array.from(employeeIds) };
        } else {
          // No employees found in these projects
          return sendResponse(
            res,
            httpStatusCodes.OK,
            responseStatus.SUCCESS,
            "Employees retrieved successfully",
            []
          );
        }
      }
    }

    const employees = await Employee.find(query)
      .select("-employeePassword")
      .populate("department", "name")
      .populate("category", "name")
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
      .populate("department", "name")
      .populate("category", "name");

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
      category,
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

    // Validate category if provided
    if (category) {
      const Category = require("../../../models/Category").default;
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
      category, // Include category field (can be undefined)
      position,
      salary,
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    // @ts-ignore
    delete employeeResponse.employeePassword;

    // Populate department and category for response
    await employee.populate([
      { path: "department", select: "name" },
      { path: "category", select: "name" },
    ]);

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
      category,
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

    // Validate category if provided
    if (category) {
      const Category = require("../../../models/Category").default;
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
    if (category !== undefined) employee.category = category;
    if (position) employee.position = position;
    if (salary !== undefined) employee.salary = salary;

    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    // @ts-ignore
    delete employeeResponse.employeePassword;

    // Populate department and category for response
    await employee.populate([
      { path: "department", select: "name" },
      { path: "category", select: "name" },
    ]);

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
  _req: AuthRequest,
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
  _req: AuthRequest,
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
