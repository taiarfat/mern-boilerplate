/**
 * Dashboard Routes
 *
 * This file defines all routes related to the executive dashboard.
 */

import express from "express";
import controller from "./controller";
import analyticsController from "./analyticsController";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /summary
 * Get dashboard summary data
 *
 * @query {string} [period] - Predefined period (last_year, last_2_years, half_year, quarter)
 * @query {string} [startDate] - Custom start date (YYYY-MM-DD)
 * @query {string} [endDate] - Custom end date (YYYY-MM-DD)
 * @query {string} [department] - Department ID to filter by
 */
route.get("/summary", authMiddleware as any, controller.getDashboardSummary as any);

/**
 * GET /insights
 * Get AI-generated insights
 *
 * @query {string} [startDate] - Start date for data range (YYYY-MM-DD)
 * @query {string} [endDate] - End date for data range (YYYY-MM-DD)
 * @query {string} [department] - Department ID to filter by
 * @query {string} [category] - Category ID to filter by
 * @query {string} [insightType] - Type of insight to generate (forecast, anomaly, trend, recommendation, alert)
 */
route.get("/insights", authMiddleware as any, controller.getAIInsights as any);

/**
 * POST /generate-sample-data
 * Generate sample data for testing (development only)
 */
route.post("/generate-sample-data", authMiddleware as any, controller.generateSampleData as any);

/**
 * Charts and Analytics Routes
 */

/**
 * GET /charts/revenue
 * Get revenue chart data
 *
 * @query {string} [period] - Predefined period (last-month, last-3-months, last-6-months, last-quarter, current-quarter, year-to-date, last-year, last-2-years, all-time, custom)
 * @query {string} [department] - Department ID to filter by
 * @query {string} [projectType] - Filter by project type (fixed, dedicated)
 * @query {string} [groupBy] - Group data by (month, quarter)
 * @query {string} [customStartDate] - Custom start date (YYYY-MM-DD) - required if period is 'custom'
 * @query {string} [customEndDate] - Custom end date (YYYY-MM-DD) - required if period is 'custom'
 */
route.get("/charts/revenue", authMiddleware as any, analyticsController.getRevenueChartData as any);

/**
 * GET /charts/expenses
 * Get expenses chart data
 *
 * @query {string} [period] - Predefined period (last-month, last-3-months, last-6-months, last-quarter, current-quarter, year-to-date, last-year, last-2-years, all-time, custom)
 * @query {string} [department] - Department ID to filter by
 * @query {string} [groupBy] - Group data by (month, quarter)
 * @query {string} [expenseType] - Filter by expense type (R&D, marketing, salary, Misc, operational)
 * @query {string} [customStartDate] - Custom start date (YYYY-MM-DD) - required if period is 'custom'
 * @query {string} [customEndDate] - Custom end date (YYYY-MM-DD) - required if period is 'custom'
 */
route.get("/charts/expenses", authMiddleware as any, analyticsController.getExpensesChartData as any);

/**
 * GET /charts/headcount
 * Get headcount chart data
 *
 * @query {string} [department] - Department ID to filter by
 * @query {string} [position] - Filter by position (Software Engineer, hr, manager)
 */
route.get("/charts/headcount", authMiddleware as any, analyticsController.getHeadcountChartData as any);

/**
 * GET /charts/profit-loss
 * Get profit and loss chart data
 *
 * @query {string} [period] - Predefined period (last-month, last-3-months, last-6-months, last-quarter, current-quarter, year-to-date, last-year, last-2-years, all-time, custom)
 * @query {string} [department] - Department ID to filter by
 * @query {string} [groupBy] - Group data by (month, quarter)
 * @query {string} [customStartDate] - Custom start date (YYYY-MM-DD) - required if period is 'custom'
 * @query {string} [customEndDate] - Custom end date (YYYY-MM-DD) - required if period is 'custom'
 */
route.get("/charts/profit-loss", authMiddleware as any, analyticsController.getProfitLossChartData as any);

/**
 * GET /department-performance
 * Get department performance comparison
 *
 * @query {string} [period] - Predefined period (last-month, last-3-months, last-6-months, last-quarter, current-quarter, year-to-date, last-year, last-2-years, all-time, custom)
 * @query {string} [customStartDate] - Custom start date (YYYY-MM-DD) - required if period is 'custom'
 * @query {string} [customEndDate] - Custom end date (YYYY-MM-DD) - required if period is 'custom'
 */
route.get("/department-performance", authMiddleware as any, analyticsController.getDepartmentPerformance as any);

export default route;
