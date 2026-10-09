import { Router } from "express";
import { list, create, getOne, update, remove } from "../controllers/crudController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const resources = new Set(["projects", "evidence", "problems", "analysis", "reports"]);

router.use(protect);
router.param("resource", (req, res, next, value) => {
  if (!resources.has(value)) {
    return res.status(404).json({ success: false, message: `Unknown resource: ${value}` });
  }
  next();
});

router.get("/:resource", list);
router.post("/:resource", create);
router.get("/:resource/:id", getOne);
router.patch("/:resource/:id", update);
router.put("/:resource/:id", update);
router.delete("/:resource/:id", remove);

export default router;
