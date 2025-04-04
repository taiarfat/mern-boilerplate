import mongoose from "mongoose";
import config from "../constants/config";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to mongo successfully");
  } catch (err) {
    const error = err as Error;
    console.log("something went wrong:", error.message);
    throw error;
  }
};

export default connectDB;
