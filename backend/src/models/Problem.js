import mongoose from "mongoose";

const { Schema } = mongoose;

/* -------------------------------------------------------------------------- */
/* Problem Schema                                                             */
/* -------------------------------------------------------------------------- */

const ProblemSchema = new Schema(
  {
    /* ---------------------------------------------------------------------- */
    /* Basic information                                                      */
    /* ---------------------------------------------------------------------- */

    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      minlength: [3, "Problem title must be at least 3 characters"],
      maxlength: [200, "Problem title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [10000, "Description cannot exceed 10000 characters"],
    },

    /* ---------------------------------------------------------------------- */
    /* Project                                                                */
    /* ---------------------------------------------------------------------- */

    /*
     * `project` is intentionally kept as String because the current
     * frontend can send a project name/string.
     */
    project: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * Optional MongoDB Project reference.
     *
     * This allows the backend to support both:
     *
     * project: "College Students"
     *
     * and:
     *
     * projectId: ObjectId(...)
     */
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Classification                                                         */
    /* ---------------------------------------------------------------------- */

    severity: {
      type: String,
      enum: {
        values: ["High", "Medium", "Low"],
        message: "Severity must be High, Medium, or Low",
      },
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Discovered",
        "Emerging",
        "Investigating",
        "Under Review",
        "Validated",
        "Prioritized",
        "Solved",
        "Archived",
      ],
      default: "Discovered",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    /* ---------------------------------------------------------------------- */
    /* Scoring                                                                 */
    /* ---------------------------------------------------------------------- */

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    opportunityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    impactScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    frequencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    /* ---------------------------------------------------------------------- */
    /* Evidence                                                                */
    /* ---------------------------------------------------------------------- */

    evidenceCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    evidenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Evidence",
      },
    ],

    /* ---------------------------------------------------------------------- */
    /* Additional information                                                  */
    /* ---------------------------------------------------------------------- */

    tags: {
      type: [String],
      default: [],
    },

    affectedUsers: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    frequency: {
      type: String,
      trim: true,
      default: "",
    },

    rootCause: {
      type: String,
      trim: true,
      default: "",
    },

    impact: {
      type: String,
      trim: true,
      default: "",
    },

    /* ---------------------------------------------------------------------- */
    /* AI information                                                          */
    /* ---------------------------------------------------------------------- */

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    aiModel: {
      type: String,
      trim: true,
      default: "",
    },

    aiSummary: {
      type: String,
      trim: true,
      default: "",
    },

    aiInsights: {
      type: [String],
      default: [],
    },

    /* ---------------------------------------------------------------------- */
    /* Ownership                                                               */
    /* ---------------------------------------------------------------------- */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Soft delete                                                             */
    /* ---------------------------------------------------------------------- */

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    versionKey: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Indexes                                                                    */
/* -------------------------------------------------------------------------- */

ProblemSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});

ProblemSchema.index({
  projectId: 1,
});

ProblemSchema.index({
  severity: 1,
});

ProblemSchema.index({
  status: 1,
});

ProblemSchema.index({
  createdAt: -1,
});

ProblemSchema.index({
  deleted: 1,
});

/* -------------------------------------------------------------------------- */
/* Normalize data before saving                                               */
/* -------------------------------------------------------------------------- */

ProblemSchema.pre("save", function (next) {
  if (typeof this.title === "string") {
    this.title = this.title.trim();
  }

  if (typeof this.description === "string") {
    this.description = this.description.trim();
  }

  if (typeof this.project === "string") {
    this.project = this.project.trim();
  }

  if (typeof this.category === "string") {
    this.category = this.category.trim();
  }

  next();
});

/* -------------------------------------------------------------------------- */
/* JSON response transformation                                               */
/* -------------------------------------------------------------------------- */

ProblemSchema.set("toJSON", {
  virtuals: true,

  transform(_doc, ret) {
    ret.id = ret._id?.toString();

    delete ret._id;

    return ret;
  },
});

/* -------------------------------------------------------------------------- */
/* Model                                                                     */
/* -------------------------------------------------------------------------- */

const Problem =
  mongoose.models.Problem ||
  mongoose.model("Problem", ProblemSchema);

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

/*
 * Default export:
 *
 * import Problem from "../models/Problem.js";
 *
 * Named export:
 *
 * import { Problem } from "../models/Problem.js";
 */

export default Problem;

export { Problem };

export { ProblemSchema };