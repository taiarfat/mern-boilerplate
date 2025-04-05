/**
 * Employee Routes
 * 
 * This file defines all routes related to employees.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all employees
 * 
 * @query {string} [department] - Filter by department ID
 * @query {string} [position] - Filter by position
 */
route.get("/", authMiddleware as any, controller.getAllEmployees as any);

/**
 * GET /:id
 * Get employee by ID
 * 
 * @param {string} id - Employee ID
 */
route.get("/:id", authMiddleware as any, controller.getEmployeeById as any);

/**
 * POST /
 * Create a new employee
 * 
 * @body {object} data - Employee data
 */
route.post("/", authMiddleware as any, controller.createEmployee as any);

/**
 * PUT /:id
 * Update an employee
 * 
 * @param {string} id - Employee ID
 * @body {object} data - Employee data to update
 */
route.put("/:id", authMiddleware as any, controller.updateEmployee as any);

/**
 * DELETE /:id
 * Delete an employee
 * 
 * @param {string} id - Employee ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteEmployee as any);

/**
 * GET /summary/department
 * Get employee summary by department
 */
route.get("/summary/department", authMiddleware as any, controller.getEmployeeSummaryByDepartment as any);

/**
 * GET /summary/position
 * Get employee summary by position
 */
route.get("/summary/position", authMiddleware as any, controller.getEmployeeSummaryByPosition as any);

export default route;
