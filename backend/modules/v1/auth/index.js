import express from "express"

import route from "./route.js";

const router = express.Router();
router.use(
    /*
     #swagger.tags = [ 'Auth']
    */
    route
)

export default router;