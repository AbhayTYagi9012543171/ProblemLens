import axios from "axios";

// ======================================================
// PROBLEMLENS API SERVICE
// ======================================================
// Centralized API configuration for:
// - Authentication
// - Dashboard
// - Projects
// - Evidence
// - Problems
// - Reports
// - Users
// - Settings
// - AI
// - Health
// ======================================================

// ======================================================
// API BASE URL
// ======================================================

const DEFAULT_API_URL = "http://localhost:5000/api";

const normalizeApiUrl = (url) => {
  if (!url || typeof url !== "string") {
    return DEFAULT_API_URL;
  }

  const normalized = url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/api$/i, "/api");

  // Accept either http://host or http://host/api in .env.
  // This prevents both missing /api and accidental /api/api URLs.
  return /\/api$/i.test(normalized)
    ? normalized
    : `${normalized}/api`;
};

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
);

// ======================================================
// AXIOS INSTANCE
// ======================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ======================================================
// STORAGE KEYS
// ======================================================

export const AUTH_TOKEN_KEY = "problemlens_token";
export const AUTH_USER_KEY = "problemlens_user";

const LEGACY_TOKEN_KEYS = [
  "token",
  "accessToken",
  "authToken",
  "problemlensToken",
];

const LEGACY_USER_KEYS = [
  "user",
  "currentUser",
  "problemlensUser",
];

// ======================================================
// BROWSER CHECK
// ======================================================

const isBrowser =
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined";

// ======================================================
// SAFE STORAGE
// ======================================================

const storage = {
  get(key) {
    if (!isBrowser || !key) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(
        `[ProblemLens] Unable to read localStorage key "${key}"`,
        error
      );

      return null;
    }
  },

  set(key, value) {
    if (!isBrowser || !key) {
      return;
    }

    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      console.warn(
        `[ProblemLens] Unable to save localStorage key "${key}"`,
        error
      );
    }
  },

  remove(key) {
    if (!isBrowser || !key) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(
        `[ProblemLens] Unable to remove localStorage key "${key}"`,
        error
      );
    }
  },
};

// ======================================================
// TOKEN STORAGE
// ======================================================

export const tokenStorage = {
  get() {
    const primaryToken = storage.get(AUTH_TOKEN_KEY);

    if (primaryToken) {
      return primaryToken;
    }

    for (const key of LEGACY_TOKEN_KEYS) {
      const legacyToken = storage.get(key);

      if (legacyToken) {
        storage.set(AUTH_TOKEN_KEY, legacyToken);
        return legacyToken;
      }
    }

    return null;
  },

  set(token) {
    if (!token) {
      return;
    }

    storage.set(AUTH_TOKEN_KEY, token);
  },

  remove() {
    storage.remove(AUTH_TOKEN_KEY);

    LEGACY_TOKEN_KEYS.forEach((key) => {
      storage.remove(key);
    });
  },

  getToken() {
    return this.get();
  },

  setToken(token) {
    return this.set(token);
  },

  clear() {
    return this.remove();
  },
};

// ======================================================
// USER STORAGE
// ======================================================

