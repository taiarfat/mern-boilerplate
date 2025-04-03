import express from "express"
import controller from "./controller.js";
import authMiddleware from "../../../middlewares/auth.js";
import validator from "../../../middlewares/validator.js";
import validatorSchema from "./validatorSchema.js";

const route = express.Router()

route.get("/",
  /*  
      #swagger.parameters['userName'] = {
              in: 'query',
              description: ''
      } 
      #swagger.parameters['userRole'] = {
              in: 'query',
              description: ''
      }
      #swagger.parameters['userGender'] = {
              in: 'query',
              description: ''
      }
      #swagger.parameters['userEmail'] = {
              in: 'query',
              description: ''
      }
      #swagger.parameters['page'] = {
              in: 'query',
              description: ''
      }
      #swagger.parameters['limit'] = {
              in: 'query',
              description: ''
      }
  */
  authMiddleware, controller.getUsers);

route.post("/",
  /*  #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                     schema: {
                         $ref: "#/definitions/addUser"
                     }  
                 }
             }
         } 
     */
  validator(validatorSchema.createUserSchema), controller.addUser);

route.get("/me", authMiddleware, controller.getUserMe);

route.put("/me",
  /*  #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                     schema: {
                         $ref: "#/definitions/updateUser"
                     }  
                 }
             }
         } 
  */
  authMiddleware, validator(validatorSchema.updateUserSchema), controller.updateUserMe);

route.get("/:id", authMiddleware, controller.getUserById);
route.delete("/:id", authMiddleware, controller.deleteUser);

route.put("/:id",
  /*  #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: {
                      $ref: "#/definitions/updateUser"
                  }  
              }
          }
      } 
  */
  authMiddleware, validator(validatorSchema.updateUserSchema), controller.updateUser);

export default route;