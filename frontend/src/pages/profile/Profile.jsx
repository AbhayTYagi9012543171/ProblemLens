
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Pencil,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { authApi, extractData, getApiErrorMessage } from "../../services/api";

/* =========================================================
   MOTION
========================================================= */

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    x: 18,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -18,
    scale: 0.985,
    transition: {
      duration: 0.2,
    },
  },
};

/* =========================================================
   PREMIUM INPUT
========================================================= */

function PremiumInput({
  label,
  type = "text",
  value = "",
  onChange,
  onClear,
  placeholder = "",
  icon: Icon,
  disabled = false,
  action,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </label>

          {action}
        </div>
      )}

      <motion.div
        animate={{
          y: focused ? -1 : 0,
        }}
        className={[
          "group relative flex min-h-[54px] items-center overflow-hidden rounded-2xl border",
          "bg-slate-950/70 backdrop-blur-xl transition-all duration-300",
          focused
            ? "border-indigo-500/70 shadow-[0_0_0_4px_rgba(99,102,241,0.10),0_16px_40px_rgba(79,70,229,0.10)]"
            : "border-slate-800/90 hover:border-slate-700",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-full min-h-[54px] w-12 shrink-0 items-center justify-center transition-colors",
            focused ? "text-indigo-400" : "text-slate-500",
          ].join(" ")}
        >
          {Icon && <Icon size={18} />}
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent py-3 pr-10 text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {value && onClear && !disabled && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onClear}
            className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={14} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  setVisible,
  icon: Icon = Lock,
}) {
  return (
    <PremiumInput
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      icon={Icon}
      action={
        value ? (
          <span className="text-[10px] font-bold text-slate-600">
            {visible ? "VISIBLE" : "HIDDEN"}
          </span>
        ) : null
      }
    />
  );
}

/* =========================================================
   PASSWORD STRENGTH
========================================================= */

