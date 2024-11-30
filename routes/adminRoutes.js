import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  deleteAdmin,
  getAdminChallenges,
  logoutAdmin,
  deleteChallengeFromAdmin,
} from "../controllers/adminController.js";
import { adminProtect } from "../middleware/adminProtect.js"; // Middleware for authorization

const router = express.Router();

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get("/challenges", adminProtect, getAdminChallenges);

router.delete("/challenge/delete/:challengeId", adminProtect, deleteChallengeFromAdmin);

router.get("/profile", adminProtect, getAdminProfile);

router.put("/profile", adminProtect, updateAdminProfile);

router.delete("/profile", adminProtect, deleteAdmin);

router.get("/logout", adminProtect, logoutAdmin);

export default router;
