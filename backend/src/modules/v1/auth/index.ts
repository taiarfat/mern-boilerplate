import express from "express";

import route from "./route";

const router = express.Router();
router.use(
  /*
   #swagger.tags = [ 'Auth']
  */
  route
);

export default router;
