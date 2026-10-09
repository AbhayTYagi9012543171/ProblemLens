import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { downloadReport } from "../controllers/reportController.js";

const router = Router();
router.use(protect);
router.get("/:id/download", downloadReport);
router.get("/:id/export", downloadReport);
export default router;
