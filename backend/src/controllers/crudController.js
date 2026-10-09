// import Project from "../models/Project.js";
// import Evidence from "../models/Evidence.js";
// import Problem from "../models/Problem.js";
// import Analysis from "../models/Analysis.js";
// import Report from "../models/Report.js";
// import ActivityLog from "../models/ActivityLog.js";
// import Notification from "../models/Notification.js";
// import User from "../models/User.js";
// import { calculateScore } from "../services/scoringService.js";
// import { runAI } from "../services/aiClient.js";

// const models = {
//   projects: Project,
//   evidence: Evidence,
//   problems: Problem,
//   analysis: Analysis,
//   reports: Report,
// };

// const ownershipField = {
//   projects: "owner",
//   evidence: "collectedBy",
//   problems: "createdBy",
//   analysis: "createdBy",
//   reports: "createdBy",
// };

// const populatePaths = {
//   projects: ["owner", "members"],
//   evidence: ["project", "collectedBy"],
//   problems: ["projectId", "createdBy", "updatedBy"],
//   analysis: ["project", "inputEvidence", "createdBy"],
//   reports: ["project", "createdBy"],
// };

// const getModel = (resource) => models[resource];

// const getUserId = (req) => req.user?._id || req.user?.id || null;

// const getFilter = (resource, req) => {
//   const field = ownershipField[resource];
//   const userId = getUserId(req);
//   return field && userId ? { [field]: userId } : {};
// };

// const applyPopulate = (query, resource) => {
//   for (const path of populatePaths[resource] || []) {
//     query = query.populate(path);
//   }
//   return query;
// };

// export async function list(req, res, next) {
//   try {
//     const M = getModel(req.params.resource);
//     if (!M) return res.status(404).json({ success: false, message: "Unknown resource" });

//     const resource = req.params.resource;
//     const filter = {
//       ...getFilter(resource, req),
//     };

//     if (req.query.project) {
//       if (resource === "evidence") filter.project = req.query.project;
//       if (resource === "problems") filter.projectId = req.query.project;
//       if (resource === "analysis" || resource === "reports") filter.project = req.query.project;
//     }

//     const query = M.find(filter).sort({ createdAt: -1 }).limit(500);
//     const data = await applyPopulate(query, resource).lean();

//     res.json({ success: true, data });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function create(req, res, next) {
//   try {
//     const resource = req.params.resource;
//     const M = getModel(resource);
//     if (!M) return res.status(404).json({ success: false, message: "Unknown resource" });

//     const body = { ...req.body };
//     const userId = getUserId(req);
//     const ownerField = ownershipField[resource];

//     if (ownerField && userId) body[ownerField] = userId;

//     if (resource === "projects") body.owner = userId;
//     if (resource === "reports") {
//       if (!body.project) return res.status(400).json({ success:false, message:"Project is required for a report." });
//       if (!body.createdBy) body.createdBy = userId;
//       body.format = String(body.format || "JSON").toUpperCase();
//       body.content = body.content || {};
//     }
//     if (resource === "problems") Object.assign(body, calculateScore(body));

//     const item = await M.create(body);
//     const populated = await applyPopulate(M.findById(item._id), resource);

//     res.status(201).json({ success: true, data: await populated.lean() });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function getOne(req, res, next) {
//   try {
//     const resource = req.params.resource;
//     const M = getModel(resource);
//     if (!M) return res.status(404).json({ success: false, message: "Unknown resource" });

//     const filter = {
//       _id: req.params.id,
//       ...getFilter(resource, req),
//     };

//     const item = await applyPopulate(M.findOne(filter), resource).lean();

//     if (!item) {
//       return res.status(404).json({ success: false, message: "Not found" });
//     }

//     res.json({ success: true, data: item });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function update(req, res, next) {
//   try {
//     const resource = req.params.resource;
//     const M = getModel(resource);
//     if (!M) return res.status(404).json({ success: false, message: "Unknown resource" });

//     const body = { ...req.body };
//     delete body.owner;
//     delete body.collectedBy;
//     delete body.createdBy;

//     if (resource === "problems") {
//       Object.assign(body, calculateScore(body));
//     }

//     const item = await M.findOneAndUpdate(
//       { _id: req.params.id, ...getFilter(resource, req) },
//       { $set: body },
//       { new: true, runValidators: true }
//     );

//     if (!item) {
//       return res.status(404).json({ success: false, message: "Not found" });
//     }