export const userStorage = {
  get() {
    const primaryUser = storage.get(AUTH_USER_KEY);

    if (primaryUser) {
      try {
        return JSON.parse(primaryUser);
      } catch (error) {
        console.warn("[ProblemLens] Invalid stored user data");
        storage.remove(AUTH_USER_KEY);
      }
    }

    for (const key of LEGACY_USER_KEYS) {
      const legacyUser = storage.get(key);

      if (!legacyUser) {
        continue;
      }

      try {
        const parsedUser = JSON.parse(legacyUser);

        storage.set(AUTH_USER_KEY, JSON.stringify(parsedUser));

        return parsedUser;
      } catch (error) {
        console.warn(
          `[ProblemLens] Invalid stored user data for key "${key}"`
        );
      }
    }

    return null;
  },

  set(user) {
    if (!user) {
      return;
    }

    try {
      storage.set(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn("[ProblemLens] Unable to store user", error);
    }
  },

  remove() {
    storage.remove(AUTH_USER_KEY);

    LEGACY_USER_KEYS.forEach((key) => {
      storage.remove(key);
    });
  },

  getUser() {
    return this.get();
  },

  setUser(user) {
    return this.set(user);
  },

  clear() {
    return this.remove();
  },
};

// ======================================================
// AUTH HELPERS
// ======================================================

export const getAuthToken = () => {
  return tokenStorage.get();
};

export const getAuthUser = () => {
  return userStorage.get();
};

export const setAuthToken = (token) => {
  tokenStorage.set(token);
};

export const setAuthUser = (user) => {
  userStorage.set(user);
};

export const setAuthStorage = ({ token, user } = {}) => {
  if (token) {
    tokenStorage.set(token);
  }

  if (user) {
    userStorage.set(user);
  }
};

export const clearAuthStorage = () => {
  tokenStorage.remove();
  userStorage.remove();

  storage.remove("refreshToken");
  storage.remove("auth");
  storage.remove("session");
};

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const responseData = error?.response?.data;

    const message =
      responseData?.message ||
      responseData?.error ||
      responseData?.details ||
      error?.message ||
      "Something went wrong. Please try again.";

    error.userMessage = message;
    error.statusCode = error?.response?.status || null;

    // --------------------------------------------------
    // Authentication failure
    // --------------------------------------------------

    if (error?.response?.status === 401) {
      const requestUrl = error?.config?.url || "";

      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/forgot-password") ||
        requestUrl.includes("/auth/reset-password") ||
        requestUrl.includes("/auth/verify-email") ||
        requestUrl.includes("/auth/resend-verification");

      if (!isAuthRequest) {
        clearAuthStorage();
      }
    }

    return Promise.reject(error);
  }
);

// ======================================================
// AUTH API
// ======================================================

export const authApi = {
  login(payload) {
    return api.post("/auth/login", payload);
  },

  register(payload) {
    return api.post("/auth/register", payload);
  },

  me() {
    return api.get("/auth/me");
  },

  getCurrentUser() {
    return api.get("/auth/me");
  },

  logout() {
    return api.post("/auth/logout");
  },

  forgotPassword(payload) {
    return api.post("/auth/forgot-password", payload);
  },

  resetPassword(payload) {
    return api.post("/auth/reset-password", payload);
  },

  verifyEmail(payload) {
    return api.post("/auth/verify-email", payload);
  },

  resendVerification(payload) {
    return api.post("/auth/resend-verification", payload);
  },

  changePassword(payload) {
    return api.post("/auth/change-password", payload);
  },

  updateProfile(payload) {
    return api.put("/auth/profile", payload);
  },
};

// ======================================================
// DASHBOARD API
// ======================================================

export const dashboardApi = {
  summary() {
    return api.get("/dashboard/summary");
  },

  getSummary() {
    return api.get("/dashboard/summary");
  },

  stats() {
    return api.get("/dashboard/stats");
  },

  getStats() {
    return api.get("/dashboard/stats");
  },

  activity() {
    return api.get("/dashboard/activity");
  },

  getActivity() {
    return api.get("/dashboard/activity");
  },

  projects() {
    return api.get("/dashboard/projects");
  },

  getProjects() {
    return api.get("/dashboard/projects");
  },

  overview() {
    return api.get("/dashboard/overview");
  },

  getOverview() {
    return api.get("/dashboard/overview");
  },
};

// ======================================================
// PROJECT API
// ======================================================

