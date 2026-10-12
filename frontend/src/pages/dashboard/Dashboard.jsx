import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  FolderKanban,
  Lightbulb,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  dashboardApi,
  extractData,
  getApiErrorMessage,
} from "../../services/api";

const EMPTY_SUMMARY = {
  totalProjects: 0,
  activeProjects: 0,
  totalEvidence: 0,
  totalProblems: 0,
  totalReports: 0,
  opportunityScore: 0,
};

const EASE = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

const panel =
  "min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm " +
  "dark:border-white/[0.08] dark:bg-[#111522]";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl " +
  "bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition " +
  "hover:bg-indigo-500 active:scale-[.98] focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50";

const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl " +
  "border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold " +
  "text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 " +
  "dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";

const STAT_CARDS = [
  {
    key: "totalProjects",
    title: "Total projects",
    description: "Research in your workspace",
    icon: FolderKanban,
    gradient: "from-indigo-500 to-violet-600",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  },
  {
    key: "totalEvidence",
    title: "Evidence collected",
    description: "Structured research records",
    icon: FileText,
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    key: "totalProblems",
    title: "Problems discovered",
    description: "Potential opportunities",
    icon: Lightbulb,
    gradient: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    key: "opportunityScore",
    title: "Opportunity score",
    description: "Workspace intelligence score",
    icon: TrendingUp,
    gradient: "from-emerald-400 to-teal-600",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    percent: true,
  },
];

const QUICK_ACTIONS = [
  {
    title: "New project",
    description: "Start a research workspace",
    icon: FolderKanban,
    href: "/projects",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  },
  {
    title: "Explore problems",
    description: "Review discovered opportunities",
    icon: Lightbulb,
    href: "/problems",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    title: "AI analysis",
    description: "Investigate research patterns",
    icon: BrainCircuit,
    href: "/analysis",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    title: "Evidence library",
    description: "Review collected evidence",
    icon: FileText,
    href: "/evidence",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
];

const ACTIVITY_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PROJECT", label: "Projects" },
  { value: "EVIDENCE", label: "Evidence" },
  { value: "PROBLEM", label: "Problems" },
];

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, number(value)));
}

function normalizeSummary(data = {}) {
  return {
    totalProjects: number(data.totalProjects ?? data.projectsCount),
    activeProjects: number(data.activeProjects),
    totalEvidence: number(
      data.totalEvidence ?? data.evidenceCollected ?? data.evidenceCount
    ),
    totalProblems: number(
      data.totalProblems ?? data.problemsDiscovered ?? data.problemsCount
    ),
    totalReports: number(data.totalReports),
    opportunityScore: clamp(
      data.opportunityScore ?? data.averageOpportunityScore
    ),
  };
}

function normalizeList(response) {
  const data = extractData(response, []);
  if (Array.isArray(data)) return data;

  const list =
    data?.items ??
    data?.results ??
    data?.activities ??
    data?.projects ??
    data?.data;

  return Array.isArray(list) ? list : [];
}

