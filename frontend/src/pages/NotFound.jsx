import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Compass,
  FileText,
  FolderKanban,
  Home,
  HelpCircle,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  /* Quick Search Route Query State */
  const [searchQuery, setSearchQuery] = useState("");

  /* Suggested Quick Destinations */
  const quickLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Evidence", href: "/evidence", icon: FileText },
    { label: "Problems", href: "/problems", icon: Lightbulb },
  ];

  /* Handle Search Navigation */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    if (query.includes("proj")) navigate("/projects");
    else if (query.includes("evid")) navigate("/evidence");
    else if (query.includes("prob")) navigate("/problems");
    else if (query.includes("rep")) navigate("/reports");
    else navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090d16] px-5 py-12 text-slate-100 font-sans">
      {/* =====================================================
          BACKGROUND AMBIENT LIGHTING ORBS
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px] animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]"
      />

      {/* Grid Pattern Backdrop overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      {/* =====================================================
          MAIN CARD CONTAINER
      ====================================================== */}
      <div className="relative z-10 w-full max-w-xl text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Animated Compass Icon Container */}
        <div className="mx-auto relative flex h-24 w-24 items-center justify-center rounded-3xl border border-indigo-500/30 bg-gradient-to-tr from-indigo-500/10 via-slate-900/80 to-violet-500/10 text-indigo-400 shadow-2xl backdrop-blur-xl group">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-md transition-opacity duration-300 group-hover:opacity-100 opacity-50"
          />
          <Compass
            size={44}
            className="relative z-10 animate-spin-slow transition-transform duration-500 hover:rotate-180"
          />
        </div>

        {/* Dynamic Missing Route Tag */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs font-bold text-slate-400 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono text-indigo-300">{location.pathname}</span>
        </div>

        {/* 404 Headline */}
        <p className="mt-4 text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 sm:text-9xl">
          404
        </p>

        <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Lost in Discovery Space
        </h1>

        <p className="mt-2.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          The research page or resource you are looking for has been moved, renamed, or does not exist in this workspace.
        </p>

        {/* Quick Search Shortcut Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative mt-8 max-w-md mx-auto flex items-center"
        >
          <Search size={16} className="absolute left-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination (e.g. Projects, Evidence, Reports)..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-11 pr-24 py-3 text-xs font-semibold text-slate-200 placeholder:text-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
          <button
            type="submit"
            className="absolute right-2 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-indigo-500 active:scale-95"
          >
            Navigate
          </button>
        </form>

        {/* Suggested Quick Links Grid */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Suggested Workspace Routes
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs font-bold text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white"
                >
                  <Icon size={15} className="text-indigo-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-xl shadow-indigo-500/25 transition-all hover:opacity-90 active:scale-95"
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}