import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Edit3,
  Eye,
  FileJson,
  FileText,
  Filter,
  Globe,
  Loader2,
  MessageSquareText,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";

import { evidenceApi, projectApi } from "../../services/api";

/* =========================================================
   CONFIG & MOTION VARIANTS
========================================================= */

const EVIDENCE_TYPES = [
  {
    value: "OTHER",
    label: "Text / Notes",
    icon: FileText,
    badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  {
    value: "SURVEY",
    label: "Survey",
    icon: ClipboardList,
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    value: "INTERVIEW",
    label: "Interview",
    icon: MessageSquareText,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    value: "REVIEW",
    label: "Web Research",
    icon: BookOpen,
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    value: "OBSERVATION",
    label: "Observation",
    icon: Eye,
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: FileText,
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    value: "ANALYTICS",
    label: "Analytics",
    icon: Zap,
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
];

const EMPTY_FORM = {
  project: "",
  type: "OTHER",
  title: "",
  content: "",
  source: "",
  author: "",
  sentiment: "",
  keywords: "",
  metadata: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 24,
    },
  },
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getResponsePayload(response) {
  return response?.data ?? response ?? null;
}

function extractArray(response, possibleKeys = []) {
  const payload = getResponsePayload(response);

  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.data)) return payload.data;

  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (payload.data && typeof payload.data === "object") {
    for (const key of possibleKeys) {
      if (Array.isArray(payload.data[key])) return payload.data[key];
    }
  }

  return [];
}

function getRecordId(record) {
  return record?._id || record?.id || "";
}

function getProjectId(project) {
  if (!project) return "";
  if (typeof project === "string") return project;
  return project._id || project.id || "";
}

function getProjectName(project) {
  if (!project) return "Unassigned project";
  if (typeof project === "string") return project;
  return (
    project.name ||
    project.title ||
    project.projectName ||
    project.description ||
    "Unnamed project"
  );
}

function normalizeTypeForUi(type) {
  const value = String(type || "OTHER").trim();
  const map = {
    Interview: "INTERVIEW",
    INTERVIEW: "INTERVIEW",
    Survey: "SURVEY",
    SURVEY: "SURVEY",
    Observation: "OBSERVATION",
    OBSERVATION: "OBSERVATION",
    "Web Research": "REVIEW",
    REVIEW: "REVIEW",
    Document: "DOCUMENT",
    DOCUMENT: "DOCUMENT",
    Analytics: "ANALYTICS",
    ANALYTICS: "ANALYTICS",
    Other: "OTHER",
    OTHER: "OTHER",
    TEXT: "OTHER",
  };
  return map[value] || "OTHER";
}

function normalizeEvidence(record = {}) {
  return {
    ...record,
    id: getRecordId(record),
    _id: getRecordId(record),
    projectId: getProjectId(record.project),
    projectName: getProjectName(record.project),
    title: record.title || "Untitled evidence",
    type: normalizeTypeForUi(record.type),
    content: record.content || record.description || "",
    source: record.source || "",
    author: record.author || "",
    sentiment:
      typeof record.sentiment === "number" ? record.sentiment : null,
    keywords: Array.isArray(record.keywords)
      ? record.keywords
      : Array.isArray(record.tags)
      ? record.tags
      : [],
    metadata:
      record.metadata && typeof record.metadata === "object"
        ? record.metadata
        : {},
    createdAt: record.createdAt || record.created_at || null,
    updatedAt: record.updatedAt || record.updated_at || null,
  };
}

function getErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.userMessage ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (Array.isArray(error?.response?.data?.errors)
      ? error.response.data.errors.map((e) => e.msg || e.message).join(", ")
      : null) ||
    error?.message ||
    fallback
  );
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTypeDetails(type) {
  return (
    EVIDENCE_TYPES.find((item) => item.value === type) ||
    EVIDENCE_TYPES.find((item) => item.value === "OTHER")
  );
}

function getSentimentDetails(sentiment) {
  if (sentiment === null || sentiment === undefined || sentiment === "") {
    return {
      label: "Unrated",
      className:
        "bg-slate-100/80 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60",
    };
  }

  const value = Number(sentiment);

  if (value > 0.2) {
    return {
      label: `Positive (${value.toFixed(2)})`,
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    };
  }

  if (value < -0.2) {
    return {
      label: `Negative (${value.toFixed(2)})`,
      className:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    };
  }

  return {
    label: `Neutral (${value.toFixed(2)})`,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  };
}