//     const populated = await applyPopulate(M.findById(item._id), resource);
//     res.json({ success: true, data: await populated.lean() });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const resource = req.params.resource;
//     const M = getModel(resource);
//     if (!M) return res.status(404).json({ success: false, message: "Unknown resource" });

//     const item = await M.findOneAndDelete({
//       _id: req.params.id,
//       ...getFilter(resource, req),
//     });

//     if (!item) return res.status(404).json({ success: false, message: "Not found" });

//     res.json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function dashboard(req, res, next) {
//   try {
//     const [projects, evidence, problems, reports] = await Promise.all([
//       Project.countDocuments(getFilter("projects", req)),
//       Evidence.countDocuments(getFilter("evidence", req)),
//       Problem.countDocuments(getFilter("problems", req)),
//       Report.countDocuments(getFilter("reports", req)),
//     ]);

//     const severity = await Problem.aggregate([
//       { $match: getFilter("problems", req) },
//       { $group: { _id: "$severity", count: { $sum: 1 } } },
//     ]);

//     res.json({
//       success: true,
//       data: {
//         counts: { projects, evidence, problems, reports },
//         severity,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function users(req, res, next) {
//   try {
//     res.json({
//       success: true,
//       data: await User.find().select("-password").sort({ createdAt: -1 }).lean(),
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function activity(req, res, next) {
//   try {
//     res.json({
//       success: true,
//       data: await ActivityLog.find()
//         .populate("user", "name email")
//         .sort({ createdAt: -1 })
//         .limit(100)
//         .lean(),
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function notifications(req, res, next) {
//   try {
//     res.json({
//       success: true,
//       data: await Notification.find({ user: req.user._id })
//         .sort({ createdAt: -1 })
//         .limit(100)
//         .lean(),
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function readNotification(req, res, next) {
//   try {
//     const data = await Notification.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       { read: true },
//       { new: true }
//     ).lean();

//     res.json({ success: true, data });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function analyze(req, res, next) {
//   try {
//     const result = await runAI("/analyze", req.body);
//     const item = await Analysis.create({
//       project: req.body.project,
//       type: req.body.type || "FULL",
//       inputEvidence: req.body.evidenceIds || [],
//       result,
//       createdBy: req.user._id,
//     });

//     res.json({ success: true, data: item });
//   } catch (error) {
//     next(error);
//   }
// }















import Project from "../models/Project.js";
import Evidence from "../models/Evidence.js";
import Problem from "../models/Problem.js";
import Analysis from "../models/Analysis.js";
import Report from "../models/Report.js";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { calculateScore } from "../services/scoringService.js";
import { runAI } from "../services/aiClient.js";

const models = {
  projects: Project,
  evidence: Evidence,
  problems: Problem,
  analysis: Analysis,
  reports: Report,
};

const ownershipField = {
  projects: "owner",
  evidence: "collectedBy",
  problems: "createdBy",
  analysis: "createdBy",
  reports: "createdBy",
};

const populatePaths = {
  projects: ["owner", "members"],
  evidence: ["project", "collectedBy"],
  problems: ["projectId", "createdBy", "updatedBy"],
  analysis: ["project", "inputEvidence", "createdBy"],
  reports: ["project", "createdBy"],
};

const getModel = (resource) => models[resource];

const getUserId = (req) => req.user?._id || req.user?.id || null;

const getFilter = (resource, req) => {
  const field = ownershipField[resource];
  const userId = getUserId(req);

  // Do not return all records if authentication is missing.
  if (!userId) return { _id: null };

  return field ? { [field]: userId } : {};
};

/**
 * Apply all configured populate paths to a Mongoose query.
 * Important: this function returns a query, not a document.
 */
const applyPopulate = (query, resource) => {
  for (const path of populatePaths[resource] || []) {
    query = query.populate(path);
  }

  return query;
};

/**
 * GET /api/:resource
 */
export async function list(req, res, next) {
  try {
    const resource = req.params.resource;
    const M = getModel(resource);

    if (!M) {
      return res.status(404).json({
        success: false,
        message: "Unknown resource",
      });
    }

    const filter = { ...getFilter(resource, req) };

    if (req.query.project) {
      if (resource === "evidence") {
        filter.project = req.query.project;
      }

      if (resource === "problems") {
        filter.projectId = req.query.project;
      }

      if (resource === "analysis" || resource === "reports") {
        filter.project = req.query.project;
      }
    }

    const query = M.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);

    const data = await applyPopulate(query, resource).lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/:resource
 */
export async function create(req, res, next) {
  try {
    const resource = req.params.resource;
    const M = getModel(resource);

    if (!M) {
      return res.status(404).json({
        success: false,
        message: "Unknown resource",
      });
    }

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const body = { ...req.body };
    const ownerField = ownershipField[resource];

    // Ownership must come from the authenticated user,
    // never from client-supplied ownership fields.
    if (ownerField) {
      body[ownerField] = userId;
    }

    if (resource === "projects") {
      body.owner = userId;
    }

    if (resource === "reports") {
      if (!body.project) {
        return res.status(400).json({
          success: false,
          message: "Project is required for a report.",
        });
      }

      if (!body.title || !String(body.title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Report title is required.",
        });
      }

      body.title = String(body.title).trim();
      body.format = String(body.format || "JSON").toUpperCase();

      if (!["JSON", "CSV", "HTML"].includes(body.format)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported report format.",
        });
      }

      body.content = body.content ?? {};
      body.createdBy = userId;
    }

    if (resource === "problems") {
      Object.assign(body, calculateScore(body));
    }

    const item = await M.create(body);

    // FIX: Do not await applyPopulate() before calling .lean().
    // applyPopulate() returns a Mongoose query.
    const populatedQuery = applyPopulate(
      M.findById(item._id),
      resource
    );

    const populatedItem = await populatedQuery.lean();

    return res.status(201).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/:resource/:id
 */
export async function getOne(req, res, next) {
  try {
    const resource = req.params.resource;
    const M = getModel(resource);

    if (!M) {
      return res.status(404).json({
        success: false,
        message: "Unknown resource",
      });
    }

    const filter = {
      _id: req.params.id,
      ...getFilter(resource, req),
    };

    const query = applyPopulate(M.findOne(filter), resource);
    const item = await query.lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH/PUT /api/:resource/:id
 */
export async function update(req, res, next) {
  try {
    const resource = req.params.resource;
    const M = getModel(resource);

    if (!M) {
      return res.status(404).json({
        success: false,
        message: "Unknown resource",
      });
    }

    const body = { ...req.body };

    // Never allow clients to transfer ownership.
    delete body.owner;
    delete body.collectedBy;
    delete body.createdBy;
    delete body._id;
    delete body.__v;

    if (resource === "reports") {
      if (body.title !== undefined) {
        body.title = String(body.title).trim();

        if (!body.title) {
          return res.status(400).json({
            success: false,
            message: "Report title is required.",
          });
        }
      }

      if (body.format !== undefined) {
        body.format = String(body.format).toUpperCase();

        if (!["JSON", "CSV", "HTML"].includes(body.format)) {
          return res.status(400).json({
            success: false,
            message: "Unsupported report format.",
          });
        }
      }
    }

    if (resource === "problems") {
      Object.assign(body, calculateScore(body));
    }

    const item = await M.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getFilter(resource, req),
      },
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    // FIX: Keep the query chain intact until .lean() is applied.
    const populatedQuery = applyPopulate(
      M.findById(item._id),
      resource
    );

    const populatedItem = await populatedQuery.lean();

    return res.json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/:resource/:id
 */
export async function remove(req, res, next) {
  try {
    const resource = req.params.resource;
    const M = getModel(resource);

    if (!M) {
      return res.status(404).json({
        success: false,
        message: "Unknown resource",
      });
    }

    const item = await M.findOneAndDelete({
      _id: req.params.id,
      ...getFilter(resource, req),
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/dashboard
 */
export async function dashboard(req, res, next) {
  try {
    const [projects, evidence, problems, reports] = await Promise.all([
      Project.countDocuments(getFilter("projects", req)),
      Evidence.countDocuments(getFilter("evidence", req)),
      Problem.countDocuments(getFilter("problems", req)),
      Report.countDocuments(getFilter("reports", req)),
    ]);

    const severity = await Problem.aggregate([
      {
        $match: getFilter("problems", req),
      },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        counts: {
          projects,
          evidence,
          problems,
          reports,
        },
        severity,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/users
 */
export async function users(req, res, next) {
  try {
    const data = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/activity
 */
export async function activity(req, res, next) {
  try {
    const data = await ActivityLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications
 */
export async function notifications(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 */
export async function readNotification(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: userId,
      },
      {
        $set: { read: true },
      },
      {
        new: true,
      }
    ).lean();

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/analyze
 */
export async function analyze(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await runAI("/analyze", req.body);

    const item = await Analysis.create({
      project: req.body.project,
      type: req.body.type || "FULL",
      inputEvidence: req.body.evidenceIds || [],
      result,
      createdBy: userId,
    });

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

