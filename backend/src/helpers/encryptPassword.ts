import bcrypt from "bcrypt";
import config from "../constants/config";
import { CustomError, httpStatusCodes } from "../constants/constants";

export const encryptPassword = async (password: string): Promise<string> => {
  const encPassword = await bcrypt.hash(password, parseInt(config.SALT_ROUND));
  return encPassword;
};

export const comparePassword = async (password: string, userPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, userPassword);
  } catch (err) {
    console.log("======== Error CompatePassword", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"], 
      (err as Error).message
    );
  }
};
