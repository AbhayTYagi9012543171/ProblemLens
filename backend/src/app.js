
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

/* =========================================================
   TRUST PROXY
   ========================================================= */

// Render runs the application behind a reverse proxy.
// Configure this before express-rate-limit is registered.
// Confirm that one trusted proxy hop matches your deployment.
if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

const configuredOrigins = String(env.clientUrl || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...localDevelopmentOrigins,
]);

console.log("--------------------------------------------------");
console.log("ProblemLens CORS Configuration");
console.log("--------------------------------------------------");
console.log("Environment:", env.nodeEnv);
console.log(
  "Configured client URL:",
  env.clientUrl || "Not configured"
);
console.log("Allowed frontend origins:");

for (const origin of allowedOrigins) {
  console.log(`  ✓ ${origin}`);
}

console.log("--------------------------------------------------");

/* =========================================================
   CORS OPTIONS
   ========================================================= */

const corsOptions = {
  origin(origin, callback) {
    // Requests without Origin include many server-to-server
    // requests and direct API calls.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    // Allow configured production and development origins.
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    // Permit localhost on changing ports during development.
    if (env.nodeEnv !== "production") {
      try {
        const parsedOrigin = new URL(origin);

        const isLocalHost =
          parsedOrigin.hostname === "localhost" ||
          parsedOrigin.hostname === "127.0.0.1";

        if (
          isLocalHost &&
          ["http:", "https:"].includes(parsedOrigin.protocol)
        ) {
          console.log(
            `Development CORS allowed: ${origin}`
          );

          return callback(null, true);
        }
      } catch {
        // Invalid origin; reject it below.
      }
    }

    console.warn(`CORS blocked origin: ${origin}`);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  // Required when the frontend sends credentials/cookies.
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

  exposedHeaders: ["Authorization"],

  optionsSuccessStatus: 204,
};

/* =========================================================
   SECURITY HEADERS
   ========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* =========================================================
   CORS MIDDLEWARE
   ========================================================= */

// cors() handles OPTIONS preflight requests.
// Avoid app.options("*", ...) with Express 5.
app.use(cors(corsOptions));

/* =========================================================
   BODY PARSERS
   ========================================================= */

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

/* =========================================================
   REQUEST LOGGING
   ========================================================= */

app.use(morgan("dev"));

/* =========================================================
   API RATE LIMITING
   ========================================================= */

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

app.use("/api", apiLimiter);

/* =========================================================
   BACKEND HEALTH CHECK
   ========================================================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "problemlens-backend",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   API ROOT
   ========================================================= */

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ProblemLens API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   AUTHENTICATION ROUTES
   ========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   DASHBOARD ROUTES
   ========================================================= */

app.use("/api/dashboard", dashboardRoutes);

/* =========================================================
   EVIDENCE ROUTES
   ========================================================= */

app.use("/api/evidence", evidenceRoutes);

/* =========================================================
   PROJECT ROUTES
   ========================================================= */

app.use("/api/projects", projectRoutes);

/* =========================================================
   PROBLEM ROUTES
   ========================================================= */

app.use("/api/problems", problemRoutes);

/* =========================================================
   AI ROUTES
   ========================================================= */

app.use("/api/ai", aiRoutes);

/* =========================================================
   USER, SETTINGS AND REPORT ROUTES
   ========================================================= */

app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);

/* =========================================================
   GENERIC RESOURCE ROUTES
   Keep after specific routes.
   ========================================================= */

app.use("/api", resourceRoutes);

/* =========================================================
   NOT FOUND HANDLER
   ========================================================= */

app.use(notFound);

/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use(errorHandler);

/* =========================================================
   EXPORT EXPRESS APP
   ========================================================= */

export default app;
