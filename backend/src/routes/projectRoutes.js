import express from "express";

import { protect } from "../middleware/auth.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

export default router;