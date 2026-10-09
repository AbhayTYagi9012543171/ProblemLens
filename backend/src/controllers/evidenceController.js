import mongoose from "mongoose";
import Evidence from "../models/Evidence.js";

const TYPE_ALIASES = {
  TEXT: "Other",
  OTHER: "Other",
  SURVEY: "Survey",
  INTERVIEW: "Interview",
  REVIEW: "Web Research",
  OBSERVATION: "Observation",
  DOCUMENT: "Document",
  ANALYTICS: "Analytics",
  "WEB RESEARCH": "Web Research",
};

const CANONICAL_TYPES = [
  "Interview",
  "Survey",
  "Observation",
  "Web Research",
  "Document",
  "Analytics",
  "Other",
];

const TYPE_TO_UI = {
  Interview: "INTERVIEW",
  Survey: "SURVEY",
  Observation: "OBSERVATION",
  "Web Research": "REVIEW",
  Document: "DOCUMENT",
  Analytics: "ANALYTICS",
  Other: "OTHER",
};

const STATUS_ALIASES = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeType(value) {
  const raw = cleanText(value);
  if (!raw) return "Other";

  const aliasKey = raw.toUpperCase();
  return TYPE_ALIASES[aliasKey] || raw;
}

function normalizeStatus(value) {
  const raw = cleanText(value);
  if (!raw) return "Pending";
  return STATUS_ALIASES[raw.toUpperCase()] || raw;
}

function normalizeTags(body) {
  const raw = Array.isArray(body.tags)
    ? body.tags
    : Array.isArray(body.keywords)
    ? body.keywords
    : typeof body.keywords === "string"
    ? body.keywords.split(",")
    : [];

  return raw
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeMetadata(value) {
  if (value === undefined || value === null || value === "") return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function normalizePayload(body = {}) {
  const rawProject = body.project || body.projectId || null;

  const payload = {
    title: cleanText(body.title),
    // `content` is the frontend name; `description` is the DB name.
    description: cleanText(body.description ?? body.content),
    source: cleanText(body.source),
    sourceUrl: cleanText(body.sourceUrl),
    type: normalizeType(body.type),
    status: normalizeStatus(body.status),
    author: cleanText(body.author),
    sentiment:
      body.sentiment === "" || body.sentiment === null || body.sentiment === undefined
        ? null
        : Number(body.sentiment),
    tags: normalizeTags(body),
    metadata: normalizeMetadata(body.metadata),
    projectName:
      cleanText(body.projectName) ||
      (typeof body.project === "string" && !mongoose.Types.ObjectId.isValid(body.project)
        ? cleanText(body.project)
        : "Unassigned project"),
  };

  if (rawProject && mongoose.Types.ObjectId.isValid(rawProject)) {
    payload.project = rawProject;
  } else if (!rawProject) {
    payload.project = null;
  }

  return payload;
}

function validatePayload(payload) {
  const errors = {};

  if (!payload.title) {
    errors.title = "Evidence title is required";
  } else if (payload.title.length < 3) {
    errors.title = "Evidence title must be at least 3 characters";
  }

  if (!payload.description) {
    errors.content = "Evidence content is required";
  } else if (payload.description.length < 5) {
    errors.content = "Evidence content must be at least 5 characters";
  }

  if (!payload.source) {
    errors.source = "Source is required";
  }

  if (payload.sourceUrl) {
    try {
      const url = new URL(payload.sourceUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.sourceUrl = "Only HTTP and HTTPS URLs are allowed";
      }
    } catch {
      errors.sourceUrl = "Enter a valid source URL";
    }
  }

  if (!CANONICAL_TYPES.includes(payload.type)) {
    errors.type = "Invalid evidence type";
  }

  if (!["Pending", "Verified", "Rejected"].includes(payload.status)) {
    errors.status = "Invalid evidence status";
  }

  if (payload.sentiment !== null && !Number.isFinite(payload.sentiment)) {
    errors.sentiment = "Sentiment must be a number between -1 and 1";
  } else if (
    payload.sentiment !== null &&
    (payload.sentiment < -1 || payload.sentiment > 1)
  ) {
    errors.sentiment = "Sentiment must be a number between -1 and 1";
  }

  return errors;
}

function serializeEvidence(item) {
  const raw = typeof item?.toObject === "function" ? item.toObject() : item;
  const projectObject = raw?.project && typeof raw.project === "object" ? raw.project : null;

  return {
    ...raw,
    id: raw?._id || raw?.id,
    projectId:
      projectObject?._id ||
      (typeof raw?.project === "string"
        ? raw.project
        : raw?.project?.toString?.() || null),
    projectName:
      projectObject?.name ||
      projectObject?.title ||
      raw?.projectName ||
      "Unassigned project",
    project: projectObject || raw?.project || null,
    content: raw?.description || "",
    keywords: Array.isArray(raw?.tags) ? raw.tags : [],
    type: TYPE_TO_UI[raw?.type] || "OTHER",
    status: raw?.status || "Pending",
    author: raw?.author || "",
    sentiment: typeof raw?.sentiment === "number" ? raw.sentiment : null,
    metadata:
      raw?.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
  };
}

/** GET /api/evidence */
export async function getEvidence(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search = "", type = "", status = "", project = "", archived = "false" } = req.query;

    const filter = { isArchived: archived === "true" };

    const userId = req.user?._id || req.user?.id;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.collectedBy = userId;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { source: searchRegex },
        { projectName: searchRegex },
        { author: searchRegex },
        { type: searchRegex },
      ];
    }

    if (type && type !== "all") {
      filter.type = normalizeType(type);
    }

    if (status && status !== "all") {
      filter.status = normalizeStatus(status);
    }

    if (project && project !== "all") {
      if (mongoose.Types.ObjectId.isValid(project)) {
        filter.project = project;
      } else {
        filter.projectName = new RegExp(project.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      }
    }

    const [items, total] = await Promise.all([
      Evidence.find(filter)
        .populate("project", "name title")
        .populate("collectedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Evidence.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items.map(serializeEvidence),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get evidence error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch evidence",
      error: error.message,
    });
  }
}

