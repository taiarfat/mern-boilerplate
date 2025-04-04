import { CustomError, httpStatusCodes } from "../../../constants/constants";
import User from "../../../models/User";
import { IUser } from "../../../types/index";

interface UserCreateData {
  userName: string;
  userEmail: string;
  userPassword: string;
  userGender?: string;
  userRole: string;
  userDob?: Date;
}

const createUser = async (data: UserCreateData): Promise<Partial<IUser>> => {
  try {
    const newUser = (await User.create(data)).toJSON();
    const { userPassword, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  } catch (err) {
    console.log("======= Error createUser", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default createUser;
