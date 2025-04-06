/**
 * Project Module
 * 
 * This file exports the project router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount project routes
router.use(route);

export default router;
