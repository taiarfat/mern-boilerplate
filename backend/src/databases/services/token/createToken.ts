import { Types } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import Token from "../../../models/Token";

interface TokenData {
  userId: string | Types.ObjectId;
  token: string;
}

const createToken = async (data: TokenData): Promise<void> => {
  try {
    const { userId, token } = data;
    await Token.updateOne(
      { userId }, 
      { refreshToken: token }, 
      { runValidators: true, upsert: true }
    );
  } catch (err) {
    console.log("======= Error createToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"], 
      (err as Error).message
    );
  }
};

export default createToken;
