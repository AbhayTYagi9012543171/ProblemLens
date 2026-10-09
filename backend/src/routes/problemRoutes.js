import express from "express";

import { protect } from "../middleware/auth.js";

import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  archiveProblem,
  restoreProblem,
  updateProblemStatus,
} from "../controllers/problemController.js";

const router = express.Router();

router.use(protect);

/* -------------------------------------------------------------------------- */
/* Problem collection                                                         */
/* -------------------------------------------------------------------------- */

/*
 * GET /api/problems
 *
 * Get all problems with optional filters:
 *
 * ?search=internship
 * ?severity=High
 * ?status=Validated
 * ?project=...
 * ?category=...
 * ?page=1
 * ?limit=20
 * ?sort=createdAt
 * ?order=desc
 */
router.get("/", getProblems);

/*
 * POST /api/problems
 *
 * Create a new problem.
 */
router.post("/", createProblem);

/* -------------------------------------------------------------------------- */
/* Individual problem                                                         */
/* -------------------------------------------------------------------------- */

/*
 * GET /api/problems/:id
 */
router.get("/:id", getProblemById);

/*
 * PUT /api/problems/:id
 */
router.put("/:id", updateProblem);

/*
 * DELETE /api/problems/:id
 */
router.delete("/:id", deleteProblem);

/* -------------------------------------------------------------------------- */
/* Problem actions                                                            */
/* -------------------------------------------------------------------------- */

/*
 * PATCH /api/problems/:id/archive
 */
router.patch("/:id/archive", archiveProblem);

/*
 * PATCH /api/problems/:id/restore
 */
router.patch("/:id/restore", restoreProblem);

/*
 * PATCH /api/problems/:id/status
 *
 * Body:
 * {
 *   "status": "Validated"
 * }
 */
router.patch("/:id/status", updateProblemStatus);

/* -------------------------------------------------------------------------- */
/* Default export                                                             */
/* -------------------------------------------------------------------------- */

export default router;