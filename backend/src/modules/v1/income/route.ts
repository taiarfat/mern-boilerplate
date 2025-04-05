/**
 * Income Routes
 * 
 * This file defines all routes related to income entries.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all income entries
 * 
 * @query {string} [yearMonth] - Filter by year-month (YYYY-MM)
 * @query {string} [category] - Filter by category ID
 * @query {string} [project] - Filter by project ID
 * @query {string} [startDate] - Filter by start date (YYYY-MM-DD)
 * @query {string} [endDate] - Filter by end date (YYYY-MM-DD)
 */
route.get("/", authMiddleware as any, controller.getAllIncomes as any);

/**
 * GET /:id
 * Get income entry by ID
 * 
 * @param {string} id - Income entry ID
 */
route.get("/:id", authMiddleware as any, controller.getIncomeById as any);

/**
 * POST /
 * Create a new income entry
 * 
 * @body {object} data - Income data
 */
route.post("/", authMiddleware as any, controller.createIncome as any);

/**
 * PUT /:id
 * Update an income entry
 * 
 * @param {string} id - Income entry ID
 * @body {object} data - Income data to update
 */
route.put("/:id", authMiddleware as any, controller.updateIncome as any);

/**
 * DELETE /:id
 * Delete an income entry
 * 
 * @param {string} id - Income entry ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteIncome as any);

/**
 * GET /summary/monthly
 * Get income summary by month
 * 
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
route.get("/summary/monthly", authMiddleware as any, controller.getIncomeSummaryByMonth as any);

/**
 * GET /summary/category
 * Get income summary by category
 * 
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
route.get("/summary/category", authMiddleware as any, controller.getIncomeSummaryByCategory as any);

export default route;
