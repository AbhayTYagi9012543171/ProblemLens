import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Evidence title is required"],
      trim: true,
      minlength: [3, "Evidence title must be at least 3 characters"],
      maxlength: [250, "Evidence title cannot exceed 250 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [3000, "Evidence content cannot exceed 3000 characters"],
      default: "",
    },

    // Kept as an alias-friendly canonical field for the frontend's `content`.
    // The controller maps content -> description before persistence.
    source: {
      type: String,
      required: [true, "Evidence source is required"],
      trim: true,
      maxlength: [150, "Source cannot exceed 150 characters"],
    },

    sourceUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;

          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        message: "Source URL must be a valid HTTP or HTTPS URL",
      },
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    projectName: {
      type: String,
      trim: true,
      default: "Unassigned project",
    },

    type: {
      type: String,
      enum: [
        "Interview",
        "Survey",
        "Observation",
        "Web Research",
        "Document",
        "Analytics",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    author: {
      type: String,
      trim: true,
      maxlength: [150, "Author cannot exceed 150 characters"],
      default: "",
    },

    sentiment: {
      type: Number,
      min: [-1, "Sentiment cannot be less than -1"],
      max: [1, "Sentiment cannot be greater than 1"],
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

evidenceSchema.index({
  title: "text",
  description: "text",
  source: "text",
  projectName: "text",
  author: "text",
});

evidenceSchema.virtual("projectLabel").get(function () {
  return this.projectName || "Unassigned project";
});

evidenceSchema.virtual("content").get(function () {
  return this.description || "";
});

evidenceSchema.virtual("keywords").get(function () {
  return this.tags || [];
});

evidenceSchema.set("toJSON", {
  virtuals: true,
});

evidenceSchema.set("toObject", {
  virtuals: true,
});

const Evidence = mongoose.model("Evidence", evidenceSchema);

export default Evidence;