function normalizeType(value) {
  const type = String(value || "").toUpperCase();
  if (type.includes("PROJECT")) return "PROJECT";
  if (type.includes("EVIDENCE")) return "EVIDENCE";
  if (type.includes("PROBLEM")) return "PROBLEM";
  return "OTHER";
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function relativeTime(value) {
  const date = safeDate(value);
  if (!date) return "Recently";

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatNumber(value) {
  return number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function getProjectName(project) {
  return project?.name || project?.title || "Untitled project";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Researcher"
  );
}

function CountUp({ value, percent = false }) {
  const reduceMotion = useReducedMotion();
  const target = number(value);
  const [current, setCurrent] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) {
      setCurrent(target);
      return undefined;
    }

    let frame;
    let start;

    const animate = (time) => {
      if (start === undefined) start = time;
      const progress = Math.min(1, (time - start) / 650);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(target * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return <>{percent ? `${Math.round(current)}%` : formatNumber(current)}</>;
}

function SectionHeading({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 break-words text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <main
      className="mx-auto w-full max-w-[1600px] space-y-5 px-3 py-5 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="h-60 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}

function StatCard({ definition, summary, index }) {
  const Icon = definition.icon;
  const value = summary[definition.key];

  let progress = 0;
  if (definition.key === "opportunityScore") {
    progress = clamp(value);
  } else if (definition.key === "totalProjects") {
    progress = summary.totalProjects
      ? clamp((summary.activeProjects / summary.totalProjects) * 100)
      : 0;
  } else {
    // Decorative scale only; not a calculated performance score.
    progress = value > 0 ? clamp(25 + Math.log10(value + 1) * 25) : 0;
  }

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`${panel} group relative overflow-hidden p-4 transition-shadow hover:shadow-lg hover:shadow-indigo-500/[.06] sm:p-5`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/[.06] blur-3xl transition-transform duration-500 group-hover:scale-125"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500 dark:text-slate-400 sm:text-xs">
            {definition.title}
          </p>
          <p className="mt-4 break-words text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            <CountUp value={value} percent={definition.percent} />
          </p>
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${definition.iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="relative mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {definition.key === "totalProjects"
          ? `${formatNumber(summary.activeProjects)} active project(s)`
          : definition.description}
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, delay: index * 0.07 }}
          className={`h-full rounded-full bg-gradient-to-r ${definition.gradient}`}
        />
      </div>
    </motion.article>
  );
}

function StatusPill({ status }) {
  const completed = ["COMPLETE", "COMPLETED"].includes(status);
  const active = ["ACTIVE", "IN_PROGRESS", "IN PROGRESS"].includes(status);

  const styles = completed
    ? "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    : active
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[.06] dark:text-slate-300";

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${completed ? "bg-sky-500" : active ? "bg-emerald-500" : "bg-slate-400"}`} />
      <span className="break-words">{status.replaceAll("_", " ")}</span>
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-white/10">
      <div className="max-w-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[.06] dark:text-slate-300">
          <Icon size={23} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

function ProjectActivityChart({ projects }) {
  const reduceMotion = useReducedMotion();

  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));

      const count = projects.filter((project) => {
        const date = safeDate(project.createdAt);
        return (
          date &&
          date.getFullYear() === day.getFullYear() &&
          date.getMonth() === day.getMonth() &&
          date.getDate() === day.getDate()
        );
      }).length;

      return {
        label: day.toLocaleDateString("en-IN", { weekday: "short" }),
        count,
      };
    });
  }, [projects]);

  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div>
      <div className="flex h-32 items-end gap-2 sm:gap-3">
        {data.map((item, index) => {
          const height = item.count ? Math.max(12, (item.count / max) * 100) : 5;
          return (
            <div
              key={`${item.label}-${index}`}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${item.label}: ${item.count} project(s) created`}
            >
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {item.count || ""}
              </span>
              <motion.div
                initial={reduceMotion ? false : { height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                className={`w-full max-w-9 rounded-t-lg ${item.count ? "bg-gradient-to-t from-indigo-600 to-violet-400" : "bg-slate-200 dark:bg-white/10"}`}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.label}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        Based on project creation dates returned by your API. This is not a complete event analytics feed.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const requestIdRef = useRef(0);
  const loadedRef = useRef(false);
  const inFlightRef = useRef(false);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);

  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");
  const [showAllProjects, setShowAllProjects] = useState(false);

  const load = useCallback(async (manual = false) => {
    if (inFlightRef.current && !manual) return;

    inFlightRef.current = true;
    const requestId = ++requestIdRef.current;

    if (loadedRef.current || manual) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const results = await Promise.allSettled([
        dashboardApi.summary(),
        dashboardApi.projects(),
        dashboardApi.activity(),
      ]);

      if (requestId !== requestIdRef.current) return;

      const [summaryResult, projectsResult, activityResult] = results;
      const failures = [];

      if (summaryResult.status === "fulfilled") {
        setSummary(normalizeSummary(extractData(summaryResult.value, {}) || {}));
      } else {
        failures.push("summary");
      }

      if (projectsResult.status === "fulfilled") {
        setProjects(normalizeList(projectsResult.value));
      } else {
        failures.push("projects");
      }

      if (activityResult.status === "fulfilled") {
        setActivity(normalizeList(activityResult.value));
      } else {
        failures.push("activity");
      }

      if (failures.length === 3) {
        throw summaryResult.reason || new Error("All dashboard requests failed.");
      }

      if (failures.length) {
        setError(`Some data could not be refreshed (${failures.join(", ")}). Please retry.`);
      }

      setLastSynced(new Date());
      loadedRef.current = true;
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(getApiErrorMessage(err, "Unable to load workspace data. Please try again."));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
        inFlightRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    load(false);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load(false);
    }, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") load(false);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      requestIdRef.current += 1;
      inFlightRef.current = false;
    };
  }, [load]);

  const normalizedProjects = useMemo(
    () =>
      projects.map((project, index) => ({
        ...project,
        id: project._id || project.id || `project-${index}`,
        name: getProjectName(project),
        status: String(project.status || "DRAFT").trim().toUpperCase(),
        tags: Array.isArray(project.tags) ? project.tags : [],
      })),
    [projects]
  );

  const statusCounts = useMemo(() => {
    const counts = { ACTIVE: 0, COMPLETED: 0, OTHER: 0 };

    normalizedProjects.forEach((project) => {
      if (["ACTIVE", "IN_PROGRESS", "IN PROGRESS"].includes(project.status)) {
        counts.ACTIVE += 1;
      } else if (["COMPLETED", "COMPLETE"].includes(project.status)) {
        counts.COMPLETED += 1;
      } else {
        counts.OTHER += 1;
      }
    });

    return counts;
  }, [normalizedProjects]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();

    return normalizedProjects.filter((project) => {
      const searchable = [project.name, project.description, ...project.tags]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "ALL" || project.status === statusFilter)
      );
    });
  }, [normalizedProjects, projectSearch, statusFilter]);

  const visibleProjects = showAllProjects
    ? filteredProjects
    : filteredProjects.slice(0, 6);

  const visibleActivity = useMemo(
    () =>
      activity
        .filter((item) => activityFilter === "ALL" || normalizeType(item.type) === activityFilter)
        .slice()
        .sort(
          (a, b) =>
            (safeDate(b.createdAt)?.getTime() || 0) -
            (safeDate(a.createdAt)?.getTime() || 0)
        )
        .slice(0, 8),
    [activity, activityFilter]
  );

  const motionProps = reduceMotion
    ? {}
    : { variants: containerVariants, initial: "hidden", animate: "show" };

  if (loading && !loadedRef.current) return <SkeletonDashboard />;

  return (
    <motion.main
      {...motionProps}
      className="relative isolate mx-auto w-full min-w-0 max-w-[1600px] space-y-5 overflow-x-clip px-3 pb-10 pt-4 sm:space-y-6 sm:px-5 sm:pt-6 lg:px-8 lg:pt-8"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[440px] overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-500/[.08] blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-violet-500/[.08] blur-3xl sm:h-96 sm:w-96" />
      </div>

      {/* Hero */}
      <motion.section
        variants={itemVariants}
        className="relative isolate overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1020] p-5 text-white shadow-xl sm:p-7 lg:p-9"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,.27),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,.16),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 hidden h-72 w-72 rounded-full border border-white/[.07] sm:block" />
        <div className="relative grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-indigo-200 sm:text-[11px]">
              <Sparkles size={13} />
              ProblemLens Intelligence Workspace
            </div>
            <h1 className="mt-5 break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {getGreeting()},
              <br className="hidden sm:block" />{" "}
              <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-sky-200 bg-clip-text text-transparent">
                {getDisplayName(user)}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Discover real-world problems, organize research evidence, and turn useful signals into actionable opportunities.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${error ? "bg-amber-400" : "bg-emerald-400"}`} />
                {error ? "Some data needs attention" : "Workspace connected"}
              </span>
              {lastSynced && (
                <span>
                  Updated {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap xl:min-w-[205px] xl:flex-col">
            <button type="button" onClick={() => load(true)} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[.12] disabled:opacity-50">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh workspace"}
            </button>
            <Link to="/projects" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:brightness-110 active:scale-[.98]">
              <Plus size={17} />
              Create a project
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            role="alert"
            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[.07] dark:text-amber-200 sm:flex-row sm:items-center"
          >
            <AlertCircle size={19} className="shrink-0" />
            <p className="min-w-0 flex-1 break-words text-sm">{error}</p>
            <button type="button" onClick={() => load(true)} disabled={refreshing} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-xs font-bold transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-400/20 dark:hover:bg-amber-400/10">
              <RefreshCw size={14} /> Retry
            </button>
            <button type="button" aria-label="Dismiss error" onClick={() => setError("")} className="self-end rounded-lg p-1 hover:bg-amber-200/50 sm:self-auto">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics */}
      <motion.section {...motionProps} aria-label="Workspace statistics" className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {STAT_CARDS.map((definition, index) => (
          <StatCard key={definition.key} definition={definition} summary={summary} index={index} />
        ))}
      </motion.section>

      {/* Quick actions */}
      <motion.section variants={itemVariants} className={`${panel} p-4 sm:p-5`}>
        <SectionHeading icon={Zap} eyebrow="Work smarter" title="Quick actions" description="Jump straight into your next research task." />
        <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.title} whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
                <Link to={action.href} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-white/[.07] dark:hover:border-indigo-400/20 dark:hover:bg-indigo-400/[.04] sm:p-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold text-slate-900 dark:text-white">{action.title}</p>
                    <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{action.description}</p>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Analytics */}
      <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <motion.section variants={itemVariants} className={`${panel} min-w-0 p-4 sm:p-5 lg:p-6`}>
          <SectionHeading icon={BarChart3} eyebrow="Research momentum" title="Project creation" description="A seven-day view based on project creation dates." />
          <div className="mt-6">
            <ProjectActivityChart projects={normalizedProjects} />
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className={`${panel} min-w-0 p-4 sm:p-5 lg:p-6`}>
          <SectionHeading icon={Target} eyebrow="Portfolio overview" title="Project status" description="How your current projects are distributed." />
          {normalizedProjects.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={FolderKanban} title="No projects to analyze" description="Create a project to start building your research portfolio.">
                <Link to="/projects" className={primaryButton}><Plus size={15} /> Create project</Link>
              </EmptyState>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {[
                { label: "Active", value: statusCounts.ACTIVE, color: "bg-emerald-500" },
                { label: "Completed", value: statusCounts.COMPLETED, color: "bg-sky-500" },
                { label: "Other statuses", value: statusCounts.OTHER, color: "bg-violet-500" },
              ].map((item, index) => {
                const percent = (item.value / normalizedProjects.length) * 100;
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">{item.value} · {Math.round(percent)}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[.07]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.6, delay: index * 0.08 }} className={`h-full rounded-full ${item.color}`} />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-400/[.07]">
                <Target size={17} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
                <p className="text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
                  Status totals are calculated from projects returned by your backend. Unrecognized statuses are grouped under “Other statuses”.
                </p>
              </div>
            </div>
          )}
        </motion.section>
      </section>

      {/* Activity feed */}
      <motion.section variants={itemVariants} className={`${panel} min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6`}>
        <SectionHeading icon={Activity} eyebrow="Workspace pulse" title="Recent activity" description="Recent research events returned by your backend." action={<span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(activity.length)} records</span>} />

        <div className="mt-5 flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-white/[.04]">
          {ACTIVITY_FILTERS.map((filter) => {
            const active = activityFilter === filter.value;
            return (
              <button key={filter.value} type="button" aria-pressed={active} onClick={() => setActivityFilter(filter.value)} className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-semibold transition ${active ? "bg-white text-indigo-700 shadow-sm dark:bg-[#252b3b] dark:text-indigo-200" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {visibleActivity.map((item, index) => {
              const type = normalizeType(item.type);
              const Icon = type === "PROJECT" ? FolderKanban : type === "PROBLEM" ? Lightbulb : type === "EVIDENCE" ? FileText : Activity;
              const key = item._id || item.id || `${type}-${item.createdAt || "record"}-${index}`;

              return (
                <motion.article key={key} layout={!reduceMotion} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.18 }} className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-white/[.06] dark:hover:border-indigo-400/20 dark:hover:bg-indigo-400/[.04] sm:items-center sm:p-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[.06] dark:text-slate-300"><Icon size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.title || item.name || "Workspace update"}</p>
                    <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.description || "A research record was updated."}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock3 size={11} />{relativeTime(item.createdAt || item.updatedAt)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold dark:bg-white/[.06]">{type}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="mt-1 shrink-0 text-slate-300 dark:text-slate-600" />
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {visibleActivity.length === 0 && (
          <div className="mt-4">
            <EmptyState icon={Activity} title="No matching activity" description={activity.length === 0 ? "Activity will appear here as your workspace changes." : "Try another filter to see more activity."}>
              {activityFilter !== "ALL" && <button type="button" onClick={() => setActivityFilter("ALL")} className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Clear filter</button>}
            </EmptyState>
          </div>
        )}
      </motion.section>

      {/* Project portfolio */}
      <motion.section variants={itemVariants} className={`${panel} min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6`}>
        <SectionHeading
          icon={FolderKanban}
          eyebrow="Your research"
          title="Project portfolio"
          description={`${formatNumber(normalizedProjects.length)} project(s) available.`}
          action={<Link to="/projects" className={secondaryButton}>Manage projects <ArrowUpRight size={15} /></Link>}
        />

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative min-w-0">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search projects, descriptions, tags..."
              value={projectSearch}
              onChange={(event) => { setProjectSearch(event.target.value); setShowAllProjects(false); }}
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.03] dark:text-white dark:focus:bg-white/[.05]"
            />
            {projectSearch && <button type="button" aria-label="Clear project search" onClick={() => setProjectSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"><X size={15} /></button>}
          </div>

          <select aria-label="Filter projects by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setShowAllProjects(false); }} className="min-h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-200">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing {visibleProjects.length} of {filteredProjects.length} matching project(s)
        </p>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-white/[.07]">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project, index) => (
              <motion.div key={project.id} layout={!reduceMotion} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.18, delay: index * 0.02 }}>
                <Link to={`/projects/${encodeURIComponent(project.id)}`} className="group flex min-w-0 flex-col gap-3 rounded-xl px-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 sm:px-3 dark:hover:bg-white/[.03]">
                  <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-700 transition group-hover:scale-105 dark:text-indigo-200"><FolderKanban size={19} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">{project.name}</p>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">{project.description || "Research project"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span>Updated {relativeTime(project.updatedAt || project.createdAt)}</span>
                        {project.tags.slice(0, 3).map((tag, tagIndex) => <span key={`${String(tag)}-${tagIndex}`} className="max-w-full break-all rounded-md bg-slate-100 px-2 py-0.5 dark:bg-white/[.06]">#{String(tag)}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-14 sm:pl-0">
                    <StatusPill status={project.status} />
                    <ChevronRight size={17} className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visibleProjects.length === 0 && (
          <div className="mt-4">
            <EmptyState icon={FolderKanban} title={normalizedProjects.length === 0 ? "Start your first project" : "No matching projects"} description={normalizedProjects.length === 0 ? "Create a project to organize evidence and investigate a problem." : "Try another search term or change the status filter."}>
              {normalizedProjects.length === 0
                ? <Link to="/projects" className={primaryButton}><Plus size={15} /> Create project</Link>
                : <button type="button" onClick={() => { setProjectSearch(""); setStatusFilter("ALL"); }} className={secondaryButton}>Clear filters</button>}
            </EmptyState>
          </div>
        )}

        {filteredProjects.length > 6 && (
          <button type="button" onClick={() => setShowAllProjects((value) => !value)} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-white/10 dark:text-slate-200 dark:hover:text-indigo-200 sm:w-auto">
            {showAllProjects ? "Show fewer projects" : "Show all projects"}
            <ArrowRight size={14} />
          </button>
        )}
      </motion.section>

      {/* AI call-to-action */}
      <motion.section variants={itemVariants} className="relative isolate overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#151b3b] via-[#28215b] to-[#432477] p-5 text-white sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="relative flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10"><BrainCircuit size={23} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-200">AI intelligence</p>
              <h2 className="mt-1 break-words text-xl font-black sm:text-2xl">Turn research into meaningful insights.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/75">
                Explore your analysis workspace to investigate evidence, patterns, and problem opportunities using your configured AI service.
              </p>
            </div>
          </div>
          <Link to="/analysis" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 transition hover:bg-indigo-50">
            Open AI analysis <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>

      <motion.footer variants={itemVariants} className="flex min-w-0 flex-col gap-3 border-t border-slate-200/80 px-1 pt-4 text-xs text-slate-500 dark:border-white/[.07] dark:text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${error ? "bg-amber-500" : "bg-emerald-500"}`} />
          {error ? "Sync needs attention" : "ProblemLens workspace"}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>{formatNumber(summary.totalProjects)} projects</span>
          <span>{formatNumber(summary.totalEvidence)} evidence records</span>
          <span>{formatNumber(summary.totalReports)} reports</span>
          <button type="button" onClick={() => load(true)} disabled={refreshing} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-400/10">
            {refreshing ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
            {refreshing ? "Syncing..." : "Sync now"}
          </button>
        </div>
      </motion.footer>
    </motion.main>
  );
}
