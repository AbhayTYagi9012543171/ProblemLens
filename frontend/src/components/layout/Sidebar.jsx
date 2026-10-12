
import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  FileBarChart,
  FolderKanban,
  Gauge,
  Lightbulb,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   PREMIUM NAVIGATION CONFIG
========================================================= */

const workspaceNavigation = [
  {
    label: "Overview",
    description: "Workspace summary",
    to: "/dashboard",
    icon: Gauge,
    accent: "indigo",
  },
  {
    label: "Projects",
    description: "Manage research projects",
    to: "/projects",
    icon: FolderKanban,
    accent: "violet",
  },
  {
    label: "Evidence",
    description: "Collected research data",
    to: "/evidence",
    icon: FileBarChart,
    accent: "sky",
  },
  {
    label: "Problems",
    description: "Discover user problems",
    to: "/problems",
    icon: Lightbulb,
    accent: "amber",
  },
  {
    label: "AI Analysis",
    description: "Analyze patterns with AI",
    to: "/analysis",
    icon: BrainCircuit,
    accent: "purple",
    ai: true,
  },
  {
    label: "Reports",
    description: "Insights and intelligence",
    to: "/reports",
    icon: BarChart3,
    accent: "emerald",
  },
];

const managementNavigation = [
  {
    label: "Users",
    description: "Manage workspace members",
    to: "/users",
    icon: Users,
    accent: "cyan",
    adminOnly: true,
  },
  {
    label: "Settings",
    description: "Configure your workspace",
    to: "/settings",
    icon: Settings,
    accent: "slate",
  },
];

/* =========================================================
   ACCENT SYSTEM
========================================================= */

const accentStyles = {
  indigo: {
    active:
      "border-indigo-400/20 bg-indigo-500/[0.11] shadow-[0_12px_35px_rgba(99,102,241,0.10)]",
    icon:
      "border-indigo-400/20 bg-indigo-500/15 text-indigo-300 shadow-[0_0_24px_rgba(99,102,241,0.14)]",
    indicator:
      "from-indigo-400 via-violet-400 to-fuchsia-400",
    glow: "bg-indigo-500/10",
  },

  violet: {
    active:
      "border-violet-400/20 bg-violet-500/[0.10] shadow-[0_12px_35px_rgba(139,92,246,0.10)]",
    icon:
      "border-violet-400/20 bg-violet-500/15 text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.14)]",
    indicator:
      "from-violet-400 via-purple-400 to-fuchsia-400",
    glow: "bg-violet-500/10",
  },

  sky: {
    active:
      "border-sky-400/20 bg-sky-500/[0.08] shadow-[0_12px_35px_rgba(14,165,233,0.08)]",
    icon:
      "border-sky-400/20 bg-sky-500/15 text-sky-300 shadow-[0_0_24px_rgba(14,165,233,0.12)]",
    indicator:
      "from-sky-400 via-cyan-400 to-blue-400",
    glow: "bg-sky-500/10",
  },

  amber: {
    active:
      "border-amber-400/20 bg-amber-500/[0.08] shadow-[0_12px_35px_rgba(245,158,11,0.08)]",
    icon:
      "border-amber-400/20 bg-amber-500/15 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    indicator:
      "from-amber-400 via-orange-400 to-yellow-400",
    glow: "bg-amber-500/10",
  },

  purple: {
    active:
      "border-fuchsia-400/20 bg-gradient-to-r from-violet-500/[0.12] to-fuchsia-500/[0.07] shadow-[0_12px_40px_rgba(217,70,239,0.12)]",
    icon:
      "border-fuchsia-400/20 bg-fuchsia-500/15 text-fuchsia-300 shadow-[0_0_26px_rgba(217,70,239,0.16)]",
    indicator:
      "from-violet-400 via-fuchsia-400 to-pink-400",
    glow: "bg-fuchsia-500/10",
  },

  emerald: {
    active:
      "border-emerald-400/20 bg-emerald-500/[0.07] shadow-[0_12px_35px_rgba(16,185,129,0.08)]",
    icon:
      "border-emerald-400/20 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    indicator:
      "from-emerald-400 via-teal-400 to-cyan-400",
    glow: "bg-emerald-500/10",
  },

  cyan: {
    active:
      "border-cyan-400/20 bg-cyan-500/[0.07] shadow-[0_12px_35px_rgba(6,182,212,0.08)]",
    icon:
      "border-cyan-400/20 bg-cyan-500/15 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.12)]",
    indicator:
      "from-cyan-400 via-sky-400 to-blue-400",
    glow: "bg-cyan-500/10",
  },

  slate: {
    active:
      "border-white/10 bg-white/[0.055] shadow-[0_12px_35px_rgba(255,255,255,0.04)]",
    icon:
      "border-white/10 bg-white/[0.06] text-slate-200",
    indicator:
      "from-slate-300 via-slate-200 to-white",
    glow: "bg-white/10",
  },
};

