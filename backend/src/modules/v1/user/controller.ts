/**
 * User Controllers
 *
 * This file contains controller functions for user-related routes
 * including listing, creating, updating, and deleting users.
 */

import { Response, NextFunction } from "express";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import createUser from "../../../databases/services/user/createUser";
import fetchAllUser from "../../../databases/services/user/fetchUsers";
import fetchUser from "../../../databases/services/user/fetchUser";
import modifyUser from "../../../databases/services/user/modifyUser";
import removeUser from "../../../databases/services/user/removeUser";
import { encryptPassword } from "../../../helpers/encryptPassword";
import { sendResponse } from "../../../helpers/response";
import { AuthRequest } from "../../../types/index";
import { UpdateUserRequest } from "../../../types/requests/UserRequests";

/**
 * Interface for query parameters in user listing
 */
interface QueryParams {
  /** Page number for pagination */
  page?: string;
  /** Number of items per page */
  limit?: string;
  /** Any additional query parameters */
  [key: string]: any;
}

/**
 * Get all users with optional filtering and pagination
 *
 * @param req - Express request object with query parameters
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with users data and count
 */
const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract pagination and filter parameters from query
    const { page, limit, ...conditions } = req.query as QueryParams;

    // Fetch users with pagination
    const users = await fetchAllUser(conditions, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    // Send successful response with users data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get All Users", users);
  } catch (err) {
    console.log("=====Get users", (err as Error).message);
    return next(err);
  }
};

/**
 * Get a user by ID
 *
 * @param req - Express request object with user ID parameter
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with user data
 */
const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract user ID from request parameters
    const id = req.params.id;

    // Fetch user by ID
    const user = await fetchUser({ _id: id });

    // Send successful response with user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get User By Id", user);
  } catch (err) {
    console.log("=====Get user by Id", (err as Error).message);
    return next(err);
  }
};

/**
 * Create a new user
 *
 * @param req - Express request object with user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created user data
 */
const addUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract user data from request body
    const userData = req.body;

    // Hash the password
    userData.userPassword = await encryptPassword(userData.userPassword);

    // Create user in database
    const user = await createUser(userData);

    // Send successful response with created user data
    return sendResponse(res, httpStatusCodes.Created, responseStatus.SUCCESS, "Add user", user);
  } catch (err) {
    console.log("=====Add user", (err as Error).message);
    return next(err);
  }
};

/**
 * Update a user by ID
 *
 * @param req - Express request object with user ID parameter and update data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated user data
 */
const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract user ID from request parameters
    const id = req.params.id;

    // Extract update data from request body
    const updateData = req.body as UpdateUserRequest;

    // If password is being updated, hash it
    if (updateData.userPassword) {
      updateData.userPassword = await encryptPassword(updateData.userPassword);
    }

    // Update user in database
    const user = await modifyUser({ _id: id }, updateData as any);

    // Send successful response with updated user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Update User", user);
  } catch (err) {
    console.log("=====Update user", (err as Error).message);
    return next(err);
  }
};

/**
 * Delete a user by ID
 *
 * @param req - Express request object with user ID parameter
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with deleted user data
 */
const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract user ID from request parameters
    const id = req.params.id;

    // Remove user from database
    const user = await removeUser({ _id: id });

    // Send successful response with deleted user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Delete User", user);
  } catch (err) {
    console.log("=====Delete user", (err as Error).message);
    return next(err);
  }
};

/**
 * Get the current authenticated user's profile
 *
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with current user data
 */
const getUserMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      throw new Error("User not found in request");
    }

    // Get user ID from authenticated user
    const id = req.user._id;

    // Fetch complete user data
    const user = await fetchUser({ _id: id });

    // Send successful response with user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get User Me", user);
  } catch (err) {
    console.log("=====Get user me", (err as Error).message);
    return next(err);
  }
};

/**
 * Update the current authenticated user's profile
 *
 * @param req - Express request object with authenticated user and update data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated user data
 */
const updateUserMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      throw new Error("User not found in request");
    }

    // Get user ID from authenticated user
    const id = req.user._id;

    // Extract update data from request body
    const updateData = req.body as UpdateUserRequest;

    // Prevent changing role and email for security reasons
    delete updateData.userRole;
    delete updateData.userEmail;

    // If password is being updated, hash it
    if (updateData.userPassword) {
      updateData.userPassword = await encryptPassword(updateData.userPassword);
    }

    // Update user in database
    const user = await modifyUser({ _id: id }, updateData as any);

    // Send successful response with updated user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Update User Me", user);
  } catch (err) {
    console.log("=====Update user me", (err as Error).message);
    return next(err);
  }
};

export default {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getUserMe,
  updateUserMe,
};
