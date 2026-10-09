import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Check,
  Copy,
  BrainCircuit,
  ChevronRight,
  CircleDot,
  Gauge,
  GitBranch,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Workflow,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileSearch,
  Filter,
  Hash,
  Layers3,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

import {
  aiApi,
  extractData,
  extractList,
  getApiErrorMessage,
  evidenceApi,
  projectApi,
} from "../../services/api";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const ANALYSIS_MODES = {
  FULL: {
    label: "Full Intelligence",
    short: "Complete",
    description:
      "Runs the complete intelligence pipeline including keywords, sentiment, clusters and recurring patterns.",
    icon: BrainCircuit,
  },
  SUMMARY: {
    label: "Executive Summary",
    short: "Summary",
    description:
      "Produces a concise research summary from the selected evidence.",
    icon: FileSearch,
  },
  KEYWORDS: {
    label: "Keyword Intelligence",
    short: "Keywords",
    description:
      "Extracts recurring terms and high-signal language from the evidence.",
    icon: Hash,
  },
  SENTIMENT: {
    label: "Sentiment Signals",
    short: "Sentiment",
    description:
      "Analyzes positive, neutral and negative language signals.",
    icon: Activity,
  },
  CLUSTERS: {
    label: "Problem Clusters",
    short: "Clusters",
    description:
      "Groups semantically related evidence into research clusters.",
    icon: Layers3,
  },
  PATTERNS: {
    label: "Recurring Patterns",
    short: "Patterns",
    description:
      "Identifies repeated phrases and recurring signals across evidence.",
    icon: Target,
  },
};

function getId(item) {
  return item?._id || item?.id || "";
}

function getProjectRef(item) {
  if (!item) return "";

  if (item.projectId) return item.projectId;

  if (typeof item.project === "string") {
    return item.project;
  }

  return item.project?._id || item.project?.id || "";
}

function getEvidenceText(item) {
  return String(
    item?.content ||
      item?.description ||
      item?.text ||
      item?.title ||
      ""
  ).trim();
}

function getProjectName(project) {
  return (
    project?.name ||
    project?.title ||
    project?.projectName ||
    "Untitled research project"
  );
}

function clamp(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return 0;

  return Math.max(0, Math.min(100, n));
}

function firstNumber(obj, keys) {
  for (const key of keys) {
    const value = Number(obj?.[key]);

    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function truncate(text, length = 140) {
  const value = String(text || "").trim();

  if (value.length <= length) return value;

  return `${value.slice(0, length).trim()}…`;
}

function normalizePattern(pattern) {
  if (typeof pattern === "string") {
    return {
      label: pattern,
      count: null,
      raw: pattern,
    };
  }

  return {
    label:
      pattern?.pattern ||
      pattern?.phrase ||
      pattern?.text ||
      pattern?.label ||
      pattern?.name ||
      "Recurring signal",
    count:
      pattern?.count ??
      pattern?.frequency ??
      pattern?.occurrences ??
      null,
    raw: pattern,
  };
}

function normalizeCluster(cluster, index) {
  if (typeof cluster === "string") {
    return {
      id: index + 1,
      label: cluster,
      items: [],
      raw: cluster,
    };
  }

  return {
    id:
      cluster?.id ||
      cluster?.cluster_id ||
      cluster?.clusterId ||
      index + 1,
    label:
      cluster?.label ||
      cluster?.name ||
      cluster?.topic ||
      `Cluster ${index + 1}`,
    items: Array.isArray(cluster?.items)
      ? cluster.items
      : Array.isArray(cluster?.indices)
      ? cluster.indices
      : Array.isArray(cluster?.members)
      ? cluster.members
      : [],
    raw: cluster,
  };
}

function normalizeAnalysis(result) {
  const source =
    result?.result ||
    result?.data?.result ||
    result?.data ||
    result ||
    {};

  const clusters = Array.isArray(source?.clusters)
    ? source.clusters
    : [];

  const patterns = Array.isArray(source?.recurring_patterns)
    ? source.recurring_patterns
    : Array.isArray(source?.patterns)
    ? source.patterns
    : [];

  const keywords = Array.isArray(source?.keywords)
    ? source.keywords
    : [];

  const sentiment = source?.sentiment || {};

  const distribution = sentiment?.distribution || {};

  const score = firstNumber(source, [
    "opportunityScore",
    "opportunity_score",
    "score",
    "confidence",
  ]);

  const documentCount = Number(
    source?.document_count ??
      source?.documentCount ??
      source?.documentsAnalyzed ??
      0
  );

  return {
    documentCount: Number.isFinite(documentCount)
      ? documentCount
      : 0,

    keywords: keywords.filter(Boolean),

    clusters: clusters.map(normalizeCluster),

    patterns: patterns.map(normalizePattern),

    sentiment: {
      positive: Number(distribution?.positive || 0),
      neutral: Number(distribution?.neutral || 0),
      negative: Number(distribution?.negative || 0),
      documents: Array.isArray(sentiment?.documents)
        ? sentiment.documents
        : [],
    },

    summary:
      source?.summary ||
      source?.message ||
      "The AI engine completed the analysis.",

    score,

    createdAt:
      result?.createdAt ||
      result?.data?.createdAt ||
      source?.createdAt ||
      null,

    raw: source,
  };
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const spring = {
  type: "spring",
  stiffness: 260,
  damping: 22,
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

function AnimatedNumber({ value }) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return <>{value}</>;

  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      key={numeric}
    >
      {numeric}
    </motion.span>
  );
}

function PremiumGlow({ reducedMotion = false }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={reducedMotion ? undefined : { x: [0, 40, 0], y: [0, -20, 0] }}
          transition={reducedMotion ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-indigo-500/[0.08] blur-[100px]"
        />
        <motion.div
          animate={reducedMotion ? undefined : { x: [0, -30, 0], y: [0, 35, 0] }}
          transition={reducedMotion ? undefined : { duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-1/4 h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/[0.07] blur-[110px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.08)_1px,transparent_0)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] dark:opacity-40" />
      </div>
    </>
  );
}



function AIOrb({ status = "idle", reducedMotion = false, compact = false }) {
  const running = status === "running";
  const error = status === "error";
  const ready = status === "ready";

  return (
    <div
      className={[
        "relative grid shrink-0 place-items-center",
        compact ? "h-12 w-12" : "h-28 w-28 sm:h-32 sm:w-32",
      ].join(" ")}
      aria-label={
        running
          ? "AI engine running"
          : error
          ? "AI engine error"
          : ready
          ? "AI engine ready"
          : "AI engine idle"
      }
      role="status"
    >
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : running
            ? { rotate: 360 }
            : { rotate: 360 }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: running ? 7 : 18, repeat: Infinity, ease: "linear" }
        }
        className={[
          "absolute inset-0 rounded-full border border-dashed",
          error
            ? "border-rose-400/35"
            : ready
            ? "border-emerald-400/35"
            : "border-indigo-400/35",
        ].join(" ")}
      />
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : running
            ? { scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }
            : { scale: [1, 1.025, 1], opacity: [0.3, 0.55, 0.3] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: running ? 1.5 : 3.5, repeat: Infinity, ease: "easeInOut" }
        }
        className={[
          "absolute inset-2 rounded-full blur-xl",
          error
            ? "bg-rose-500/25"
            : ready
            ? "bg-emerald-500/20"
            : "bg-indigo-500/25",
        ].join(" ")}
      />
      <div
        className={[
          "relative grid place-items-center rounded-full border shadow-2xl backdrop-blur-xl",
          compact ? "h-9 w-9" : "h-20 w-20 sm:h-24 sm:w-24",
          error
            ? "border-rose-400/30 bg-rose-500/10 text-rose-500"
            : ready
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-500"
            : "border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-fuchsia-500/15 text-indigo-500",
        ].join(" ")}
      >
        <BrainCircuit size={compact ? 17 : 32} />
      </div>

      {!compact && !reducedMotion && (
        <>
          <motion.span
            animate={{ rotate: -360 }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-7px] rounded-full border border-indigo-400/15"
          />
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-15px] rounded-full border border-violet-400/10"
          />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_16px_rgba(217,70,239,.7)]" />
          <span className="absolute bottom-2 left-0 h-1.5 w-1.5 rounded-full bg-indigo-400" />
        </>
      )}
    </div>
  );
}

