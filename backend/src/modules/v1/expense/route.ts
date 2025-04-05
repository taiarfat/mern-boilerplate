/**
 * Expense Routes
 * 
 * This file defines all routes related to expense entries.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all expense entries
 * 
 * @query {string} [yearMonth] - Filter by year-month (YYYY-MM)
 * @query {string} [category] - Filter by category ID
 * @query {string} [department] - Filter by department ID
 * @query {string} [type] - Filter by expense type
 * @query {string} [startDate] - Filter by start date (YYYY-MM-DD)
 * @query {string} [endDate] - Filter by end date (YYYY-MM-DD)
 */
route.get("/", authMiddleware as any, controller.getAllExpenses as any);

/**
 * GET /:id
 * Get expense entry by ID
 * 
 * @param {string} id - Expense entry ID
 */
route.get("/:id", authMiddleware as any, controller.getExpenseById as any);

/**
 * POST /
 * Create a new expense entry
 * 
 * @body {object} data - Expense data
 */
route.post("/", authMiddleware as any, controller.createExpense as any);

/**
 * PUT /:id
 * Update an expense entry
 * 
 * @param {string} id - Expense entry ID
 * @body {object} data - Expense data to update
 */
route.put("/:id", authMiddleware as any, controller.updateExpense as any);

/**
 * DELETE /:id
 * Delete an expense entry
 * 
 * @param {string} id - Expense entry ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteExpense as any);

/**
 * GET /summary/monthly
 * Get expense summary by month
 * 
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
route.get("/summary/monthly", authMiddleware as any, controller.getExpenseSummaryByMonth as any);

/**
 * GET /summary/type
 * Get expense summary by type
 * 
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
route.get("/summary/type", authMiddleware as any, controller.getExpenseSummaryByType as any);

/**
 * GET /summary/department
 * Get expense summary by department
 * 
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
route.get("/summary/department", authMiddleware as any, controller.getExpenseSummaryByDepartment as any);

export default route;
