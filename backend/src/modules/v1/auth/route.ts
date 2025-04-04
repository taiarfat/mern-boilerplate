/**
 * Authentication Routes
 *
 * This file defines all routes related to authentication including
 * login, registration, token refresh, and logout.
 */

import express from "express";
import controller from "./controller";

// Create a router instance
const route = express.Router();

/**
 * POST /login
 * Authenticates a user and returns tokens
 *
 * @body {object} credentials - User login credentials
 * @body {string} credentials.userEmail - User's email
 * @body {string} credentials.userPassword - User's password
 */
route.post("/login", controller.login as any);

/**
 * POST /register
 * Registers a new user
 *
 * @body {object} userData - New user information
 * @body {string} userData.userName - User's full name
 * @body {string} userData.userEmail - User's email
 * @body {string} userData.userPassword - User's password
 * @body {string} [userData.userGender] - User's gender (optional)
 * @body {string} [userData.userRole] - User's role (defaults to 'user')
 */
route.post("/register", controller.register as any);

/**
 * POST /refresh_token
 * Refreshes the access token using a valid refresh token
 *
 * Uses refresh_token cookie to generate a new access token
 */
route.post("/refresh_token", controller.refreshToken as any);

/**
 * POST /logout
 * Logs out the user by invalidating tokens
 *
 * Clears auth cookies and removes refresh token from database
 */
route.post("/logout", controller.logout as any);

export default route;
