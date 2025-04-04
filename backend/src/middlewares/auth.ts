/**
 * Authentication Middleware
 *
 * This middleware verifies that the user is authenticated by checking
 * the access and refresh tokens in cookies. If valid, it attaches the
 * user object to the request for use in protected routes.
 */

import { Response, NextFunction } from "express";
import { CustomError, httpStatusCodes } from "../constants/constants";
import fetchUser from "../databases/services/user/fetchUser";
import { verifyAccessToken, verifyRefreshToken } from "../helpers/handleToken";
import { AuthRequest } from "../types/index";

/**
 * Authentication middleware function
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract tokens from cookies
    const { access_token: accessToken, refresh_token: refreshToken } = req.cookies;

    // Verify both tokens exist
    if (!accessToken || !refreshToken) {
      throw new CustomError(httpStatusCodes.Unauthorized, "Authentication required");
    }

    // Verify access token and decode user data
    const decodedData = verifyAccessToken(accessToken);

    // Fetch user from database using email from token
    const user = await fetchUser(
      { userEmail: decodedData.data.userEmail },
      { userName: 1, userEmail: 1, userRole: 1 }
    );

    // Verify user exists in database
    if (!user) {
      throw new CustomError(httpStatusCodes.Unauthorized, "User not found");
    }

    // Verify refresh token is valid for this user
    await verifyRefreshToken(refreshToken, { user: user as any });

    // Attach user to request object for use in route handlers
    req.user = user;

    // Continue to the next middleware or route handler
    return next();
  } catch (err) {
    console.log("======= Error AuthMiddleware", (err as Error).message);
    return next(err);
  }
};

export default authMiddleware;
