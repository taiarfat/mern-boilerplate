/**
 * API v1 Routes
 *
 * This file aggregates all v1 API routes and exports them as a single router.
 */

import express from "express";
import authRoute from "./auth/index";
import userRoute from "./user/index";
import departmentRoute from "./department/index";
import categoryRoute from "./category/index";
import projectRoute from "./project/index";
import employeeRoute from "./employee/index";
import incomeRoute from "./income/index";
import expenseRoute from "./expense/index";
import dashboardRoute from "./dashboard/index";

const route = express.Router();

// Authentication routes
route.use("/auth", authRoute);

// User management routes
route.use("/user", userRoute);

// Master data routes
route.use("/departments", departmentRoute);
route.use("/categories", categoryRoute);

// Core business routes
route.use("/projects", projectRoute);
route.use("/employees", employeeRoute);
route.use("/income", incomeRoute);
route.use("/expenses", expenseRoute);

// Dashboard and analytics routes
route.use("/dashboard", dashboardRoute);

export default route;
