
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownToLine,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Eye,
  FileJson,
  FileText,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

import {
  extractList,
  getApiErrorMessage,
  projectApi,
  reportApi,
} from "../../services/api";

const EMPTY_FORM = {
  title: "",
  project: "",
  format: "JSON",
  content: "",
};

const getId = (item) => item?._id || item?.id || "";

const getProjectName = (report) => {
  if (report?.project && typeof report.project === "object") {
    return report.project.name || report.project.title || "Untitled project";
  }

  return report?.project || "Unassigned";
};

const getDate = (date) => {
  if (!date) return "Date unavailable";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "Date unavailable";

  return value.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeContent = (content) => {
  if (content == null) return {};

  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return { summary: content };
    }
  }

  return content;
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:border-white/20";

const FORMAT_STYLES = {
  JSON: {
    icon: FileJson,
    color:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  },
  CSV: {
    icon: BarChart3,
    color:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  HTML: {
    icon: Code2,
    color:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
};

function Field({ label, children, hint }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
        {hint && (
          <span className="text-[10px] font-medium normal-case tracking-normal text-slate-400">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function IconButton({ label, onClick, children, disabled, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-rose-500/15 text-rose-500 hover:bg-rose-500/10"
          : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-500/5 hover:text-indigo-600 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[.06]"
      )}
    >
      {children}
    </button>
  );
}

export default function Reports() {
  const reduceMotion = useReducedMotion();

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadReports = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [reportResponse, projectResponse] = await Promise.all([
        reportApi.getAll(),
        projectApi.getAll(),
      ]);

      setReports(extractList(reportResponse));
      setProjects(extractList(projectResponse));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to load reports. Check your connection and try again."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...reports]
      .filter((report) => {
        const searchable = [
          report.title,
          getProjectName(report),
          report.format,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query || searchable.includes(query);

        const matchesFormat =
          formatFilter === "ALL" ||
          String(report.format || "JSON").toUpperCase() ===
            formatFilter;

        return matchesSearch && matchesFormat;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.updatedAt || b.createdAt || 0
        ).getTime();

        if (sortBy === "oldest") return dateA - dateB;

        if (sortBy === "title") {
          return String(a.title || "").localeCompare(
            String(b.title || "")
          );
        }

        return dateB - dateA;
      });
  }, [reports, search, formatFilter, sortBy]);

  const stats = useMemo(
    () => [
      {
        title: "Total reports",
        value: reports.length,
        icon: FileText,
        gradient: "from-indigo-500 to-violet-500",
      },
      {
        title: "Projects covered",
        value: new Set(
          reports
            .map((report) => getId(report.project) || report.project)
            .filter(Boolean)
            .map(String)
        ).size,
        icon: FolderKanban,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        title: "JSON reports",
        value: reports.filter(
          (report) =>
            String(report.format || "JSON").toUpperCase() === "JSON"
        ).length,
        icon: FileJson,
        gradient: "from-emerald-500 to-teal-500",
      },
    ],
    [reports]
  );

  const openCreateForm = () => {
    setEditingReport(null);
    setForm({
      ...EMPTY_FORM,
      project: getId(projects[0]),
    });
    setFormError("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (report) => {
    setEditingReport(report);

    setForm({
      title: report.title || "",
      project: getId(report.project) || report.project || "",
      format: String(report.format || "JSON").toUpperCase(),
      content:
        typeof report.content === "string"
          ? report.content
          : JSON.stringify(report.content ?? {}, null, 2),
    });

    setFormError("");
    setError("");
    setPreviewReport(null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setFormError("");
    setEditingReport(null);
  };

  const saveReport = async (event) => {
    event.preventDefault();
    setFormError("");

    const title = form.title.trim();

    if (!title) {
      setFormError("Please enter a report title.");
      return;
    }

    if (!form.project) {
      setFormError("Please select a project for this report.");
      return;
    }

    let content = {};

    if (form.content.trim()) {
      try {
        content = JSON.parse(form.content);
      } catch {
        setFormError(
          "Invalid JSON content. Correct the syntax before saving."
        );
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title,
        project: form.project,
        format: form.format,
        content,
      };

      if (editingReport) {
        const response = await reportApi.update(
          getId(editingReport),
          payload
        );

        const saved =
          response?.data?.data ??
          response?.data?.report ??
          response?.data;

        setReports((current) =>
          current.map((item) =>
            getId(item) === getId(editingReport)
              ? {
                  ...item,
                  ...saved,
                  project:
                    saved?.project ??
                    projects.find(
                      (project) => getId(project) === form.project
                    ) ??
                    form.project,
                }
              : item
          )
        );

        setNotice("Report updated successfully.");
      } else {
        const response = await reportApi.create(payload);

        const saved =
          response?.data?.data ??
          response?.data?.report ??
          response?.data;

        if (!getId(saved)) {
          throw new Error(
            "The server did not return the saved report. Please refresh and check before creating it again."
          );
        }

        setReports((current) => [saved, ...current]);
        setNotice("Report created successfully.");
      }

      setShowForm(false);
      setEditingReport(null);
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, "Unable to save the report.")
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteReport = async (report) => {
    const confirmed = window.confirm(
      `Delete "${report.title || "Untitled report"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(getId(report));
    setError("");

    try {
      await reportApi.remove(getId(report));

      setReports((current) =>
        current.filter((item) => getId(item) !== getId(report))
      );

      if (getId(previewReport) === getId(report)) {
        setPreviewReport(null);
      }

      setNotice("Report deleted successfully.");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to delete this report.")
      );
    } finally {
      setDeletingId("");
    }
  };

  const downloadReport = async (report) => {
    setDownloadingId(getId(report));
    setError("");

    try {
      const format = String(report.format || "JSON").toUpperCase();

      const response = await reportApi.download(
        getId(report),
        format
      );

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]);

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      const safeName =
        String(report.title || "report")
          .replace(/[^a-z0-9-_]+/gi, "-")
          .replace(/^-+|-+$/g, "") || "report";

      anchor.href = url;
      anchor.download = `${safeName}.${format.toLowerCase()}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setNotice("Report download started.");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to download the report.")
      );
    } finally {
      setDownloadingId("");
    }
  };

  const animation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 pb-12">
      {/* PREMIUM HEADER */}
      <motion.section
        {...animation}
        className="relative isolate overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm dark:border-white/[.08] dark:bg-slate-950"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,.18),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,.12),transparent_40%)]" />

        <div className="p-5 sm:p-8 lg:p-9">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/[.07] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-indigo-600 dark:text-indigo-300">
                <Sparkles size={13} />
                Research intelligence
                <span className="h-1 w-1 rounded-full bg-indigo-500" />
                Reports workspace
              </div>

              <h1 className="text-3xl font-black tracking-[-.055em] text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                Insights, made actionable.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                Create, organize, preview and export research reports
                connected to your projects, all from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadReports(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-200"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateForm}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25"
              >
                <Plus
                  size={16}
                  className="transition-transform group-hover:rotate-90"
                />
                Add report
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map(({ title, value, icon: Icon, gradient }, i) => (
              <motion.div
                key={title}
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: i * 0.08 },
                    })}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xl dark:border-white/[.08] dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {title}
                  </span>

                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md",
                      gradient
                    )}
                  >
                    <Icon size={17} />
                  </span>
                </div>

                <strong className="mt-3 block text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  {value}
                </strong>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[.07] p-4 text-sm text-rose-700 dark:text-rose-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH / FILTERS */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-xl dark:border-white/[.07] dark:bg-white/[.025]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              aria-label="Search reports"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports, projects or formats..."
              className={cn(inputClass, "h-11 py-0 pl-11")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="relative">
              <select
                aria-label="Filter by format"
                value={formatFilter}
                onChange={(event) => setFormatFilter(event.target.value)}
                className={cn(
                  inputClass,
                  "h-11 appearance-none py-0 pr-9 text-xs font-bold sm:min-w-[145px]"
                )}
              >
                <option value="ALL">All formats</option>
                <option value="JSON">JSON</option>
                <option value="CSV">CSV</option>
                <option value="HTML">HTML</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                aria-label="Sort reports"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className={cn(
                  inputClass,
                  "h-11 appearance-none py-0 pr-9 text-xs font-bold sm:min-w-[145px]"
                )}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
          <span>
            {loading
              ? "Loading reports..."
              : `Showing ${filteredReports.length} of ${reports.length} reports`}
          </span>

          {(search || formatFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFormatFilter("ALL");
              }}
              className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* REPORT GRID */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/70 dark:border-white/[.06] dark:bg-white/[.03]"
            />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="grid min-h-[300px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/50 px-5 py-12 text-center dark:border-slate-700 dark:bg-white/[.02]">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <FileText size={25} />
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">
            {reports.length ? "No matching reports" : "Your report library starts here"}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {reports.length
              ? "Try a different search or clear your filters."
              : "Create a report to organize findings, research evidence and project recommendations."}
          </p>

          {reports.length === 0 ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white transition hover:bg-indigo-500"
            >
              <Plus size={15} />
              Create your first report
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFormatFilter("ALL");
              }}
              className="mt-4 text-xs font-bold text-indigo-600"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, index) => {
              const type = String(report.format || "JSON").toUpperCase();
              const meta = FORMAT_STYLES[type] || FORMAT_STYLES.JSON;
              const Icon = meta.icon;
              const reportId = getId(report);
              const content = normalizeContent(report.content);

              const summary =
                typeof content === "string"
                  ? content
                  : content?.summary ||
                    content?.description ||
                    "Preview this report to explore its findings and recommendations.";

              return (
                <motion.article
                  layout
                  key={reportId || `${report.title}-${index}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? {} : { opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.23, delay: index * 0.035 }}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300/70 hover:shadow-xl hover:shadow-slate-900/[.06] dark:border-white/[.08] dark:bg-slate-950/70 dark:hover:border-indigo-400/30"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-70 transition-opacity group-hover:opacity-100" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-2xl border",
                          meta.color
                        )}
                      >
                        <Icon size={21} />
                      </div>

                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-extrabold",
                          meta.color
                        )}
                      >
                        {type}
                      </span>
                    </div>

                    <h2 className="mt-5 break-words text-lg font-extrabold leading-snug text-slate-900 dark:text-white">
                      {report.title || "Untitled report"}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <FolderKanban size={14} className="shrink-0" />
                      <span className="truncate">{getProjectName(report)}</span>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-10 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {String(summary)}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-400 dark:border-white/[.07]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {getDate(report.createdAt || report.updatedAt)}
                      </span>
                      <span>Research output</span>
                    </div>

                    <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewReport(report)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-extrabold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-200"
                      >
                        <Eye size={14} />
                        Preview
                      </button>

                      <IconButton
                        label="Download report"
                        disabled={downloadingId === reportId}
                        onClick={() => downloadReport(report)}
                      >
                        {downloadingId === reportId ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <ArrowDownToLine size={15} />
                        )}
                      </IconButton>

                      <IconButton
                        label="Edit report"
                        onClick={() => openEditForm(report)}
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        label="Delete report"
                        danger
                        disabled={deletingId === reportId}
                        onClick={() => deleteReport(report)}
                      >
                        {deletingId === reportId ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </IconButton>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ADD / EDIT REPORT FORM */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <motion.form
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-form-title"
              onSubmit={saveReport}
              initial={
                reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? {} : { opacity: 0, y: 12, scale: 0.99 }}
              transition={{ duration: 0.22 }}
              className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-white shadow-2xl sm:rounded-[26px] dark:bg-slate-950"
            >
              {/* Form header */}
              <header className="relative shrink-0 overflow-hidden border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-white/[.08]">
                <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,.14),transparent_55%)]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-indigo-600 dark:text-indigo-300">
                      <Sparkles size={12} />
                      Reports workspace
                    </div>

                    <h2
                      id="report-form-title"
                      className="mt-1.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white"
                    >
                      {editingReport ? "Edit report" : "Create a new report"}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Enter your report details and prepare the content for export.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    aria-label="Close report form"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[.08]"
                  >
                    <X size={17} />
                  </button>
                </div>
              </header>

              {/* Scrollable fields */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                {formError && (
                  <div
                    role="alert"
                    className="flex gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[.07] p-3 text-xs leading-5 text-rose-700 dark:text-rose-300"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <Field
                  label="Report title"
                  hint={`${form.title.length}/120 characters`}
                >
                  <input
                    autoFocus
                    required
                    maxLength={120}
                    value={form.title}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Market research and findings"
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Connected project">
                    <select
                      required
                      value={form.project}
                      onChange={(event) =>
                        setForm((old) => ({
                          ...old,
                          project: event.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select a project...</option>

                      {projects.map((project) => (
                        <option key={getId(project)} value={getId(project)}>
                          {project.name || project.title || "Untitled project"}
                        </option>
                      ))}
                    </select>

                    {projects.length === 0 && (
                      <span className="mt-1.5 block text-[11px] text-amber-600">
                        Create a project first to attach a report.
                      </span>
                    )}
                  </Field>

                  <Field label="Export format">
                    <select
                      value={form.format}
                      onChange={(event) =>
                        setForm((old) => ({
                          ...old,
                          format: event.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="JSON">JSON — Structured data</option>
                      <option value="CSV">CSV — Spreadsheet</option>
                      <option value="HTML">HTML — Web document</option>
                    </select>
                  </Field>
                </div>

                <Field label="Report content" hint="Valid JSON required">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Describe findings, evidence and recommendations.
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((old) => ({
                          ...old,
                          content: JSON.stringify(
                            {
                              summary: "",
                              findings: [],
                              recommendations: [],
                            },
                            null,
                            2
                          ),
                        }))
                      }
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                    >
                      Insert template
                    </button>
                  </div>

                  <textarea
                    spellCheck={false}
                    value={form.content}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        content: event.target.value,
                      }))
                    }
                    rows={9}
                    placeholder={`{
  "summary": "Research overview",
  "findings": [],
  "recommendations": []
}`}
                    className={cn(
                      inputClass,
                      "min-h-[190px] resize-y font-mono text-xs leading-6"
                    )}
                  />

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{form.content.length} characters</span>
                    <span className="inline-flex items-center gap-1">
                      <Code2 size={12} />
                      JSON validation enabled
                    </span>
                  </div>
                </Field>

                <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[.045] p-3.5">
                  <div className="flex gap-2.5">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Ready for your workspace
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                        Your report will be associated with the selected project.
                        You can preview, edit and export it after saving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed form actions */}
              <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-7 dark:border-white/[.08] dark:bg-white/[.02]">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || projects.length === 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}

                  {saving
                    ? "Saving report..."
                    : editingReport
                      ? "Save changes"
                      : "Create report"}
                </button>
              </footer>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT PREVIEW */}
      <AnimatePresence>
        {previewReport && (
          <div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setPreviewReport(null);
              }
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-preview-title"
              initial={reduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, y: 10 }}
              className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-white shadow-2xl sm:rounded-[26px] dark:bg-slate-950"
            >
              <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6 dark:border-white/[.08]">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-indigo-600 dark:text-indigo-300">
                    Report preview
                  </span>

                  <h2
                    id="report-preview-title"
                    className="mt-1 break-words text-xl font-black text-slate-950 dark:text-white"
                  >
                    {previewReport.title || "Untitled report"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {getProjectName(previewReport)} ·{" "}
                    {previewReport.format || "JSON"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  aria-label="Close preview"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/[.08]"
                >
                  <X size={17} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-6">
                <pre className="whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 sm:p-5 dark:border-white/[.08] dark:bg-black/30 dark:text-slate-200">
                  {JSON.stringify(
                    normalizeContent(previewReport.content),
                    null,
                    2
                  )}
                </pre>
              </div>

              <footer className="flex justify-end gap-2 border-t border-slate-200 p-4 sm:px-6 dark:border-white/[.08]">
                <button
                  type="button"
                  onClick={() => openEditForm(previewReport)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => downloadReport(previewReport)}
                  disabled={downloadingId === getId(previewReport)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  <ArrowDownToLine size={14} />
                  Download
                </button>
              </footer>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            className="fixed bottom-5 right-5 z-[130] flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-white px-4 py-3 text-xs font-extrabold text-slate-800 shadow-2xl dark:bg-slate-900 dark:text-white"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={16} />
            </span>

            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}