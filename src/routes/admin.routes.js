import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { deleteUser, getAllUsers, updateUserRole } from "../controllers/admin.controller.js";

const router = express.Router();



// All admin routes are protected
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
 
);

router.patch(
  "/users/:userId/role",
  authMiddleware,
  roleMiddleware("admin"),
 updateUserRole
);

router.delete(
  "/users/:userId",
  authMiddleware,
  roleMiddleware("admin"),
 deleteUser
);


export default router;