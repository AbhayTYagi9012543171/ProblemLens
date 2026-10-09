import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Evidence from "../models/Evidence.js";
import Problem from "../models/Problem.js";
import Report from "../models/Report.js";

await connectDB();
await Promise.all([
  User.deleteMany({}),
  Project.deleteMany({}),
  Evidence.deleteMany({}),
  Problem.deleteMany({}),
  Report.deleteMany({}),
]);

const password = await bcrypt.hash("Password123!", 12);
const admin = await User.create({ name: "Admin User", email: "admin@problemlens.local", password, role: "ADMIN" });
const researcher = await User.create({ name: "Researcher", email: "researcher@problemlens.local", password, role: "RESEARCHER" });
const viewer = await User.create({ name: "Viewer", email: "viewer@problemlens.local", password, role: "VIEWER" });

const project = await Project.create({
  name: "Sample Research Project",
  description: "Seed project for ProblemLens",
  category: "Research",
  status: "ACTIVE",
  owner: researcher._id,
  members: [researcher._id, viewer._id],
  tags: ["sample", "research"],
});

const evidence = await Evidence.create({
  project: project._id,
  projectName: project.name,
  type: "Interview",
  title: "Sample interview",
  description: "Users report difficulty discovering recurring workflow problems.",
  source: "Seed interview",
  collectedBy: researcher._id,
  status: "Verified",
});

const problem = await Problem.create({
  projectId: project._id,
  project: project.name,
  title: "Recurring workflow friction",
  description: "Users repeatedly encounter workflow friction.",
  frequencyScore: 80,
  impactScore: 75,
  confidence: 90,
  evidenceIds: [evidence._id],
  evidenceCount: 1,
  createdBy: researcher._id,
  severity: "High",
  status: "Investigating",
  category: "Workflow",
});

const report = await Report.create({
  project: project._id,
  title: "Sample Opportunity Brief",
  format: "JSON",
  content: {
    summary: "Recurring workflow friction is a strong research signal.",
    problemId: problem._id.toString(),
    evidenceCount: 1,
    recommendation: "Validate the workflow with additional interviews.",
  },
  createdBy: researcher._id,
});

console.log("Seed complete", {
  admin: admin.email,
  researcher: researcher.email,
  viewer: viewer.email,
  project: project.name,
  report: report.title,
});

await mongoose.disconnect();