export const projectApi = {
  getAll(params = {}) {
    return api.get("/projects", {
      params,
    });
  },

  list(params = {}) {
    return this.getAll(params);
  },

  getById(id) {
    return api.get(`/projects/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return api.post("/projects", payload);
  },

  update(id, payload) {
    return api.put(`/projects/${encodeURIComponent(id)}`, payload);
  },

  remove(id) {
    return api.delete(`/projects/${encodeURIComponent(id)}`);
  },

  delete(id) {
    return this.remove(id);
  },

  archive(id) {
    return api.patch(`/projects/${encodeURIComponent(id)}/archive`);
  },

  restore(id) {
    return api.patch(`/projects/${encodeURIComponent(id)}/restore`);
  },

  getStats(id) {
    return api.get(`/projects/${encodeURIComponent(id)}/stats`);
  },

  getEvidence(id, params = {}) {
    return api.get(`/projects/${encodeURIComponent(id)}/evidence`, {
      params,
    });
  },

  getProblems(id, params = {}) {
    return api.get(`/projects/${encodeURIComponent(id)}/problems`, {
      params,
    });
  },

  getReports(id, params = {}) {
    return api.get(`/projects/${encodeURIComponent(id)}/reports`, {
      params,
    });
  },
};

// ======================================================
// EVIDENCE API
// ======================================================

export const evidenceApi = {
  getAll(params = {}) {
    return api.get("/evidence", {
      params,
    });
  },

  list(params = {}) {
    return this.getAll(params);
  },

  getStats(params = {}) {
    return api.get("/evidence/stats", {
      params,
    });
  },

  getById(id) {
    return api.get(`/evidence/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return api.post("/evidence", payload);
  },

  update(id, payload) {
    return api.put(`/evidence/${encodeURIComponent(id)}`, payload);
  },

  remove(id) {
    return api.delete(`/evidence/${encodeURIComponent(id)}`);
  },

  delete(id) {
    return this.remove(id);
  },

  archive(id) {
    return api.patch(`/evidence/${encodeURIComponent(id)}/archive`);
  },

  restore(id) {
    return api.patch(`/evidence/${encodeURIComponent(id)}/restore`);
  },

  analyze(id, payload = {}) {
    return api.post(
      `/evidence/${encodeURIComponent(id)}/analyze`,
      payload
    );
  },

  bulkCreate(payload) {
    return api.post("/evidence/bulk", payload);
  },
};

// ======================================================
// PROBLEM API
// ======================================================

export const problemApi = {
  getAll(params = {}) {
    return api.get("/problems", {
      params,
    });
  },

  list(params = {}) {
    return this.getAll(params);
  },

  getById(id) {
    return api.get(`/problems/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return api.post("/problems", payload);
  },

  update(id, payload) {
    return api.put(`/problems/${encodeURIComponent(id)}`, payload);
  },

  remove(id) {
    return api.delete(`/problems/${encodeURIComponent(id)}`);
  },

  delete(id) {
    return this.remove(id);
  },

  archive(id) {
    return api.patch(`/problems/${encodeURIComponent(id)}/archive`);
  },

  restore(id) {
    return api.patch(`/problems/${encodeURIComponent(id)}/restore`);
  },

  analyze(payload) {
    return api.post("/problems/analyze", payload);
  },

  getInsights(id) {
    return api.get(`/problems/${encodeURIComponent(id)}/insights`);
  },

  updateStatus(id, status) {
    return api.patch(
      `/problems/${encodeURIComponent(id)}/status`,
      {
        status,
      }
    );
  },
};

// ======================================================
// REPORT API
// ======================================================

export const reportApi = {
  getAll(params = {}) {
    return api.get("/reports", {
      params,
    });
  },

  list(params = {}) {
    return this.getAll(params);
  },

  getById(id) {
    return api.get(`/reports/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return api.post("/reports", payload);
  },

  update(id, payload) {
    return api.put(`/reports/${encodeURIComponent(id)}`, payload);
  },

  remove(id) {
    return api.delete(`/reports/${encodeURIComponent(id)}`);
  },

  delete(id) {
    return this.remove(id);
  },

  generate(payload) {
    return api.post("/reports/generate", payload);
  },

  download(id, format = "pdf") {
    return api.get(
      `/reports/${encodeURIComponent(id)}/download`,
      {
        params: {
          format,
        },
        responseType: "blob",
      }
    );
  },

  export(id, format = "pdf") {
    return api.get(
      `/reports/${encodeURIComponent(id)}/export`,
      {
        params: {
          format,
        },
        responseType: "blob",
      }
    );
  },
};

// ======================================================
// USER API
// ======================================================

export const userApi = {
  getAll(params = {}) {
    return api.get("/users", {
      params,
    });
  },

  list(params = {}) {
    return this.getAll(params);
  },

  getById(id) {
    return api.get(`/users/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return api.post("/users", payload);
  },

  update(id, payload) {
    return api.put(`/users/${encodeURIComponent(id)}`, payload);
  },

  remove(id) {
    return api.delete(`/users/${encodeURIComponent(id)}`);
  },

  delete(id) {
    return this.remove(id);
  },

  updateRole(id, role) {
    return api.patch(
      `/users/${encodeURIComponent(id)}/role`,
      {
        role,
      }
    );
  },

  activate(id) {
    return api.patch(`/users/${encodeURIComponent(id)}/activate`);
  },

  deactivate(id) {
    return api.patch(`/users/${encodeURIComponent(id)}/deactivate`);
  },
};

// ======================================================
// SETTINGS API
// ======================================================

export const settingsApi = {
  get() {
    return api.get("/settings");
  },

  getSettings() {
    return api.get("/settings");
  },

  update(payload) {
    return api.put("/settings", payload);
  },

  updateProfile(payload) {
    return api.put("/settings/profile", payload);
  },

  updateNotifications(payload) {
    return api.put("/settings/notifications", payload);
  },

  updateAppearance(payload) {
    return api.put("/settings/appearance", payload);
  },

  changePassword(payload) {
    return api.post("/auth/change-password", payload);
  },
};

// ======================================================
// AI API
// ======================================================

export const aiApi = {
  health() {
    return api.get("/ai/health");
  },

  analyzeProject(payload) {
    return api.post("/ai/analyze", payload);
  },

  analyzeEvidence(payload) {
    return api.post("/ai/analyze/evidence", payload);
  },

  discoverProblems(payload) {
    return api.post("/ai/discover-problems", payload);
  },

  generateOpportunities(payload) {
    return api.post("/ai/opportunities", payload);
  },

  getHistory(params = {}) {
    return api.get("/ai/history", {
      params,
    });
  },
};

// ======================================================
// HEALTH API
// ======================================================

export const healthApi = {
  check() {
    const healthBaseURL = API_BASE_URL.replace(/\/api\/?$/i, "");

    return axios.get(`${healthBaseURL}/health`, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });
  },
};

// ======================================================
// RESPONSE HELPERS
// ======================================================

export const extractData = (response, fallback = null) => {
  if (!response) {
    return fallback;
  }

  const responseData = response?.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    Object.prototype.hasOwnProperty.call(responseData, "data")
  ) {
    return responseData.data ?? fallback;
  }

  return responseData ?? fallback;
};

// ======================================================
// LIST EXTRACTION
// ======================================================

export const extractList = (response) => {
  const data = extractData(response, []);

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const possibleKeys = [
    "items",
    "results",
    "projects",
    "evidence",
    "problems",
    "reports",
    "users",
    "solutions",
    "opportunities",
    "activities",
    "notifications",
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
};

// ======================================================
// ERROR HELPERS
// ======================================================

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error) {
    return fallback;
  }

  if (error.userMessage) {
    return error.userMessage;
  }

  const responseData = error?.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.details) {
    return responseData.details;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

export const getApiErrorStatus = (error) => {
  return error?.response?.status || error?.statusCode || null;
};

// ======================================================
// DEBUG HELPER
// ======================================================

export const getApiConfig = () => {
  return {
    baseURL: API_BASE_URL,
    hasToken: Boolean(tokenStorage.get()),
    user: userStorage.get(),
  };
};

export const apiStatus = {
  async check() {
    const response = await healthApi.check();
    return extractData(response, response?.data || {});
  },
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default api;