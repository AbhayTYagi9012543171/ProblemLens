import { Router } from "express";
import { protect, requireRoles } from "../middleware/auth.js";
import { listUsers, getUser, createUser, updateUser, deleteUser, updateUserRole, setUserActive } from "../controllers/userController.js";

const router = Router();
router.use(protect);
router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", requireRoles("ADMIN"), createUser);
router.put("/:id", requireRoles("ADMIN"), updateUser);
router.patch("/:id/role", requireRoles("ADMIN"), updateUserRole);
router.patch("/:id/activate", requireRoles("ADMIN"), setUserActive);
router.patch("/:id/deactivate", requireRoles("ADMIN"), setUserActive);
router.delete("/:id", requireRoles("ADMIN"), deleteUser);
export default router;
