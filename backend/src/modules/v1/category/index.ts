/**
 * Category Module
 * 
 * This file exports the category router for use in the application.
 */

import express from "express";
import route from "./route";

const router = express.Router();

// Mount category routes
router.use(route);

export default router;
