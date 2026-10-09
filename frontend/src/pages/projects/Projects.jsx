import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  Grid2X2,
  LayoutList,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Users,
  X,
  AlertCircle,
  Database,
  Layers3,
  BarChart3,
  Edit3,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  evidenceApi,
  extractList,
  problemApi,
  projectApi,
} from "../../services/api";

/* =========================================================
   PAGE ANIMATIONS
========================================================= */

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,
    transition: {
      duration: 0.45,
      staggerChildren: 0.06,
    },
  },
};

const sectionVariants = {
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

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985,
  },

  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(index * 0.035, 0.25),
      type: "spring",
      stiffness: 280,
      damping: 25,
    },
  }),

  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 18,
  },

  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  },

  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.18,
    },
  },
};

/* =========================================================
   PREMIUM CARD
========================================================= */

function PremiumCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        border border-slate-200/80
        bg-white shadow-sm
        transition-all duration-300
        dark:border-slate-800
        dark:bg-slate-900
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =========================================================
   PREMIUM BUTTON
========================================================= */

function PremiumButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}) {
  const styles =
    variant === "secondary"
      ? `
        border border-slate-200
        bg-white
        text-slate-700
        hover:bg-slate-50
        dark:border-slate-700
        dark:bg-slate-900
        dark:text-slate-200
        dark:hover:bg-slate-800
      `
      : `
        bg-slate-950
        text-white
        hover:bg-slate-800
        dark:bg-white
        dark:text-slate-950
        dark:hover:bg-slate-200
      `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2.5
        text-sm
        font-semibold
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-lg
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${styles}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   SAFE HELPERS
========================================================= */

function getProjectId(project) {
  return (
    project?._id ||
    project?.id ||
    project?.projectId ||
    project?.uuid ||
    ""
  );
}

function getProjectName(project) {
  return (
    project?.name ||
    project?.title ||
    project?.projectName ||
    "Untitled project"
  );
}

function getProjectDescription(project) {
  return (
    project?.description ||
    project?.summary ||
    project?.details ||
    "No project description has been added yet."
  );
}

/*
 * Backend Project schema does not have a `category`
 * field. We therefore support:
 *
 * category
 * type
 * domain
 * industry
 * tags[0]
 */
function getProjectCategory(project) {
  const category =
    project?.category ||
    project?.type ||
    project?.domain ||
    project?.industry;

  if (category) {
    return String(category);
  }

  if (
    Array.isArray(project?.tags) &&
    project.tags.length > 0
  ) {
    return String(project.tags[0]);
  }

  return "General";
}

function getProjectOwner(project) {
  if (typeof project?.owner === "string") {
    return project.owner;
  }

  if (project?.owner?.name) {
    return project.owner.name;
  }

  if (project?.owner?.email) {
    return project.owner.email;
  }

  if (project?.createdBy?.name) {
    return project.createdBy.name;
  }

  if (project?.createdBy?.email) {
    return project.createdBy.email;
  }

  return "Workspace owner";
}

function getProjectStatus(project) {
  const value =
    project?.status ||
    project?.state ||
    project?.projectStatus ||
    "ACTIVE";

  return String(value).toLowerCase();
}

function getStatusLabel(status) {
  const normalized = String(status)
    .toLowerCase()
    .trim();

  const labels = {
    active: "Active",
    completed: "Completed",
    archived: "Archived",
    draft: "Draft",
    paused: "Paused",
    pending: "Pending",
  };

  return (
    labels[normalized] ||
    normalized
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
}

function getStatusStyles(status) {
  const normalized = String(status)
    .toLowerCase()
    .trim();

  switch (normalized) {
    case "completed":
      return {
        icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
      };

    case "archived":
      return {
        icon: Archive,
        className:
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };

    case "paused":
      return {
        icon: Clock3,
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
      };

    case "draft":
      return {
        icon: FileText,
        className:
          "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
      };

    case "pending":
      return {
        icon: Clock3,
        className:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300",
      };

    default:
      return {
        icon: Activity,
        className:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
      };
  }
}

function getDateValue(project) {
  return (
    project?.updatedAt ||
    project?.createdAt ||
    project?.date ||
    project?.updated_at ||
    project?.created_at ||
    null
  );
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMetricNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getEvidenceCount(project) {
  return getMetricNumber(
    project?.evidenceCount ??
      project?.evidence_count ??
      project?.evidence?.length ??
      project?.metrics?.evidence ??
      project?.stats?.evidence ??
      project?.evidence
  );
}

function getProblemCount(project) {
  return getMetricNumber(
    project?.problemCount ??
      project?.problem_count ??
      project?.problemsCount ??
      project?.problems?.length ??
      project?.metrics?.problems ??
      project?.stats?.problems ??
      project?.problems
  );
}

function getSolutionCount(project) {
  return getMetricNumber(
    project?.solutionCount ??
      project?.solution_count ??
      project?.solutionsCount ??
      project?.solutions?.length ??
      project?.metrics?.solutions ??
      project?.stats?.solutions ??
      project?.solutions
  );
}

/* =========================================================
   RELATION HELPERS
========================================================= */

function getRelationProjectId(item) {
  const relation =
    item?.projectId ??
    item?.project ??
    item?.project_id;

  if (!relation) {
    return "";
  }

  if (typeof relation === "string") {
    return relation;
  }

  if (typeof relation === "number") {
    return String(relation);
  }

  if (relation?._id) {
    return String(relation._id);
  }

  if (relation?.id) {
    return String(relation.id);
  }

  if (
    typeof relation?.toString === "function"
  ) {
    const value = relation.toString();

    if (
      value &&
      value !== "[object Object]"
    ) {
      return String(value);
    }
  }

  return "";
}

function buildCountMap(items) {
  const map = new Map();

  if (!Array.isArray(items)) {
    return map;
  }

  items.forEach((item) => {
    const projectId =
      getRelationProjectId(item);

    if (!projectId) {
      return;
    }

    const key = String(projectId);

    map.set(
      key,
      (map.get(key) || 0) + 1
    );
  });

  return map;
}

/* =========================================================
   PAGINATED COLLECTION LOADER
========================================================= */

async function fetchAllCollection(
  apiMethod,
  pageSize = 100
) {
  const allItems = [];

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await apiMethod({
      page,
      limit: pageSize,
    });

    const items = extractList(response);

    if (Array.isArray(items)) {
      allItems.push(...items);
    }

    const pagination =
      response?.data?.pagination ||
      response?.pagination ||
      {};

    totalPages = Math.max(
      Number(
        pagination.totalPages ||
          pagination.pages ||
          1
      ),
      1
    );

    page += 1;

    /*
     * Safety protection against a malformed
     * pagination response.
     */
    if (page > 1000) {
      break;
    }
  }

  return allItems;
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({ status }) {
  const styles = getStatusStyles(status);
  const Icon = styles.icon;

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-bold
        ${styles.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      {getStatusLabel(status)}
    </span>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  accent = "blue",
}) {
  const accentMap = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    violet:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    orange:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{
        y: -4,
      }}
      className="group"
    >
      <PremiumCard className="p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl transition-all duration-500 group-hover:bg-blue-500/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {title}
            </p>

            {loading ? (
              <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {value}
              </p>
            )}

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              transition-all
              duration-300
              group-hover:scale-105
              dark:border-slate-700
              ${accentMap[accent] || accentMap.blue}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  index,
  evidenceCount,
  problemCount,
  onEdit,
  onDelete,
}) {
  const projectId =
    getProjectId(project);

  const category =
    getProjectCategory(project);

  const owner =
    getProjectOwner(project);

  const status =
    getProjectStatus(project);

  const resolvedEvidenceCount =
    evidenceCount ??
    getEvidenceCount(project);

  const resolvedProblemCount =
    problemCount ??
    getProblemCount(project);

  const solutionCount =
    getSolutionCount(project);

  return (
    <motion.div
      custom={index}
      layout
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{
        y: -7,
      }}
      className="group h-full"
    >
      <PremiumCard className="flex h-full flex-col">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="p-5">
          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950">
                <FolderKanban className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-950 dark:text-white">
                  {getProjectName(project)}
                </h3>

                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {category}
                </p>
              </div>
            </div>

            <StatusPill status={status} />
          </div>

          {/* DESCRIPTION */}

          <p className="mt-5 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-600 dark:text-slate-300">
            {getProjectDescription(project)}
          </p>

          {/* METRICS */}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Evidence
              </p>

              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                {resolvedEvidenceCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Problems
              </p>

              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                {resolvedProblemCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Solutions
              </p>

              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                {solutionCount}
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Users className="h-3.5 w-3.5" />
              </div>

              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {owner}
              </span>
            </div>

            <span className="shrink-0 text-xs text-slate-400">
              {formatDate(
                getDateValue(project)
              )}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <Link to={`/projects/${projectId}`} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            <Eye className="h-3.5 w-3.5" /> Open
          </Link>
          <button type="button" onClick={() => onEdit?.(project)} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-white hover:text-indigo-500 dark:border-slate-700 dark:hover:bg-slate-900" title="Edit project">
            <Edit3 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete?.(project)} className="rounded-xl border border-rose-500/10 p-2.5 text-rose-500 transition hover:bg-rose-500/10" title="Delete project">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* OPEN PROJECT */}

        <div className="hidden">
          <Link
            to={`/projects/${projectId}`}
            className="group/link flex items-center justify-between text-sm font-bold text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
          >
            <span>
              Open project
            </span>

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  searchQuery,
  hasFilters,
  onCreate,
  onClear,
}) {
  const filtered =
    searchQuery || hasFilters;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        {filtered ? (
          <Search className="h-7 w-7" />
        ) : (
          <FolderKanban className="h-7 w-7" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {filtered
          ? "No matching projects"
          : "No projects yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? "Try changing your search or filters to find the project you are looking for."
          : "Create your first research project and start collecting evidence."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {filtered && (
          <PremiumButton
            type="button"
            variant="secondary"
            onClick={onClear}
          >
            Clear filters
          </PremiumButton>
        )}

        <PremiumButton
          type="button"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          Create project
        </PremiumButton>
      </div>
    </motion.div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: index * 0.05,
          }}
          className="h-[330px] animate-pulse rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="flex-1">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

              <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          <div className="mt-7 space-y-2">
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2">
            <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* =========================================================
   PROJECT TABLE
========================================================= */

function ProjectTable({
  projects,
  evidenceCountMap,
  problemCountMap,
  onEdit,
  onDelete,
}) {
  return (
    <PremiumCard>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Project
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Evidence
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Problems
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Updated
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {projects.map(
                (project, index) => {
                  const projectId =
                    getProjectId(project);

                  const status =
                    getProjectStatus(project);

                  const evidence =
                    evidenceCountMap.get(
                      String(projectId)
                    ) ??
                    getEvidenceCount(project);

                  const problems =
                    problemCountMap.get(
                      String(projectId)
                    ) ??
                    getProblemCount(project);

                  return (
                    <motion.tr
                      key={
                        projectId ||
                        `project-row-${index}`
                      }
                      layout
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.03,
                          0.2
                        ),
                      }}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <FolderKanban className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                              {getProjectName(
                                project
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {getProjectOwner(
                                project
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {getProjectCategory(
                          project
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusPill
                          status={status}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {evidence}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {problems}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(
                          getDateValue(
                            project
                          )
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link to={`/projects/${projectId}`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Eye className="h-3.5 w-3.5" /> View</Link>
                          <button type="button" onClick={() => onEdit?.(project)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-indigo-500 dark:border-slate-700"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => onDelete?.(project)} className="rounded-xl border border-rose-500/10 p-2 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                }
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}

/* =========================================================
   MAIN PROJECTS PAGE
========================================================= */

export default function Projects() {
  const [projectList, setProjectList] =
    useState([]);

  const [
    evidenceCountMap,
    setEvidenceCountMap,
  ] = useState(() => new Map());

  const [
    problemCountMap,
    setProblemCountMap,
  ] = useState(() => new Map());

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("grid");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [editingProject, setEditingProject] = useState(null);

  const [saving, setSaving] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      category: "",
      status: "ACTIVE",
    });

  /* =======================================================
     LOAD PROJECT DATA
  ======================================================= */

  const loadProjects = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * Project data is required.
         *
         * Evidence/problems are additional dynamic
         * collections used to calculate project metrics.
         *
         * Promise.allSettled prevents one optional
         * collection failure from breaking the page.
         */
        const results =
          await Promise.allSettled([
            projectApi.getAll(),

            fetchAllCollection(
              (params) =>
                evidenceApi.getAll(
                  params
                )
            ),

            fetchAllCollection(
              (params) =>
                problemApi.getAll(
                  params
                )
            ),
          ]);

        /* PROJECTS */

        const projectResult =
          results[0];

        if (
          projectResult.status ===
          "rejected"
        ) {
          throw projectResult.reason;
        }

        const projects =
          extractList(
            projectResult.value
          );

        setProjectList(
          Array.isArray(projects)
            ? projects
            : []
        );

        /* EVIDENCE */

        const evidenceResult =
          results[1];

        if (
          evidenceResult.status ===
          "fulfilled"
        ) {
          setEvidenceCountMap(
            buildCountMap(
              evidenceResult.value
            )
          );
        } else {
          console.warn(
            "Evidence metrics unavailable:",
            evidenceResult.reason
          );

          setEvidenceCountMap(
            new Map()
          );
        }

        /* PROBLEMS */

        const problemResult =
          results[2];

        if (
          problemResult.status ===
          "fulfilled"
        ) {
          setProblemCountMap(
            buildCountMap(
              problemResult.value
            )
          );
        } else {
          console.warn(
            "Problem metrics unavailable:",
            problemResult.reason
          );

          setProblemCountMap(
            new Map()
          );
        }
      } catch (err) {
        console.error(
          "Failed to load projects:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load projects."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const values =
      projectList
        .map(getProjectCategory)
        .filter(Boolean)
        .map((value) =>
          String(value).trim()
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [projectList]);

  /* =======================================================
     FILTERED PROJECTS
  ======================================================= */

  const filteredProjects =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return projectList.filter(
        (project) => {
          const projectName =
            String(
              getProjectName(
                project
              )
            ).toLowerCase();

          const description =
            String(
              getProjectDescription(
                project
              )
            ).toLowerCase();

          const projectCategory =
            String(
              getProjectCategory(
                project
              )
            ).toLowerCase();

          const projectStatus =
            String(
              getProjectStatus(
                project
              )
            ).toLowerCase();

          const owner =
            String(
              getProjectOwner(
                project
              )
            ).toLowerCase();

          const matchesSearch =
            !query ||
            projectName.includes(
              query
            ) ||
            description.includes(
              query
            ) ||
            projectCategory.includes(
              query
            ) ||
            owner.includes(query);

          const matchesCategory =
            category === "all" ||
            projectCategory ===
              category.toLowerCase();

          const matchesStatus =
            status === "all" ||
            projectStatus ===
              status.toLowerCase();

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );
        }
      );
    }, [
      projectList,
      searchQuery,
      category,
      status,
    ]);

  /* =======================================================
     METRICS
  ======================================================= */

  const metrics = useMemo(() => {
    const active =
      projectList.filter(
        (project) =>
          getProjectStatus(
            project
          ) === "active"
      ).length;

    const completed =
      projectList.filter(
        (project) =>
          getProjectStatus(
            project
          ) === "completed"
      ).length;

    const archived =
      projectList.filter(
        (project) =>
          getProjectStatus(
            project
          ) === "archived"
      ).length;

    const evidence =
      projectList.reduce(
        (total, project) => {
          const projectId =
            getProjectId(
              project
            );

          const dynamicCount =
            evidenceCountMap.get(
              String(projectId)
            );

          return (
            total +
            (dynamicCount ??
              getEvidenceCount(
                project
              ))
          );
        },
        0
      );

    const problems =
      projectList.reduce(
        (total, project) => {
          const projectId =
            getProjectId(
              project
            );

          const dynamicCount =
            problemCountMap.get(
              String(projectId)
            );

          return (
            total +
            (dynamicCount ??
              getProblemCount(
                project
              ))
          );
        },
        0
      );

    return {
      total: projectList.length,
      active,
      completed,
      archived,
      evidence,
      problems,
    };
  }, [
    projectList,
    evidenceCountMap,
    problemCountMap,
  ]);

  /* =======================================================
     FORM RESET
  ======================================================= */

  const resetForm =
    useCallback(() => {
      setFormData({
        name: "",
        description: "",
        category: "",
        status: "ACTIVE",
      });
    }, []);

  /* =======================================================
     CREATE PROJECT
  ======================================================= */

  const handleCreateProject =
    async (event) => {
      event.preventDefault();

      if (!formData.name.trim()) {
        setError(
          "Project name is required."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        /*
         * Important:
         *
         * Backend Project schema has:
         * - name
         * - description
         * - status
         * - tags
         *
         * It does NOT have category.
         *
         * Therefore category is persisted
         * through tags.
         */
        const payload = {
          name: formData.name.trim(),

          description:
            formData.description.trim(),

          status:
            formData.status.toUpperCase(),

          tags: formData.category.trim()
            ? [
                formData.category.trim(),
              ]
            : [],
        };

        if (editingProject) {
          await projectApi.update(getProjectId(editingProject), payload);
        } else {
          await projectApi.create(payload);
        }

        setShowCreateModal(false);
        setEditingProject(null);

        resetForm();

        setNotice(
          editingProject ? "Project updated successfully." : "Project created successfully."
        );

        await loadProjects(true);

        window.setTimeout(() => {
          setNotice("");
        }, 3000);
      } catch (err) {
        console.error(
          "Failed to create project:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to create project."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     OPEN CREATE MODAL
  ======================================================= */

  const openCreateModal = () => {
    setEditingProject(null);
    setError("");
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setError("");
    setFormData({
      name: getProjectName(project),
      description: getProjectDescription(project),
      category: getProjectCategory(project),
      status: String(getProjectStatus(project) || "active").toUpperCase(),
    });
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (project) => {
    const id = getProjectId(project);
    const name = getProjectName(project);
    if (!id || !window.confirm(`Delete project "${name}"?`)) return;
    try {
      setError("");
      await projectApi.remove(id);
      setProjectList((prev) => prev.filter((item) => String(getProjectId(item)) !== String(id)));
      setNotice(`Project "${name}" deleted successfully.`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to delete project.");
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setStatus("all");
  };

  const hasFilters =
    Boolean(searchQuery) ||
    category !== "all" ||
    status !== "all";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        text-slate-950
        dark:bg-slate-950
        dark:text-white
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          variants={sectionVariants}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
            md:p-8
          "
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />

                Research workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Projects
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                Organize research initiatives,
                collect evidence, discover
                meaningful problems, and move
                validated opportunities toward
                solutions.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  <Database className="h-3.5 w-3.5" />
                  Live project data
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  <Layers3 className="h-3.5 w-3.5" />
                  Evidence intelligence
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Dynamic insights
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PremiumButton
                type="button"
                variant="secondary"
                onClick={() =>
                  loadProjects(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </PremiumButton>

              <PremiumButton
                type="button"
                onClick={
                  openCreateModal
                }
              >
                <Plus className="h-4 w-4" />

                New project
              </PremiumButton>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            METRICS
        ================================================= */}

        <motion.section
          variants={sectionVariants}
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            title="Total projects"
            value={metrics.total}
            subtitle="Across your workspace"
            icon={FolderKanban}
            loading={loading}
            accent="blue"
          />

          <MetricCard
            title="Active"
            value={metrics.active}
            subtitle="Currently in progress"
            icon={Activity}
            loading={loading}
            accent="violet"
          />

          <MetricCard
            title="Evidence"
            value={metrics.evidence}
            subtitle="Collected across projects"
            icon={FileText}
            loading={loading}
            accent="emerald"
          />

          <MetricCard
            title="Problems"
            value={metrics.problems}
            subtitle={`${metrics.completed} completed projects`}
            icon={Target}
            loading={loading}
            accent="orange"
          />
        </motion.section>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-700
                dark:border-red-500/20
                dark:bg-red-500/10
                dark:text-red-300
              "
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 opacity-90">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            SUCCESS NOTICE
        ================================================= */}

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                p-4
                text-sm
                font-medium
                text-emerald-700
                dark:border-emerald-500/20
                dark:bg-emerald-500/10
                dark:text-emerald-300
              "
            >
              <CheckCircle2 className="h-5 w-5" />

              {notice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            CONTROL CENTER
        ================================================= */}

        <motion.section
          variants={sectionVariants}
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search projects, descriptions, owners, categories..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-11
                  pr-10
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  dark:focus:bg-slate-950
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* CATEGORY */}

            <div className="relative">
              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="
                  h-11
                  min-w-[170px]
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  pr-10
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-200
                "
              >
                <option value="all">
                  All categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="
                  h-11
                  min-w-[150px]
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  pr-10
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-200
                "
              >
                <option value="all">
                  All status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* VIEW MODE */}

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() =>
                  setViewMode("grid")
                }
                className={`
                  flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  px-3
                  text-xs
                  font-bold
                  transition
                  ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }
                `}
              >
                <Grid2X2 className="h-4 w-4" />

                Grid
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("table")
                }
                className={`
                  flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  px-3
                  text-xs
                  font-bold
                  transition
                  ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }
                `}
              >
                <LayoutList className="h-4 w-4" />

                Table
              </button>
            </div>
          </div>

          {/* FILTER SUMMARY */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-black text-slate-800 dark:text-slate-200">
                {filteredProjects.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-slate-800 dark:text-slate-200">
                {projectList.length}
              </span>{" "}
              projects
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear filters

                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.section>

        {/* =================================================
            PROJECT RESULTS
        ================================================= */}

        <motion.section
          variants={sectionVariants}
          className="mt-6"
        >
          {loading ? (
            <LoadingState />
          ) : filteredProjects.length ===
            0 ? (
            <EmptyState
              searchQuery={
                searchQuery
              }
              hasFilters={
                hasFilters
              }
              onCreate={
                openCreateModal
              }
              onClear={
                clearFilters
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {/*
               * mode="sync" is intentionally not
               * popLayout.
               *
               * ProjectCard is a normal function
               * component and does not need to
               * receive a forwarded ref.
               */}
              <AnimatePresence
                initial={false}
                mode="sync"
              >
                {filteredProjects.map(
                  (
                    project,
                    index
                  ) => {
                    const id =
                      getProjectId(
                        project
                      );

                    return (
                      <ProjectCard
                        key={
                          id ||
                          `project-${index}`
                        }
                        project={
                          project
                        }
                        index={
                          index
                        }
                        onEdit={openEditModal}
                        onDelete={handleDeleteProject}
                        evidenceCount={evidenceCountMap.get(
                          String(id)
                        )}
                        problemCount={problemCountMap.get(
                          String(id)
                        )}
                      />
                    );
                  }
                )}
              </AnimatePresence>
            </div>
          ) : (
            <ProjectTable
              projects={
                filteredProjects
              }
              evidenceCountMap={
                evidenceCountMap
              }
              problemCountMap={
                problemCountMap
              }
              onEdit={openEditModal}
              onDelete={handleDeleteProject}
            />
          )}
        </motion.section>
      </div>

      {/* ===================================================
          PREMIUM CREATE / EDIT PROJECT MODAL
      ================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-xl sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setShowCreateModal(false);
                setEditingProject(null);
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-white text-slate-950 shadow-[0_40px_120px_rgba(15,23,42,.35)] dark:border-white/10 dark:bg-slate-950 dark:text-white"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-cyan-400/10" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5 sm:px-7 sm:py-6 dark:border-white/10">
                <div className="flex min-w-0 items-center gap-3.5">
                  <motion.div
                    initial={{ scale: .8, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25"
                  >
                    {editingProject ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </motion.div>
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[.22em] text-indigo-600 dark:text-indigo-400">
                      {editingProject ? 'Project editor' : 'New workspace'}
                    </p>
                    <h2 id="project-modal-title" className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                      {editingProject ? 'Edit project' : 'Create project'}
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {editingProject ? 'Refine your research workspace and save changes.' : 'Create a focused workspace for your research pipeline.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => { setShowCreateModal(false); setEditingProject(null); }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:-rotate-3 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-400 dark:hover:bg-white/[.08] dark:hover:text-white"
                  aria-label="Close project editor"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="relative max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid gap-5">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-400/10 dark:bg-indigo-500/[.06]">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/[.08] dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Research workspace</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          Keep the project name precise. You can continuously add evidence and discovered problems later.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="project-name" className="flex items-center justify-between text-xs font-black uppercase tracking-[.12em] text-slate-600 dark:text-slate-400">
                      <span>Project name</span><span className="font-semibold normal-case tracking-normal text-slate-400">Required</span>
                    </label>
                    <div className="relative">
                      <FolderKanban className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="project-name"
                        type="text"
                        value={formData.name}
                        onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                        placeholder="e.g. Problems Faced by College Students"
                        className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-11 pr-4 text-[15px] font-semibold !text-slate-950 caret-indigo-600 outline-none transition-all placeholder:font-normal placeholder:!text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:caret-indigo-400 dark:placeholder:!text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-white/[.06]"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="project-description" className="text-xs font-black uppercase tracking-[.12em] text-slate-600 dark:text-slate-400">Description</label>
                    <textarea
                      id="project-description"
                      value={formData.description}
                      onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Describe what this research project is investigating..."
                      rows={4}
                      className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-[14px] font-medium leading-6 !text-slate-950 caret-indigo-600 outline-none transition-all placeholder:font-normal placeholder:!text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:caret-indigo-400 dark:placeholder:!text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-white/[.06]"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="project-category" className="text-xs font-black uppercase tracking-[.12em] text-slate-600 dark:text-slate-400">Category</label>
                      <input
                        id="project-category"
                        type="text"
                        value={formData.category}
                        onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                        placeholder="Education, Finance..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 text-sm font-semibold !text-slate-950 caret-indigo-600 outline-none transition-all placeholder:font-normal placeholder:!text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:caret-indigo-400 dark:placeholder:!text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-white/[.06]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="project-status" className="text-xs font-black uppercase tracking-[.12em] text-slate-600 dark:text-slate-400">Status</label>
                      <select
                        id="project-status"
                        value={formData.status}
                        onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 text-sm font-semibold !text-slate-950 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:!text-white dark:focus:border-indigo-400"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  {error ? (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-500/[.08]">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <p className="text-xs font-semibold leading-5 text-rose-700 dark:text-rose-300">{error}</p>
                    </motion.div>
                  ) : null}
                </div>

                <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-white/95 px-5 pt-5 backdrop-blur-xl sm:-mx-7 sm:flex-row sm:justify-end sm:px-7 dark:border-white/10 dark:bg-slate-950/95">
                  <PremiumButton type="button" variant="secondary" disabled={saving} onClick={() => { setShowCreateModal(false); setEditingProject(null); }}>
                    Cancel
                  </PremiumButton>
                  <PremiumButton type="submit" disabled={saving} className="min-w-[150px] bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <>{editingProject ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingProject ? 'Save changes' : 'Create project'}</>}
                  </PremiumButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}