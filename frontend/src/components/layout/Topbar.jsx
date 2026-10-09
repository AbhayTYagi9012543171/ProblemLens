import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  Command,
  Menu,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   HELPERS
   ========================================================= */

function getInitials(user) {
  const name = user?.name || user?.fullName || user?.email || "User";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(user) {
  return user?.name || user?.fullName || "Workspace user";
}

function getRoleLabel(user) {
  if (!user?.role) return "Workspace member";

  return user.role
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPageContext(pathname) {
  const routes = {
    "/dashboard": {
      label: "Overview",
      description: "Workspace intelligence",
      accent: "indigo",
    },
    "/projects": {
      label: "Projects",
      description: "Research portfolio",
      accent: "violet",
    },
    "/evidence": {
      label: "Evidence",
      description: "Research evidence",
      accent: "sky",
    },
    "/problems": {
      label: "Problems",
      description: "Problem discovery",
      accent: "amber",
    },
    "/analysis": {
      label: "AI Analysis",
      description: "AI-powered intelligence",
      accent: "purple",
      ai: true,
    },
    "/reports": {
      label: "Reports",
      description: "Insights & reporting",
      accent: "emerald",
    },
    "/users": {
      label: "Users",
      description: "Workspace members",
      accent: "cyan",
    },
    "/settings": {
      label: "Settings",
      description: "Workspace configuration",
      accent: "slate",
    },
    "/profile": {
      label: "Profile",
      description: "Account settings",
      accent: "indigo",
    },
  };

  if (routes[pathname]) return routes[pathname];

  const matchingRoute = Object.entries(routes).find(
    ([route]) =>
      route !== "/dashboard" && pathname.startsWith(route)
  );

  return (
    matchingRoute?.[1] || {
      label: "Workspace",
      description: "ProblemLens intelligence",
      accent: "indigo",
    }
  );
}

/* =========================================================
   SEARCH DATA
   ========================================================= */

const SEARCH_ITEMS = [
  {
    label: "Dashboard",
    description: "Workspace overview",
    path: "/dashboard",
    keywords: "home overview stats",
  },
  {
    label: "Projects",
    description: "Manage research projects",
    path: "/projects",
    keywords: "project research portfolio",
  },
  {
    label: "Evidence",
    description: "Manage research evidence",
    path: "/evidence",
    keywords: "evidence sources research",
  },
  {
    label: "Problems",
    description: "Discover and manage problems",
    path: "/problems",
    keywords: "problems discovery opportunities",
  },
  {
    label: "AI Analysis",
    description: "AI-powered problem intelligence",
    path: "/analysis",
    keywords: "ai analysis intelligence insights",
  },
  {
    label: "Reports",
    description: "View insights and reports",
    path: "/reports",
    keywords: "reports analytics export",
  },
  {
    label: "Users",
    description: "Manage workspace members",
    path: "/users",
    keywords: "users members team",
  },
  {
    label: "Settings",
    description: "Workspace configuration",
    path: "/settings",
    keywords: "settings configuration preferences",
  },
  {
    label: "Profile",
    description: "Manage your account",
    path: "/profile",
    keywords: "profile account user",
  },
];

/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

function KeyboardShortcut() {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/i.test(
      navigator.platform || navigator.userAgent || ""
    );

  return (
    <span className="hidden items-center gap-1 lg:flex">
      <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[9px] font-bold text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        {isMac ? <Command size={9} /> : "Ctrl"}
      </kbd>
      <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[9px] font-bold text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        K
      </kbd>
    </span>
  );
}

/* =========================================================
   HEADER ICON BUTTON
   ========================================================= */

function HeaderIconButton({
  label,
  children,
  className = "",
  onClick,
  active = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "group relative flex h-10 w-10 items-center justify-center rounded-xl",
        "border transition-all duration-200",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* =========================================================
   PAGE CONTEXT
   ========================================================= */

function PageContext({ context }) {
  return (
    <div className="hidden min-w-0 items-center gap-3 md:flex">
      <span
        aria-hidden="true"
        className="h-7 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-700"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            {context.label}
          </p>

          {context.ai && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-violet-600 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles size={8} fill="currentColor" />
              AI
            </span>
          )}
        </div>

        <p className="truncate text-[9px] text-slate-400 dark:text-slate-500">
          {context.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function SystemStatus() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 shadow-sm shadow-emerald-100/30 xl:flex dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:shadow-none">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30 motion-reduce:animate-none" />
        <span className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.55)]" />
      </span>

      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
        System operational
      </span>
    </div>
  );
}

/* =========================================================
   SEARCH PANEL
   ========================================================= */

function SearchPanel({
  query,
  setQuery,
  onClose,
  onNavigate,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return SEARCH_ITEMS;

    return SEARCH_ITEMS.filter((item) =>
      `${item.label} ${item.description} ${item.keywords}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  return (
    <div className="absolute left-3 right-3 top-[calc(100%+10px)] z-50 sm:left-6 sm:right-auto sm:w-[420px] lg:left-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30">
        <div className="flex items-center gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
          <Search size={16} className="text-indigo-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "Enter" && results[0]) {
                onNavigate(results[0].path);
              }
            }}
            placeholder="Search pages, projects, insights..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close search"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          <p className="px-2 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {query ? "Search results" : "Quick navigation"}
          </p>

          {results.length ? (
            results.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500/15 dark:group-hover:text-indigo-300">
                  <Search size={14} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                    {item.label}
                  </span>
                  <span className="block truncate text-[10px] text-slate-400 dark:text-slate-500">
                    {item.description}
                  </span>
                </span>

                <span className="text-[9px] font-semibold text-slate-300 transition group-hover:text-indigo-400 dark:text-slate-600">
                  Enter
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Search size={22} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No matching pages
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Try another search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function NotificationPanel({ onClose }) {
  const notifications = [
    {
      id: 1,
      title: "AI analysis is ready",
      text: "Your latest problem analysis has completed.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "Workspace updated",
      text: "New evidence was added to your workspace.",
      time: "12 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Report generated",
      text: "The latest intelligence report is available.",
      time: "1 hr ago",
      unread: false,
    },
  ];

  return (
    <div className="absolute right-2 top-[calc(100%+10px)] z-50 w-[min(390px,calc(100vw-16px))]">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-white">
              Notifications
            </p>
            <p className="text-[9px] text-slate-400">
              Recent workspace activity
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[330px] overflow-y-auto">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/60"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                {notification.unread ? (
                  <Sparkles size={14} />
                ) : (
                  <Check size={14} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    {notification.title}
                  </span>
                  {notification.unread && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </span>

                <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                  {notification.text}
                </span>

                <span className="mt-1 block text-[9px] font-medium text-slate-300 dark:text-slate-600">
                  {notification.time}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-slate-800">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center justify-center rounded-xl px-3 py-2 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
          >
            View workspace activity
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function ProfileButton({
  initials,
  displayName,
  email,
  roleLabel,
  open,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open profile menu"
      aria-expanded={open}
      className="group flex items-center gap-2 rounded-2xl border border-transparent p-1.5 transition-all duration-200 hover:border-slate-200/80 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:border-slate-700 dark:hover:bg-slate-800 sm:gap-2.5"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-[11px] font-bold text-white shadow-md shadow-indigo-200/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none">
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        <span className="relative z-10">{initials}</span>
        <span aria-hidden="true" className="absolute bottom-[-1px] right-[-1px] h-2.5 w-2.5 rounded-full border-2 border-[#f8f9fd] bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.5)] dark:border-[#0b1120]" />
      </div>

      <div className="hidden min-w-0 text-left sm:block">
        <div className="flex items-center gap-1.5">
          <p className="max-w-[145px] truncate text-[12px] font-semibold leading-5 text-slate-800 dark:text-slate-100">
            {displayName}
          </p>
          <span className="hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 sm:flex dark:bg-emerald-500/10">
            <Check size={8} strokeWidth={3} />
          </span>
        </div>

        <p className="max-w-[145px] truncate text-[9px] font-medium leading-4 text-slate-400 dark:text-slate-500">
          {email || roleLabel}
        </p>
      </div>

      <ChevronDown
        size={14}
        className={[
          "hidden shrink-0 text-slate-400 transition-transform duration-200 sm:block",
          open ? "rotate-180 text-indigo-500" : "group-hover:translate-y-0.5",
        ].join(" ")}
      />
    </button>
  );
}

/* =========================================================
   PROFILE MENU
   ========================================================= */

function ProfileMenu({ user, roleLabel, onClose, onLogout }) {
  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <div className="absolute right-2 top-[calc(100%+10px)] z-50 w-[280px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 dark:from-indigo-500/10 dark:via-slate-900 dark:to-violet-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-200/40 dark:shadow-none">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-slate-800 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.email || "Workspace account"}
              </p>
              <span className="mt-1 inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <UserRound size={15} className="text-slate-500" />
            <span>
              <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                My profile
              </span>
              <span className="block text-[9px] text-slate-400">
                Account information
              </span>
            </span>
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Settings2 size={15} className="text-slate-500" />
            <span>
              <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                Settings
              </span>
              <span className="block text-[9px] text-slate-400">
                Workspace preferences
              </span>
            </span>
          </Link>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Zap size={15} />
            <span>
              <span className="block text-[11px] font-semibold">
                Sign out
              </span>
              <span className="block text-[9px] text-rose-400">
                End this session
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TOPBAR
   ========================================================= */

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(user);
  const pageContext = getPageContext(location.pathname);

  const closeMenus = useCallback(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    closeMenus();
    setSearchOpen(true);
  }, [closeMenus]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      closeSearch();
      closeMenus();
    },
    [navigate, closeSearch, closeMenus]
  );

  const handleLogout = useCallback(async () => {
    setProfileOpen(false);

    try {
      await logout?.();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout]);

  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setSearchOpen((current) => !current);

        if (!searchOpen) {
          closeMenus();
        }
      }

      if (event.key === "Escape") {
        closeSearch();
        closeMenus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, closeSearch, closeMenus]);

  /* =======================================================
     CLOSE ON OUTSIDE CLICK
     ======================================================= */

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () =>
      document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  /* =======================================================
     ROUTE CHANGE
     ======================================================= */

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="sticky top-0 z-40 flex h-[76px] shrink-0 items-center justify-between overflow-visible border-b border-slate-200/70 bg-[#f8f9fd]/85 px-3 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-[#0b1120]/85 sm:px-6 lg:px-8"
      role="banner"
    >
      {/* Premium top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent dark:via-indigo-500/40"
      />

      {/* Ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-0 h-20 w-72 rounded-full bg-indigo-500/[0.035] blur-3xl dark:bg-indigo-500/[0.065]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[18%] top-0 h-16 w-48 rounded-full bg-violet-500/[0.025] blur-3xl dark:bg-violet-500/[0.045]"
      />

      {/* LEFT */}
      <div className="relative z-10 flex min-w-0 items-center gap-2 sm:gap-3">
        <HeaderIconButton
          label="Open navigation menu"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu size={20} strokeWidth={2} />
        </HeaderIconButton>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            type="button"
            aria-label="Search workspace"
            aria-expanded={searchOpen}
            onClick={openSearch}
            className="group hidden h-11 w-64 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-3.5 text-left shadow-sm shadow-slate-200/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md hover:shadow-indigo-100/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-none dark:hover:border-indigo-500/50 dark:hover:bg-slate-900 sm:flex lg:w-[350px]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400">
              <Search size={15} strokeWidth={2} />
            </span>

            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-400 dark:text-slate-500">
              Search workspace...
            </span>

            <KeyboardShortcut />
          </button>

          <HeaderIconButton
            label="Search workspace"
            onClick={openSearch}
            active={searchOpen}
            className="sm:hidden"
          >
            <Search size={19} strokeWidth={2} />
          </HeaderIconButton>

          {searchOpen && (
            <SearchPanel
              query={query}
              setQuery={setQuery}
              onClose={closeSearch}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        <PageContext context={pageContext} />
      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2">
        <SystemStatus />

        <HeaderIconButton
          label="Workspace activity"
          className="hidden sm:flex"
        >
          <Activity size={18} strokeWidth={1.8} />
        </HeaderIconButton>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <HeaderIconButton
            label="Notifications"
            active={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setProfileOpen(false);
              setSearchOpen(false);
            }}
          >
            <Bell
              size={18}
              strokeWidth={1.9}
              className="transition-transform duration-300 group-hover:rotate-[-8deg]"
            />

            <span
              aria-label="Unread notifications"
              className="absolute right-2.5 top-2 flex h-2 w-2"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-30 motion-reduce:animate-none" />
              <span className="relative h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-[#f8f9fd] dark:bg-indigo-400 dark:ring-[#0b1120]" />
            </span>
          </HeaderIconButton>

          {notificationsOpen && (
            <NotificationPanel
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        <div
          aria-hidden="true"
          className="mx-1 hidden h-7 w-px bg-slate-200 dark:bg-slate-800 sm:block"
        />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <ProfileButton
            initials={initials}
            displayName={displayName}
            email={user?.email}
            roleLabel={roleLabel}
            open={profileOpen}
            onClick={() => {
              setProfileOpen((current) => !current);
              setNotificationsOpen(false);
              setSearchOpen(false);
            }}
          />

          {profileOpen && (
            <ProfileMenu
              user={user}
              roleLabel={roleLabel}
              onClose={() => setProfileOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
