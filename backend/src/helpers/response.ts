import { Response, Request, NextFunction } from "express";
import { httpStatusCodes, responseStatus } from "../constants/constants";
import { ApiResponse, CustomErrorType } from "../types/index";

export const sendResponse = <T>(
  res: Response,
  statuscode: number,
  status: string,
  operation: string,
  data: T = {} as T
): Response<ApiResponse<T>> => {
  return res.status(statuscode).json({ status, statuscode, operation, data });
};

export const errResponse = (
  err: CustomErrorType,
  req: Request,
  res: Response,
  next: NextFunction
): Response<ApiResponse> => {
  return res.status(err.status || httpStatusCodes["Internal Server Error"]).json({
    status: responseStatus.ERROR,
    statuscode: err.status || httpStatusCodes["Internal Server Error"],
    message: err.message || "Server Error"
  });
};
