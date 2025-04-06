/**
 * Employee Module
 * 
 * This file exports the employee router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount employee routes
router.use(route);

export default router;