function PasswordStrength({ password }) {
  const score = useMemo(() => {
    if (!password) return 0;

    let result = 0;

    if (password.length >= 8) result++;
    if (password.length >= 12) result++;
    if (/[A-Z]/.test(password)) result++;
    if (/[0-9]/.test(password)) result++;
    if (/[^A-Za-z0-9]/.test(password)) result++;

    return Math.min(result, 4);
  }, [password]);

  if (!password) return null;

  const levels = [
    {
      label: "Very weak",
      text: "text-rose-400",
      bg: "bg-rose-500",
    },
    {
      label: "Weak",
      text: "text-orange-400",
      bg: "bg-orange-500",
    },
    {
      label: "Good",
      text: "text-amber-400",
      bg: "bg-amber-500",
    },
    {
      label: "Strong",
      text: "text-emerald-400",
      bg: "bg-emerald-500",
    },
  ];

  const level = levels[Math.max(score - 1, 0)];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-3 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Password strength
        </span>

        <span className={`text-[10px] font-black uppercase ${level.text}`}>
          {level.label}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: index < score ? 1 : 0.25 }}
            transition={{ delay: index * 0.05 }}
            className={`h-1.5 origin-left rounded-full ${
              index < score ? level.bg : "bg-slate-800"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  glow,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -5,
        scale: 1.015,
      }}
      className="group relative overflow-hidden rounded-[26px] border border-slate-800/80 bg-slate-900/55 p-5 shadow-xl shadow-black/10 backdrop-blur-2xl"
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-black tracking-tight text-white sm:text-[28px]">
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        <motion.div
          whileHover={{
            rotate: 6,
            scale: 1.1,
          }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${iconClass}`}
        >
          <Icon size={19} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="mb-7 flex items-start gap-4 border-b border-slate-800/80 pb-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-black tracking-tight text-white">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("personal");

  const [form, setForm] = useState({
    name: user?.name || user?.fullName || "Abhay Tyagi",
    email: user?.email || "abhay@problemlens.ai",
    role: user?.role || "Lead Research Analyst",
    organization:
      user?.organization || "ProblemLens Intelligence Lab",
    location: user?.location || "Delhi NCR, India",
    bio:
      user?.bio ||
      "Product researcher focused on problem discovery, signal validation, and user interviews.",
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const avatarInputRef = useRef(null);

  /* =======================================================
     SYNC USER
  ======================================================= */

  useEffect(() => {
    if (!user) return;

    setForm((previous) => ({
      ...previous,
      name: user.name || user.fullName || previous.name,
      email: user.email || previous.email,
      role: user.role || previous.role,
      organization: user.organization || previous.organization,
      location: user.location || previous.location,
      bio: user.bio || previous.bio,
    }));

    if (user.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user]);

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => {
      setNotice("");
    }, 4200);

    return () => clearTimeout(timer);
  }, [notice]);

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const completion = useMemo(() => {
    const fields = [
      form.name,
      form.email,
      form.role,
      form.organization,
      form.location,
      form.bio,
      avatarUrl,
    ];

    const completed = fields.filter(Boolean).length;

    return Math.round((completed / fields.length) * 100);
  }, [form, avatarUrl]);

  /* =======================================================
     AVATAR
  ======================================================= */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result || ""));
      setErrorMessage("");
      setNotice("Profile photo preview updated.");
    };
    reader.readAsDataURL(file);
    setErrorMessage("");
    setNotice("Profile photo preview updated.");
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setNotice("Profile photo removed.");
  };

  /* =======================================================
     PROFILE SAVE
  ======================================================= */

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await authApi.updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        organization: form.organization.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        avatar: avatarUrl || "",
      });

      const savedUser = extractData(response, null);
      if (savedUser && updateUser) {
        updateUser(savedUser);
      }

      setNotice("Profile details updated successfully.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to update profile. Please try again.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     SECURITY SAVE
  ======================================================= */

  const handleSecuritySubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!securityForm.currentPassword) {
      setErrorMessage("Enter your current password.");
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      await authApi.changePassword({
        currentPassword: securityForm.currentPassword,
        password: securityForm.newPassword,
      });

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setNotice("Password updated successfully.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to update password. Verify your credentials.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal",
      description: "Profile & contact",
      icon: UserRound,
    },
    {
      id: "security",
      label: "Security",
      description: "Password & access",
      icon: Shield,
    },
    {
      id: "workspace",
      label: "Workspace",
      description: "Role & organization",
      icon: Building2,
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto w-full max-w-[1380px] space-y-6 pb-16"
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[8%] top-20 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[8%] top-[15%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[130px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05),transparent_45%)]" />
      </div>

      {/* =====================================================
          PREMIUM HERO
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="group relative overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-950/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-3xl sm:p-8 lg:p-9"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_15%_100%,rgba(139,92,246,0.12),transparent_35%)]" />

          <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full border border-indigo-500/10" />

          <div className="absolute right-[-120px] top-[-140px] h-96 w-96 rounded-full border border-indigo-500/5" />
        </div>

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 gap-5">
            {/* Hero Avatar */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="hidden h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-3xl font-black text-white shadow-2xl shadow-indigo-500/20 sm:flex"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                (form.name || "U").charAt(0).toUpperCase()
              )}
            </motion.div>

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-indigo-300">
                  <Sparkles size={12} />
                  Account Center
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Active
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl lg:text-[42px]">
                Profile & Identity
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400 sm:text-sm">
                Control your research identity, workspace presence,
                security credentials, and account information from one
                centralized profile.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 backdrop-blur-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Profile completion
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  />
                </div>

                <span className="text-xs font-black text-white">
                  {completion}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <motion.section
        variants={pageVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          icon={Activity}
          label="Research activity"
          value="142"
          description="Contributed problem signals"
          iconClass="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
          glow="bg-indigo-500/20"
        />

        <StatCard
          icon={CheckCircle2}
          label="Validation rate"
          value="94.2%"
          description="Accepted evidence quality"
          iconClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          glow="bg-emerald-500/20"
        />

        <StatCard
          icon={Award}
          label="Access level"
          value="Admin"
          description="Full workspace permissions"
          iconClass="border-violet-500/20 bg-violet-500/10 text-violet-400"
          glow="bg-violet-500/20"
        />

        <StatCard
          icon={Clock3}
          label="Member since"
          value="Oct 2024"
          description="Active workspace member"
          iconClass="border-amber-500/20 bg-amber-500/10 text-amber-400"
          glow="bg-amber-500/20"
        />
      </motion.section>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
      >
        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <aside className="space-y-5">
          {/* Profile Card */}
          <Card className="group relative overflow-hidden border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl shadow-black/10 backdrop-blur-3xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent" />

            <div className="relative flex flex-col items-center">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-5xl font-black text-white shadow-2xl shadow-indigo-500/20 ring-4 ring-slate-950"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (form.name || form.email || "U")
                      .charAt(0)
                      .toUpperCase()
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>

                {/* Upload */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-950 bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
                  title="Change profile photo"
                >
                  <Camera size={16} />
                </motion.button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {avatarUrl && (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-slate-950 bg-rose-500 text-white shadow-lg"
                    title="Remove profile photo"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                )}
              </div>

              <div className="mt-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="max-w-[220px] truncate text-lg font-black text-white">
                    {form.name || "Workspace User"}
                  </h2>

                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-indigo-400"
                  />
                </div>

                <p className="mt-1 max-w-[230px] truncate text-xs font-medium text-slate-500">
                  {form.email}
                </p>

                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black text-indigo-300">
                  <Sparkles size={12} />
                  <span className="truncate">{form.role}</span>
                </div>
              </div>

              {/* Identity Info */}
              <div className="mt-6 w-full space-y-1 border-t border-slate-800/80 pt-5">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                  <Building2
                    size={15}
                    className="shrink-0 text-indigo-400"
                  />

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Organization
                    </p>
                    <p className="truncate text-xs font-bold text-slate-300">
                      {form.organization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                  <MapPin
                    size={15}
                    className="shrink-0 text-indigo-400"
                  />

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Location
                    </p>
                    <p className="truncate text-xs font-bold text-slate-300">
                      {form.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                  <UserCheck
                    size={15}
                    className="shrink-0 text-emerald-400"
                  />

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Account status
                    </p>

                    <p className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <Card className="border-slate-800/80 bg-slate-900/55 p-2 shadow-xl backdrop-blur-3xl">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setErrorMessage("");
                    }}
                    className={[
                      "relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-3.5 text-left transition-all duration-300",
                      active
                        ? "text-white"
                        : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.div
                        layoutId="profile-active-tab"
                        className="absolute inset-0 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20"
                      />
                    )}

                    <div
                      className={[
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-white/10 text-white"
                          : "bg-slate-800/60 text-slate-500",
                      ].join(" ")}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="truncate text-xs font-black">
                        {tab.label}
                      </p>

                      <p
                        className={[
                          "truncate text-[9px] font-medium",
                          active ? "text-indigo-100" : "text-slate-600",
                        ].join(" ")}
                      >
                        {tab.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className={[
                        "relative z-10 shrink-0 transition-transform",
                        active
                          ? "translate-x-0 text-indigo-100"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0",
                      ].join(" ")}
                    />
                  </motion.button>
                );
              })}
            </nav>
          </Card>

          {/* Security Badge */}
          <div className="rounded-[24px] border border-emerald-500/15 bg-emerald-500/5 p-4 backdrop-blur-xl">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={17} />
              </div>

              <div>
                <p className="text-xs font-black text-emerald-300">
                  Protected workspace
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  Your profile and workspace credentials are managed through
                  the authenticated account system.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <section className="min-w-0">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 shadow-lg shadow-rose-950/10"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-rose-400"
                />

                <div className="min-w-0">
                  <p className="text-xs font-black text-rose-300">
                    Action could not be completed
                  </p>

                  <p className="mt-0.5 text-[11px] leading-relaxed text-rose-400/80">
                    {errorMessage}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="ml-auto shrink-0 text-rose-400/70 hover:text-rose-300"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}

            {activeTab === "personal" && (
              <motion.div
                key="personal"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Card className="overflow-hidden border-slate-800/80 bg-slate-900/55 p-5 shadow-2xl shadow-black/10 backdrop-blur-3xl sm:p-7">
                  <SectionHeader
                    eyebrow="Identity"
                    title="Personal information"
                    description="Manage the information used to identify you across your ProblemLens workspace."
                    icon={UserRound}
                  />

                  <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-6"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <PremiumInput
                        label="Full name"
                        icon={UserRound}
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        onClear={() =>
                          setForm((current) => ({
                            ...current,
                            name: "",
                          }))
                        }
                        placeholder="Your full name"
                      />

                      <PremiumInput
                        label="Email address"
                        icon={Mail}
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        onClear={() =>
                          setForm((current) => ({
                            ...current,
                            email: "",
                          }))
                        }
                        placeholder="name@example.com"
                      />
                    </div>

                    <PremiumInput
                      label="Location"
                      icon={Globe2}
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      onClear={() =>
                        setForm((current) => ({
                          ...current,
                          location: "",
                        }))
                      }
                      placeholder="City, Country"
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Professional bio
                        </label>

                        <span className="text-[9px] font-bold text-slate-600">
                          {form.bio.length}/300
                        </span>
                      </div>

                      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/70 transition-all duration-300 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
                        <textarea
                          rows={6}
                          maxLength={300}
                          value={form.bio}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              bio: event.target.value,
                            }))
                          }
                          placeholder="Tell your workspace about your research focus..."
                          className="w-full resize-none bg-transparent p-4 text-sm font-medium leading-6 text-slate-100 outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] font-medium text-slate-600">
                        Changes are reflected across your workspace profile.
                      </p>

                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-indigo-600 px-5 shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] sm:w-auto"
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Check size={15} />
                            Save changes
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Card className="overflow-hidden border-slate-800/80 bg-slate-900/55 p-5 shadow-2xl shadow-black/10 backdrop-blur-3xl sm:p-7">
                  <SectionHeader
                    eyebrow="Protection"
                    title="Security & credentials"
                    description="Keep your account protected by maintaining a strong authentication credential."
                    icon={Shield}
                  />

                  <form
                    onSubmit={handleSecuritySubmit}
                    className="space-y-6"
                  >
                    <PasswordInput
                      label="Current password"
                      value={securityForm.currentPassword}
                      onChange={(event) =>
                        setSecurityForm((previous) => ({
                          ...previous,
                          currentPassword: event.target.value,
                        }))
                      }
                      visible={showCurrent}
                      setVisible={setShowCurrent}
                      icon={KeyRound}
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <PasswordInput
                          label="New password"
                          value={securityForm.newPassword}
                          onChange={(event) =>
                            setSecurityForm((previous) => ({
                              ...previous,
                              newPassword: event.target.value,
                            }))
                          }
                          visible={showNew}
                          setVisible={setShowNew}
                          icon={Lock}
                        />

                        <PasswordStrength
                          password={securityForm.newPassword}
                        />
                      </div>

                      <PasswordInput
                        label="Confirm new password"
                        value={securityForm.confirmPassword}
                        onChange={(event) =>
                          setSecurityForm((previous) => ({
                            ...previous,
                            confirmPassword: event.target.value,
                          }))
                        }
                        visible={showConfirm}
                        setVisible={setShowConfirm}
                        icon={Lock}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        "Minimum 8 characters",
                        "Uppercase & numbers",
                        "Special character",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-3"
                        >
                          <CheckCircle2
                            size={14}
                            className="shrink-0 text-emerald-400"
                          />

                          <span className="text-[10px] font-bold text-slate-500">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        <ShieldCheck size={14} />
                        Keep your credentials private.
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isSaving ||
                          !securityForm.currentPassword ||
                          !securityForm.newPassword ||
                          !securityForm.confirmPassword
                        }
                        className="w-full bg-indigo-600 px-5 shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                            Updating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShieldCheck size={15} />
                            Update password
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Card className="overflow-hidden border-slate-800/80 bg-slate-900/55 p-5 shadow-2xl shadow-black/10 backdrop-blur-3xl sm:p-7">
                  <SectionHeader
                    eyebrow="Workspace"
                    title="Workspace identity"
                    description="Configure how your role and organization are represented across research activity."
                    icon={Building2}
                  />

                  <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-6"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <PremiumInput
                        label="Research role"
                        icon={Sparkles}
                        value={form.role}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            role: event.target.value,
                          }))
                        }
                        onClear={() =>
                          setForm((previous) => ({
                            ...previous,
                            role: "",
                          }))
                        }
                        placeholder="Researcher"
                      />

                      <PremiumInput
                        label="Organization"
                        icon={Building2}
                        value={form.organization}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            organization: event.target.value,
                          }))
                        }
                        onClear={() =>
                          setForm((previous) => ({
                            ...previous,
                            organization: "",
                          }))
                        }
                        placeholder="Organization name"
                      />
                    </div>

                    <div className="relative overflow-hidden rounded-[24px] border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent p-5">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                          <Zap size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-black text-indigo-300">
                            Workspace metadata
                          </p>

                          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                            Your role and organization information can be used
                            to identify contributors across projects, evidence,
                            research logs, and problem intelligence records.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                            <Award size={16} />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                              Permission level
                            </p>
                            <p className="mt-0.5 text-xs font-black text-white">
                              Administrator
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <BadgeCheck size={16} />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                              Workspace status
                            </p>
                            <p className="mt-0.5 text-xs font-black text-emerald-400">
                              Verified
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] font-medium text-slate-600">
                        Workspace identity is shared with authorized workspace
                        members.
                      </p>

                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-indigo-600 px-5 shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] sm:w-auto"
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Check size={15} />
                            Save workspace
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

      {/* =====================================================
          SUCCESS TOAST
      ===================================================== */}

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 28,
            }}
            className="fixed bottom-5 right-5 z-[100] w-[calc(100%-40px)] max-w-sm"
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Check size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white">
                    Update successful
                  </p>

                  <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                    {notice}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

