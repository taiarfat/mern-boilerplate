/**
 * User Routes
 *
 * This file defines all routes related to user management including
 * listing, creating, updating, and deleting users.
 */

import express from "express";
import controller from "./controller";
import authMiddleware from "../../../middlewares/auth";

// Create a router instance
const route = express.Router();

/**
 * GET /
 * Get all users with optional filtering
 *
 * @query {string} [userName] - Filter by user name
 * @query {string} [userRole] - Filter by user role
 * @query {string} [userGender] - Filter by user gender
 * @query {string} [userEmail] - Filter by user email
 * @query {number} [page] - Page number for pagination
 * @query {number} [limit] - Number of items per page
 */
route.get("/", authMiddleware as any, controller.getUsers as any);

/**
 * POST /
 * Create a new user
 *
 * @body {object} userData - New user information
 */
route.post("/", controller.addUser as any);

/**
 * GET /me
 * Get the current authenticated user's profile
 */
route.get("/me", authMiddleware as any, controller.getUserMe as any);

/**
 * PUT /me
 * Update the current authenticated user's profile
 *
 * @body {object} userData - User data to update
 */
route.put("/me", authMiddleware as any, controller.updateUserMe as any);

/**
 * GET /:id
 * Get a user by ID
 *
 * @param {string} id - User ID
 */
route.get("/:id", authMiddleware as any, controller.getUserById as any);

/**
 * DELETE /:id
 * Delete a user by ID
 *
 * @param {string} id - User ID
 */
route.delete("/:id", authMiddleware as any, controller.deleteUser as any);

/**
 * PUT /:id
 * Update a user by ID
 *
 * @param {string} id - User ID
 * @body {object} userData - User data to update
 */
route.put("/:id", authMiddleware as any, controller.updateUser as any);

export default route;
