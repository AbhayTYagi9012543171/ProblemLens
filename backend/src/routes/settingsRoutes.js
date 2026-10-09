import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getSettings, updateSettings, updateNotifications, updateAppearance } from "../controllers/settingsController.js";

const router = Router();
router.use(protect);
router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/notifications", updateNotifications);
router.put("/appearance", updateAppearance);
export default router;
