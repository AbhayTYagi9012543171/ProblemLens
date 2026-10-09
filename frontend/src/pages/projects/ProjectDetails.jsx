import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Filter,
  Layers3,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { evidenceApi, problemApi, projectApi } from "../../services/api";

const fallbackProject = {
  id: "1",
  _id: "1",
  name: "Problems Faced by Indian College Students",
  description:
    "A research workspace exploring recurring challenges experienced by college students during internships, placement drives, and career verification processes.",
  status: "Active",
  progress: 72,
  score: 87,
  evidenceCount: 11,
  problemCount: 6,
  createdAt: "2026-03-01T08:00:00Z",
};

const fallbackEvidence = [
  {
    id: "ev-1",
    title: "Unverified Internship Offers on Social Platforms",
    type: "INTERVIEW",
    source: "Student Survey Drive",
    content:
      "Multiple students reported receiving illegitimate internship offers requesting upfront security deposits without formal interviews.",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "ev-2",
    title: "Scattered Placement Drive Notices",
    type: "SURVEY",
    source: "Telegram & WhatsApp Groups",
    content:
      "Important placement schedules are shared across unofficial messaging groups, leading to missed interview slots.",
    createdAt: "2026-03-18T14:30:00Z",
  },
];

const fallbackProblems = [
  { id: "prob-1", title: "Internship authenticity is difficult to verify", severity: "High", confidence: "92%", status: "Validated" },
  { id: "prob-2", title: "Placement information is fragmented across channels", severity: "Medium", confidence: "84%", status: "Emerging" },
];

const ease = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.045, 0.25), duration: 0.4, ease } }),
};

