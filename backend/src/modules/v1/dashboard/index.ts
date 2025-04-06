/**
 * Dashboard Module
 * 
 * This file exports the dashboard router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount dashboard routes
router.use(route);

export default router;