/* =========================================================
   UI SUBCOMPONENTS
========================================================= */

function TypeBadge({ type }) {
  const details = getTypeDetails(type);
  const Icon = details.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-all duration-200 ${details.badgeBg}`}
    >
      <Icon size={12} />
      {details.label}
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const details = getSentimentDetails(sentiment);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md transition-all duration-200 ${details.className}`}
    >
      {details.label}
    </span>
  );
}

function PremiumStatCard({ icon: Icon, label, value, description, iconClass, trend }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-3xl transition-all duration-300 hover:border-indigo-300/80 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/60"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${iconClass} shadow-md`}>
          <Icon size={19} />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-inner mb-4">
        <FileText size={32} />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        No evidence found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Start collecting interviews, surveys, observations, and research notes to back your problem discovery pipeline.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 active:scale-95"
      >
        <Plus size={16} />
        Add First Evidence
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      <p className="mt-4 text-xs font-bold text-slate-400 tracking-wider uppercase">
        Loading Evidence Records...
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
        <AlertCircle size={28} />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        Unable to load evidence
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      >
        <RefreshCw size={14} />
        Try Again
      </button>
    </div>
  );
}

/* =========================================================
   EVIDENCE MODAL
========================================================= */

function EvidenceModal({
  open,
  editingRecord,
  form,
  projects,
  saving,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  const isEditing = Boolean(editingRecord);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Research Intelligence
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {isEditing ? "Edit Evidence Record" : "Add New Evidence"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="overflow-y-auto pt-4 space-y-4 pr-1">
          {error ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Context *
            </label>
            <select
              name="project"
              value={form.project}
              onChange={onChange}
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={getRecordId(project)} value={getRecordId(project)}>
                  {getProjectName(project)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {EVIDENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sentiment (-1.0 to 1.0)
              </label>
              <input
                name="sentiment"
                type="number"
                min="-1"
                max="1"
                step="0.01"
                value={form.sentiment}
                onChange={onChange}
                placeholder="e.g. 0.65"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Evidence Title *
            </label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Users struggle with initial setup steps"
              className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Evidence Details / Content *
            </label>
            <textarea
              name="content"
              required
              minLength={5}
              rows={4}
              value={form.content}
              onChange={onChange}
              placeholder="Describe observation or quotes in detail..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source *
              </label>
              <input
                name="source"
                type="text"
                required
                value={form.source}
                onChange={onChange}
                placeholder="e.g. User Interview"
                className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Author / Respondent
              </label>
              <input
                name="author"
                type="text"
                value={form.author}
                onChange={onChange}
                placeholder="e.g. Participant #4"
                className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Keywords (Comma separated)
            </label>
            <input
              name="keywords"
              type="text"
              value={form.keywords}
              onChange={onChange}
              placeholder="onboarding, friction, support"
              className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Metadata JSON
            </label>
            <textarea
              name="metadata"
              rows={3}
              value={form.metadata}
              onChange={onChange}
              placeholder={`{\n  "duration": "15m"\n}`}
              className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-emerald-600 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-emerald-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || projects.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white hover:bg-indigo-500"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{isEditing ? "Update Evidence" : "Save Evidence"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* =========================================================
   MAIN EVIDENCE PAGE
========================================================= */

export default function Evidence() {
  const [evidence, setEvidence] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    projects: 0,
    interviews: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [notice, setNotice] = useState("");

  /* Load Projects */
  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const response = await projectApi.getAll({ page: 1, limit: 100 });
      const records = extractArray(response, ["projects", "items", "records", "results"]);
      setProjects(records);
    } catch (requestError) {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  /* Load Evidence */
  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      if (projectFilter) params.project = projectFilter;

      const response = await evidenceApi.getAll(params);
      const payload = getResponsePayload(response);

      const records = extractArray(response, [
        "evidence",
        "items",
        "records",
        "results",
      ]).map(normalizeEvidence);

      setEvidence(records);

      const receivedPagination =
        payload?.pagination ||
        payload?.data?.pagination ||
        response?.pagination ||
        {};

      setPagination({
        page: Number(receivedPagination.page || page),
        limit: Number(receivedPagination.limit || limit),
        total: Number(receivedPagination.total || records.length),
        pages: Number(
          receivedPagination.pages ||
            receivedPagination.totalPages ||
            Math.max(1, Math.ceil(Number(receivedPagination.total || records.length) / limit))
        ),
      });
    } catch (requestError) {
      setEvidence([]);
      setError(
        getErrorMessage(
          requestError,
          "Unable to load evidence library. Please check your network connection."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [limit, page, projectFilter, search, typeFilter]);

  /* Load Stats */
  const loadStats = useCallback(async () => {
    try {
      const response = await evidenceApi.getStats();
      const payload = getResponsePayload(response);
      const data = payload?.data || payload?.stats || payload || {};

      setStats({
        total: Number(data.total || data.totalEvidence || 0),
        recent: Number(data.recent || data.recentCount || data.recentEvidence || 0),
        projects: Number(data.projects || data.projectCount || data.totalProjects || 0),
        interviews: Number(data.interviews || data.interviewCount || 0),
      });
    } catch (requestError) {
      setStats((previous) => ({
        ...previous,
        total: pagination.total || evidence.length,
        interviews: evidence.filter((item) => item.type === "INTERVIEW").length,
      }));
    }
  }, [evidence, pagination.total]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const visibleStats = useMemo(() => {
    const uniqueProjects = new Set(
      evidence.map((item) => item.projectId).filter(Boolean)
    ).size;

    return {
      total: stats.total || pagination.total || evidence.length,
      recent: stats.recent || 0,
      projects: stats.projects || uniqueProjects,
      interviews:
        stats.interviews ||
        evidence.filter((item) => item.type === "INTERVIEW").length,
    };
  }, [evidence, pagination.total, stats]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      project: record.projectId || getProjectId(record.project),
      type: record.type || "OTHER",
      title: record.title || "",
      content: record.content || "",
      source: record.source || "",
      author: record.author || "",
      sentiment:
        record.sentiment === null || record.sentiment === undefined
          ? ""
          : String(record.sentiment),
      keywords: Array.isArray(record.keywords)
        ? record.keywords.join(", ")
        : "",
      metadata:
        record.metadata && Object.keys(record.metadata).length > 0
          ? JSON.stringify(record.metadata, null, 2)
          : "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.project) {
      setFormError("Please select a project.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Evidence title is required.");
      return;
    }
    if (!form.content.trim()) {
      setFormError("Evidence content is required.");
      return;
    }

    let sentimentValue = undefined;
    if (form.sentiment !== "" && form.sentiment !== null) {
      sentimentValue = Number(form.sentiment);
      if (
        Number.isNaN(sentimentValue) ||
        sentimentValue < -1 ||
        sentimentValue > 1
      ) {
        setFormError("Sentiment must be a number between -1 and 1.");
        return;
      }
    }

    let metadataValue = {};
    if (form.metadata.trim()) {
      try {
        metadataValue = JSON.parse(form.metadata);
      } catch (parseError) {
        setFormError("Metadata contains invalid JSON.");
        return;
      }
    }

    const keywordsValue = form.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!form.source.trim()) {
      setFormError("Evidence source is required.");
      return;
    }

    const payload = {
      project: form.project,
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
      source: form.source.trim(),
      author: form.author.trim(),
      sentiment: sentimentValue,
      keywords: keywordsValue,
      metadata: metadataValue,
    };

    setSaving(true);

    try {
      if (editingRecord) {
        const id = getRecordId(editingRecord);
        await evidenceApi.update(id, payload);
        setNotice("Evidence updated successfully.");
      } else {
        await evidenceApi.create(payload);
        setNotice("Evidence created successfully.");
      }

      closeModal();
      setPage(1);
      await loadEvidence();
      await loadStats();
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          "Unable to save evidence record. Please verify inputs."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    const id = getRecordId(record);
    if (!id) return;

    if (!window.confirm(`Delete "${record.title}"?`)) return;

    setDeleting(true);
    setDeleteId(id);

    try {
      await evidenceApi.remove(id);
      setNotice("Evidence deleted successfully.");

      if (evidence.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadEvidence();
      }

      await loadStats();
    } catch (requestError) {
      setNotice(
        getErrorMessage(
          requestError,
          "Unable to delete evidence. Please try again."
        )
      );
    } finally {
      setDeleting(false);
      setDeleteId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setProjectFilter("");
    setPage(1);
  };

  const hasFilters = Boolean(search || typeFilter || projectFilter);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto max-w-[1600px] space-y-6 p-4 pb-16 sm:p-6 lg:p-8"
    >
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[450px] overflow-hidden">
        <div className="absolute left-[15%] top-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-[15%] top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Hero Header Banner */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-950 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-slate-950/30"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(139,92,246,0.10),transparent_40%)]" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-xl">
              <Sparkles size={13} className="animate-pulse text-indigo-400" />
              Research Intelligence Engine
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Evidence{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-200 bg-clip-text text-transparent">
                Library.
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Collect, tag, and normalize raw research evidence from interviews, surveys, and web findings into actionable problem discovery signals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <Database size={13} className="text-indigo-300" />
                {visibleStats.total} Total Signals
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <MessageSquareText size={13} className="text-amber-300" />
                {visibleStats.interviews} Interviews
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                loadEvidence();
                loadStats();
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/10 active:scale-95"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-indigo-400" : ""} />
              <span>Refresh Library</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={16} />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* KPI Stats Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumStatCard
          icon={FileText}
          label="Total Evidence"
          value={visibleStats.total}
          description="Collected research records"
          iconClass="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
        />
        <PremiumStatCard
          icon={CalendarDays}
          label="Recent Signals"
          value={visibleStats.recent}
          description="Recently recorded data"
          iconClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        />
        <PremiumStatCard
          icon={Database}
          label="Projects Covered"
          value={visibleStats.projects}
          description="Connected project spaces"
          iconClass="bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        />
        <PremiumStatCard
          icon={MessageSquareText}
          label="User Interviews"
          value={visibleStats.interviews}
          description="Interview evidence records"
          iconClass="bg-gradient-to-br from-amber-500 to-orange-600 text-white"
        />
      </motion.section>

      {/* Main Table Container */}
      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60 overflow-hidden"
      >
        {/* Filter Controls Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Filter size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Research Records
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Filter and browse structured qualitative and quantitative signals
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={15} />
              Add Record
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, content, author, or source..."
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-9 text-xs font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
            >
              <option value="">All Types</option>
              {EVIDENCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
              disabled={projectsLoading}
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
            >
              <option value="">
                {projectsLoading ? "Loading projects..." : "All Projects"}
              </option>
              {projects.map((project) => (
                <option key={getRecordId(project)} value={getRecordId(project)}>
                  {getProjectName(project)}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Render States */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              loadEvidence();
              loadStats();
            }}
          />
        ) : evidence.length === 0 ? (
          <EmptyState onCreate={openCreateModal} />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-950/40">
                    <th className="px-6 py-4">Evidence</th>
                    <th className="px-5 py-4">Project</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Source</th>
                    <th className="px-5 py-4">Sentiment</th>
                    <th className="px-5 py-4">Added</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {evidence.map((record) => (
                    <tr
                      key={record.id}
                      className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="max-w-[380px] px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <FileText size={17} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                              {record.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {record.content}
                            </p>
                            {record.keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {record.keywords.slice(0, 3).map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  >
                                    <Tag size={9} />
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Database size={12} className="text-indigo-500" />
                          {record.projectName}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <TypeBadge type={record.type} />
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {record.source || "Not specified"}
                          </p>
                          {record.author && (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                              <User size={10} />
                              {record.author}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <SentimentBadge sentiment={record.sentiment} />
                      </td>

                      <td className="px-5 py-4 align-top text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(record.createdAt)}
                      </td>

                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(record)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record)}
                            disabled={deleting && deleteId === record.id}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            {deleting && deleteId === record.id ? (
                              <Loader2 size={15} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet View Cards */}
            <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
              {evidence.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {record.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                        {record.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TypeBadge type={record.type} />
                    <SentimentBadge sentiment={record.sentiment} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>{record.projectName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(record)}
                        className="font-bold text-slate-700 dark:text-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
                        className="font-bold text-rose-600 dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex flex-col gap-3 border-t border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{evidence.length}</span> of{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{pagination.total}</span> records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2">
                  {page} / {Math.max(1, pagination.pages)}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages || loading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.section>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <Check size={18} className="text-emerald-500" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">{notice}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence Modal */}
      <EvidenceModal
        open={modalOpen}
        editingRecord={editingRecord}
        form={form}
        projects={projects}
        saving={saving}
        error={formError}
        onClose={closeModal}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}