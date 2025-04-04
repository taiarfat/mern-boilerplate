import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { CustomError, httpStatusCodes } from "../constants/constants";
import config from "../constants/config";
import createToken from "../databases/services/token/createToken";
import fetchToken from "../databases/services/token/fetchToken";
import removeToken from "../databases/services/token/removeToken";
import { IUser } from "../types/index";

interface TokenUser {
  _id?: string | Types.ObjectId;
  userEmail: string;
  userRole: string;
  [key: string]: any;
}

interface TokenData {
  data: TokenUser;
  iat: number;
  exp: number;
}

interface VerifyOptions {
  user?: TokenUser;
  isAuth?: boolean;
}

const genJWT = (data: TokenUser, tokenSecret: string, tokenExpire: string): string => {
  try {
    // Use any type to bypass TypeScript's strict checking
    const token = jwt.sign({ data }, tokenSecret as any, { expiresIn: tokenExpire } as any);
    return token;
  } catch (err) {
    console.log("=====Gen JWT", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

const verifyJWT = (token: string, tokenSecret: string): TokenData => {
  try {
    const decodedData = jwt.verify(token, tokenSecret as any) as TokenData;
    return decodedData;
  } catch (err) {
    console.log("=====Verify JWT", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes.Unauthorized,
      (err as Error).message
    );
  }
};

export const genAccessToken = (user: TokenUser): string => {
  try {
    const token = genJWT(user, config.ACCESS_TOKEN_SECRET, config.ACCESS_TOKEN_EXPIRES);
    return token;
  } catch (err) {
    console.log("=====Gen AccessToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export const genRefreshToken = async (user: TokenUser): Promise<string> => {
  try {
    const token = genJWT(user, config.REFRESH_TOKEN_SECRET, config.REFRESH_TOKEN_EXPIRES);
    // Ensure user._id exists before passing to createToken
    if (!user._id) {
      throw new CustomError(httpStatusCodes["Bad Request"], "User ID is required");
    }
    await createToken({ userId: user._id, token });
    return token;
  } catch (err) {
    console.log("=====Gen RefreshToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export const verifyAccessToken = (token: string): TokenData => {
  try {
    const decodedData = verifyJWT(token, config.ACCESS_TOKEN_SECRET);
    return decodedData;
  } catch (err) {
    console.log("=====Verify AccessToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes.Unauthorized,
      (err as Error).message
    );
  }
};

export const verifyRefreshToken = async (token: string, optional: VerifyOptions = {}): Promise<TokenData> => {
  try {
    const { user = {} as TokenUser, isAuth = true } = optional;
    const decodedData = verifyJWT(token, config.REFRESH_TOKEN_SECRET);

    if (isAuth && decodedData.data._id != user._id) {
      throw new CustomError(httpStatusCodes.Unauthorized, "Invalid Tokens");
    }

    const { refreshToken } = await fetchToken({ userId: decodedData.data._id }, { refreshToken: 1 });

    if (refreshToken != token) {
      await removeToken({ userId: user._id });
      throw new CustomError(httpStatusCodes.Unauthorized, "Invalid Tokens");
    }

    return decodedData;
  } catch (err) {
    console.log("=====Verify RefreshToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes.Unauthorized,
      (err as Error).message
    );
  }
};
