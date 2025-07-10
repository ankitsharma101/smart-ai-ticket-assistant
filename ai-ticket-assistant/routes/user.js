import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  getAllUsers,
  updateUserRole,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/users", authenticate, getAllUsers);
router.post("/update-user", authenticate, updateUserRole);

export default router;
