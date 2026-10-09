import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  Edit3,
  Eye,
  Filter,
  Flame,
  Gauge,
  Info,
  Layers3,
  Lightbulb,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import Badge from "../../components/common/Badge";
import { problemApi, projectApi } from "../../services/api";

/* =========================================================
   CONFIG & MOTION VARIANTS
========================================================= */

const SEVERITY_TYPES = ["All Severities", "High", "Medium", "Low"];

const STATUS_TYPES = [
  "All Statuses",
  "Validated",
  "Emerging",
  "Under Review",
  "Archived",
];

const EMPTY_FORM = {
  title: "",
  project: "",
  severity: "Medium",
  status: "Emerging",
  description: "",
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
   NORMALIZATION HELPERS
========================================================= */

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizePercentage(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const number = Number(cleaned);
    if (!Number.isFinite(number)) return fallback;
    return number <= 1 ? Math.round(number * 100) : Math.round(number);
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return number <= 1 ? Math.round(number * 100) : Math.round(number);
}

function getRecordId(item, index = 0) {
  return String(
    item?.id ||
      item?._id ||
      item?.problemId ||
      item?.uuid ||
      `problem-${index}`
  );
}

function getProjectName(item) {
  if (!item) return "General Research";
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.title ||
    item?.projectName ||
    item?.project?.name ||
    item?.project?.title ||
    "General Research"
  );
}

function getApiList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    for (const key of keys) {
      if (Array.isArray(payload.data?.[key])) return payload.data[key];
    }
  }

  return [];
}

