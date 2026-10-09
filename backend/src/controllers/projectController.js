import Project from "../models/Project.js";
import mongoose from "mongoose";

// Helper to format status according to schema enum ["DRAFT", "ACTIVE", "ARCHIVED"]
const formatStatus = (status) => {
  if (!status) return "ACTIVE";
  const upper = status.toString().toUpperCase();
  return ["DRAFT", "ACTIVE", "ARCHIVED"].includes(upper) ? upper : "ACTIVE";
};

/* =========================================================
   1. GET ALL PROJECTS (GET /api/projects)
========================================================= */
export const getProjects = async (req, res) => {
  try {
    const { search } = req.query;
    const ownerId = req.user?._id || req.user?.id;
    let filter = ownerId ? { owner: ownerId } : {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Defensive query execution with flexible population
    const projects = await Project.find(filter)
      .populate({ path: "owner", select: "name email", strictPopulate: false })
      .populate({ path: "members", select: "name email", strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(projects || []);
  } catch (error) {
    console.error("🔥 Error in getProjects:", error);
    return res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
};

/* =========================================================
   2. GET SINGLE PROJECT BY ID (GET /api/projects/:id)
========================================================= */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const accessFilter = req.user?.role === "ADMIN" ? { _id: id } : { _id: id, owner: req.user?._id };

    const project = await Project.findOne(accessFilter)
      .populate({ path: "owner", select: "name email", strictPopulate: false })
      .populate({ path: "members", select: "name email", strictPopulate: false })
      .lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("🔥 Error in getProjectById:", error);
    return res.status(500).json({
      message: "Server error while fetching project",
    });
  }
};

/* =========================================================
   3. CREATE NEW PROJECT (POST /api/projects)
========================================================= */
export const createProject = async (req, res) => {
  try {
    const { name, description, status, category, owner, members, tags, startDate, endDate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    // The authenticated user is the canonical owner.
    const ownerId = req.user?._id || req.user?.id;

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const newProject = new Project({
      name: name.trim(),
      description: description || "",
      category: String(category || (Array.isArray(tags) && tags[0]) || "General").trim(),
      status: formatStatus(status),
      owner: ownerId,
      members: Array.isArray(members) ? members : [],
      tags: Array.isArray(tags) ? tags : [],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const savedProject = await newProject.save();

    return res.status(201).json(savedProject);
  } catch (error) {
    console.error("🔥 Error in createProject:", error);
    return res.status(500).json({
      message: "Failed to create project",
    });
  }
};

/* =========================================================
   4. UPDATE PROJECT (PUT /api/projects/:id)
========================================================= */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const updateData = { ...req.body };
    delete updateData.owner;
    if (updateData.status) {
      updateData.status = formatStatus(updateData.status);
    }

    const accessFilter = req.user?.role === "ADMIN" ? { _id: id } : { _id: id, owner: req.user?._id };

    const updatedProject = await Project.findOneAndUpdate(
      accessFilter,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({ path: "owner", select: "name email", strictPopulate: false })
      .populate({ path: "members", select: "name email", strictPopulate: false });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error("🔥 Error in updateProject:", error);
    return res.status(500).json({
      message: "Failed to update project",
    });
  }
};

/* =========================================================
   5. DELETE PROJECT (DELETE /api/projects/:id)
========================================================= */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const accessFilter = req.user?.role === "ADMIN" ? { _id: id } : { _id: id, owner: req.user?._id };

    const deletedProject = await Project.findOneAndDelete(accessFilter);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("🔥 Error in deleteProject:", error);
    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
};