/** GET /api/evidence/stats */
export async function getEvidenceStats(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const ownerFilter = userId && mongoose.Types.ObjectId.isValid(userId)
      ? { collectedBy: userId }
      : {};

    const [total, verified, pending, rejected, byType] = await Promise.all([
      Evidence.countDocuments({ ...ownerFilter, isArchived: false }),
      Evidence.countDocuments({ ...ownerFilter, status: "Verified", isArchived: false }),
      Evidence.countDocuments({ ...ownerFilter, status: "Pending", isArchived: false }),
      Evidence.countDocuments({ ...ownerFilter, status: "Rejected", isArchived: false }),
      Evidence.aggregate([
        { $match: { ...ownerFilter, isArchived: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        verified,
        pending,
        rejected,
        byType: byType.map((item) => ({
          type: TYPE_TO_UI[item._id] || "OTHER",
          label: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("Get evidence stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch evidence statistics",
    });
  }
}

/** GET /api/evidence/:id */
export async function getEvidenceById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid evidence ID" });
    }

    const evidence = await Evidence.findOne({ _id: id, isArchived: false })
      .populate("project", "name title")
      .populate("collectedBy", "name email");

    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    return res.status(200).json({ success: true, data: serializeEvidence(evidence) });
  } catch (error) {
    console.error("Get evidence by ID error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch evidence" });
  }
}

/** POST /api/evidence */
export async function createEvidence(req, res) {
  try {
    const payload = normalizePayload(req.body);
    const errors = validatePayload(payload);

    if (Object.keys(errors).length) {
      return res.status(422).json({
        success: false,
        message: "Please correct the validation errors",
        errors,
      });
    }

    if (req.user?._id || req.user?.id) {
      payload.collectedBy = req.user._id || req.user.id;
    }

    const evidence = await Evidence.create(payload);

    return res.status(201).json({
      success: true,
      message: "Evidence created successfully",
      data: serializeEvidence(evidence),
    });
  } catch (error) {
    console.error("Create evidence error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.entries(error.errors).forEach(([key, value]) => {
        errors[key === "description" ? "content" : key] = value.message;
      });
      return res.status(422).json({ success: false, message: "Validation failed", errors });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create evidence",
      error: error.message,
    });
  }
}

/** PUT /api/evidence/:id */
export async function updateEvidence(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid evidence ID" });
    }

    const payload = normalizePayload(req.body);
    const errors = validatePayload(payload);

    if (Object.keys(errors).length) {
      return res.status(422).json({
        success: false,
        message: "Please correct the validation errors",
        errors,
      });
    }

    const evidence = await Evidence.findOneAndUpdate(
      { _id: id, isArchived: false },
      { $set: payload },
      { new: true, runValidators: true }
    )
      .populate("project", "name title")
      .populate("collectedBy", "name email");

    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Evidence updated successfully",
      data: serializeEvidence(evidence),
    });
  } catch (error) {
    console.error("Update evidence error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update evidence",
      error: error.message,
    });
  }
}

/** DELETE /api/evidence/:id */
export async function deleteEvidence(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid evidence ID" });
    }

    const evidence = await Evidence.findOneAndUpdate(
      { _id: id, isArchived: false },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    return res.status(200).json({ success: true, message: "Evidence deleted successfully" });
  } catch (error) {
    console.error("Delete evidence error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete evidence" });
  }
}
