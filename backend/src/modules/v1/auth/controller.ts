/**
 * Authentication Controllers
 *
 * This file contains controller functions for authentication-related routes
 * including login, registration, token refresh, and logout.
 */

import { Request, Response, NextFunction } from "express";
import { CustomError, httpStatusCodes, responseStatus } from "../../../constants/constants";
import { genAccessToken, genRefreshToken, verifyRefreshToken } from "../../../helpers/handleToken";
import { sendResponse } from "../../../helpers/response";
import { comparePassword, encryptPassword } from "../../../helpers/encryptPassword";
import config from "../../../constants/config";
import fetchUser from "../../../databases/services/user/fetchUser";
import removeToken from "../../../databases/services/token/removeToken";
import createUser from "../../../databases/services/user/createUser";
import { AuthRequest } from "../../../types/index";
import { LoginRequest, RegisterRequest } from "../../../types/requests/UserRequests";

/**
 * Login controller
 * Authenticates a user and generates access and refresh tokens
 *
 * @param req - Express request object with login credentials
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with user data and tokens set in cookies
 */
const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Clear any existing tokens
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

    // Extract login data from request body
    const { userEmail, userPassword } = req.body as LoginRequest;

    // Find user by email and include password for verification
    const user = await fetchUser({ userEmail }, { userEmail: 1, userPassword: 1, userRole: 1 });

    // Verify user exists and password is correct
    if (!user || !(await comparePassword(userPassword, user.userPassword))) {
      throw new CustomError(httpStatusCodes["Bad Request"], "Invalid email or password");
    }

    // Remove password from user object before generating tokens
    const { userPassword: pwd, ...userWithoutPassword } = user;

    // Generate tokens
    const accessToken = genAccessToken(userWithoutPassword as any);
    const refreshToken = await genRefreshToken(userWithoutPassword as any);

    // Set access token cookie
    res.cookie("access_token", accessToken, {
      expires: new Date(Date.now() + 60 * 1000 * parseInt(config.ACCESS_TOKEN_COOKIE_EXPIRE_TIME)),
      httpOnly: true
    });

    // Set refresh token cookie
    res.cookie("refresh_token", refreshToken, {
      expires: new Date(Date.now() + 60 * 1000 * parseInt(config.REFRESH_TOKEN_COOKIE_EXPIRE_TIME)),
      httpOnly: true
    });

    // Send successful response with user data
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Login Successfully", userWithoutPassword);
  } catch (err) {
    console.log("=====login", (err as Error).message);
    return next(err);
  }
};

/**
 * Refresh Token controller
 * Generates a new access token using a valid refresh token
 *
 * @param req - Express request object with refresh token in cookies
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with new access token set in cookie
 */
const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Get refresh token from cookies
    const { refresh_token: refreshToken } = req.cookies;

    // Verify refresh token exists
    if (!refreshToken) {
      throw new CustomError(httpStatusCodes.Unauthorized, "No refresh token provided");
    }

    // Verify refresh token and get user data
    const decodedData = await verifyRefreshToken(refreshToken, { isAuth: false });
    const user = await fetchUser(
      { _id: decodedData.data._id },
      { userName: 1, userEmail: 1, userRole: 1 }
    );

    // Generate new access token
    const accessToken = genAccessToken(user as any);

    // Set new access token cookie
    res.cookie("access_token", accessToken, {
      expires: new Date(Date.now() + 60 * 1000 * parseInt(config.ACCESS_TOKEN_COOKIE_EXPIRE_TIME)),
      httpOnly: true
    });

    // Send successful response
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Token Refreshed", user);
  } catch (err) {
    console.log("=====refreshToken", (err as Error).message);
    return next(err);
  }
};

/**
 * Logout controller
 * Invalidates tokens and clears cookies
 *
 * @param req - Express request object with refresh token in cookies
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating successful logout
 */
const logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Get refresh token from cookies
    const { refresh_token: refreshToken } = req.cookies;

    // If refresh token exists, remove it from database
    if (refreshToken) {
      const decodedData = await verifyRefreshToken(refreshToken, { isAuth: false });
      await removeToken({ userId: decodedData.data._id });
    }

    // Clear auth cookies
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

    // Send successful response
    return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Logout Successfully");
  } catch (err) {
    console.log("=====logout", (err as Error).message);
    return next(err);
  }
};

/**
 * Register controller
 * Creates a new user account
 *
 * @param req - Express request object with user registration data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created user data
 */
const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract registration data from request body
    const userData = req.body as RegisterRequest;

    // Hash the password
    userData.userPassword = await encryptPassword(userData.userPassword);

    // Ensure userRole is set (default to 'user')
    if (!userData.userRole) {
      userData.userRole = 'user';
    }

    // Create the user in database
    const user = await createUser(userData as any);

    // Send successful response with user data
    return sendResponse(res, httpStatusCodes.Created, responseStatus.SUCCESS, "User registered successfully", user);
  } catch (err) {
    console.log("=====register", (err as Error).message);
    return next(err);
  }
};

export default {
  login,
  refreshToken,
  logout,
  register
};
