import { Router } from "express";
import mongoose from "mongoose";

import { protect } from "../middleware/auth.js";
import { runAI } from "../services/aiClient.js";
import { env } from "../config/env.js";
import Analysis from "../models/Analysis.js";

const router = Router();

router.use(protect);

/* =========================================================
   AI HEALTH
========================================================= */

router.get("/health", async (req, res) => {
  const aiUrl = String(env.aiServiceUrl || "").replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${aiUrl}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        service: "ai",
        message: "The AI service returned an unhealthy response.",
        ...(env.nodeEnv === "development" ? { upstreamStatus: response.status } : {}),
      });
    }

    return res.status(200).json({
      success: true,
      service: "ai",
      data,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return res.status(503).json({
      success: false,
      service: "ai",
      message: timedOut
        ? "The AI service health check timed out."
        : "AI service unavailable. Start the AI service and verify AI_SERVICE_URL.",
      ...(env.nodeEnv === "development" ? { reason: timedOut ? "timeout" : "connection_failed" } : {}),
    });
  } finally {
    clearTimeout(timeout);
  }
});

/* =========================================================
   RUN AI ANALYSIS
========================================================= */

router.post("/analyze", async (req, res, next) => {
  try {
    const {
      project = null,
      type = "FULL",
      evidence = [],
      evidenceIds = [],
    } = req.body || {};

    /* -----------------------------------------------------
       Validate project
    ----------------------------------------------------- */

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    /* -----------------------------------------------------
       Validate analysis type
    ----------------------------------------------------- */

    const allowedTypes = [
      "SUMMARY",
      "KEYWORDS",
      "SENTIMENT",
      "CLUSTERS",
      "PATTERNS",
      "FULL",
    ];

    const normalizedType =
      String(type || "FULL")
        .trim()
        .toUpperCase();

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid analysis type "${type}".`,
      });
    }

    /* -----------------------------------------------------
       Normalize evidence
    ----------------------------------------------------- */

    const normalizedEvidence =
      Array.isArray(evidence)
        ? evidence
            .map((item) => {
              const id =
                item?.id ||
                item?._id ||
                null;

              const text = String(
                item?.text ||
                  item?.content ||
                  item?.description ||
                  item?.title ||
                  ""
              ).trim();

              return {
                id,
                text,
              };
            })
            .filter(
              (item) => item.text.length > 0
            )
        : [];

    /* -----------------------------------------------------
       Evidence required
    ----------------------------------------------------- */

    if (normalizedEvidence.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No usable evidence was provided for analysis.",
      });
    }

    /* -----------------------------------------------------
       Validate evidence IDs
    ----------------------------------------------------- */

    const validEvidenceIds = (
      Array.isArray(evidenceIds)
        ? evidenceIds
        : normalizedEvidence
            .map((item) => item.id)
            .filter(Boolean)
    ).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    /* -----------------------------------------------------
       AI payload
    ----------------------------------------------------- */

    const aiPayload = {
      project,
      type: normalizedType,

      evidence: normalizedEvidence.map(
        (item) => ({
          id: item.id,
          text: item.text,
        })
      ),
    };

    console.log(
      `[AI] Starting ${normalizedType} analysis`
    );

    console.log(
      `[AI] Service: ${env.aiServiceUrl}`
    );

    console.log(
      `[AI] Evidence count: ${normalizedEvidence.length}`
    );

    /* -----------------------------------------------------
       Call FastAPI
    ----------------------------------------------------- */

    const result = await runAI(
      "/analyze",
      aiPayload
    );

    /* -----------------------------------------------------
       Save analysis
    ----------------------------------------------------- */

    const analysis =
      await Analysis.create({
        project,
        type: normalizedType,

        inputEvidence:
          validEvidenceIds,

        result,

        createdBy:
          req.user?._id || null,
      });

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      data: {
        analysisId:
          analysis._id,

        project,

        type: normalizedType,

        result,

        createdAt:
          analysis.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "[AI ANALYSIS ERROR]",
      error
    );

    next(error);
  }
});

export default router;