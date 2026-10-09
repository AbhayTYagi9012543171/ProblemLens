import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { env } from "../config/env.js";

export const signToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

function sanitizeUser(user) {
  const safeUser = user?.toObject
    ? user.toObject()
    : { ...(user || {}) };

  delete safeUser.password;

  return safeUser;
}

export async function register(data = {}) {
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const rawPassword = String(data.password || "");

  if (name.length < 2) {
    throw Object.assign(
      new Error("Name must contain at least 2 characters."),
      { statusCode: 400 }
    );
  }

  if (!email) {
    throw Object.assign(
      new Error("Email address is required."),
      { statusCode: 400 }
    );
  }

  if (rawPassword.length < 8) {
    throw Object.assign(
      new Error("Password must contain at least 8 characters."),
      { statusCode: 400 }
    );
  }

  if (await User.findOne({ email })) {
    throw Object.assign(
      new Error("Email already registered"),
      { statusCode: 409 }
    );
  }

  const password = await bcrypt.hash(rawPassword, 12);

  const user = await User.create({
    name,
    email,
    password,
    role: data.role || "RESEARCHER",
  });

  return {
    user: sanitizeUser(user),
    token: signToken(user._id),
  };
}

export async function login(email, password) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (
    !user ||
    !(await bcrypt.compare(String(password || ""), user.password))
  ) {
    throw Object.assign(
      new Error("Invalid credentials"),
      { statusCode: 401 }
    );
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user._id),
  };
}

export async function createResetToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");

  /* Only the newest recovery request remains valid. */
  await PasswordResetToken.deleteMany({
    user: userId,
  });

  await PasswordResetToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  return raw;
}