/* =========================================================
   USER HELPERS
========================================================= */

function getInitials(user) {
  if (!user) return "PL";

  const firstName =
    user.firstName ||
    user.firstname ||
    user.name?.split(" ")?.[0] ||
    "";

  const lastName =
    user.lastName ||
    user.lastname ||
    user.name?.split(" ")?.slice(1)?.join(" ") ||
    "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return "PL";
}

function getDisplayName(user) {
  if (!user) return "ProblemLens User";

  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.fullName ||
    user.username ||
    user.email?.split("@")[0] ||
    "ProblemLens User"
  );
}

function getRole(user) {
  return String(user?.role || user?.userRole || "member").toLowerCase();
}

function getRoleLabel(user) {
  const role = getRole(user);

  const roleMap = {
    admin: "Administrator",
    administrator: "Administrator",
    manager: "Manager",
    analyst: "Analyst",
    researcher: "Researcher",
    member: "Workspace Member",
    user: "Workspace Member",
  };

  return (
    roleMap[role] ||
    role
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function isAdminUser(user) {
  const role = getRole(user);

  return [
    "admin",
    "administrator",
    "superadmin",
    "super_admin",
  ].includes(role);
}

/* =========================================================
   NAVIGATION ITEM
========================================================= */

function NavigationItem({ item, onClose }) {
  const {
    label,
    description,
    to,
    icon: Icon,
    accent = "indigo",
    ai = false,
    adminOnly = false,
  } = item;

  const theme = accentStyles[accent] || accentStyles.indigo;

  return (
    <NavLink
      to={to}
      onClick={onClose}
      className="group relative block outline-none"
      aria-label={label}
    >
      {({ isActive }) => (
        <div
          className={[
            "relative mx-2 mb-1.5 overflow-hidden rounded-[17px]",
            "border transition-all duration-300",
            "focus-within:ring-2 focus-within:ring-indigo-400/30",
            isActive
              ? theme.active
              : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.035]",
          ].join(" ")}
        >
          {/* Premium hover light */}
          <span
            className={[
              "pointer-events-none absolute inset-y-0 -left-24 w-24",
              "rotate-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent",
              "blur-sm transition-transform duration-1000",
              "group-hover:translate-x-[420px]",
            ].join(" ")}
          />

          {/* Active indicator */}
          <span
            className={[
              "absolute left-0 top-1/2 h-8 w-[3px]",
              "-translate-y-1/2 rounded-r-full",
              "bg-gradient-to-b transition-all duration-300",
              theme.indicator,
              isActive
                ? "opacity-100 shadow-[0_0_14px_rgba(129,140,248,0.55)]"
                : "opacity-0",
            ].join(" ")}
          />

          <div className="relative flex items-center gap-3 px-3 py-3">
            {/* Icon */}
            <div
              className={[
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]",
                "border transition-all duration-300",
                isActive
                  ? theme.icon
                  : "border-white/[0.055] bg-white/[0.025] text-slate-500 group-hover:border-white/[0.10] group-hover:bg-white/[0.055] group-hover:text-slate-200",
              ].join(" ")}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-2"
              />

              {ai && (
                <>
                  <span className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full bg-fuchsia-500/20 blur-sm" />

                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#070b14] bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-lg">
                    <Sparkles size={7} className="text-white" />
                  </span>
                </>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "truncate text-[13px] font-semibold tracking-[-0.01em]",
                    "transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-300 group-hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </span>

                {ai && (
                  <span className="hidden rounded-full border border-fuchsia-400/15 bg-fuchsia-400/[0.08] px-1.5 py-[2px] text-[7px] font-black uppercase tracking-[0.16em] text-fuchsia-300 sm:inline-flex">
                    AI
                  </span>
                )}

                {adminOnly && (
                  <ShieldCheck
                    size={10}
                    className="hidden text-cyan-400/70 sm:block"
                  />
                )}
              </div>

              <p
                className={[
                  "mt-0.5 truncate text-[10px]",
                  "transition-colors duration-200",
                  isActive
                    ? "text-slate-400"
                    : "text-slate-600 group-hover:text-slate-400",
                ].join(" ")}
              >
                {description}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={15}
              className={[
                "shrink-0 transition-all duration-300",
                isActive
                  ? "translate-x-0 text-indigo-300 opacity-100"
                  : "-translate-x-1 text-slate-700 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
              ].join(" ")}
            />
          </div>
        </div>
      )}
    </NavLink>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ label, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-2 pt-5">
      <Icon size={11} className="text-slate-600" />

      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
        {label}
      </span>

      <div className="ml-auto h-px flex-1 bg-gradient-to-r from-white/[0.055] to-transparent" />
    </div>
  );
}

/* =========================================================
   PREMIUM AI CARD
========================================================= */

function AIWorkspaceCard() {
  return (
    <div className="group relative mx-3 mt-5 overflow-hidden rounded-[20px] border border-indigo-400/[0.13] bg-gradient-to-br from-indigo-500/[0.10] via-violet-500/[0.055] to-fuchsia-500/[0.06] p-3.5 shadow-[0_15px_45px_rgba(79,70,229,0.08)] transition-all duration-500 hover:border-indigo-400/20 hover:shadow-[0_20px_55px_rgba(79,70,229,0.13)]">
      {/* Animated glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-indigo-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />

      <div className="pointer-events-none absolute -bottom-12 -left-10 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10">
              <BrainCircuit
                size={17}
                className="text-indigo-300 transition-transform duration-500 group-hover:scale-110"
              />

              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.7)]" />
            </div>

            <div>
              <p className="text-[11px] font-bold text-white">
                AI Intelligence
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                ProblemLens engine
              </p>
            </div>
          </div>

          {/* Online indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[7px] font-bold uppercase tracking-wider text-emerald-300">
              Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.05] bg-black/10 px-2.5 py-2 transition-all duration-300 hover:bg-white/[0.035]">
            <div className="mb-1 flex items-center gap-1">
              <Activity size={10} className="text-emerald-400" />

              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                Engine
              </span>
            </div>

            <p className="text-[10px] font-semibold text-emerald-300">
              Operational
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-black/10 px-2.5 py-2 transition-all duration-300 hover:bg-white/[0.035]">
            <div className="mb-1 flex items-center gap-1">
              <Zap size={10} className="text-amber-400" />

              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                Mode
              </span>
            </div>

            <p className="text-[10px] font-semibold text-amber-300">
              Intelligent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   USER PROFILE
========================================================= */

function UserProfile({
  user,
  initials,
  displayName,
  roleLabel,
}) {
  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    user?.photoURL;

  return (
    <div className="group mb-2 rounded-[18px] border border-white/[0.06] bg-white/[0.025] p-2.5 transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-[11px] font-black text-white shadow-[0_7px_24px_rgba(99,102,241,0.25)]">
              <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <span className="relative">{initials}</span>
            </div>
          )}

          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070b14] bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.65)]" />
        </div>

        {/* User */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white">
            {displayName}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <ShieldCheck size={10} className="shrink-0 text-indigo-400" />

            <p className="truncate text-[9px] font-medium text-slate-500">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.06]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN SIDEBAR
========================================================= */

export default function Sidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(user);
  const isAdmin = isAdminUser(user);

  const isAnalysis = location.pathname.startsWith("/analysis");
  const isSettings = location.pathname.startsWith("/settings");

  /*
   * Dynamic navigation:
   * Admin-only items are automatically hidden for normal users.
   */
  const visibleManagementNavigation = managementNavigation.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/75 backdrop-blur-md lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        id="mobile-navigation"
        aria-label="Main navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col overflow-hidden",
          "border-r border-white/[0.07]",
          "bg-[#070b14]",
          "shadow-[25px_0_80px_rgba(0,0,0,0.35)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* ===================================================
            PREMIUM BACKGROUND
        =================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Main ambient lights */}
          <div className="absolute -left-32 -top-32 h-80 w-80 animate-[pulse_7s_ease-in-out_infinite] rounded-full bg-indigo-600/[0.075] blur-3xl" />

          <div className="absolute -right-32 top-[25%] h-72 w-72 animate-[pulse_9s_ease-in-out_infinite] rounded-full bg-violet-600/[0.045] blur-3xl" />

          <div className="absolute -bottom-32 left-0 h-80 w-80 animate-[pulse_11s_ease-in-out_infinite] rounded-full bg-fuchsia-600/[0.035] blur-3xl" />

          {/* Fine grid */}
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Top glow */}
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
        </div>

        {/* ===================================================
            BRAND HEADER
        =================================================== */}

        <div className="relative shrink-0 border-b border-white/[0.06] px-4">
          <div className="flex h-[78px] items-center justify-between">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            >
              {/* Logo */}
              <div className="relative shrink-0">
                <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[15px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-fuchsia-500/10 shadow-[0_9px_30px_rgba(79,70,229,0.20)]">
                  <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                  <BrainCircuit
                    size={22}
                    strokeWidth={2}
                    className="relative text-indigo-300 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                  />
                </div>

                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#070b14] bg-gradient-to-br from-indigo-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.45)]">
                  <Sparkles size={7} className="text-white" />
                </span>
              </div>

              {/* Brand */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-black tracking-[-0.045em] text-white">
                    Problem
                  </span>

                  <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-[17px] font-black tracking-[-0.045em] text-transparent">
                    Lens
                  </span>
                </div>

                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.24em] text-slate-600">
                  Intelligence Platform
                </p>
              </div>
            </NavLink>

            {/* Mobile close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 lg:hidden"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ===================================================
            SCROLLABLE NAVIGATION
        =================================================== */}

        <div className="relative min-h-0 flex-1 overflow-y-auto py-2 scrollbar-thin">
          {/* Workspace */}
          <SectionHeader label="Workspace" icon={Gauge} />

          <nav aria-label="Workspace navigation">
            {workspaceNavigation.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                onClose={onClose}
              />
            ))}
          </nav>

          {/* Management */}
          <SectionHeader label="Management" icon={ShieldCheck} />

          <nav aria-label="Management navigation">
            {visibleManagementNavigation.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                onClose={onClose}
              />
            ))}
          </nav>

          {/* AI status */}
          <AIWorkspaceCard />

          <div className="h-4" />
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="relative shrink-0 border-t border-white/[0.06] bg-[#070b14]/95 p-3 backdrop-blur-xl">
          {/* Profile */}
          <UserProfile
            user={user}
            initials={initials}
            displayName={displayName}
            roleLabel={roleLabel}
          />

          {/* System status */}
          <div className="mb-2 grid grid-cols-2 gap-2">
            {/* AI status */}
            <div
              className={[
                "rounded-xl border px-2.5 py-2 transition-all duration-300",
                isAnalysis
                  ? "border-indigo-400/15 bg-indigo-400/[0.07]"
                  : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.035]",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5">
                <BrainCircuit
                  size={11}
                  className={
                    isAnalysis
                      ? "text-indigo-300"
                      : "text-slate-600"
                  }
                />

                <span
                  className={[
                    "text-[8px] font-bold uppercase tracking-wider",
                    isAnalysis
                      ? "text-indigo-300"
                      : "text-slate-600",
                  ].join(" ")}
                >
                  AI
                </span>
              </div>

              <p className="mt-1 text-[9px] font-semibold text-slate-500">
                {isAnalysis ? "Analyzing" : "Ready"}
              </p>
            </div>

            {/* System status */}
            <div
              className={[
                "rounded-xl border px-2.5 py-2 transition-all duration-300",
                isSettings
                  ? "border-violet-400/15 bg-violet-400/[0.07]"
                  : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.035]",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5">
                <Settings
                  size={11}
                  className={
                    isSettings
                      ? "text-violet-300"
                      : "text-slate-600"
                  }
                />

                <span
                  className={[
                    "text-[8px] font-bold uppercase tracking-wider",
                    isSettings
                      ? "text-violet-300"
                      : "text-slate-600",
                  ].join(" ")}
                >
                  System
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />
                Online
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all duration-300 hover:border-red-400/10 hover:bg-red-400/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.035] text-slate-500 transition-all duration-300 group-hover:bg-red-400/10 group-hover:text-red-300">
              <LogOut
                size={15}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400 transition-colors group-hover:text-red-300">
                Sign out
              </p>

              <p className="mt-0.5 text-[8px] text-slate-600">
                End current session
              </p>
            </div>

            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors group-hover:text-red-400">
              Exit
            </span>
          </button>

          {/* Footer branding */}
          <div className="mt-2 flex items-center justify-center gap-2 pt-1">
            <span className="h-px flex-1 bg-white/[0.04]" />

            <span className="flex items-center gap-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              <Sparkles size={8} />
              ProblemLens
            </span>

            <span className="h-px flex-1 bg-white/[0.04]" />
          </div>
        </div>

        {/* ===================================================
            PREMIUM SCROLLBAR + ACCESSIBILITY
        =================================================== */}

        <style>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.07);
            border-radius: 999px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.14);
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
              transition-duration: 0.01ms !important;
            }
          }

          @media (max-width: 640px) {
            aside {
              width: min(292px, 88vw);
            }
          }
        `}</style>
      </aside>
    </>
  );
}
