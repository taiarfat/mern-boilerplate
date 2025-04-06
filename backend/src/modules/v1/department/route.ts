/**
 * Department Routes
 * 
 * This file defines all routes related to departments.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all departments
 */
route.get("/", authMiddleware as any, controller.getAllDepartments as any);

/**
 * GET /:id
 * Get department by ID
 * 
 * @param {string} id - Department ID
 */
route.get("/:id", authMiddleware as any, controller.getDepartmentById as any);

/**
 * POST /
 * Create a new department
 * 
 * @body {object} data - Department data
 * @body {string} data.name - Department name
 */
route.post("/", authMiddleware as any, controller.createDepartment as any);

/**
 * PUT /:id
 * Update a department
 * 
 * @param {string} id - Department ID
 * @body {object} data - Department data to update
 * @body {string} data.name - Department name
 */
route.put("/:id", authMiddleware as any, controller.updateDepartment as any);

/**
 * DELETE /:id
 * Delete a department
 * 
 * @param {string} id - Department ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteDepartment as any);

export default route;
