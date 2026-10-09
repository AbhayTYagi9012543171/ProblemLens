// import jwt from "jsonwebtoken";
// import { env } from "../config/env.js";
// import User from "../models/User.js";

// export async function protect(req, res, next) {
//   try {
//     const header = req.headers.authorization || "";
//     if (!header.startsWith("Bearer ")) return res.status(401).json({ success:false, message:"Authentication required" });
//     const token = header.slice(7);
//     const payload = jwt.verify(token, env.jwtSecret);
//     const user = await User.findById(payload.id).select("-password");
//     if (!user || !user.isActive) return res.status(401).json({ success:false, message:"Invalid or inactive user" });
//     req.user = user;
//     next();
//   } catch {
//     res.status(401).json({ success:false, message:"Invalid or expired token" });
//   }
// }

// export const requireRoles = (...roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) return res.status(403).json({ success:false, message:"Insufficient permissions" });
//   next();
// };



import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);

    if (!payload?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(payload.id).select("-password");

    if (!user || user.isActive !== true) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return next(error);
  }
}

export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const actualRole = String(req.user.role || "")
    .trim()
    .toUpperCase();

  const allowedRoles = roles.map((role) =>
    String(role).trim().toUpperCase()
  );

  if (!allowedRoles.includes(actualRole)) {
    return res.status(403).json({
      success: false,
      message: "Insufficient permissions",
    });
  }

  return next();
};