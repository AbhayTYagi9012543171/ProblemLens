import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import {
  register,
  login,
  createResetToken,
} from "../services/authService.js";
import { env } from "../config/env.js";

export async function registerUser(req, res) {
  const result = await register(req.body);

  return res.status(201).json({
    success: true,
    data: result,
  });
}

export async function loginUser(req, res) {
  const result = await login(
    req.body?.email,
    req.body?.password
  );

  return res.json({
    success: true,
    data: result,
  });
}

export async function me(req, res) {
  return res.json({
    success: true,
    data: req.user,
  });
}

export async function logout(req, res) {
  return res.json({
    success: true,
    message: "Logged out. Discard the client token.",
  });
}

/* -------------------------------------------------------------------------- */
/* FORGOT PASSWORD                                                            */
/* -------------------------------------------------------------------------- */

export async function forgotPassword(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address is required.",
    });
  }

  const user = await User.findOne({ email });

  /*
   * Always return the same public message so the endpoint does not reveal
   * whether an email is registered.
   */
  const response = {
    success: true,
    message:
      "If an account exists for this email, password-reset instructions have been prepared.",
  };

  if (!user) {
    return res.json(response);
  }

  const token = await createResetToken(user._id);

  /*
   * Development-only helper.
   * Never expose reset tokens in production.
   */
  if (env.nodeEnv !== "production") {
    const baseClientUrl = String(env.clientUrl || "http://localhost:5173")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");

    response.devToken = token;
    response.devResetUrl = `${baseClientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  return res.json(response);
}

/* -------------------------------------------------------------------------- */
/* RESET PASSWORD                                                             */
/* -------------------------------------------------------------------------- */

export async function resetPassword(req, res) {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Reset token is required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters.",
    });
  }

  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const record = await PasswordResetToken.findOne({
    tokenHash: hash,
    expiresAt: { $gt: new Date() },
  }).populate("user");

  if (!record || !record.user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link.",
    });
  }

  record.user.password = await bcrypt.hash(password, 12);
  await record.user.save();
  await record.deleteOne();

  /* Invalidate any other active reset tokens for this account. */
  await PasswordResetToken.deleteMany({
    user: record.user._id,
  });

  return res.json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
}

/* -------------------------------------------------------------------------- */
/* CHANGE PASSWORD                                                            */
/* -------------------------------------------------------------------------- */

export async function changePassword(req, res) {
  const currentPassword = String(req.body?.currentPassword || "");
  const password = String(req.body?.password || "");

  if (!currentPassword || !password) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must contain at least 8 characters.",
    });
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User account not found.",
    });
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();

  return res.json({
    success: true,
    message: "Password changed successfully.",
  });
}
