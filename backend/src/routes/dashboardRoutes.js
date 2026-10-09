import express from "express";

import Project from "../models/Project.js";
import Evidence from "../models/Evidence.js";
import Problem from "../models/Problem.js";
import { protect } from "../middleware/auth.js";
import Report from "../models/Report.js";
import Analysis from "../models/Analysis.js";

const router = express.Router();

// Dashboard data is private to the authenticated workspace.
router.use(protect);

const getUserId = (req) => req.user?._id || req.user?.id || null;

/*
 * The project/evidence/problem models use different ownership fields.
 * Keep the filter model-aware so an authenticated workspace does not
 * accidentally return zero records.
 */
const buildFilter = (req, resource) => {
  const userId = getUserId(req);
  if (!userId) return {};

  if (resource === "projects") {
    return { owner: userId };
  }

  if (resource === "evidence") {
    return { collectedBy: userId };
  }

  if (resource === "problems") {
    return { createdBy: userId };
  }

  if (resource === "reports" || resource === "analysis") {
    return { createdBy: userId };
  }

  return {};
};

const activeProjectFilter = (base = {}) => ({
  ...base,
  status: "ACTIVE",
});

const activeEvidenceFilter = (base = {}) => ({
  ...base,
  isArchived: { $ne: true },
});

const activeProblemFilter = (base = {}) => ({
  ...base,
  deleted: { $ne: true },
  isArchived: { $ne: true },
});

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

async function getSummary(req) {
  const projectFilter = buildFilter(req, "projects");
  const evidenceFilter = buildFilter(req, "evidence");
  const problemFilter = buildFilter(req, "problems");
  const reportFilter = buildFilter(req, "reports");

  const [
    totalProjects,
    activeProjects,
    totalEvidence,
    totalProblems,
    totalReports,
    scoreRows,
  ] = await Promise.all([
    Project.countDocuments(projectFilter),
    Project.countDocuments(activeProjectFilter(projectFilter)),
    Evidence.countDocuments(activeEvidenceFilter(evidenceFilter)),
    Problem.countDocuments(activeProblemFilter(problemFilter)),
    Report.countDocuments(reportFilter),
    Problem.find(activeProblemFilter(problemFilter))
      .select("opportunityScore score")
      .limit(1000)
      .lean(),
  ]);

  const scores = scoreRows
    .map((item) => safeNumber(item.opportunityScore ?? item.score))
    .filter((value) => value > 0);

  const opportunityScore = scores.length
    ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1))
    : 0;

  return {
    totalProjects,
    activeProjects,
    totalEvidence,
    totalProblems,
    totalReports,
    opportunityScore,
    projectsCount: totalProjects,
    evidenceCount: totalEvidence,
    problemsCount: totalProblems,
    averageOpportunityScore: opportunityScore,
  };
}

router.get("/summary", async (req, res, next) => {
  try {
    res.json({ success: true, data: await getSummary(req) });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const data = await getSummary(req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/projects", async (req, res, next) => {
  try {
    const ownerFilter = buildFilter(req, "projects");

    const projects = await Project.aggregate([
      { $match: ownerFilter },
      { $sort: { updatedAt: -1, createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "evidences",
          localField: "_id",
          foreignField: "project",
          as: "evidenceRows",
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "projectId",
          as: "problemRows",
        },
      },
      {
        $addFields: {
          evidenceCount: { $size: "$evidenceRows" },
          problemsCount: {
            $size: {
              $filter: {
                input: "$problemRows",
                as: "problem",
                cond: { $ne: ["$$problem.deleted", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          evidenceRows: 0,
          problemRows: 0,
        },
      },
    ]);

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.get("/activity", async (req, res, next) => {
  try {
    const [projects, evidence, problems, analyses] = await Promise.all([
      Project.find(buildFilter(req, "projects"))
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id name status createdAt updatedAt")
        .lean(),

      Evidence.find(activeEvidenceFilter(buildFilter(req, "evidence")))
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id title type createdAt project")
        .lean(),

      Problem.find(activeProblemFilter(buildFilter(req, "problems")))
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id title status createdAt")
        .lean(),

      Analysis.find(buildFilter(req, "analysis"))
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id project type createdAt")
        .lean(),
    ]);

    const activity = [
      ...projects.map((item) => ({
        id: `project-${item._id}`,
        type: "project",
        title: item.name || "Project updated",
        description: `${item.status || "DRAFT"} project`,
        createdAt: item.updatedAt || item.createdAt,
      })),
      ...evidence.map((item) => ({
        id: `evidence-${item._id}`,
        type: "evidence",
        title: item.title || "Evidence collected",
        description: `${item.type || "Other"} evidence added`,
        createdAt: item.createdAt,
      })),
      ...problems.map((item) => ({
        id: `problem-${item._id}`,
        type: "problem",
        title: item.title || "Problem discovered",
        description: `${item.status || "Discovered"} problem`,
        createdAt: item.createdAt,
      })),
      ...analyses.map((item) => ({
        id: `analysis-${item._id}`,
        type: "analysis",
        title: "AI analysis completed",
        description: `${item.type || "FULL"} analysis`,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
});

router.get("/overview", async (req, res, next) => {
  try {
    const [summary, projects] = await Promise.all([
      getSummary(req),
      Project.find(buildFilter(req, "projects"))
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        summary,
        recentProjects: projects,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