function IntelligencePipeline({ running, resultData, error, reducedMotion }) {
  const stages = [
    ["Evidence", "Live research records", FileSearch],
    ["Signal Extraction", "Language and lexical signals", Sparkles],
    ["Pattern Detection", "Recurring research signals", Target],
    ["Semantic Clustering", "Related evidence groups", Layers3],
    ["Sentiment Analysis", "Positive / neutral / negative", Activity],
    ["Research Intelligence", "Structured AI output", BrainCircuit],
  ];

  const stageState = (index) => {
    if (error) return index === 5 ? "error" : index < 5 ? "complete" : "pending";
    if (running) return index === 0 ? "complete" : index === 1 ? "active" : "pending";
    if (resultData) return "complete";
    return index === 0 ? "active" : "pending";
  };

  return (
    <GlassCard className="p-5 sm:p-7">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <AIOrb status={running ? "running" : error ? "error" : resultData ? "ready" : "idle"} reducedMotion={reducedMotion} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                AI Intelligence Engine
              </span>
              {running && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  AI engine running
                </span>
              )}
              {!running && resultData && !error && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Check size={11} />
                  Intelligence ready
                </span>
              )}
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Transforming evidence into structured research signals.
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500 dark:text-slate-400">
              The visual pipeline reflects real application state. It never invents backend progress or confidence.
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex items-center gap-2">
            <Workflow size={15} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Processing state
            </span>
          </div>
          <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
            {running ? "Analyzing evidence…" : error ? "Attention required" : resultData ? "Analysis complete" : "Ready to analyze"}
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto pb-1">
        <div className="flex min-w-[860px] items-start">
          {stages.map(([label, description, Icon], index) => {
            const state = stageState(index);
            const active = state === "active";
            const complete = state === "complete";
            const failed = state === "error";

            return (
              <div key={label} className="flex min-w-0 flex-1 items-start">
                <motion.div
                  animate={
                    active && !reducedMotion
                      ? { y: [0, -3, 0] }
                      : undefined
                  }
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="min-w-0 flex-1 text-center"
                >
                  <div
                    className={[
                      "mx-auto grid h-11 w-11 place-items-center rounded-2xl border transition-all",
                      failed
                        ? "border-rose-400/30 bg-rose-500/10 text-rose-500"
                        : complete
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-500"
                        : active
                        ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/10"
                        : "border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-white/[0.03]",
                    ].join(" ")}
                  >
                    {failed ? <AlertCircle size={17} /> : complete ? <Check size={17} /> : <Icon size={17} />}
                  </div>
                  <p className="mt-3 text-[11px] font-black text-slate-900 dark:text-white">{label}</p>
                  <p className="mx-auto mt-1 max-w-[130px] text-[9px] leading-4 text-slate-400">{description}</p>
                  <span className={[
                    "mt-2 inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em]",
                    failed ? "bg-rose-500/10 text-rose-500" : complete ? "bg-emerald-500/10 text-emerald-500" : active ? "bg-indigo-500/10 text-indigo-500" : "bg-slate-100 text-slate-400 dark:bg-white/5",
                  ].join(" ")}>
                    {failed ? "Failed" : complete ? "Complete" : active ? "Active" : "Pending"}
                  </span>
                </motion.div>

                {index < stages.length - 1 && (
                  <div className="mt-5 h-px w-8 shrink-0 overflow-hidden bg-slate-200 dark:bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: complete ? "100%" : active && !reducedMotion ? ["0%", "100%"] : "0%" }}
                      transition={active && !reducedMotion ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

function SignalScore({ score }) {
  const available = Number.isFinite(Number(score));
  const numeric = available ? clamp(Number(score)) : null;
  const circumference = 2 * Math.PI * 43;
  const dash = numeric === null ? 0 : (numeric / 100) * circumference;

  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionHeading
        icon={Gauge}
        eyebrow="Quality signal"
        title="AI Analysis Signal"
        description="Uses only the score/confidence value returned by the current analysis response."
      />
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-200 dark:text-white/10" />
            {available && (
              <motion.circle
                cx="50" cy="50" r="43" fill="none" stroke="url(#signalGradient)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dash} ${circumference}` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <defs>
              <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            {available ? (
              <>
                <span className="text-2xl font-black text-slate-950 dark:text-white">{Math.round(numeric)}</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">signal</span>
              </>
            ) : (
              <span className="px-4 text-[9px] font-black uppercase leading-4 tracking-wider text-slate-400">Unavailable</span>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {available ? "Returned analysis signal" : "Signal score unavailable"}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            {available
              ? "This visualization reflects the normalized score returned by the AI engine."
              : "The current analysis response did not provide a confidence or score value."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* UI Components                                                               */
/* -------------------------------------------------------------------------- */

function GlassCard({
  children,
  className = "",
  hover = false,
  ...props
}) {
  return (
    <motion.section
      variants={fadeUp}
      whileHover={
        hover
          ? {
              y: -2,
            }
          : undefined
      }
      className={[
        "group relative overflow-hidden rounded-[1.65rem]",
        "border border-white/80 bg-white/75",
        "shadow-[0_24px_80px_-34px_rgba(15,23,42,0.24)]",
        "ring-1 ring-slate-900/[0.02] transition-shadow duration-500 hover:shadow-[0_30px_100px_-40px_rgba(79,70,229,0.28)]",
        "backdrop-blur-xl",
        "dark:border-white/10 dark:bg-slate-950/65",
        "dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)]",
        className,
      ].join(" ")}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-indigo-500/[0.03] dark:from-white/[0.04] dark:to-indigo-400/[0.04]" />

      <div className="relative">{children}</div>
    </motion.section>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        )}

        <h2 className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  accent = "indigo",
}) {
  const accentClasses = {
    indigo:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,.24)] backdrop-blur-xl transition-all duration-500 hover:border-indigo-300/70 hover:shadow-[0_22px_60px_-30px_rgba(79,70,229,.25)] dark:border-white/10 dark:bg-white/[0.035]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl ${
            accentClasses[accent] || accentClasses.indigo
          }`}
        >
          <Icon size={16} />
        </div>

        <Sparkles
          size={14}
          className="text-slate-300 transition group-hover:text-indigo-400 dark:text-slate-700"
        />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
          <AnimatedNumber value={value} />
        </p>

        {helper && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StatusPill({ status = "idle" }) {
  const config = {
    ready: {
      label: "AI engine ready",
      icon: CheckCircle2,
      classes:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    running: {
      label: "AI engine running",
      icon: Loader2,
      classes:
        "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    },
    error: {
      label: "AI engine unavailable",
      icon: XCircle,
      classes:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    idle: {
      label: "AI engine",
      icon: Activity,
      classes:
        "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
    },
  };

  const item = config[status] || config.idle;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.classes}`}
    >
      <Icon
        size={13}
        className={status === "running" ? "animate-spin" : ""}
      />

      {item.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.035]">
      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-white/10" />

      <div className="mt-5 h-10 w-24 rounded bg-slate-200 dark:bg-white/10" />

      <div className="mt-4 h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-white/10 dark:bg-white/[0.025]">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function SentimentBar({
  label,
  value,
  total,
  icon: Icon,
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
          <Icon size={14} />
          {label}
        </div>

        <span className="font-bold text-slate-900 dark:text-white">
          {value}
          <span className="ml-1 font-normal text-slate-400">
            ({percentage}%)
          </span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
        />
      </div>
    </div>
  );
}

function KeywordChip({ keyword, index }) {
  return (
    <motion.span
      variants={fadeUp}
      whileHover={{ y: -2, scale: 1.02 }}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-200"
    >
      <span className="grid h-5 w-5 place-items-center rounded-md bg-indigo-500/10 text-[10px] text-indigo-600 dark:text-indigo-400">
        {index + 1}
      </span>

      {String(keyword)}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                              */
/* -------------------------------------------------------------------------- */

export default function Analysis() {
  const [projects, setProjects] = useState([]);
  const [evidence, setEvidence] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState("FULL");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [running, setRunning] = useState(false);

  const [aiStatus, setAiStatus] = useState("idle");
  const [error, setError] = useState("");

  const [showRaw, setShowRaw] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState(null);
  const [expandedClusters, setExpandedClusters] = useState({});
  const reducedMotion = useReducedMotion();

  /* ---------------------------------------------------------------------- */
  /* Load live data                                                         */
  /* ---------------------------------------------------------------------- */

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [projectRes, evidenceRes] = await Promise.all([
        projectApi.getAll(),
        evidenceApi.getAll({ limit: 100 }),
      ]);

      const projectRows = extractList(projectRes);
      const evidenceRows = extractList(evidenceRes);

      setProjects(projectRows);
      setEvidence(evidenceRows);

      setProjectId((current) => {
        const currentExists = projectRows.some(
          (project) =>
            String(getId(project)) === String(current)
        );

        if (currentExists) {
          return current;
        }

        return getId(projectRows[0]);
      });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to load live research data."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------------------------------------------------------------- */
  /* Selected project                                                       */
  /* ---------------------------------------------------------------------- */

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) =>
          String(getId(project)) === String(projectId)
      ) || null,
    [projects, projectId]
  );

  /* ---------------------------------------------------------------------- */
  /* Project evidence                                                       */
  /* ---------------------------------------------------------------------- */

  const projectEvidence = useMemo(() => {
    if (!projectId) return [];

    return evidence.filter(
      (item) =>
        String(getProjectRef(item)) === String(projectId)
    );
  }, [evidence, projectId]);

  const validEvidence = useMemo(
    () =>
      projectEvidence.filter(
        (item) => getEvidenceText(item).length > 0
      ),
    [projectEvidence]
  );

  const visibleEvidence = useMemo(() => {
    const query = evidenceQuery.trim().toLowerCase();
    if (!query) return validEvidence;
    return validEvidence.filter((item) =>
      `${item?.title || ""} ${getEvidenceText(item)}`
        .toLowerCase()
        .includes(query)
    );
  }, [validEvidence, evidenceQuery]);

  const readiness = useMemo(() => {
    const total = projectEvidence.length;
    const usable = validEvidence.length;
    const percentage = total ? Math.round((usable / total) * 100) : 0;
    return {
      total,
      usable,
      percentage,
      status:
        total === 0 || usable === 0
          ? "No usable evidence"
          : percentage >= 80
          ? "Ready"
          : "Limited",
    };
  }, [projectEvidence.length, validEvidence.length]);

  /* ---------------------------------------------------------------------- */
  /* Result metrics                                                         */
  /* ---------------------------------------------------------------------- */

  const resultData = useMemo(
    () => (result ? normalizeAnalysis(result) : null),
    [result]
  );

  const visibleKeywords = useMemo(() => {
    const query = keywordQuery.trim().toLowerCase();
    if (!resultData?.keywords?.length || !query) {
      return resultData?.keywords || [];
    }
    return resultData.keywords.filter((keyword) =>
      String(keyword).toLowerCase().includes(query)
    );
  }, [resultData, keywordQuery]);

  const coverage = useMemo(() => {
    if (!projectEvidence.length || !resultData) {
      return 0;
    }

    return clamp(
      (resultData.documentCount /
        projectEvidence.length) *
        100
    );
  }, [projectEvidence.length, resultData]);

  const sentimentTotal = useMemo(() => {
    if (!resultData) return 0;

    return (
      resultData.sentiment.positive +
      resultData.sentiment.neutral +
      resultData.sentiment.negative
    );
  }, [resultData]);

  const modeConfig =
    ANALYSIS_MODES[type] || ANALYSIS_MODES.FULL;

  const ModeIcon = modeConfig.icon;

  /* ---------------------------------------------------------------------- */
  /* AI health                                                              */
  /* ---------------------------------------------------------------------- */

  const checkAiHealth = async () => {
    try {
      setAiStatus("running");

      await aiApi.health();

      setAiStatus("ready");
    } catch {
      setAiStatus("error");
    }
  };

  useEffect(() => {
    if (!loading) {
      checkAiHealth();
    }
  }, [loading]);

  /* ---------------------------------------------------------------------- */
  /* Run analysis                                                           */
  /* ---------------------------------------------------------------------- */

  const copyRawResult = async () => {
    if (!resultData?.raw) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(resultData.raw, null, 2)
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const copySummary = async () => {
    if (!resultData?.summary) return;
    try {
      await navigator.clipboard.writeText(String(resultData.summary));
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 1600);
    } catch {
      setSummaryCopied(false);
    }
  };

  const runAnalysis = async () => {
    if (running) return;

    if (!projectId) {
      setError("Please select a research project first.");
      return;
    }

    if (validEvidence.length === 0) {
      setError(
        "This project does not have usable evidence for analysis yet."
      );
      return;
    }

    setRunning(true);
    setAiStatus("running");
    setError("");

    try {
      const payload = {
        project: projectId,

        type,

        evidenceIds: validEvidence
          .map(getId)
          .filter(Boolean),

        evidence: validEvidence.map((item) => ({
          id: getId(item),
          text: getEvidenceText(item),
        })),
      };

      const response = await aiApi.analyzeProject(
        payload
      );

      const data = extractData(response, {});

      setResult(data);
      setAiStatus("ready");
      setShowRaw(false);
    } catch (err) {
      setAiStatus("error");

      setError(
        getApiErrorMessage(
          err,
          "AI analysis could not be completed."
        )
      );
    } finally {
      setRunning(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Cluster evidence                                                       */
  /* ---------------------------------------------------------------------- */

  const resolveClusterEvidence = (cluster) => {
    if (!cluster?.items?.length) return [];

    return cluster.items
      .map((item) => {
        const numericIndex =
          typeof item === "number"
            ? item
            : Number(item);

        if (
          Number.isInteger(numericIndex) &&
          validEvidence[numericIndex]
        ) {
          return validEvidence[numericIndex];
        }

        const id =
          typeof item === "object"
            ? getId(item)
            : item;

        return validEvidence.find(
          (evidenceItem) =>
            String(getId(evidenceItem)) ===
            String(id)
        );
      })
      .filter(Boolean);
  };

  /* ---------------------------------------------------------------------- */
  /* Loading state                                                          */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden bg-[#f7f8fc] px-3 py-5 dark:bg-[#070914] sm:px-6 lg:px-8">
        <PremiumGlow reducedMotion={reducedMotion} />
        <div className="relative mx-auto max-w-7xl">
          <GlassCard className="p-6 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <AIOrb status="running" reducedMotion={reducedMotion} />
              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                AI Engine Initializing
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Preparing research intelligence workspace
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Loading live research projects, evidence and analysis configuration.
              </p>
            </div>

            <div className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-2">
              {[
                ["Loading research projects", "complete"],
                ["Loading evidence", "complete"],
                ["Preparing intelligence pipeline", "active"],
                ["Waiting for analysis", "pending"],
              ].map(([label, state]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.025]">
                  <span className={[
                    "grid h-8 w-8 place-items-center rounded-xl",
                    state === "complete" ? "bg-emerald-500/10 text-emerald-500" : state === "active" ? "bg-indigo-500/10 text-indigo-500" : "bg-slate-200/70 text-slate-400 dark:bg-white/5",
                  ].join(" ")}>
                    {state === "complete" ? <Check size={15} /> : state === "active" ? <Loader2 size={15} className="animate-spin" /> : <CircleDot size={15} />}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f7f8fc] px-3 py-4 dark:bg-[#070914] sm:px-5 sm:py-6 lg:px-8">
      <PremiumGlow reducedMotion={reducedMotion} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl"
      >
        {/* ---------------------------------------------------------------- */}
        {/* HERO                                                             */}
        {/* ---------------------------------------------------------------- */}

        <motion.header
          variants={fadeUp}
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_35px_120px_-45px_rgba(79,70,229,0.30)] backdrop-blur-2xl ring-1 ring-indigo-950/[0.025] dark:border-white/10 dark:bg-slate-950/65 sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-400">
                  <Sparkles size={13} />
                  Research Intelligence
                </span>

                <StatusPill status={running ? "running" : aiStatus} />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live intelligence workspace
              </motion.div>

              <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl lg:text-6xl">
                Turn raw evidence into
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {" "}
                  research intelligence.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                Analyze real project evidence with the ProblemLens
                AI engine to surface keywords, sentiment signals,
                semantic clusters and recurring patterns.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["AI Engine", aiStatus === "error" ? "Attention" : aiStatus === "ready" ? "Ready" : running ? "Running" : "Standby", BrainCircuit],
                  ["Live project", selectedProject ? getProjectName(selectedProject) : "Not selected", Target],
                  ["Evidence", `${validEvidence.length} usable / ${projectEvidence.length} total`, FileSearch],
                  ["Mode", modeConfig.label, ModeIcon],
                  ["Dataset readiness", readiness.status, Gauge],
                  ["Last analysis", resultData?.createdAt ? formatDateTime(resultData.createdAt) : "Not available", Clock3],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/55 px-3 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{label}</p>
                      <p className="mt-0.5 truncate text-[11px] font-bold text-slate-800 dark:text-slate-200">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProject && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Target size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Active project
                      </p>

                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {getProjectName(selectedProject)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Dataset
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {validEvidence.length} usable evidence items
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={runAnalysis}
                disabled={running || !projectId || validEvidence.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} fill="currentColor" />}
                <span>{resultData ? "Run Again" : "Run Analysis"}</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ---------------------------------------------------------------- */}
        {/* METRICS                                                          */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          variants={stagger}
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <MetricCard
            icon={FileSearch}
            label="Evidence available"
            value={projectEvidence.length}
            helper={`${validEvidence.length} contain analyzable text`}
            accent="indigo"
          />

          <MetricCard
            icon={BrainCircuit}
            label="Evidence analyzed"
            value={resultData?.documentCount || 0}
            helper={
              resultData
                ? `${Math.round(coverage)}% dataset coverage`
                : "Run an analysis to populate"
            }
            accent="violet"
          />

          <MetricCard
            icon={Hash}
            label="Keywords found"
            value={resultData?.keywords.length || 0}
            helper="Extracted research signals"
            accent="emerald"
          />

          <MetricCard
            icon={Layers3}
            label="Clusters detected"
            value={resultData?.clusters.length || 0}
            helper={
              resultData?.patterns.length
                ? `${resultData.patterns.length} recurring patterns`
                : "Semantic grouping output"
            }
            accent="amber"
          />

          <MetricCard
            icon={Target}
            label="Recurring patterns"
            value={resultData?.patterns.length || 0}
            helper="Repeated signals returned by the engine"
            accent="violet"
          />

          <MetricCard
            icon={Activity}
            label="Sentiment signals"
            value={sentimentTotal}
            helper="Positive, neutral and negative signals"
            accent="emerald"
          />

          <MetricCard
            icon={Gauge}
            label="Dataset coverage"
            value={`${Math.round(coverage)}%`}
            helper={resultData ? "Analyzed records / project evidence" : "Available after analysis"}
            accent="indigo"
          />
        </motion.div>

        <div className="mt-6">
          <IntelligencePipeline
            running={running}
            resultData={resultData}
            error={error}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* CONFIG + DATASET                                                  */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Configuration */}
          <GlassCard className="p-5 sm:p-6">
            <SectionHeading
              icon={Zap}
              eyebrow="Control center"
              title="Analysis configuration"
              description="Choose the project and intelligence pipeline."
            />

            <div className="space-y-5">
              {/* Project */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Research project
                </label>

                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(event) => {
                      setProjectId(event.target.value);
                      setResult(null);
                      setError("");
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">
                      Select a research project
                    </option>

                    {projects.map((project) => {
                      const id = getId(project);

                      return (
                        <option key={id} value={id}>
                          {getProjectName(project)}
                        </option>
                      );
                    })}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Intelligence mode
                </label>

                <div className="grid gap-2 sm:max-h-none max-sm:flex max-sm:overflow-x-auto max-sm:pb-1">
                  {Object.entries(ANALYSIS_MODES).map(
                    ([key, config]) => {
                      const Icon = config.icon;
                      const active = type === key;

                      return (
                        <motion.button
                          key={key}
                          type="button"
                          whileTap={{ scale: 0.985 }}
                          onClick={() => {
                            setType(key);
                            setResult(null);
                            setError("");
                          }}
                          className={[
                            "group flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 max-sm:min-w-[250px]",
                            active
                              ? "border-indigo-500/30 bg-indigo-500/[0.08] shadow-sm"
                              : "border-slate-200 bg-white/60 hover:border-indigo-300 hover:bg-indigo-500/[0.035] dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-indigo-500/30",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                              active
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
                            ].join(" ")}
                          >
                            <Icon size={16} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                              {config.label}
                            </span>

                            <span className="mt-0.5 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                              {config.description}
                            </span>
                          </span>

                          {active && (
                            <CheckCircle2
                              size={16}
                              className="shrink-0 text-indigo-500"
                            />
                          )}
                        </motion.button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Dataset coverage */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Dataset readiness
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {validEvidence.length} usable of{" "}
                      {projectEvidence.length} evidence items
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {readiness.percentage}%
                    </span>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {readiness.status}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        projectEvidence.length
                          ? (validEvidence.length /
                              projectEvidence.length) *
                            100
                          : 0
                      }%`,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                  />
                </div>
              </div>

              {/* Run button */}
              <motion.button
                whileHover={{
                  y: -2,
                  boxShadow:
                    "0 18px 45px -20px rgba(79,70,229,.6)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis}
                disabled={
                  running ||
                  !projectId ||
                  validEvidence.length === 0
                }
                className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 translate-x-[-110%] bg-white/20 transition-transform duration-700 group-hover:translate-x-[110%]" />

                {running ? (
                  <>
                    <Loader2
                      size={17}
                      className="relative animate-spin"
                    />
                    <span className="relative">
                      Analyzing evidence…
                    </span>
                  </>
                ) : (
                  <>
                    <Play
                      size={17}
                      fill="currentColor"
                      className="relative"
                    />
                    <span className="relative">
                      Run {modeConfig.short} Analysis
                    </span>
                  </>
                )}
              </motion.button>

              {validEvidence.length === 0 && (
                <p className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle size={14} />
                  Add evidence to this project before running AI analysis.
                </p>
              )}
            </div>
          </GlassCard>

          {/* Dataset preview */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeading
                icon={FileSearch}
                eyebrow="Live dataset"
                title="Evidence being analyzed"
                description="These records are sent to the AI engine for the selected project."
              />

              <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Records
                </p>

                <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
                  {validEvidence.length}
                </p>
              </div>
            </div>

            {validEvidence.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="No analyzable evidence"
                description="Create or assign evidence to this project. The analysis engine will automatically use the live records."
              />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={evidenceQuery}
                      onChange={(event) => setEvidenceQuery(event.target.value)}
                      placeholder="Filter evidence by title or content…"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white/75 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                  <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                    <Filter size={14} />
                    {visibleEvidence.length} shown
                  </div>
                </div>

                {visibleEvidence.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No matching evidence"
                    description="Try a different keyword or clear the filter."
                  />
                ) : (
                  visibleEvidence.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={getId(item) || index}
                    variants={fadeUp}
                    className="group rounded-2xl border border-slate-200/80 bg-white/70 p-4 transition hover:border-indigo-300 hover:bg-indigo-500/[0.025] dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-indigo-500/30"
                  >
                    <div className="flex gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-500 dark:bg-white/10 dark:text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item?.title ||
                            `Evidence item ${index + 1}`}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {truncate(getEvidenceText(item), 170)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  ))
                )}

                {visibleEvidence.length > 6 && (
                  <p className="pt-2 text-center text-xs font-medium text-slate-400">
                    + {visibleEvidence.length - 6} additional matching evidence records
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* ERROR                                                            */}
        {/* ---------------------------------------------------------------- */}

        <AnimatePresence initial={false} mode="wait">
          {error && (
            <motion.div
              key="analysis-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-700 dark:text-rose-300"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  Analysis request needs attention
                </p>

                <p className="mt-1 leading-6 opacity-90">
                  {error}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={running || !projectId || validEvidence.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                  >
                    <RefreshCw size={12} />
                    Retry analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-white/70 px-3 py-2 text-[10px] font-black text-rose-700 dark:bg-white/[0.04] dark:text-rose-300"
                  >
                    <RefreshCw size={12} />
                    Refresh data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* RESULTS                                                          */}
        {/* ---------------------------------------------------------------- */}

        <AnimatePresence initial={false} mode="wait">
          {resultData ? (
            <motion.div
              key="analysis-result"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 space-y-6"
            >
              {/* Result header */}
              <GlassCard className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0.8, rotate: -8 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 16,
                      }}
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                    >
                      <BrainCircuit size={22} />
                    </motion.div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                          Analysis complete
                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Live result
                        </span>
                      </div>

                      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                        {modeConfig.label}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {selectedProject
                          ? getProjectName(selectedProject)
                          : "Selected research project"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {resultData.createdAt && (
                      <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                        <Clock3 size={13} />
                        {formatDateTime(resultData.createdAt)}
                      </span>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={runAnalysis}
                      disabled={running}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-400"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          running ? "animate-spin" : ""
                        }
                      />
                      Run again
                    </motion.button>
                  </div>
                </div>
              </GlassCard>

              <motion.div
                variants={fadeUp}
                className="grid gap-3 sm:grid-cols-3"
              >
                {[
                  ["Mode", modeConfig.short, ModeIcon],
                  ["Processed", `${resultData.documentCount} records`, FileSearch],
                  ["Signals", `${resultData.keywords.length + resultData.patterns.length}`, Sparkles],
                ].map(([label, value, Icon]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Coverage + Signal + Summary */}
              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="p-5 sm:p-6">
                  <SectionHeading
                    icon={BarChart3}
                    eyebrow="Dataset coverage"
                    title="Evidence coverage"
                    description="How much of this project's evidence was processed by the current analysis."
                  />

                  <div className="flex items-center gap-7">
                    <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-white/5">
                      <svg
                        className="absolute inset-0 h-full w-full -rotate-90"
                        viewBox="0 0 120 120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="9"
                          className="text-slate-200 dark:text-white/10"
                        />

                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="url(#coverageGradient)"
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={314}
                          initial={{ strokeDashoffset: 314 }}
                          animate={{
                            strokeDashoffset:
                              314 -
                              (314 * coverage) / 100,
                          }}
                          transition={{
                            duration: 1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />

                        <defs>
                          <linearGradient
                            id="coverageGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#6366f1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#a855f7"
                            />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="relative text-center">
                        <p className="text-2xl font-black text-slate-950 dark:text-white">
                          {Math.round(coverage)}%
                        </p>

                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          coverage
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {resultData.documentCount} evidence items analyzed
                      </p>

                      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                        The coverage metric represents dataset
                        processing coverage only. It is not an
                        opportunity or success score.
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <CheckCircle2 size={14} />
                        Analysis output is live
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <SectionHeading
                      icon={Sparkles}
                      eyebrow="AI interpretation"
                      title="AI Executive Summary"
                      description="A concise explanation generated from the analyzed evidence."
                    />
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={copySummary}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400"
                        aria-label="Copy executive summary"
                      >
                        {summaryCopied ? <Check size={12} /> : <Copy size={12} />}
                        {summaryCopied ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSummaryExpanded((value) => !value)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400"
                        aria-expanded={summaryExpanded}
                      >
                        {summaryExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        {summaryExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  <motion.div
                    layout
                    className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.07] via-violet-500/[0.04] to-transparent p-5"
                  >
                    <div className="flex gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <BrainCircuit size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300 ${summaryExpanded ? "" : "line-clamp-5"}`}>
                          {resultData.summary}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span>{resultData.documentCount} evidence items analyzed</span>
                          <span>•</span>
                          <span>{modeConfig.label}</span>
                          {resultData.createdAt && <><span>•</span><span>{formatDateTime(resultData.createdAt)}</span></>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </GlassCard>
              </div>

              {/* ---------------------------------------------------------------- */}
              {/* Intelligence grid                                                */}
              {/* ---------------------------------------------------------------- */}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Keywords */}
                <GlassCard className="p-5 sm:p-6">
                  <SectionHeading
                    icon={Hash}
                    eyebrow="Language signals"
                    title="Keyword intelligence"
                    description="Terms surfaced from the analyzed evidence."
                  />

                  {resultData.keywords.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="No keywords returned"
                      description="The selected analysis mode did not return keyword signals."
                    />
                  ) : (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={keywordQuery}
                            onChange={(event) => setKeywordQuery(event.target.value)}
                            placeholder="Filter keywords…"
                            aria-label="Filter keywords"
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white/70 pl-8 pr-3 text-[11px] font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          />
                        </div>
                        <span className="rounded-xl bg-slate-100 px-2.5 py-2 text-[10px] font-black text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          {visibleKeywords.length}
                        </span>
                      </div>
                      <motion.div
                        variants={stagger}
                        className="flex flex-wrap gap-2"
                      >
                        {visibleKeywords.map(
                          (keyword, index) => (
                          <KeywordChip
                            key={`${keyword}-${index}`}
                            keyword={keyword}
                            index={index}
                          />
                        )
                      )}
                      </motion.div>
                    </>
                  )}
                </GlassCard>

                {/* Sentiment */}
                <GlassCard className="p-5 sm:p-6">
                  <SectionHeading
                    icon={Activity}
                    eyebrow="Emotional signal"
                    title="Sentiment distribution"
                    description="Lexical sentiment signals across analyzed documents."
                  />

                  {sentimentTotal === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="No sentiment distribution"
                      description="The current AI response does not contain sentiment distribution data."
                    />
                  ) : (
                    <div className="space-y-5">
                      <SentimentBar
                        label="Positive"
                        value={resultData.sentiment.positive}
                        total={sentimentTotal}
                        icon={TrendingUp}
                      />

                      <SentimentBar
                        label="Neutral"
                        value={resultData.sentiment.neutral}
                        total={sentimentTotal}
                        icon={Activity}
                      />

                      <SentimentBar
                        label="Negative"
                        value={resultData.sentiment.negative}
                        total={sentimentTotal}
                        icon={TrendingDown}
                      />

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {resultData.sentiment.positive}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">
                            Positive
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-500/10 p-3 text-center">
                          <p className="text-lg font-black text-slate-600 dark:text-slate-300">
                            {resultData.sentiment.neutral}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Neutral
                          </p>
                        </div>

                        <div className="rounded-xl bg-rose-500/10 p-3 text-center">
                          <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                            {resultData.sentiment.negative}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-400/70">
                            Negative
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              <GlassCard className="p-5 sm:p-6">
                <SectionHeading
                  icon={GitBranch}
                  eyebrow="Traceability"
                  title="Evidence → AI insight"
                  description="A visual map of the analytical layers represented by the current live result."
                />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Evidence", validEvidence.length, FileSearch],
                    ["Signals", resultData.keywords.length + sentimentTotal, Sparkles],
                    ["Patterns", resultData.patterns.length, Target],
                    ["Clusters", resultData.clusters.length, Layers3],
                    ["Insights", resultData.summary ? 1 : 0, BrainCircuit],
                  ].map(([label, value, Icon], index, items) => (
                    <div key={label} className="relative flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.025]">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{label}</p>
                        <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{value}</p>
                      </div>
                      {index < items.length - 1 && (
                        <ChevronRight size={13} className="absolute -right-2 z-10 hidden text-slate-300 lg:block dark:text-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* ---------------------------------------------------------------- */}
              {/* Clusters                                                         */}
              {/* ---------------------------------------------------------------- */}

              <GlassCard className="p-5 sm:p-6">
                <SectionHeading
                  icon={Layers3}
                  eyebrow="Semantic intelligence"
                  title="Problem clusters"
                  description="Related evidence grouped by the AI clustering engine."
                />

                {resultData.clusters.length === 0 ? (
                  <EmptyState
                    icon={Layers3}
                    title="No clusters returned"
                    description="Run the Full Intelligence or Problem Clusters mode to populate semantic groups."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {resultData.clusters.map(
                      (cluster, index) => {
                        const clusterEvidence =
                          resolveClusterEvidence(cluster);

                        return (
                          <motion.article
                            key={`${cluster.id}-${index}`}
                            variants={fadeUp}
                            whileHover={{ y: -3 }}
                            className="group rounded-2xl border border-slate-200/80 bg-white/70 p-4 transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-indigo-500/30"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-xs font-black text-indigo-600 dark:text-indigo-400">
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </div>

                              {clusterEvidence.length > 0 && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                                  {clusterEvidence.length} signals
                                </span>
                              )}
                            </div>

                            <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                              {cluster.label}
                            </h3>

                            {clusterEvidence.length > 0 ? (
                              <div className="mt-4 space-y-2">
                                {clusterEvidence
                                  .slice(0, expandedClusters[cluster.id] ? clusterEvidence.length : 3)
                                  .map(
                                    (
                                      evidenceItem,
                                      evidenceIndex
                                    ) => (
                                      <div
                                        key={
                                          getId(
                                            evidenceItem
                                          ) ||
                                          evidenceIndex
                                        }
                                        className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]"
                                      >
                                        <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                                          {truncate(
                                            getEvidenceText(
                                              evidenceItem
                                            ),
                                            115
                                          )}
                                        </p>
                                      </div>
                                    )
                                  )}

                                {clusterEvidence.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedClusters((current) => ({
                                        ...current,
                                        [cluster.id]: !current[cluster.id],
                                      }))
                                    }
                                    className="inline-flex items-center gap-1.5 pt-1 text-[10px] font-black text-indigo-500"
                                  >
                                    {expandedClusters[cluster.id]
                                      ? "Show less"
                                      : `+${clusterEvidence.length - 3} more evidence signals`}
                                    <ChevronDown size={12} className={expandedClusters[cluster.id] ? "rotate-180" : ""} />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {truncate(
                                  String(
                                    cluster.raw?.description ||
                                      cluster.raw?.summary ||
                                      cluster.label
                                  ),
                                  180
                                )}
                              </p>
                            )}
                          </motion.article>
                        );
                      }
                    )}
                  </div>
                )}
              </GlassCard>

              {/* ---------------------------------------------------------------- */}
              {/* Recurring patterns                                               */}
              {/* ---------------------------------------------------------------- */}

              <GlassCard className="p-5 sm:p-6">
                <SectionHeading
                  icon={Target}
                  eyebrow="Pattern intelligence"
                  title="Recurring signals"
                  description="Repeated language and patterns detected across the research dataset."
                />

                {resultData.patterns.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No recurring patterns"
                    description="The current analysis did not return recurring pattern signals."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {resultData.patterns.map(
                      (pattern, index) => (
                        <motion.div
                          key={`${pattern.label}-${index}`}
                          variants={fadeUp}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.025]"
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <Zap size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {pattern.label}
                            </p>

                            {pattern.count !== null && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Detected{" "}
                                <span className="font-bold">
                                  {pattern.count}
                                </span>{" "}
                                time
                                {Number(pattern.count) === 1
                                  ? ""
                                  : "s"}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                )}
              </GlassCard>

              {/* ---------------------------------------------------------------- */}
              {/* Raw engine response                                              */}
              {/* ---------------------------------------------------------------- */}

              <GlassCard className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setShowRaw((value) => !value)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
                      <Search size={15} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Engine response
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Inspect the raw dynamic response returned by the AI service.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        <span>{modeConfig.short}</span>
                        <span>•</span>
                        <span>{resultData.documentCount} records</span>
                        {resultData.createdAt && <><span>•</span><span>{formatDateTime(resultData.createdAt)}</span></>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        copyRawResult();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </motion.button>
                    <ChevronDown
                      size={17}
                      className={`text-slate-400 transition-transform ${
                        showRaw ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {showRaw && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      className="overflow-hidden"
                    >
                      <pre className="mt-5 max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-[11px] leading-6 text-slate-300 dark:border-white/10">
                        {JSON.stringify(
                          resultData.raw,
                          null,
                          2
                        )}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="analysis-empty"
              variants={fadeUp}
              className="mt-6"
            >
              <GlassCard className="p-8 sm:p-12">
                <div className="mx-auto max-w-2xl text-center">
                  <motion.div
                    animate={floatAnimation}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-400"
                  >
                    <BrainCircuit size={34} />
                  </motion.div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                    Intelligence workspace
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                    Your research intelligence is waiting.
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Select a project, choose an analysis pipeline and
                    run the AI engine. Results will appear here with
                    live evidence coverage, semantic clusters,
                    sentiment signals and recurring patterns.
                  </p>

                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {[
                      "Keywords",
                      "Sentiment",
                      "Clusters",
                      "Patterns",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}