function normalizeProblem(item, index) {
  const confidence = normalizePercentage(
    item?.confidence ??
      item?.confidenceScore ??
      item?.score ??
      item?.aiScore ??
      item?.validationScore,
    0
  );

  const evidenceCount = normalizeNumber(
    item?.evidenceCount ??
      item?.evidence?.length ??
      item?.sources ??
      item?.sourceCount ??
      item?.evidenceTotal,
    0
  );

  const impactScore = normalizePercentage(
    item?.impactScore ??
      item?.impact ??
      item?.opportunityScore ??
      item?.priorityScore,
    0
  );

  return {
    id: getRecordId(item, index),
    _id: getRecordId(item, index),
    title:
      item?.title ||
      item?.name ||
      item?.problemStatement ||
      "Untitled Problem",
    description:
      item?.description ||
      item?.content ||
      item?.statement ||
      item?.problemDescription ||
      "No problem description available.",
    project: getProjectName(item),
    severity:
      item?.severity ||
      item?.priority ||
      item?.riskLevel ||
      "Medium",
    confidence,
    status:
      item?.status ||
      item?.validationStatus ||
      item?.state ||
      "Emerging",
    evidenceCount,
    impactScore,
    createdAt:
      item?.createdAt ||
      item?.created_at ||
      item?.date ||
      new Date().toISOString(),
    updatedAt:
      item?.updatedAt ||
      item?.updated_at ||
      item?.createdAt ||
      new Date().toISOString(),
    raw: item,
  };
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatDate(date) {
  if (!date) return "Unknown";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getRelativeDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  const diff = Date.now() - parsed.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

/* =========================================================
   BADGES & BARS
========================================================= */

function getSeverityBadge(severity) {
  const normalized = String(severity || "").trim().toLowerCase();

  if (normalized === "high" || normalized === "critical") {
    return (
      <Badge
        variant="danger"
        className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"
      >
        <Flame size={11} className="mr-1" />
        High
      </Badge>
    );
  }

  if (normalized === "medium" || normalized === "moderate") {
    return (
      <Badge
        variant="warning"
        className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
      >
        <AlertTriangle size={11} className="mr-1" />
        Medium
      </Badge>
    );
  }

  return (
    <Badge
      variant="neutral"
      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
    >
      <Info size={11} className="mr-1" />
      Low
    </Badge>
  );
}

function getStatusBadge(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "validated" || normalized === "verified") {
    return (
      <Badge
        variant="success"
        className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
      >
        <CheckCircle2 size={11} className="mr-1" />
        Validated
      </Badge>
    );
  }

  if (normalized === "emerging" || normalized === "investigating") {
    return (
      <Badge
        variant="purple"
        className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400"
      >
        <Sparkles size={11} className="mr-1" />
        Emerging
      </Badge>
    );
  }

  if (normalized === "archived") {
    return (
      <Badge
        variant="neutral"
        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
      >
        Archived
      </Badge>
    );
  }

  return (
    <Badge
      variant="info"
      className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400"
    >
      <Activity size={11} className="mr-1" />
      {status || "Under Review"}
    </Badge>
  );
}

function ConfidenceBar({ value = 0 }) {
  const score = Math.min(100, Math.max(0, normalizePercentage(value)));

  return (
    <div className="min-w-[120px]">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Confidence
        </span>
        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
          {score}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500"
        />
      </div>
    </div>
  );
}

function PremiumStatCard({ icon: Icon, label, value, description, iconClass, trend }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-3xl transition-all duration-300 hover:border-amber-300/80 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-slate-800/80 dark:bg-slate-900/60"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                <TrendingUp size={11} className="mr-0.5" />
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

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [projects, setProjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (detailOpen) setDetailOpen(false);
      else if (modalOpen) setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, detailOpen]);

  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");

    try {
      const [problemResult, projectResult] = await Promise.allSettled([
        problemApi?.getAll ? problemApi.getAll() : Promise.reject(new Error("Problem API unavailable")),
        projectApi?.getAll ? projectApi.getAll() : Promise.reject(new Error("Project API unavailable")),
      ]);

      let receivedProblems = false;

      if (problemResult.status === "fulfilled") {
        const payload = problemResult.value?.data ?? problemResult.value;
        const list = getApiList(payload, ["problems", "items", "results", "records"]);
        if (list.length > 0) {
          setProblems(list.map(normalizeProblem));
          receivedProblems = true;
        } else setProblems([]);
      }

      if (projectResult.status === "fulfilled") {
        const payload = projectResult.value?.data ?? projectResult.value;
        const list = getApiList(payload, ["projects", "items", "results", "records"]);
        setProjects(list);
      }

      if (problemResult.status === "rejected" && projectResult.status === "rejected") {
        throw new Error("Unable to connect to the backend.");
      }

      if (!receivedProblems && problemResult.status === "fulfilled") setProblems([]);
    } catch (err) {
      setError("Unable to sync with the backend. Please check your network connection.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const total = problems.length;
    const validated = problems.filter((p) => String(p.status).toLowerCase() === "validated").length;
    const highSeverity = problems.filter((p) => {
      const sev = String(p.severity).toLowerCase();
      return sev === "high" || sev === "critical";
    }).length;

    const confidenceValues = problems.map((p) => normalizePercentage(p.confidence)).filter(Number.isFinite);
    const avgConfidence = confidenceValues.length > 0 ? Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) : 0;
    const totalEvidence = problems.reduce((a, b) => a + normalizeNumber(b.evidenceCount), 0);
    const averageImpact = total > 0 ? Math.round(problems.reduce((a, b) => a + normalizePercentage(b.impactScore), 0) / total) : 0;
    const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;

    return { total, validated, highSeverity, avgConfidence, totalEvidence, averageImpact, validationRate };
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return problems.filter((problem) => {
      const text = [problem.title, problem.description, problem.project, problem.status, problem.severity].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesSeverity = selectedSeverity === "All Severities" || String(problem.severity).toLowerCase() === selectedSeverity.toLowerCase();
      const matchesStatus = selectedStatus === "All Statuses" || String(problem.status).toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [problems, searchQuery, selectedSeverity, selectedStatus]);

  const hasFilters = Boolean(searchQuery) || selectedSeverity !== "All Severities" || selectedStatus !== "All Statuses";

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({ ...EMPTY_FORM, project: getProjectName(projects[0]) });
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      title: record.title || "",
      project: record.project || "",
      severity: record.severity || "Medium",
      status: record.status || "Emerging",
      description: record.description || "",
    });
    setModalOpen(true);
  };

  const handleOpenDetails = (record) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSeverity("All Severities");
    setSelectedStatus("All Statuses");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      setError("Problem title is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (editingRecord) {
        if (!problemApi?.update) throw new Error("Problem update API is unavailable.");
        const response = await problemApi.update(editingRecord.id, formData);
        const updatedPayload = response?.data ?? response;
        const updatedRecord = normalizeProblem({
          ...editingRecord.raw,
          ...formData,
          ...(updatedPayload?.problem || updatedPayload?.data || {}),
          id: editingRecord.id,
        }, 0);

        setProblems((curr) => curr.map((item) => (item.id === editingRecord.id ? updatedRecord : item)));
        setNotice("Problem signal updated successfully.");
      } else {
        if (!problemApi?.create) throw new Error("Problem create API is unavailable.");
        const response = await problemApi.create(formData);
        const payload = response?.data ?? response;
        const created = payload?.problem || payload?.item || payload?.data || payload;
        const newRecord = normalizeProblem({ ...created, ...formData }, 0);

        setProblems((curr) => [newRecord, ...curr]);
        setNotice("New problem signal created successfully.");
      }

      setModalOpen(false);
      setEditingRecord(null);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save problem signal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const record = problems.find((p) => p.id === id);
    if (!window.confirm(`Delete "${record?.title || "this problem"}"?`)) return;

    try {
      if (!problemApi?.remove) throw new Error("Problem delete API unavailable.");
      await problemApi.remove(id);

      setProblems((curr) => curr.filter((p) => p.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
        setDetailOpen(false);
      }
      setNotice("Problem signal deleted successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete problem signal.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-64 rounded-[32px] bg-slate-200/70 dark:bg-slate-800/50" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-[26px] bg-slate-200/70 dark:bg-slate-800/50" />
          ))}
        </div>
        <div className="h-[440px] rounded-[32px] bg-slate-200/70 dark:bg-slate-800/50" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto max-w-[1600px] space-y-6 p-4 pb-16 sm:p-6 lg:p-8"
    >
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[450px] overflow-hidden">
        <div className="absolute left-[15%] top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[15%] top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      {/* Hero Header Banner */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-950 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-slate-950/30"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.15),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(249,115,22,0.10),transparent_40%)]" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-xl">
              <Sparkles size={13} className="animate-pulse text-amber-400" />
              Problem Intelligence Hub
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Discover the problems{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                worth solving.
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Transform scattered research evidence into structured, validated problem signals. Monitor severity, confidence, evidence strength, and research momentum.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <Database size={13} className="text-amber-300" />
                {stats.totalEvidence} Evidence Signals
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <Target size={13} className="text-emerald-300" />
                {stats.validationRate}% Validation Rate
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <Gauge size={13} className="text-violet-300" />
                {stats.avgConfidence}% Avg. Confidence
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
              <span>{isRefreshing ? "Syncing..." : "Sync Data"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 active:scale-95"
            >
              <Plus size={16} />
              <span>New Problem</span>
              <ArrowUpRight size={14} className="opacity-70" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-700 dark:text-rose-400"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button type="button" onClick={() => setError("")} className="rounded-lg p-1 hover:bg-rose-500/10">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary KPI Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumStatCard
          icon={Layers3}
          label="Problem Signals"
          value={stats.total}
          description="Tracked research signals"
          iconClass="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        />
        <PremiumStatCard
          icon={CheckCircle2}
          label="Validated Signals"
          value={stats.validated}
          description={`${stats.validationRate}% of discovered signals`}
          trend={stats.validationRate > 0 ? `${stats.validationRate}%` : null}
          iconClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        />
        <PremiumStatCard
          icon={Flame}
          label="High Severity"
          value={stats.highSeverity}
          description="Priority issues for review"
          iconClass="bg-gradient-to-br from-rose-500 to-pink-600 text-white"
        />
        <PremiumStatCard
          icon={Gauge}
          label="Avg. Confidence"
          value={`${stats.avgConfidence}%`}
          description="Across available signals"
          iconClass="bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        />
      </motion.section>

      {/* Analytics Strip */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Evidence Coverage
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalEvidence}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Database size={18} />
            </div>
          </div>
          <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, stats.total > 0 ? (stats.totalEvidence / Math.max(stats.total * 10, 1)) * 100 : 0)}%`,
              }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-sky-500"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Aggregate evidence linked to tracked problems
          </p>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Research Impact
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.averageImpact}%
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.averageImpact}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Average impact score from available records
          </p>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Visible Results
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {filteredProblems.length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="mt-3.5 text-xs text-slate-400">
            {hasFilters ? "Narrowed by active filters" : "Showing all problem signals"}
          </p>
        </div>
      </motion.section>

      {/* Main Radar Table Section */}
      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60 overflow-hidden"
      >
        {/* Header and Controls */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Problem Radar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage discovered research problem signals
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95"
            >
              <Plus size={15} />
              Add Signal
            </button>
          </div>

          {/* Filters Bar */}
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px_auto]">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem statements..."
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-9 text-xs font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
              >
                {SEVERITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
              >
                {STATUS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Table / Cards */}
        {filteredProblems.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lightbulb size={32} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                {hasFilters ? "No matching signals" : "No problem signals recorded"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {hasFilters
                  ? "Try updating your search query or clear active filter presets."
                  : "Start populating your workspace by adding your first problem signal."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-950/40">
                    <th className="px-6 py-4">Problem Statement</th>
                    <th className="px-5 py-4">Project Context</th>
                    <th className="px-5 py-4">Severity</th>
                    <th className="px-5 py-4">Confidence</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredProblems.map((record) => (
                    <tr
                      key={record.id}
                      className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="max-w-[400px] px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Target size={17} />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(record)}
                              className="text-left font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {record.title}
                            </button>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {record.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                              <span>Created {getRelativeDate(record.createdAt)}</span>
                              <span>·</span>
                              <span>{record.evidenceCount} linked evidence</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Database size={12} className="text-slate-400" />
                          {record.project}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        {getSeverityBadge(record.severity)}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <ConfidenceBar value={record.confidence} />
                      </td>

                      <td className="px-5 py-4 align-top">
                        {getStatusBadge(record.status)}
                      </td>

                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(record)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
              {filteredProblems.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(record)}
                        className="text-left font-bold text-sm text-slate-900 dark:text-white line-clamp-2"
                      >
                        {record.title}
                      </button>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {record.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(record)}
                      className="rounded-lg p-1.5 text-slate-400"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {getSeverityBadge(record.severity)}
                    {getStatusBadge(record.status)}
                  </div>

                  <div className="mt-3">
                    <ConfidenceBar value={record.confidence} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>{record.evidenceCount} evidence items</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(record)}
                        className="font-bold text-slate-700 dark:text-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        className="font-bold text-rose-600 dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.section>

      {/* Modal Overlay Component */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRecord ? "Edit Problem Signal" : "Create Problem Signal"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Describe problem concise..."
                    className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="Emerging">Emerging</option>
                      <option value="Validated">Validated</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Problem Statement Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full problem context and observed user frictions..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-10 rounded-xl px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    <span>{editingRecord ? "Save Changes" : "Create Signal"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Slide Drawer */}
      <AnimatePresence>
        {detailOpen && selectedRecord && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setDetailOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-lg border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Problem Signal Details
                </span>
                <button
                  type="button"
                  onClick={() => setDetailOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedRecord.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Created {formatDate(selectedRecord.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedRecord.severity)}
                  {getStatusBadge(selectedRecord.status)}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Problem Description
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedRecord.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Confidence</span>
                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                      {selectedRecord.confidence}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Linked Evidence</span>
                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                      {selectedRecord.evidenceCount}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailOpen(false);
                      handleOpenEdit(selectedRecord);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-500 text-xs font-bold text-slate-950"
                  >
                    <Edit3 size={14} />
                    Edit Signal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedRecord.id)}
                    className="h-10 rounded-xl border border-rose-200 px-4 text-xs font-bold text-rose-600 dark:border-rose-900/40 dark:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">{notice}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}