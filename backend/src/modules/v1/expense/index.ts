/**
 * Expense Module
 * 
 * This file exports the expense router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount expense routes
router.use(route);

export default router;
