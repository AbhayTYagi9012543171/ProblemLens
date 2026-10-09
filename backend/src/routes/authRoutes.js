import {Router} from "express";
import {registerUser,loginUser,me,logout,forgotPassword,resetPassword,changePassword} from "../controllers/authController.js";
import { updateProfile } from "../controllers/profileController.js";
import {protect} from "../middleware/auth.js";
const r=Router();
r.post("/register",registerUser);r.post("/login",loginUser);r.post("/forgot-password",forgotPassword);r.post("/reset-password",resetPassword);
r.use(protect);r.get("/me",me);r.post("/logout",logout);r.post("/change-password",changePassword);r.put("/profile",updateProfile);
export default r;
