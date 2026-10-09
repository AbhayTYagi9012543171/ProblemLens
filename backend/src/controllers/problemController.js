import mongoose from "mongoose";
import Problem from "../models/Problem.js";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.auth?.userId ||
    req.auth?.id ||
    null
  );
};

const normalizeString = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
};

const normalizeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/* -------------------------------------------------------------------------- */
/* Build problem payload                                                      */
/* -------------------------------------------------------------------------- */

const buildProblemPayload = (body = {}) => {
  const payload = {};

  if (body.title !== undefined) {
    payload.title = normalizeString(body.title);
  }

  if (body.description !== undefined) {
    payload.description = normalizeString(body.description);
  }

  if (body.project !== undefined) {
    payload.project = normalizeString(body.project);
  }

  if (body.projectId !== undefined) {
    if (
      body.projectId === null ||
      body.projectId === ""
    ) {
      payload.projectId = null;
    } else if (isValidObjectId(body.projectId)) {
      payload.projectId = body.projectId;
    }
  }

  if (body.severity !== undefined) {
    payload.severity = normalizeString(body.severity, "Medium");
  }

  if (body.status !== undefined) {
    payload.status = normalizeString(body.status, "Discovered");
  }

  if (body.category !== undefined) {
    payload.category = normalizeString(body.category);
  }

  if (body.confidence !== undefined) {
    payload.confidence = normalizeNumber(body.confidence);
  }

  if (body.opportunityScore !== undefined) {
    payload.opportunityScore = normalizeNumber(
      body.opportunityScore
    );
  }

  if (body.impactScore !== undefined) {
    payload.impactScore = normalizeNumber(
      body.impactScore
    );
  }

  if (body.frequencyScore !== undefined) {
    payload.frequencyScore = normalizeNumber(
      body.frequencyScore
    );
  }

  if (body.evidenceCount !== undefined) {
    payload.evidenceCount = normalizeNumber(
      body.evidenceCount
    );
  }

  if (body.evidenceIds !== undefined) {
    payload.evidenceIds = normalizeArray(body.evidenceIds);
  }

  if (body.tags !== undefined) {
    payload.tags = normalizeArray(body.tags);
  }

  if (body.affectedUsers !== undefined) {
    payload.affectedUsers = normalizeArray(
      body.affectedUsers
    );
  }

  if (body.location !== undefined) {
    payload.location = normalizeString(body.location);
  }

  if (body.frequency !== undefined) {
    payload.frequency = normalizeString(body.frequency);
  }

  if (body.rootCause !== undefined) {
    payload.rootCause = normalizeString(body.rootCause);
  }

  if (body.impact !== undefined) {
    payload.impact = normalizeString(body.impact);
  }

  if (body.aiGenerated !== undefined) {
    payload.aiGenerated = Boolean(body.aiGenerated);
  }

  if (body.aiModel !== undefined) {
    payload.aiModel = normalizeString(body.aiModel);
  }

  if (body.aiSummary !== undefined) {
    payload.aiSummary = normalizeString(body.aiSummary);
  }

  if (body.aiInsights !== undefined) {
    payload.aiInsights = normalizeArray(body.aiInsights);
  }

  return payload;
};

/* -------------------------------------------------------------------------- */
/* GET /api/problems                                                          */
/* -------------------------------------------------------------------------- */

