import mongoose, { Schema } from "mongoose";
import config from "../constants/config";
import { IToken } from "../types/index";

const tokenSchema = new Schema<IToken>({
  refreshToken: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

tokenSchema.index({ userId: 1, refreshToken: 1 });
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: parseInt(config.DB_TOKEN_EXPIRES) * 60 });

const Token = mongoose.model<IToken>("token", tokenSchema);

export default Token;
