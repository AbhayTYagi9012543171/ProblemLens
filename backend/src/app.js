import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

/* ==========================================================================
   CORS CONFIGURATION
   ========================================================================== */

const configuredOrigins = String(env.clientUrl || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    ...localDevelopmentOrigins,
  ]),
];

console.log("--------------------------------------------------");
console.log("ProblemLens CORS Configuration");
console.log("--------------------------------------------------");
console.log("Environment:", env.nodeEnv);
console.log("Configured client URL:", env.clientUrl || "Not configured");
console.log("Allowed frontend origins:");

allowedOrigins.forEach((origin) => {
  console.log(`  ✓ ${origin}`);
});

console.log("--------------------------------------------------");

/* ==========================================================================
   CORS OPTIONS
   ========================================================================== */

const corsOptions = {
  origin(origin, callback) {
    /*
     * Requests from Postman, curl, server-to-server requests etc.
     * normally do not contain an Origin header.
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Exact allowed origin
     */
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    /*
     * Development:
     * Allow localhost / 127.0.0.1 on any port.
     *
     * This is useful when Vite changes from 5173 to 5174, etc.
     */
    if (env.nodeEnv !== "production") {
      try {
        const url = new URL(origin);

        const isLocalHost =
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1";

        if (isLocalHost) {
          console.log(`✓ Development CORS allowed: ${origin}`);
          return callback(null, true);
        }
      } catch {
        // Invalid origin. Continue to reject it.
      }
    }

    console.warn(`❌ CORS blocked origin: ${origin}`);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  /*
   * IMPORTANT:
   * Frontend Login.jsx uses:
   *
   * credentials: "include"
   *
   * Therefore this MUST be true.
   */
  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

/* ==========================================================================
   SECURITY HEADERS
   ========================================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* ==========================================================================
   CORS
   ========================================================================== */

/*
 * IMPORTANT:
 *
 * Do NOT use:
 *
 * app.options("*", cors());
 *
 * Express 5 / path-to-regexp throws:
 *
 * PathError: Missing parameter name at index 1: *
 *
 * The cors middleware below automatically handles OPTIONS
 * preflight requests.
 */
app.use(cors(corsOptions));

/* ==========================================================================
   BODY PARSERS
   ========================================================================== */

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

/* ==========================================================================
   LOGGING
   ========================================================================== */

app.use(morgan("dev"));

/* ==========================================================================
   RATE LIMITING
   ========================================================================== */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 500,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/*
 * Apply rate limiting to API requests.
 */
app.use("/api", apiLimiter);

/* ==========================================================================
   HEALTH CHECK
   ========================================================================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "problemlens-backend",
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================================
   API ROOT
   ========================================================================== */

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ProblemLens API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

app.use(
  "/api/auth",
  authRoutes
);

/* ==========================================================================
   DASHBOARD ROUTES
   ========================================================================== */

app.use(
  "/api/dashboard",
  dashboardRoutes
);

/* ==========================================================================
   EVIDENCE ROUTES
   ========================================================================== */

app.use(
  "/api/evidence",
  evidenceRoutes
);

/* ==========================================================================
   PROJECT ROUTES
   ========================================================================== */

app.use(
  "/api/projects",
  projectRoutes
);

/* ==========================================================================
   PROBLEM ROUTES
   ========================================================================== */

app.use(
  "/api/problems",
  problemRoutes
);

/* ==========================================================================
   AI ROUTES
   ========================================================================== */

app.use(
  "/api/ai",
  aiRoutes
);

app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);

/* ==========================================================================
   GENERIC RESOURCE ROUTES
   ========================================================================== */

/*
 * IMPORTANT:
 *
 * This must remain AFTER the specific routes above.
 *
 * Otherwise generic routes could capture:
 *
 * /api/auth
 * /api/projects
 * /api/problems
 * etc.
 */
app.use(
  "/api",
  resourceRoutes
);

/* ==========================================================================
   404 HANDLER
   ========================================================================== */

app.use(notFound);

/* ==========================================================================
   GLOBAL ERROR HANDLER
   ========================================================================== */

app.use(errorHandler);

/* ==========================================================================
   EXPORT
   ========================================================================== */

export default app;