import mongoose, { Schema, Model } from "mongoose";
import { userConstants } from "../constants/constants";
import paginationPlugin from "../helpers/paginationPlugin";
import { IUser } from "../types/index";

const userSchema = new Schema<IUser>({
  userName: {
    type: String,
    trim: true,
    required: true,
  },
  userEmail: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    immutable: true,
    required: true,
  },
  userPassword: {
    type: String,
    select: false,
    required: true,
  },
  userGender: {
    type: String,
    enum: [...Object.values(userConstants.GENDER)],
  },
  userRole: {
    type: String,
    ref: "role",
    enum: [...Object.values(userConstants.ROLES)],
    required: true
  },
  userDob: {
    type: Date,
    max: new Date()
  }
}, {
  timestamps: true
});

userSchema.index({ userRole: 1 });
userSchema.plugin(paginationPlugin);

// Add static method to the interface
interface UserModel extends Model<IUser> {
  pagination: (query: any[], options: { page?: number; limit?: number; totalData: number }) => Promise<{ data: IUser[]; count: number }>;
}

const User = mongoose.model<IUser, UserModel>("user", userSchema);

export default User;
