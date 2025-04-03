import express from "express";
import authRoute from "./auth/index.js"
import userRoute from "./user/index.js"


const route = express.Router();

route.use("/auth", authRoute)
route.use("/user", userRoute)

export default route;