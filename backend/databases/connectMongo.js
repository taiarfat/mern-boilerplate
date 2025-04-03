import mongoose from "mongoose";
import config from "../constants/config.js";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Connected to mongo successfully")
    }
    catch (err) {
        console.log("something went wrong:", err.message)
    }
}

export default connectDB
