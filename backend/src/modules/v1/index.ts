import express from "express";
import authRoute from "./auth/index";
import userRoute from "./user/index";

const route = express.Router();

route.use("/auth", authRoute);
route.use("/user", userRoute);

export default route;
