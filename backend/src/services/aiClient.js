import { env } from "../config/env.js";

function normalizeErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return Array.isArray(data.detail)
      ? data.detail
          .map((item) => item?.msg || JSON.stringify(item))
          .join(", ")
      : String(data.detail);
  }

  if (data.message) {
    return String(data.message);
  }

  if (data.error) {
    return String(data.error);
  }

  return fallback;
}

async function readResponseBody(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    return text || null;
  } catch {
    return null;
  }
}

export async function runAI(path, payload) {
  const baseUrl = String(env.aiServiceUrl || "").replace(
    /\/+$/,
    ""
  );

  const targetUrl = `${baseUrl}${path}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(targetUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(payload),

      signal: controller.signal,
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      const message = normalizeErrorMessage(
        data,
        `AI service returned HTTP ${response.status}`
      );

      throw new Error(
        `AI service error: ${message}`
      );
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "AI service request timed out after 30 seconds."
      );
    }

    if (
      error?.code === "ECONNREFUSED" ||
      error?.cause?.code === "ECONNREFUSED"
    ) {
      throw new Error(
        `AI service is not reachable at ${targetUrl}. Make sure FastAPI is running and AI_SERVICE_URL matches its port.`
      );
    }

    if (
      error?.message?.includes("fetch failed")
    ) {
      throw new Error(
        `Unable to connect to AI service at ${targetUrl}. Make sure FastAPI is running and AI_SERVICE_URL matches its port.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}