
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Layout,
  LockKeyhole,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Zap,
  X,
  AlertCircle,
  CheckCheck,
  LoaderCircle,
} from "lucide-react";

import {
  authApi,
  extractData,
  settingsApi,
  getApiErrorMessage,
} from "../../services/api";

import Card from "../../components/common/Card";
import "./Settings.css";

const STORAGE_KEY = "problemlens_settings";

const DEFAULTS = {
  notifications: {
    emailAlerts: true,
    weeklySummary: true,
    realtimeSignals: true,
    securityAlerts: true,
  },
  appearance: {
    theme: "system",
    density: "comfortable",
    animations: true,
    compactSidebar: false,
  },
  workspace: {
    autoSave: true,
    analyticsConsent: true,
  },
};

const TABS = [
  {
    id: "general",
    label: "General",
    description: "Workspace behavior",
    icon: SlidersHorizontal,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Your alerts and updates",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and interface",
    icon: Palette,
  },
  {
    id: "security",
    label: "Security",
    description: "Protect your account",
    icon: ShieldCheck,
  },
];

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULTS));

function normalizeSettings(value) {
  const data = value && typeof value === "object" ? value : {};

  const normalized = {
    notifications: {
      ...DEFAULTS.notifications,
      ...(data.notifications || {}),
    },
    appearance: {
      ...DEFAULTS.appearance,
      ...(data.appearance || {}),
    },
    workspace: {
      ...DEFAULTS.workspace,
      ...(data.workspace || {}),
    },
  };

  // Keep unsupported values from breaking the controls.
  if (!["system", "light", "dark"].includes(normalized.appearance.theme)) {
    normalized.appearance.theme = DEFAULTS.appearance.theme;
  }

  if (
    !["comfortable", "compact"].includes(normalized.appearance.density)
  ) {
    normalized.appearance.density = DEFAULTS.appearance.density;
  }

  for (const section of Object.values(normalized)) {
    for (const [key, value] of Object.entries(section)) {
      if (typeof DEFAULTS[Object.keys(normalized).find(
        (sectionName) => normalized[sectionName] === section
      )]?.[key] === "boolean" && typeof value !== "boolean") {
        section[key] = false;
      }
    }
  }

  return normalized;
}

function readLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function persistLocalSettings(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border",
        "transition-all duration-300 focus-visible:outline-none focus-visible:ring-4",
        "focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-indigo-500 bg-indigo-600 shadow-lg shadow-indigo-500/20"
          : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800",
      ].join(" ")}
    >
      <span
        className={[
          "h-5 w-5 rounded-full bg-white shadow-md",
          "transition-transform duration-300",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function Row({ icon: Icon, title, description, children, last = false }) {
  return (
    <div
      className={[
        "flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between",
        !last && "border-b border-slate-200/70 dark:border-white/[0.07]",
      ].filter(Boolean).join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-300">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center sm:justify-end">{children}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="mb-2 flex items-start gap-3">
      {Icon && (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon size={19} />
        </div>
      )}
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SelectField({ value, onChange, label, children }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-36 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
    >
      {children}
    </select>
  );
}

function Notice({ type = "success", children, onClose }) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={[
        "flex items-start gap-3 rounded-2xl border p-4 shadow-sm",
        isError
          ? "border-rose-300/50 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/[0.08] dark:text-rose-300"
          : "border-emerald-300/50 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-300",
      ].join(" ")}
    >
      {isError ? (
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      )}
      <p className="min-w-0 flex-1 text-xs font-bold leading-5">{children}</p>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss message"
          onClick={onClose}
          className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function PreferenceCard({ children, className = "" }) {
  return (
    <Card
      variant="glass"
      className={`overflow-hidden rounded-3xl border border-slate-200/70 p-5 shadow-sm transition-colors duration-300 dark:border-white/[0.07] sm:p-7 ${className}`}
    >
      {children}
    </Card>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(cloneDefaults);
  const [savedSettings, setSavedSettings] = useState(cloneDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const enabledCount = useMemo(() => {
    const toggles = [
      settings.notifications.emailAlerts,
      settings.notifications.weeklySummary,
      settings.notifications.realtimeSignals,
      settings.notifications.securityAlerts,
      settings.appearance.animations,
      settings.appearance.compactSidebar,
      settings.workspace.autoSave,
      settings.workspace.analyticsConsent,
    ];

    return toggles.filter(Boolean).length;
  }, [settings]);

  const completion = Math.round((enabledCount / 8) * 100);

  const update = useCallback((section, key, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value,
      },
    }));

    setNotice("");
    setError("");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const localSettings = readLocalSettings();

    if (localSettings) {
      setSettings(localSettings);
      setSavedSettings(localSettings);
    }

    try {
      const response = await settingsApi.get();
      const extracted = extractData(response, DEFAULTS);
      const normalized = normalizeSettings(extracted);

      setSettings(normalized);
      setSavedSettings(normalized);
      persistLocalSettings(normalized);
    } catch (err) {
      if (localSettings) {
        setError(
          "Could not sync with the server. Your locally saved preferences are shown."
        );
      } else {
        const defaults = cloneDefaults();
        setSettings(defaults);
        setSavedSettings(defaults);
        setError(
          getApiErrorMessage(
            err,
            "Unable to load preferences. Default settings are shown."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Apply the selected theme and keep "system" synchronized with the OS.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        settings.appearance.theme === "dark" ||
        (settings.appearance.theme === "system" && media.matches);

      root.classList.toggle("dark", isDark);
      root.dataset.theme = isDark ? "dark" : "light";
      root.style.colorScheme = isDark ? "dark" : "light";

      // Keep the browser chrome and the next page load in sync with the preview.
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", isDark ? "#080d19" : "#f6f8fc");
      persistLocalSettings(settings);
    };

    applyTheme();
    media.addEventListener?.("change", applyTheme);

    return () => media.removeEventListener?.("change", applyTheme);
  }, [settings.appearance.theme, settings]);

  // Expose layout preferences to the rest of the application.
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.density = settings.appearance.density;
    root.dataset.animations = settings.appearance.animations ? "on" : "off";
    root.dataset.compactSidebar = settings.appearance.compactSidebar
      ? "true"
      : "false";

    return () => {
      delete root.dataset.density;
      delete root.dataset.animations;
      delete root.dataset.compactSidebar;
    };
  }, [
    settings.appearance.density,
    settings.appearance.animations,
    settings.appearance.compactSidebar,
  ]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const save = async () => {
    if (saving || loading || !isDirty) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      // Use a snapshot so the saved baseline matches the submitted payload.
      const submitted = normalizeSettings(settings);
      const response = await settingsApi.update(submitted);
      const extracted = extractData(response, submitted);
      const normalized = normalizeSettings(extracted);

      setSettings(normalized);
      setSavedSettings(normalized);
      persistLocalSettings(normalized);
      setNotice("Your preferences have been saved to your account.");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to save preferences. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    const defaults = cloneDefaults();
    setSettings(defaults);
    setNotice("");
    setError("");
  };

  const discardChanges = () => {
    setSettings(normalizeSettings(savedSettings));
    setNotice("");
    setError("");
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!password.currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }

    if (password.newPassword === password.currentPassword) {
      setPasswordError("Choose a password different from your current one.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      await authApi.changePassword({
        currentPassword: password.currentPassword,
        password: password.newPassword,
      });

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordOpen(false);
      setNotice("Your password has been changed successfully.");
    } catch (err) {
      setPasswordError(
        getApiErrorMessage(err, "Unable to change your password.")
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;

    setPasswordOpen(false);
    setPasswordError("");
    setPassword({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const activeTabInfo = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white";

  return (
    <main className="settings-page mx-auto w-full max-w-[1440px] space-y-6 pb-12 motion-safe:animate-[settingsFadeIn_.45s_ease-out]">
      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Premium hero */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#080e1b]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.10),transparent_38%)]" />
        <div className="absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[90px]" />
        <div className="absolute -bottom-36 left-[35%] -z-10 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[100px]" />

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                <Sparkles size={13} />
                Personal control center
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Your workspace.
                <span className="block bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                  Your rules.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Fine-tune your research environment, control notifications, shape
                your interface, and keep your account secure.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold",
                    isDirty
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                      : "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      isDirty ? "bg-amber-500" : "bg-emerald-500",
                    ].join(" ")}
                  />
                  {isDirty ? "Unsaved changes" : "All changes saved"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                  <ShieldCheck size={12} />
                  Account preferences
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                type="button"
                onClick={discardChanges}
                disabled={!isDirty || saving || loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 text-xs font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                <RotateCcw size={14} />
                Discard
              </button>

              <button
                type="button"
                onClick={reset}
                disabled={saving || loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 text-xs font-extrabold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-indigo-300"
              >
                <RefreshCw size={14} />
                Reset defaults
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving || loading || !isDirty}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-size-[200%_100%] bg-left px-5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:bg-right hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Saving preferences..." : "Save preferences"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Enabled preferences
                </span>
                <CheckCheck size={15} className="text-emerald-500" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <strong className="text-2xl font-black text-slate-900 dark:text-white">
                  {enabledCount}
                  <span className="ml-1 text-sm font-bold text-slate-400">/ 8</span>
                </strong>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {completion}%
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-[width] duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex items-center gap-2 text-slate-500">
                {settings.appearance.theme === "dark" ? (
                  <Moon size={15} />
                ) : settings.appearance.theme === "light" ? (
                  <Sun size={15} />
                ) : (
                  <Monitor size={15} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Appearance
                </span>
              </div>
              <strong className="mt-3 block text-xl font-black capitalize text-slate-900 dark:text-white">
                {settings.appearance.theme} theme
              </strong>
              <p className="mt-1 text-[11px] text-slate-500">
                {settings.appearance.density} interface density
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex items-center gap-2 text-slate-500">
                <Zap size={15} />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Motion
                </span>
              </div>
              <strong className="mt-3 block text-xl font-black text-slate-900 dark:text-white">
                {settings.appearance.animations ? "Dynamic" : "Reduced"}
              </strong>
              <p className="mt-1 text-[11px] text-slate-500">
                {settings.appearance.animations
                  ? "Transitions are enabled"
                  : "Subtle motion is disabled"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck size={15} />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Security
                </span>
              </div>
              <strong className="mt-3 block text-xl font-black text-slate-900 dark:text-white">
                Protected
              </strong>
              <p className="mt-1 text-[11px] text-slate-500">
                Password updates use your authentication API
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Notice type="error" onClose={() => setError("")}>
          {error}
        </Notice>
      )}

      {notice && (
        <Notice onClose={() => setNotice("")}>
          {notice}
        </Notice>
      )}

      {/* Settings layout */}
      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-6">
        <aside className="space-y-4 lg:sticky lg:top-5">
          <Card
            variant="glass"
            className="overflow-hidden rounded-3xl border border-slate-200/70 p-2 dark:border-white/[0.07]"
          >
            <div className="px-3 pb-3 pt-3">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">
                Preferences
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Configure your workspace
              </p>
            </div>

            <nav aria-label="Settings sections" className="space-y-1">
              {TABS.map(({ id, label, description, icon: Icon }) => {
                const selected = activeTab === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    aria-current={selected ? "page" : undefined}
                    className={[
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15",
                      selected
                        ? "bg-indigo-500/[0.09] text-indigo-700 ring-1 ring-inset ring-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.045] dark:hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                        selected
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-white/[0.05] dark:text-slate-400 dark:group-hover:bg-white/10",
                      ].join(" ")}
                    >
                      <Icon size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-black">{label}</span>
                      <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                        {description}
                      </span>
                    </span>

                    <ChevronRight
                      size={15}
                      className={[
                        "shrink-0 transition-transform",
                        selected ? "translate-x-0.5 opacity-100" : "opacity-0",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </nav>
          </Card>

          <div className="rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.08] to-cyan-500/[0.04] p-5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
              <CircleHelp size={17} />
              <span className="text-xs font-black">Preference tip</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
              Changes are staged until you save them. Your theme preview updates
              immediately; save to sync preferences with your account.
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-5" aria-live="polite">
          {loading ? (
            <PreferenceCard className="flex min-h-[390px] flex-col items-center justify-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <RefreshCw size={23} className="animate-spin" />
              </div>
              <h2 className="mt-5 text-sm font-black text-slate-900 dark:text-white">
                Loading your preferences
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Syncing your ProblemLens workspace...
              </p>
            </PreferenceCard>
          ) : (
            <div
              key={activeTab}
              className="space-y-5 motion-safe:animate-[settingsFadeIn_.25s_ease-out]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    Workspace configuration
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    {activeTabInfo.label}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {activeTabInfo.description}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                  {isDirty ? "Changes pending" : "Up to date"}
                </span>
              </div>

              {activeTab === "general" && (
                <PreferenceCard>
                  <SectionHeading
                    eyebrow="Productivity"
                    title="Workspace behavior"
                    description="Choose how ProblemLens supports your research workflow."
                    icon={Zap}
                  />

                  <Row
                    icon={RefreshCw}
                    title="Auto-save"
                    description="Allow supported editors to save work automatically as you make changes."
                  >
                    <Toggle
                      checked={settings.workspace.autoSave}
                      onChange={(value) => update("workspace", "autoSave", value)}
                      label="Auto-save"
                    />
                  </Row>

                  <Row
                    icon={ShieldCheck}
                    title="Anonymous usage analytics"
                    description="Allow anonymous product usage measurements to help improve ProblemLens."
                  >
                    <Toggle
                      checked={settings.workspace.analyticsConsent}
                      onChange={(value) =>
                        update("workspace", "analyticsConsent", value)
                      }
                      label="Anonymous usage analytics"
                    />
                  </Row>

                  <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
                    <div className="flex gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                        <CircleHelp size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">
                          Preferences and feature support
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          These controls store your preferences. Auto-save and
                          analytics behavior must also be implemented by the
                          corresponding editor and analytics services.
                        </p>
                      </div>
                    </div>
                  </div>
                </PreferenceCard>
              )}

              {activeTab === "notifications" && (
                <PreferenceCard>
                  <SectionHeading
                    eyebrow="Stay informed"
                    title="Notification intelligence"
                    description="Choose which notification preferences you want enabled."
                    icon={Bell}
                  />

                  <Row
                    icon={Bell}
                    title="Email alerts"
                    description="Receive important account and workspace email notifications."
                  >
                    <Toggle
                      checked={settings.notifications.emailAlerts}
                      onChange={(value) =>
                        update("notifications", "emailAlerts", value)
                      }
                      label="Email alerts"
                    />
                  </Row>

                  <Row
                    icon={Sparkles}
                    title="Weekly intelligence brief"
                    description="Opt in to a weekly summary of workspace activity and research signals."
                  >
                    <Toggle
                      checked={settings.notifications.weeklySummary}
                      onChange={(value) =>
                        update("notifications", "weeklySummary", value)
                      }
                      label="Weekly intelligence brief"
                    />
                  </Row>

                  <Row
                    icon={Zap}
                    title="Real-time signals"
                    description="Enable in-app notifications for new evidence and relevant activity."
                  >
                    <Toggle
                      checked={settings.notifications.realtimeSignals}
                      onChange={(value) =>
                        update("notifications", "realtimeSignals", value)
                      }
                      label="Real-time signals"
                    />
                  </Row>

                  <Row
                    icon={ShieldCheck}
                    title="Security alerts"
                    description="Keep security-related alerts enabled so important account events remain visible."
                    last
                  >
                    <Toggle
                      checked={settings.notifications.securityAlerts}
                      onChange={(value) =>
                        update("notifications", "securityAlerts", value)
                      }
                      label="Security alerts"
                    />
                  </Row>

                  <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-500 dark:bg-white/[0.03]">
                    These are notification preferences. Actual email delivery
                    and real-time alerts depend on your backend notification
                    services.
                  </p>
                </PreferenceCard>
              )}

              {activeTab === "appearance" && (
                <PreferenceCard>
                  <SectionHeading
                    eyebrow="Personalize"
                    title="Interface studio"
                    description="Adjust the appearance and density of your workspace."
                    icon={Palette}
                  />

                  <Row
                    icon={Sun}
                    title="Color theme"
                    description="Use a light or dark appearance, or follow your device's system preference."
                  >
                    <SelectField
                      label="Color theme"
                      value={settings.appearance.theme}
                      onChange={(value) => update("appearance", "theme", value)}
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </SelectField>
                  </Row>

                  <Row
                    icon={Layout}
                    title="Interface density"
                    description="Choose more breathing room or a compact layout for information-heavy screens."
                  >
                    <SelectField
                      label="Interface density"
                      value={settings.appearance.density}
                      onChange={(value) =>
                        update("appearance", "density", value)
                      }
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </SelectField>
                  </Row>

                  <Row
                    icon={Sparkles}
                    title="Interface animations"
                    description="Enable subtle transitions and decorative motion where supported."
                  >
                    <Toggle
                      checked={settings.appearance.animations}
                      onChange={(value) =>
                        update("appearance", "animations", value)
                      }
                      label="Interface animations"
                    />
                  </Row>

                  <Row
                    icon={Layout}
                    title="Compact sidebar"
                    description="Choose a narrower navigation rail where the application layout supports it."
                    last
                  >
                    <Toggle
                      checked={settings.appearance.compactSidebar}
                      onChange={(value) =>
                        update("appearance", "compactSidebar", value)
                      }
                      label="Compact sidebar"
                    />
                  </Row>

                  <div className="mt-5 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.04] p-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
                      <Monitor size={16} />
                      <span className="text-xs font-black">Live theme preview</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      The light/dark theme is applied immediately. Density,
                      sidebar width, and application-wide animation preferences
                      require your shared layout components and CSS to read the
                      corresponding document data attributes.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                        {settings.appearance.theme} theme
                      </span>
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                        {settings.appearance.density} density
                      </span>
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                        Motion {settings.appearance.animations ? "on" : "off"}
                      </span>
                    </div>
                  </div>
                </PreferenceCard>
              )}

              {activeTab === "security" && (
                <>
                  <PreferenceCard>
                    <SectionHeading
                      eyebrow="Account protection"
                      title="Security center"
                      description="Manage your credentials and keep your account protected."
                      icon={ShieldCheck}
                    />

                    <div className="mt-6 rounded-2xl border border-rose-500/15 bg-gradient-to-br from-rose-500/[0.06] to-orange-500/[0.03] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
                            <LockKeyhole size={19} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              Password credentials
                            </h3>
                            <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Change your password after verifying your current
                              credentials with the server.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPasswordError("");
                            setPasswordOpen(true);
                          }}
                          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                        >
                          <LockKeyhole size={14} />
                          Change password
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.045] p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                          <ShieldCheck size={17} />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                            Authentication-managed password updates
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                            Password changes are submitted through your existing
                            authentication API. Server-side verification,
                            password hashing, and session handling must be
                            enforced by the backend.
                          </p>
                        </div>
                      </div>
                    </div>
                  </PreferenceCard>

                  <PreferenceCard>
                    <SectionHeading
                      eyebrow="Privacy"
                      title="Data preferences"
                      description="Review your workspace data-related choices."
                      icon={ShieldCheck}
                    />

                    <Row
                      icon={ShieldCheck}
                      title="Anonymous analytics"
                      description="Your current preference for anonymous product analytics."
                      last
                    >
                      <span
                        className={[
                          "rounded-full px-3 py-1.5 text-[10px] font-black",
                          settings.workspace.analyticsConsent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400",
                        ].join(" ")}
                      >
                        {settings.workspace.analyticsConsent
                          ? "Opted in"
                          : "Opted out"}
                      </span>
                    </Row>
                  </PreferenceCard>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Change password modal */}
      {passwordOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md motion-safe:animate-[settingsFadeIn_.18s_ease-out]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePasswordModal();
          }}
        >
          <form
            onSubmit={changePassword}
            aria-labelledby="change-password-title"
            aria-modal="true"
            role="dialog"
            className="my-auto w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl shadow-black/30 dark:bg-[#0b1020]"
          >
            <div className="relative overflow-hidden border-b border-slate-200 p-6 dark:border-white/[0.07] sm:p-7">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-indigo-500/10 blur-[60px]" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <LockKeyhole size={21} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                      Security center
                    </p>
                    <h3
                      id="change-password-title"
                      className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white"
                    >
                      Change password
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Use a strong password you have not used before.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={passwordSaving}
                  aria-label="Close change password dialog"
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 dark:hover:bg-white/[0.07] dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6 sm:p-7">
              {passwordError && (
                <Notice type="error">{passwordError}</Notice>
              )}

              {[
                {
                  label: "Current password",
                  key: "currentPassword",
                  visible: showCurrent,
                  setVisible: setShowCurrent,
                  autocomplete: "current-password",
                },
                {
                  label: "New password",
                  key: "newPassword",
                  visible: showNew,
                  setVisible: setShowNew,
                  autocomplete: "new-password",
                },
                {
                  label: "Confirm new password",
                  key: "confirmPassword",
                  visible: showConfirm,
                  setVisible: setShowConfirm,
                  autocomplete: "new-password",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`password-${field.key}`}
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                  >
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      id={`password-${field.key}`}
                      required
                      minLength={field.key === "currentPassword" ? undefined : 8}
                      autoComplete={field.autocomplete}
                      type={field.visible ? "text" : "password"}
                      value={password[field.key]}
                      onChange={(event) => {
                        setPassword((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }));
                        setPasswordError("");
                      }}
                      className={`${inputClass} pr-12`}
                      placeholder={
                        field.key === "currentPassword"
                          ? "Enter current password"
                          : field.key === "newPassword"
                            ? "At least 8 characters"
                            : "Enter new password again"
                      }
                    />

                    <button
                      type="button"
                      onClick={() => field.setVisible(!field.visible)}
                      aria-label={
                        field.visible
                          ? `Hide ${field.label.toLowerCase()}`
                          : `Show ${field.label.toLowerCase()}`
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {field.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {field.key === "newPassword" && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      Use at least 8 characters. A longer, unique password is
                      recommended.
                    </p>
                  )}
                </div>
              ))}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={passwordSaving}
                  className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordSaving ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  {passwordSaving ? "Updating password..." : "Update password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Persistent save action for long settings pages */}
      {!loading && isDirty && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 motion-safe:animate-[settingsFadeIn_.2s_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <AlertCircle size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 dark:text-white">
                Unsaved changes
              </p>
              <p className="text-[10px] text-slate-500">
                Save to sync your preferences.
              </p>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3.5 text-[11px] font-black text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save
            </button>

            <button
              type="button"
              onClick={discardChanges}
              disabled={saving}
              aria-label="Discard unsaved changes"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}