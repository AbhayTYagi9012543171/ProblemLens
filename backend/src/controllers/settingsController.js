
import User from "../models/User.js";

const DEFAULTS = Object.freeze({
  notifications: {
    emailAlerts: true,
    weeklySummary: true,
    realtimeSignals: true,
    securityAlerts: true,
  },
  appearance: {
    theme: "system",
    density: "comfortable",
    animations: true,
    compactSidebar: false,
  },
  workspace: {
    autoSave: true,
    analyticsConsent: true,
  },
});

const VALID_THEMES = ["system", "light", "dark"];
const VALID_DENSITIES = ["comfortable", "compact"];

const SECTION_NAMES = Object.keys(DEFAULTS);

/**
 * Get the authenticated user's ID.
 */
function getUserId(req) {
  return req.user?._id || req.user?.id || null;
}

/**
 * Ensure a value is a plain object.
 */
function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Sanitize a settings section.
 * Only known keys and valid values are accepted.
 * Missing values are preserved from existing settings.
 */
function sanitizeSection(sectionName, existing = {}, incoming = {}) {
  const defaults = DEFAULTS[sectionName];

  if (!defaults) {
    throw new Error(`Unknown settings section: ${sectionName}`);
  }

  const previous = isObject(existing) ? existing : {};
  const updates = isObject(incoming) ? incoming : {};

  const result = { ...defaults };

  for (const key of Object.keys(defaults)) {
    if (Object.prototype.hasOwnProperty.call(previous, key)) {
      result[key] = previous[key];
    }
  }

  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(updates, key)) {
      continue;
    }

    const value = updates[key];

    if (typeof defaultValue === "boolean") {
      if (typeof value === "boolean") {
        result[key] = value;
      }
      continue;
    }

    if (key === "theme" && VALID_THEMES.includes(value)) {
      result[key] = value;
      continue;
    }

    if (key === "density" && VALID_DENSITIES.includes(value)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Create the complete preferences object.
 */
function buildPreferences(existing = {}, updates = {}) {
  const current = isObject(existing) ? existing : {};
  const incoming = isObject(updates) ? updates : {};

  return {
    notifications: sanitizeSection(
      "notifications",
      current.notifications,
      incoming.notifications
    ),
    appearance: sanitizeSection(
      "appearance",
      current.appearance,
      incoming.appearance
    ),
    workspace: sanitizeSection(
      "workspace",
      current.workspace,
      incoming.workspace
    ),
  };
}

/**
 * Format preferences for API responses.
 */
function serialize(user) {
  const preferences = buildPreferences(user.preferences);

  return {
    ...preferences,
    updatedAt: user.updatedAt,
  };
}

/**
 * Send a consistent error response through Express.
 */
function handleError(error, next) {
  return next(error);
}

/**
 * Load the authenticated user's settings.
 * GET /api/settings
 */
export async function getSettings(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId)
      .select("preferences updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }

    // Avoid stale cached settings responses.
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: serialize(user),
    });
  } catch (error) {
    console.error("[Settings] Failed to load settings:", error);
    return handleError(error, next);
  }
}

/**
 * Persist preferences without validating unrelated user fields,
 * such as a legacy role value.
 */
async function persistPreferences(userId, preferences) {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        preferences,
      },
    },
    {
      new: true,
      runValidators: true,
      projection: "preferences updatedAt",
    }
  ).lean();
}

/**
 * Update settings.
 * PUT /api/settings
 */
export async function updateSettings(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid JSON object.",
      });
    }

    const user = await User.findById(userId)
      .select("preferences")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }

    const preferences = buildPreferences(
      user.preferences,
      req.body
    );

    const updatedUser = await persistPreferences(
      userId,
      preferences
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: serialize(updatedUser),
      message: "Settings saved successfully.",
    });
  } catch (error) {
    console.error("[Settings] Failed to save settings:", error);
    return handleError(error, next);
  }
}

/**
 * Update only notification settings.
 * PUT /api/settings/notifications
 */
export async function updateNotifications(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid JSON object.",
      });
    }

    const user = await User.findById(userId)
      .select("preferences")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }

    const preferences = buildPreferences(user.preferences, {
      notifications: req.body,
    });

    const updatedUser = await persistPreferences(
      userId,
      preferences
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: serialize(updatedUser),
      message: "Notification settings saved successfully.",
    });
  } catch (error) {
    console.error(
      "[Settings] Failed to update notifications:",
      error
    );
    return handleError(error, next);
  }
}

/**
 * Update only appearance settings.
 * PUT /api/settings/appearance
 */
export async function updateAppearance(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isObject(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid JSON object.",
      });
    }

    const user = await User.findById(userId)
      .select("preferences")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }

    const preferences = buildPreferences(user.preferences, {
      appearance: req.body,
    });

    const updatedUser = await persistPreferences(
      userId,
      preferences
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: serialize(updatedUser),
      message: "Appearance settings saved successfully.",
    });
  } catch (error) {
    console.error(
      "[Settings] Failed to update appearance:",
      error
    );
    return handleError(error, next);
  }
}

