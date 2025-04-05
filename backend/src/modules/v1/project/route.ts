/**
 * Project Routes
 * 
 * This file defines all routes related to projects.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all projects
 * 
 * @query {string} [status] - Filter by status
 * @query {string} [type] - Filter by type
 */
route.get("/", authMiddleware as any, controller.getAllProjects as any);

/**
 * GET /:id
 * Get project by ID
 * 
 * @param {string} id - Project ID
 */
route.get("/:id", authMiddleware as any, controller.getProjectById as any);

/**
 * POST /
 * Create a new project
 * 
 * @body {object} data - Project data
 */
route.post("/", authMiddleware as any, controller.createProject as any);

/**
 * PUT /:id
 * Update a project
 * 
 * @param {string} id - Project ID
 * @body {object} data - Project data to update
 */
route.put("/:id", authMiddleware as any, controller.updateProject as any);

/**
 * DELETE /:id
 * Delete a project
 * 
 * @param {string} id - Project ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteProject as any);

/**
 * POST /:id/team
 * Add team members to a project
 * 
 * @param {string} id - Project ID
 * @body {object} data - Team data
 * @body {string[]} data.employees - Array of employee IDs to add
 */
route.post("/:id/team", authMiddleware as any, controller.addTeamMembers as any);

/**
 * DELETE /:id/team
 * Remove team members from a project
 * 
 * @param {string} id - Project ID
 * @body {object} data - Team data
 * @body {string[]} data.employees - Array of employee IDs to remove
 */
route.delete("/:id/team", authMiddleware as any, controller.removeTeamMembers as any);

export default route;