function idOf(item) {
  return item?.id || item?._id || item?.evidenceId || item?.problemId || crypto.randomUUID?.() || Math.random();
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function normalStatus(value) {
  return String(value || "ACTIVE").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusPill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
      {children}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-500/15 to-violet-500/5 text-indigo-600 dark:text-indigo-300",
    cyan: "from-cyan-500/15 to-sky-500/5 text-cyan-600 dark:text-cyan-300",
    amber: "from-amber-500/15 to-orange-500/5 text-amber-600 dark:text-amber-300",
    emerald: "from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:text-emerald-300",
  };
  return (
    <motion.div variants={reveal} whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)] backdrop-blur-xl dark:border-white/[.07] dark:bg-slate-900/75">
      <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]} opacity-70`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 dark:bg-white/[.06] dark:ring-white/10 ${tones[tone].split(" ").at(-1)}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyPanel({ title, text, icon: Icon }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center dark:border-white/10 dark:bg-white/[.025]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Icon className="h-5 w-5" /></div>
      <p className="text-sm font-bold text-slate-800 dark:text-white">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(fallbackProject);
  const [evidenceList, setEvidenceList] = useState(fallbackEvidence);
  const [problemList, setProblemList] = useState(fallbackProblems);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("evidence");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", type: "INTERVIEW", content: "", source: "" });

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const [p, e, pr] = await Promise.allSettled([
        projectApi.getById(id),
        evidenceApi.getAll({ project: id }),
        problemApi.getAll({ project: id }),
      ]);
      if (p.status === "fulfilled") {
        const raw = p.value?.data?.data || p.value?.data || p.value;
        if (raw) setProject((old) => ({ ...old, ...raw, id: raw.id || raw._id || id, name: raw.name || raw.title || old.name }));
      }
      if (e.status === "fulfilled") {
        const raw = e.value?.data?.data || e.value?.data || e.value;
        const items = Array.isArray(raw) ? raw : raw?.evidence || raw?.items || [];
        if (items.length) setEvidenceList(items);
      }
      if (pr.status === "fulfilled") {
        const raw = pr.value?.data?.data || pr.value?.data || pr.value;
        const items = Array.isArray(raw) ? raw : raw?.problems || raw?.items || [];
        if (items.length) setProblemList(items);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to sync project data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const score = Math.min(100, Math.max(0, Number(project.score ?? 87)));
  const progress = Math.min(100, Math.max(0, Number(project.progress ?? 72)));

  const filteredEvidence = useMemo(() => evidenceList.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [item.title, item.content, item.source, item.type].join(" ").toLowerCase().includes(q);
    const matchesFilter = filter === "ALL" || String(item.type || "").toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  }), [evidenceList, search, filter]);

  const filteredProblems = useMemo(() => problemList.filter((item) => {
    const q = search.trim().toLowerCase();
    return !q || [item.title, item.status, item.severity].join(" ").toLowerCase().includes(q);
  }), [problemList, search]);

  const submitEvidence = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, title: form.title.trim(), content: form.content.trim(), source: form.source.trim(), project: id };
      await evidenceApi.create(payload);
      setEvidenceList((items) => [{ ...payload, id: `local-${Date.now()}`, createdAt: new Date().toISOString() }, ...items]);
      setProject((p) => ({ ...p, evidenceCount: Number(p.evidenceCount || 0) + 1 }));
      setForm({ title: "", type: "INTERVIEW", content: "", source: "" });
      setModalOpen(false);
      setNotice("Evidence added to the research workspace.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to save evidence.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.main initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: .06 } } }} className="mx-auto w-full max-w-[1500px] space-y-6 pb-12">
      <motion.div variants={reveal} className="flex items-center justify-between gap-4">
        <Link to="/projects" className="group inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-black uppercase tracking-[.14em] text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/[.05] dark:hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Projects
        </Link>
        <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400 sm:flex"><Clock3 className="h-3.5 w-3.5" /> Last synced {formatDate(project.updatedAt || project.createdAt)}</div>
      </motion.div>

      <motion.section variants={reveal} className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#090e1b] px-5 py-6 text-white shadow-[0_28px_90px_rgba(15,23,42,.2)] sm:px-8 sm:py-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <motion.div animate={{ x: [0, 20, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <motion.div animate={{ x: [0, -16, 0], y: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_310px] lg:items-end">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2"><StatusPill>{normalStatus(project.status)}</StatusPill><span className="rounded-full border border-white/10 bg-white/[.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Project #{id}</span></div>
            <h1 className="max-w-4xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">{project.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">{project.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button whileTap={{ scale: .97 }} onClick={() => setModalOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 shadow-lg shadow-black/20 transition hover:bg-indigo-50"><Plus className="h-4 w-4" /> Add evidence</motion.button>
              <motion.button whileTap={{ scale: .97 }} onClick={() => load(true)} disabled={refreshing} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-4 text-xs font-black text-slate-200 backdrop-blur transition hover:bg-white/[.09] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Syncing" : "Sync data"}</motion.button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Research readiness</span><span className="text-lg font-black text-white">{progress}%</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease }} className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300" /></div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400"><span>Evidence + problem discovery</span><TrendingUp className="h-4 w-4 text-emerald-400" /></div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Database} label="Evidence" value={project.evidenceCount ?? evidenceList.length} detail="Research records connected" tone="cyan" />
        <MetricCard icon={Target} label="Problems" value={project.problemCount ?? problemList.length} detail="Signals identified" tone="amber" />
        <MetricCard icon={BarChart3} label="Opportunity" value={`${score}/100`} detail="Current intelligence score" tone="emerald" />
        <MetricCard icon={Activity} label="Project health" value={loading ? "…" : "Healthy"} detail="Workspace is operational" tone="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <motion.section variants={reveal} className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/85 shadow-[0_16px_55px_rgba(15,23,42,.05)] backdrop-blur-xl dark:border-white/[.07] dark:bg-slate-900/75">
          <div className="border-b border-slate-200/80 p-5 dark:border-white/[.07] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Research intelligence</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Evidence & problems</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Explore the signals that are shaping this project.</p></div>
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/[.05]">
                {[["evidence", "Evidence", evidenceList.length], ["problems", "Problems", problemList.length]].map(([key, label, count]) => (
                  <button key={key} type="button" onClick={() => { setActiveTab(key); setSearch(""); }} className={`rounded-lg px-3 py-2 text-[11px] font-black transition ${activeTab === key ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>{label} <span className="ml-1 opacity-50">{count}</span></button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium !text-slate-950 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:placeholder:text-slate-500" /></div>
              {activeTab === "evidence" && <div className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-bold !text-slate-800 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900 dark:!text-white sm:w-44"><option value="ALL">All sources</option><option value="INTERVIEW">Interview</option><option value="SURVEY">Survey</option><option value="REVIEW">Review</option><option value="OBSERVATION">Observation</option></select></div>}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="popLayout">
              {activeTab === "evidence" ? (
                filteredEvidence.length ? filteredEvidence.map((item, index) => (
                  <motion.article key={idOf(item)} custom={index} variants={listItem} initial="hidden" animate="show" exit={{ opacity: 0, x: -10 }} whileHover={{ y: -2 }} className="group mb-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-indigo-200 hover:bg-white dark:border-white/[.06] dark:bg-white/[.025] dark:hover:border-indigo-400/20 dark:hover:bg-white/[.04]">
                    <div className="flex gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"><FileText className="h-4.5 w-4.5" /></div>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title || "Untitled evidence"}</h3><span className="rounded-lg bg-slate-200/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/[.07] dark:text-slate-300">{item.type || "EVIDENCE"}</span></div><p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.content || "No findings recorded."}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400"><span>{item.source || "Unspecified source"}</span><span>•</span><span>{formatDate(item.createdAt)}</span></div></div>
                    </div>
                  </motion.article>
                )) : <EmptyPanel title="No matching evidence" text="Add evidence or adjust your search and source filter." icon={FileText} />
              ) : filteredProblems.length ? filteredProblems.map((item, index) => (
                <motion.article key={idOf(item)} custom={index} variants={listItem} initial="hidden" animate="show" exit={{ opacity: 0, x: -10 }} whileHover={{ y: -2 }} className="group mb-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-amber-200 hover:bg-white dark:border-white/[.06] dark:bg-white/[.025] dark:hover:border-amber-400/20 dark:hover:bg-white/[.04]">
                  <div className="flex items-start gap-3.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title || "Unnamed problem"}</h3><span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${String(item.severity).toLowerCase() === "high" ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-amber-500/10 text-amber-600 dark:text-amber-300"}`}>{item.severity || "Medium"}</span></div><div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400"><span>Confidence {item.confidence || "85%"}</span><span>•</span><span>{item.status || "Emerging"}</span></div></div></div>
                </motion.article>
              )) : <EmptyPanel title="No matching problems" text="Problem discovery results will appear here as evidence is analyzed." icon={Target} />}
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.aside variants={reveal} className="space-y-6">
          <div className="relative overflow-hidden rounded-[26px] border border-indigo-200/60 bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-950 p-6 text-white shadow-[0_20px_70px_rgba(79,70,229,.2)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative"><div className="flex items-center gap-2 text-indigo-100"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[.18em]">AI research layer</span></div><h3 className="mt-3 text-xl font-black tracking-tight">Turn evidence into insight.</h3><p className="mt-2 text-xs leading-6 text-indigo-100/80">Run the analysis pipeline after adding enough evidence to surface stronger problem clusters and opportunity signals.</p><button type="button" onClick={() => navigate("/analysis")} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-indigo-700 transition hover:bg-indigo-50">Run AI synthesis <ArrowUpRight className="h-4 w-4" /></button></div>
          </div>

          <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_16px_55px_rgba(15,23,42,.05)] backdrop-blur-xl dark:border-white/[.07] dark:bg-slate-900/75">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Opportunity score</p><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{score}<span className="text-sm text-slate-400">/100</span></p></div><div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-black text-emerald-600 dark:text-emerald-300"><Zap className="h-5 w-5" /></div></div>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/[.06]"><motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.1, ease }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" /></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[.04]"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Evidence</p><p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{evidenceList.length}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[.04]"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Problems</p><p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{problemList.length}</p></div></div>
          </div>

          <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_16px_55px_rgba(15,23,42,.05)] backdrop-blur-xl dark:border-white/[.07] dark:bg-slate-900/75">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Project metadata</p>
            <div className="mt-4 space-y-3"><div className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Created</span><b className="text-slate-800 dark:text-slate-200">{formatDate(project.createdAt)}</b></div><div className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2 text-slate-500"><Layers3 className="h-4 w-4" /> Status</span><b className="text-slate-800 dark:text-slate-200">{normalStatus(project.status)}</b></div><div className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2 text-slate-500"><TrendingUp className="h-4 w-4" /> Progress</span><b className="text-slate-800 dark:text-slate-200">{progress}%</b></div></div>
          </div>
        </motion.aside>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-xl sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && !saving && setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .97 }} transition={{ type: "spring", stiffness: 280, damping: 25 }} className="relative my-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-white/20 bg-white text-slate-950 shadow-[0_40px_120px_rgba(15,23,42,.35)] dark:border-white/10 dark:bg-slate-950 dark:text-white" onMouseDown={(e) => e.stopPropagation()}>
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-cyan-500/10" />
              <div className="relative flex items-start justify-between border-b border-slate-200/80 p-5 sm:p-6 dark:border-white/10"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-indigo-600 dark:text-indigo-400">Evidence capture</p><h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Add research evidence</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Record a useful source while the context is fresh.</p></div><button type="button" onClick={() => setModalOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/[.06] dark:text-slate-300 dark:hover:bg-white/[.1]"><X className="h-4 w-4" /></button></div>
              <form onSubmit={submitEvidence} className="relative space-y-4 p-5 sm:p-6">
                <div><label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-slate-600 dark:text-slate-400">Title</label><input autoFocus required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What did you discover?" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold !text-slate-950 caret-indigo-600 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:placeholder:text-slate-500" /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-slate-600 dark:text-slate-400">Source type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold !text-slate-950 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900 dark:!text-white"><option value="INTERVIEW">Interview</option><option value="SURVEY">Survey</option><option value="REVIEW">Review</option><option value="OBSERVATION">Observation</option></select></div><div><label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-slate-600 dark:text-slate-400">Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Person, site, survey..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold !text-slate-950 caret-indigo-600 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:placeholder:text-slate-500" /></div></div>
                <div><label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-slate-600 dark:text-slate-400">Findings</label><textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Capture the finding, observation, quote, or supporting context..." className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 !text-slate-950 caret-indigo-600 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[.04] dark:!text-white dark:placeholder:text-slate-500" /></div>
                {error && <div className="flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:justify-end dark:border-white/10"><button type="button" onClick={() => setModalOpen(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[.05]">Cancel</button><button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="h-4 w-4" /> Save evidence</>}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && <motion.div initial={{ opacity: 0, y: 20, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl dark:border-emerald-400/20 dark:bg-slate-900"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /></span><p className="text-xs font-bold text-slate-800 dark:text-slate-200">{notice}</p><button onClick={() => setNotice("")} className="ml-auto text-slate-400"><X className="h-4 w-4" /></button></motion.div>}
      </AnimatePresence>
    </motion.main>
  );
}
