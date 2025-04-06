/**
 * Income Module
 * 
 * This file exports the income router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount income routes
router.use(route);

export default router;