export const getProblems = async (req, res, next) => {
  try {
    const {
      search = "",
      severity,
      status,
      project,
      category,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const currentPage = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      100
    );

    const filter = {
      deleted: false,
    };

    const userId = getUserId(req);
    if (userId && isValidObjectId(userId)) {
      filter.createdBy = userId;
    }

    /* Search */

    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /* Severity */

    if (
      severity &&
      severity !== "All Severities"
    ) {
      filter.severity = severity;
    }

    /* Status */

    if (
      status &&
      status !== "All Statuses"
    ) {
      filter.status = status;
    }

    /* Project */

    if (project) {
      if (isValidObjectId(project)) {
        filter.$or = [
          ...(filter.$or || []),
          {
            projectId: project,
          },
          {
            project: {
              $regex: project,
              $options: "i",
            },
          },
        ];
      } else {
        filter.project = {
          $regex: project,
          $options: "i",
        };
      }
    }

    /* Category */

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    /* Sorting */

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "title",
      "severity",
      "status",
      "confidence",
      "opportunityScore",
      "impactScore",
      "frequencyScore",
      "evidenceCount",
    ];

    const sortField = allowedSortFields.includes(sort)
      ? sort
      : "createdAt";

    const sortDirection =
      String(order).toLowerCase() === "asc"
        ? 1
        : -1;

    const skip = (currentPage - 1) * perPage;

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .populate(
          "projectId",
          "name title description"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        )
        .sort({
          [sortField]: sortDirection,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Problem.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: problems,
      problems,

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage),
        hasNextPage:
          currentPage < Math.ceil(total / perPage),
        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* GET /api/problems/:id                                                      */
/* -------------------------------------------------------------------------- */

export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const problem = await Problem.findOne({
      _id: id,
      deleted: false,
    })
      .populate(
        "projectId",
        "name title description"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: problem,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* POST /api/problems                                                         */
/* -------------------------------------------------------------------------- */

export const createProblem = async (req, res, next) => {
  try {
    const body = req.body || {};

    const title = normalizeString(body.title);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Problem title is required.",
      });
    }

    if (title.length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "Problem title must be at least 3 characters.",
      });
    }

    const payload = buildProblemPayload(body);

    payload.title = title;

    /*
     * Defaults
     */

    if (!payload.severity) {
      payload.severity = "Medium";
    }

    if (!payload.status) {
      payload.status = "Discovered";
    }

    /*
     * Ownership
     */

    const userId = getUserId(req);

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      payload.createdBy = userId;
      payload.updatedBy = userId;
    }

    const problem = await Problem.create(payload);

    const populatedProblem =
      await Problem.findById(problem._id)
        .populate(
          "projectId",
          "name title description"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        );

    return res.status(201).json({
      success: true,
      message: "Problem created successfully.",
      data: populatedProblem,
      problem: populatedProblem,
    });
  } catch (error) {
    console.error(
      "createProblem error:",
      error
    );

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return res.status(400).json({
        success: false,
        message: "Problem validation failed.",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A problem with this data already exists.",
      });
    }

    if (
      error instanceof mongoose.Error.CastError
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}.`,
      });
    }

    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* PUT /api/problems/:id                                                      */
/* -------------------------------------------------------------------------- */

export const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const payload = buildProblemPayload(
      req.body || {}
    );

    const userId = getUserId(req);

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      payload.updatedBy = userId;
    }

    const problem =
      await Problem.findOneAndUpdate(
        {
          _id: id,
          deleted: false,
        },
        {
          $set: payload,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "projectId",
          "name title description"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully.",
      data: problem,
      problem,
    });
  } catch (error) {
    console.error(
      "updateProblem error:",
      error
    );

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return res.status(400).json({
        success: false,
        message: "Problem validation failed.",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    if (
      error instanceof mongoose.Error.CastError
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}.`,
      });
    }

    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* DELETE /api/problems/:id                                                   */
/* -------------------------------------------------------------------------- */

export const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const userId = getUserId(req);

    const update = {
      deleted: true,
      deletedAt: new Date(),
      status: "Archived",
    };

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      update.updatedBy = userId;
    }

    const problem =
      await Problem.findOneAndUpdate(
        {
          _id: id,
          deleted: false,
        },
        {
          $set: update,
        },
        {
          new: true,
        }
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully.",
      data: problem,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* PATCH /api/problems/:id/archive                                            */
/* -------------------------------------------------------------------------- */

export const archiveProblem = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const userId = getUserId(req);

    const update = {
      status: "Archived",
    };

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      update.updatedBy = userId;
    }

    const problem =
      await Problem.findOneAndUpdate(
        {
          _id: id,
          deleted: false,
        },
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem archived successfully.",
      data: problem,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* PATCH /api/problems/:id/restore                                            */
/* -------------------------------------------------------------------------- */

export const restoreProblem = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const userId = getUserId(req);

    const update = {
      deleted: false,
      deletedAt: null,
      status: "Discovered",
    };

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      update.updatedBy = userId;
    }

    /*
     * Restore can operate on a soft-deleted problem.
     */
    const problem =
      await Problem.findOneAndUpdate(
        {
          _id: id,
          deleted: true,
        },
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Deleted problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem restored successfully.",
      data: problem,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* PATCH /api/problems/:id/status                                             */
/* -------------------------------------------------------------------------- */

export const updateProblemStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const status = normalizeString(
      req.body?.status
    );

    const allowedStatuses = [
      "Discovered",
      "Emerging",
      "Investigating",
      "Under Review",
      "Validated",
      "Prioritized",
      "Solved",
      "Archived",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid problem status.",
        allowedStatuses,
      });
    }

    const userId = getUserId(req);

    const update = {
      status,
    };

    if (
      userId &&
      isValidObjectId(userId)
    ) {
      update.updatedBy = userId;
    }

    const problem =
      await Problem.findOneAndUpdate(
        {
          _id: id,
          deleted: false,
        },
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Problem status updated successfully.",
      data: problem,
      problem,
    });
  } catch (error) {
    next(error);
  }
};