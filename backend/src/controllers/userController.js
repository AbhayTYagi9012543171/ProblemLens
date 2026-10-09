// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";
// import User from "../models/User.js";

// const safeUser = (user) => {
//   const value = user?.toObject ? user.toObject() : { ...user };
//   delete value.password;
//   return {
//     ...value,
//     id: value._id || value.id,
//     status: value.isActive ? "Active" : "Inactive",
//   };
// };

// const normalizeRole = (role) => {
//   const value = String(role || "RESEARCHER").trim().toUpperCase();
//   return ["ADMIN", "RESEARCHER", "VIEWER"].includes(value)
//     ? value
//     : "RESEARCHER";
// };

// export async function listUsers(req, res, next) {
//   try {
//     const { search = "", role = "", status = "" } = req.query;
//     const filter = {};

//     if (search.trim()) {
//       const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
//       filter.$or = [{ name: regex }, { email: regex }];
//     }

//     if (["ADMIN", "RESEARCHER", "VIEWER"].includes(String(role).toUpperCase())) {
//       filter.role = String(role).toUpperCase();
//     }

//     if (String(status).toLowerCase() === "active") filter.isActive = true;
//     if (String(status).toLowerCase() === "inactive") filter.isActive = false;

//     const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();
//     return res.json({ success: true, data: users.map(safeUser) });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function getUser(req, res, next) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid user ID" });
//     }
//     const user = await User.findById(req.params.id).select("-password").lean();
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     return res.json({ success: true, data: safeUser(user) });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function createUser(req, res, next) {
//   try {
//     const name = String(req.body?.name || "").trim();
//     const email = String(req.body?.email || "").trim().toLowerCase();
//     const password = String(req.body?.password || "Password123!");

//     if (name.length < 2) return res.status(400).json({ success: false, message: "Name must contain at least 2 characters." });
//     if (!email) return res.status(400).json({ success: false, message: "Email is required." });
//     if (password.length < 8) return res.status(400).json({ success: false, message: "Password must contain at least 8 characters." });
//     if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered." });

//     const user = await User.create({
//       name,
//       email,
//       password: await bcrypt.hash(password, 12),
//       role: normalizeRole(req.body?.role),
//       avatar: String(req.body?.avatar || "").trim(),
//       isActive: req.body?.isActive !== false,
//     });

//     return res.status(201).json({ success: true, data: safeUser(user), message: "User created successfully." });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function updateUser(req, res, next) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid user ID" });
//     }

//     const payload = {};
//     if (req.body?.name !== undefined) payload.name = String(req.body.name).trim();
//     if (req.body?.email !== undefined) payload.email = String(req.body.email).trim().toLowerCase();
//     if (req.body?.role !== undefined) payload.role = normalizeRole(req.body.role);
//     if (req.body?.avatar !== undefined) payload.avatar = String(req.body.avatar || "").trim();
//     if (req.body?.isActive !== undefined) payload.isActive = Boolean(req.body.isActive);
//     if (req.body?.password) payload.password = await bcrypt.hash(String(req.body.password), 12);

//     if (payload.email) {
//       const duplicate = await User.findOne({ email: payload.email, _id: { $ne: req.params.id } });
//       if (duplicate) return res.status(409).json({ success: false, message: "Email already registered." });
//     }

//     const user = await User.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true }).select("-password").lean();
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     return res.json({ success: true, data: safeUser(user), message: "User updated successfully." });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function deleteUser(req, res, next) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid user ID" });
//     }
//     if (String(req.params.id) === String(req.user._id)) {
//       return res.status(400).json({ success: false, message: "You cannot delete your own account from the user manager." });
//     }
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     return res.json({ success: true, message: "User deleted successfully." });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function updateUserRole(req, res, next) {
//   try {
//     req.body = { ...req.body, role: normalizeRole(req.body?.role) };
//     return updateUser(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// }

// export async function setUserActive(req, res, next) {
//   try {
//     req.body = { ...req.body, isActive: req.path.endsWith("/activate") };
//     return updateUser(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// }




import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const ALLOWED_ROLES = ["ADMIN", "RESEARCHER", "VIEWER"];

const safeUser = (user) => {
  const value = user?.toObject
    ? user.toObject()
    : { ...user };

  delete value.password;

  return {
    ...value,
    id: value._id || value.id,
    status: value.isActive ? "Active" : "Inactive",
  };
};

const normalizeRole = (role) => {
  const value = String(role || "RESEARCHER")
    .trim()
    .toUpperCase();

  return ALLOWED_ROLES.includes(value) ? value : "RESEARCHER";
};

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const isAdmin = (user) =>
  String(user?.role || "").trim().toUpperCase() === "ADMIN";

const isSelf = (user, targetId) =>
  String(user?._id || user?.id || "") === String(targetId);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/users
export async function listUsers(req, res, next) {
  try {
    const {
      search = "",
      role = "",
      status = "",
    } = req.query;

    const filter = {};
    const searchText = String(search).trim();

    if (searchText) {
      const regex = new RegExp(escapeRegex(searchText), "i");

      filter.$or = [
        { name: regex },
        { email: regex },
      ];
    }

    const requestedRole = String(role).trim().toUpperCase();

    if (ALLOWED_ROLES.includes(requestedRole)) {
      filter.role = requestedRole;
    }

    const requestedStatus = String(status).trim().toLowerCase();

    if (requestedStatus === "active") {
      filter.isActive = true;
    } else if (requestedStatus === "inactive") {
      filter.isActive = false;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: users.map(safeUser),
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/users/:id
// Admins may view any user; other users may view only themselves.
export async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!isAdmin(req.user) && !isSelf(req.user, id)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own account.",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: safeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

// POST /api/users
export async function createUser(req, res, next) {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: normalizeRole(req.body?.role),
      avatar: String(req.body?.avatar || "").trim(),
      isActive: req.body?.isActive !== false,
    });

    return res.status(201).json({
      success: true,
      data: safeUser(user),
      message: "User created successfully.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return next(error);
  }
}

// PUT /api/users/:id
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const payload = {};

    if (req.body?.name !== undefined) {
      const name = String(req.body.name).trim();

      if (name.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters.",
        });
      }

      payload.name = name;
    }

    if (req.body?.email !== undefined) {
      const email = String(req.body.email)
        .trim()
        .toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      payload.email = email;
    }

    if (req.body?.role !== undefined) {
      payload.role = normalizeRole(req.body.role);
    }

    if (req.body?.avatar !== undefined) {
      payload.avatar = String(req.body.avatar || "").trim();
    }

    if (req.body?.isActive !== undefined) {
      if (typeof req.body.isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean.",
        });
      }

      payload.isActive = req.body.isActive;
    }

    if (req.body?.password) {
      const password = String(req.body.password);

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters.",
        });
      }

      payload.password = await bcrypt.hash(password, 12);
    }

    // Prevent administrators from accidentally locking themselves out.
    if (
      isSelf(req.user, id) &&
      payload.isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    if (payload.email) {
      const duplicate = await User.findOne({
        email: payload.email,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Email already registered.",
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: payload },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: safeUser(user),
      message: "User updated successfully.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return next(error);
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (isSelf(req.user, id)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account from the user manager.",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/users/:id/role
export async function updateUserRole(req, res, next) {
  try {
    if (!req.body?.role) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    req.body = {
      ...req.body,
      role: normalizeRole(req.body.role),
    };

    return updateUser(req, res, next);
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/users/:id/activate
// PATCH /api/users/:id/deactivate
export async function setUserActive(req, res, next) {
  try {
    const isActivating = req.path.endsWith("/activate");

    if (
      !isActivating &&
      isSelf(req.user, req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    req.body = {
      ...req.body,
      isActive: isActivating,
    };

    return updateUser(req, res, next);
  } catch (error) {
    return next(error);
  }
}