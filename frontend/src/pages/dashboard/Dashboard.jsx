import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Flame,
  FolderKanban,
  Gauge,
  Layers,
  Lightbulb,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { dashboardApi, extractData, getApiErrorMessage } from "../../services/api";

/* =========================================================
   CONFIG & MOTION VARIANTS
========================================================= */

const EMPTY = {
  totalProjects: 0,
  activeProjects: 0,
  totalEvidence: 0,
  totalProblems: 0,
  totalReports: 0,
  opportunityScore: 0,
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

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function score(value) {
  const n = number(value);
  return `${Math.round(n)}%`;
}

function relativeTime(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function displayName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Researcher"
  );
}

function unwrapList(response) {
  const data = extractData(response, []);
  if (Array.isArray(data)) return data;

  return (
    data?.items ||
    data?.results ||
    data?.activities ||
    data?.projects ||
    []
  );
}

/* =========================================================
   UI SUBCOMPONENTS
========================================================= */

function PremiumStatCard({ icon: Icon, label, value, detail, badgeText, progress, gradient, glowColor }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-3xl transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700/80"
    >
      {/* Ambient Glow */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-125 group-hover:opacity-35 ${glowColor}`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </span>
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${gradient} text-white shadow-md`}>
            <Icon size={18} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
            {badgeText && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Flame size={11} />
                {badgeText}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {detail}
          </p>

          {/* Mini Visual Progress Bar */}
          {progress !== undefined && (
            <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${gradient}`}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="h-64 animate-pulse rounded-[32px] bg-slate-200/70 dark:bg-slate-800/50" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[26px] bg-slate-200/70 dark:bg-slate-800/50" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="h-[460px] animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-800/50" />
        <div className="h-[460px] animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-800/50" />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD COMPONENT
========================================================= */

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(EMPTY);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters & Search State
  const [activityFilter, setActivityFilter] = useState("ALL");
  const [projectSearch, setProjectSearch] = useState("");

  const load = useCallback(async (manual = false) => {
    setRefreshing(manual);
    if (!manual) setLoading(true);
    setError("");

    try {
      const [summaryRes, projectsRes, activityRes] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.projects(),
        dashboardApi.activity(),
      ]);

      const summaryData = extractData(summaryRes, {}) || {};
      setSummary({
        ...EMPTY,
        ...summaryData,
        totalProjects: number(summaryData.totalProjects ?? summaryData.projectsCount),
        activeProjects: number(summaryData.activeProjects),
        totalEvidence: number(summaryData.totalEvidence ?? summaryData.evidenceCollected ?? summaryData.evidenceCount),
        totalProblems: number(summaryData.totalProblems ?? summaryData.problemsDiscovered ?? summaryData.problemsCount),
        totalReports: number(summaryData.totalReports),
        opportunityScore: number(summaryData.opportunityScore ?? summaryData.averageOpportunityScore),
      });

      setProjects(unwrapList(projectsRes));
      setActivity(unwrapList(activityRes));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sync live workspace data."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const timer = window.setInterval(() => load(true), 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const name = (p.name || p.title || "").toLowerCase();
        return name.includes(projectSearch.toLowerCase());
      })
      .slice(0, 6)
      .map((project) => ({
        id: project._id || project.id,
        name: project.name || project.title || "Untitled project",
        status: String(project.status || "DRAFT").toUpperCase(),
        tags: Array.isArray(project.tags) ? project.tags : [],
        updatedAt: project.updatedAt || project.createdAt,
      }));
  }, [projects, projectSearch]);

  // Filtered Activity Rows
  const filteredActivity = useMemo(() => {
    let list = activity.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activityFilter !== "ALL") {
      list = list.filter((item) => String(item.type).toLowerCase() === activityFilter.toLowerCase());
    }
    return list.slice(0, 7);
  }, [activity, activityFilter]);

  if (loading) return <Skeleton />;

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto max-w-[1600px] space-y-6 p-4 pb-16 sm:p-6 lg:p-8"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[450px] overflow-hidden">
        <div className="absolute left-[20%] top-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-[20%] top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Hero Header Banner */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-950 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-slate-950/30"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(139,92,246,0.10),transparent_40%)]" />

        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-xl">
              <Sparkles size={13} className="animate-pulse text-indigo-400" />
              Live Workspace Operating System
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {displayName(user)}
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Workspace telemetry active. All continuous research pipelines, evidence collectors, and problem validation models are running online.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-indigo-400" : ""} />
              <span>{refreshing ? "Syncing..." : "Sync Live Data"}</span>
            </button>
            <Link
              to="/projects"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={16} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Error Alert Box */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-700 dark:text-amber-400"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Metrics Grid */}
      <motion.section variants={itemVariants} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumStatCard
          icon={FolderKanban}
          label="Total Projects"
          value={number(summary.totalProjects)}
          detail={`${number(summary.activeProjects)} active research track(s)`}
          progress={(summary.activeProjects / (summary.totalProjects || 1)) * 100}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          glowColor="bg-indigo-500"
        />
        <PremiumStatCard
          icon={FileText}
          label="Evidence Vault"
          value={number(summary.totalEvidence)}
          detail="Live structured entries"
          progress={Math.min(100, summary.totalEvidence * 5)}
          gradient="bg-gradient-to-br from-sky-500 to-blue-600"
          glowColor="bg-sky-500"
        />
        <PremiumStatCard
          icon={Lightbulb}
          label="Validated Problems"
          value={number(summary.totalProblems)}
          detail="Opportunities identified"
          progress={Math.min(100, summary.totalProblems * 10)}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          glowColor="bg-amber-500"
        />
        <PremiumStatCard
          icon={TrendingUp}
          label="Opportunity Score"
          value={score(summary.opportunityScore)}
          detail={`${number(summary.totalReports)} intelligence report(s)`}
          badgeText="High Quality"
          progress={summary.opportunityScore}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          glowColor="bg-emerald-500"
        />
      </motion.section>

      {/* Main Grid: Activity + AI Hub */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        {/* Interactive Activity Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Activity Stream</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time telemetry across workspace</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
              {["ALL", "PROJECT", "EVIDENCE", "PROBLEM"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivityFilter(tab)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activityFilter === tab
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredActivity.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="text-center p-6">
                <Gauge className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No matching activity found
                </p>
                <p className="mt-1 text-xs text-slate-500">Try switching your filter or creating new records.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredActivity.map((item, index) => (
                <motion.div
                  key={item.id || `${item.type}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3.5 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-slate-800/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-indigo-400">
                    {item.type === "project" ? (
                      <FolderKanban size={18} />
                    ) : item.type === "problem" ? (
                      <Lightbulb size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title || "Workspace Action"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">{item.description || "Updated dataset record"}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 shrink-0 text-[11px]">
                        <Clock size={11} />
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Intelligence Hub Banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-2xl shadow-indigo-600/20 flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-indigo-200">
              <BrainCircuit size={18} />
              <span className="text-[11px] font-bold uppercase tracking-widest">AI Intelligence Layer</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Turn Evidence into Market Signals.</h2>
            <p className="text-xs leading-relaxed text-indigo-100/80">
              Automate qualitative analysis, pattern extraction, and problem validation across your workspace.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                [FileText, "Collect", "Ingest primary & secondary research."],
                [Target, "Validate", "Rank priority problems using confidence scores."],
                [Zap, "Synthesize", "Generate production-ready intelligence reports."],
              ].map(([Icon, title, text]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[11px] text-indigo-100/70">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/analysis"
            className="group relative z-10 mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-xs font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-[0.99]"
          >
            <span>Launch AI Engine</span>
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </section>

      {/* Portfolio Tracker Section with Live Search */}
      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-3xl dark:border-slate-800/80 dark:bg-slate-900/60"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Research Portfolio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tracked projects and active discovery status</p>
            </div>
          </div>

          {/* Search Bar & Manage Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="h-9 w-44 rounded-xl border border-slate-200/80 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white sm:w-56"
              />
            </div>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Manage portfolio
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="grid min-h-[180px] place-items-center rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
            <div>
              <CheckCircle2 className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No projects found</p>
              <p className="mt-1 text-xs text-slate-500">Try updating your search query or add a new project.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group flex flex-col gap-4 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:px-3 rounded-2xl dark:hover:bg-slate-800/40"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  <FolderKanban size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>Updated {relativeTime(project.updatedAt)}</span>
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      project.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {project.status}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* Footer Telemetry Status */}
      <motion.footer
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs font-medium text-slate-400"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Live API Connected · Database Sync Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{number(summary.totalProjects)} projects in active workspace</span>
        </div>
      </motion.footer>
    </motion.main>
  );
}