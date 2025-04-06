/**
 * Category Routes
 * 
 * This file defines all routes related to categories.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all categories
 */
route.get("/", authMiddleware as any, controller.getAllCategories as any);

/**
 * GET /:id
 * Get category by ID
 * 
 * @param {string} id - Category ID
 */
route.get("/:id", authMiddleware as any, controller.getCategoryById as any);

/**
 * POST /
 * Create a new category
 * 
 * @body {object} data - Category data
 * @body {string} data.name - Category name
 */
route.post("/", authMiddleware as any, controller.createCategory as any);

/**
 * PUT /:id
 * Update a category
 * 
 * @param {string} id - Category ID
 * @body {object} data - Category data to update
 * @body {string} data.name - Category name
 */
route.put("/:id", authMiddleware as any, controller.updateCategory as any);

/**
 * DELETE /:id
 * Delete a category
 * 
 * @param {string} id - Category ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteCategory as any);

export default route;
