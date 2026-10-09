import express from "express";

import { protect } from "../middleware/auth.js";

import {
  getEvidence,
  getEvidenceStats,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
} from "../controllers/evidenceController.js";

const router = express.Router();

router.use(protect);

// Authentication is handled globally in this project where applicable.
// Keep the routes JSON-only and let the controller return field-level errors.
router.get("/stats", getEvidenceStats);
router.get("/", getEvidence);
router.get("/:id", getEvidenceById);
router.post("/", createEvidence);
router.put("/:id", updateEvidence);
router.delete("/:id", deleteEvidence);

export default router;
