/**
 * Department Module
 * 
 * This file exports the department router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount department routes
router.use(route);

export default router;
