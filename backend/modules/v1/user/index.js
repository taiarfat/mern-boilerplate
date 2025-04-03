import express from "express"

import route from "./route.js";

const router = express.Router();
router.use(
    /*
    #swagger.tags = [ 'User']
    */
    route
)

export default router;