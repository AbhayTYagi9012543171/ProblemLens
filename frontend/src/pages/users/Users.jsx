
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownUp,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  LockKeyhole,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users as UsersIcon,
  UserRound,
  UserRoundX,
  UserX,
  X,
} from "lucide-react";

import {
  extractList,
  getApiErrorMessage,
  userApi,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "RESEARCHER",
  isActive: true,
};

const ROLES = [
  { value: "RESEARCHER", label: "Researcher" },
  { value: "VIEWER", label: "Viewer" },
  { value: "ADMIN", label: "Administrator" },
];

const idOf = (user) => user?._id || user?.id;

const statusOf = (user) =>
  user?.isActive === false ||
  String(user?.status || "").toLowerCase() === "inactive"
    ? "Inactive"
    : "Active";

const roleLabel = (role) =>
  ({
    ADMIN: "Administrator",
    RESEARCHER: "Researcher",
    VIEWER: "Viewer",
  })[role] || role || "Researcher";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const dateLabel = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

function Avatar({ user, size = "normal" }) {
  return (
    <div
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500",
        "font-black text-white shadow-lg shadow-indigo-500/15",
        size === "large" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm"
      )}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        initials(user?.name)
      )}
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red:
      "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    indigo:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    amber:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    slate:
      "border-slate-500/15 bg-slate-500/10 text-slate-500 dark:text-slate-300",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full",
        "border px-2.5 py-1 text-[10px] font-extrabold tracking-wide",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
}

function MetricCard({ label, value, description, icon: Icon, tone, index }) {
  const tones = {
    indigo: "bg-indigo-500/10 text-indigo-500",
    green: "bg-emerald-500/10 text-emerald-500",
    violet: "bg-violet-500/10 text-violet-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/5 dark:border-white/[0.07] dark:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={cx(
            "grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
            tones[tone]
          )}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        {description}
      </p>
    </motion.div>
  );
}

function FormField({ label, hint, children, className = "" }) {
  return (
    <label className={cx("block min-w-0", className)}>
      <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[10px] leading-4 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

function UserModal({
  open,
  editing,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) setShowPassword(false);
  }, [open, editing]);

  const fieldClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose();
          }}
        >
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="my-auto w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl dark:bg-slate-950"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#11152e] via-[#29205b] to-[#111827] px-6 py-6 text-white sm:px-8">
              <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-violet-200">
                    <Sparkles size={12} />
                    Admin workspace
                  </div>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {editing ? "Edit user" : "Create a user"}
                  </h2>
                  <p className="mt-2 max-w-md text-xs leading-6 text-slate-300">
                    {editing
                      ? "Update account details, permissions and access status."
                      : "Add a member and configure their initial account access."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Close form"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs font-semibold leading-5 text-rose-600 dark:text-rose-300"
                >
                  <CircleAlert size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Full name" className="sm:col-span-2">
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Enter full name"
                      className={cx(fieldClass, "pl-11")}
                    />
                  </div>
                </FormField>

                <FormField label="Email address">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="name@company.com"
                      className={cx(fieldClass, "pl-11")}
                    />
                  </div>
                </FormField>

                <FormField label="Access role">
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      value={form.role}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, role: event.target.value }))
                      }
                      className={cx(fieldClass, "appearance-none pl-11 pr-10")}
                    >
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  </div>
                </FormField>

                <FormField
                  label={editing ? "Change password (optional)" : "Initial password"}
                  className="sm:col-span-2"
                  hint={
                    editing
                      ? "Leave blank to keep the current password unchanged."
                      : "Use at least 8 characters. Share initial credentials securely."
                  }
                >
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required={!editing}
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      placeholder={editing ? "Leave blank to keep password" : "Minimum 8 characters"}
                      className={cx(fieldClass, "pl-11 pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-indigo-500"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
                <div className="flex items-center gap-3">
                  <div
                    className={cx(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      form.isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-slate-500/10 text-slate-400"
                    )}
                  >
                    {form.isActive ? <UserCheck size={19} /> : <UserRoundX size={19} />}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Account status
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {form.isActive
                        ? "This account will be active."
                        : "This account will be inactive."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cx(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span
                    className={cx(
                      "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
                      form.isActive ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-white/[0.08] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : editing ? (
                    <Check size={15} />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  {saving ? "Saving..." : editing ? "Save changes" : "Create user"}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDialog({ state, busy, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-slate-950 sm:p-7"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
              {state.type === "delete" ? <Trash2 size={21} /> : <Shield size={21} />}
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              {state.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {state.description}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                className={cx(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black text-white disabled:opacity-60",
                  state.type === "delete"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {busy && <RefreshCw size={14} className="animate-spin" />}
                {state.confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 18, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-5 right-4 z-[130] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-emerald-500/20 bg-white p-4 shadow-2xl dark:bg-slate-950 sm:bottom-7 sm:right-7"
        >
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <p className="text-xs font-extrabold text-slate-800 dark:text-white">
            {toast}
          </p>
          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const canManage = String(currentUser?.role || "").toUpperCase() === "ADMIN";
  const currentUserId = String(idOf(currentUser) || "");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadUsers = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setPageError("");

    try {
      const response = await userApi.getAll();
      setUsers(extractList(response));
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Unable to load users. Check your connection and administrator access."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch =
          !query ||
          `${user.name || ""} ${user.email || ""}`
            .toLowerCase()
            .includes(query);

        const matchesRole =
          roleFilter === "ALL" || user.role === roleFilter;

        const matchesStatus =
          statusFilter === "ALL" ||
          statusOf(user).toUpperCase() === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return String(a.name || "").localeCompare(String(b.name || ""));
        }

        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [users, search, roleFilter, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    const active = users.filter((user) => statusOf(user) === "Active").length;

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      admins: users.filter((user) => user.role === "ADMIN").length,
      researchers: users.filter((user) => user.role === "RESEARCHER").length,
      viewers: users.filter((user) => user.role === "VIEWER").length,
    };
  }, [users]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "RESEARCHER",
      isActive: statusOf(user) === "Active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  const saveUser = async (event) => {
    event.preventDefault();
    if (!canManage || saving) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setFormError("Please enter a name with at least 2 characters.");
      return;
    }

    if (!email) {
      setFormError("Email address is required.");
      return;
    }

    if (!editing && form.password.length < 8) {
      setFormError("The initial password must contain at least 8 characters.");
      return;
    }

    if (editing && form.password && form.password.length < 8) {
      setFormError("A new password must contain at least 8 characters.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name,
        email,
        role: form.role,
        isActive: Boolean(form.isActive),
      };

      if (form.password) payload.password = form.password;

      if (editing) {
        const response = await userApi.update(idOf(editing), payload);
        const saved = unwrap(response);

        setUsers((previous) =>
          previous.map((user) =>
            String(idOf(user)) === String(idOf(editing))
              ? { ...user, ...saved, ...payload, _id: idOf(user) }
              : user
          )
        );

        setToast("User details updated successfully.");
      } else {
        const response = await userApi.create({
          ...payload,
          password: form.password,
        });
        const saved = unwrap(response);

        if (!saved || !idOf(saved)) {
          await loadUsers(true);
        } else {
          setUsers((previous) => [
            saved,
            ...previous.filter(
              (user) => String(idOf(user)) !== String(idOf(saved))
            ),
          ]);
        }

        setToast("New user created successfully.");
      }

      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to save this user."));
    } finally {
      setSaving(false);
    }
  };

  const requestToggle = (user) => {
    if (!canManage) return;

    if (String(idOf(user)) === currentUserId && statusOf(user) === "Active") {
      setPageError("You cannot deactivate your own account from this screen.");
      return;
    }

    const currentlyActive = statusOf(user) === "Active";

    setConfirm({
      type: "status",
      user,
      title: currentlyActive ? "Deactivate this account?" : "Activate this account?",
      description: currentlyActive
        ? `${user.name} will be marked inactive. Whether they can sign in depends on the backend authentication checks.`
        : `${user.name} will be marked active and may be able to sign in again.`,
      confirmLabel: currentlyActive ? "Deactivate account" : "Activate account",
      active: !currentlyActive,
    });
  };

  const requestDelete = (user) => {
    if (!canManage) return;

    if (String(idOf(user)) === currentUserId) {
      setPageError("You cannot delete your own account from this screen.");
      return;
    }

    setConfirm({
      type: "delete",
      user,
      title: "Delete this user permanently?",
      description: `The account for ${user.name} will be removed. This action cannot be undone.`,
      confirmLabel: "Delete user",
    });
  };

  const runConfirmedAction = async () => {
    if (!confirm || !canManage || confirmBusy) return;

    const user = confirm.user;
    const userId = idOf(user);

    setConfirmBusy(true);
    setBusyId(String(userId));
    setBusyAction(confirm.type);
    setPageError("");

    try {
      if (confirm.type === "delete") {
        await userApi.remove(userId);
        setUsers((previous) =>
          previous.filter((item) => String(idOf(item)) !== String(userId))
        );
        setToast("User deleted successfully.");
      } else {
        const response = confirm.active
          ? await userApi.activate(userId)
          : await userApi.deactivate(userId);

        const saved = unwrap(response);

        setUsers((previous) =>
          previous.map((item) =>
            String(idOf(item)) === String(userId)
              ? {
                  ...item,
                  ...(saved && typeof saved === "object" ? saved : {}),
                  isActive: confirm.active,
                  status: confirm.active ? "Active" : "Inactive",
                }
              : item
          )
        );

        setToast(
          confirm.active
            ? "Account activated successfully."
            : "Account deactivated successfully."
        );
      }

      setConfirm(null);
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "The requested account action failed.")
      );
    } finally {
      setConfirmBusy(false);
      setBusyId("");
      setBusyAction("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-12">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#080e1b] via-[#19143e] to-[#101526] p-6 text-white shadow-2xl shadow-indigo-950/10 sm:p-9 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />

        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">
              <Sparkles size={13} />
              ProblemLens · Admin console
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-[-0.045em] sm:text-5xl">
              People, roles
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-200 bg-clip-text text-transparent">
                & access.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Manage your workspace directory, permissions and account status
              from one clear, responsive control center.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge tone="indigo">
                <ShieldCheck size={11} />
                Role-based access
              </Badge>
              <Badge tone="green">
                <Activity size={11} />
                {metrics.active} active accounts
              </Badge>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-extrabold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              disabled={!canManage}
              title={!canManage ? "Administrator access required" : "Create user"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-xs font-black text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
              Add user
            </button>
          </div>
        </div>
      </section>

      {!canManage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-700 dark:text-amber-300"
        >
          <LockKeyhole size={17} className="mt-1 shrink-0" />
          <p>
            <strong>Read-only access.</strong> An administrator account is
            required to create, edit, activate, deactivate or delete users.
          </p>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total members"
          value={metrics.total}
          description="Accounts in your user directory"
          icon={UsersIcon}
          tone="indigo"
          index={0}
        />
        <MetricCard
          label="Active accounts"
          value={metrics.active}
          description="Accounts currently marked active"
          icon={UserCheck}
          tone="green"
          index={1}
        />
        <MetricCard
          label="Administrators"
          value={metrics.admins}
          description="Accounts assigned admin privileges"
          icon={ShieldCheck}
          tone="violet"
          index={2}
        />
        <MetricCard
          label="Inactive accounts"
          value={metrics.inactive}
          description="Accounts currently marked inactive"
          icon={UserX}
          tone="amber"
          index={3}
        />
      </div>

      {/* Page error */}
      <AnimatePresence>
        {pageError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs leading-6 text-rose-600 dark:text-rose-300"
          >
            <CircleAlert size={18} className="mt-1 shrink-0" />
            <p className="flex-1">{pageError}</p>
            <button
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
              className="rounded-lg p-1 hover:bg-rose-500/10"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory */}
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-950/[0.025] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/65">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/[0.07] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Workspace directory
              </h2>
              <Badge>{filteredUsers.length} users</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Search, filter and manage member access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {metrics.active} active
            </Badge>
            <Badge tone="red">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {metrics.inactive} inactive
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-3 border-b border-slate-200/70 p-4 dark:border-white/[0.07] sm:p-5 lg:grid-cols-[minmax(200px,1fr)_180px_180px_180px]">
          <div className="relative min-w-0">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              aria-label="Search users"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/[0.08] dark:bg-slate-950/70 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 dark:border-white/[0.08] dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">All roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="relative">
            <Activity
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by account status"
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 dark:border-white/[0.08] dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="relative">
            <ArrowDownUp
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort users"
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 dark:border-white/[0.08] dark:bg-slate-950 dark:text-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* User table */}
        {loading ? (
          <div className="grid min-h-[340px] place-items-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={26} className="animate-spin text-indigo-500" />
              <p className="text-xs font-bold text-slate-500">
                Loading workspace members...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center p-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <UserRoundX size={25} />
            </div>
            <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
              No users found
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
              Try another search or filter. You can also create a new user if
              you have administrator permissions.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Clear filters
              </button>
              {canManage && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white hover:bg-indigo-700"
                >
                  <Plus size={14} />
                  Add user
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200/70 bg-slate-50/80 dark:border-white/[0.06] dark:bg-white/[0.025]">
                <tr>
                  {["Member", "Role", "Status", "Date added", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 sm:px-6"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                <AnimatePresence initial={false}>
                  {filteredUsers.map((user, index) => {
                    const userId = String(idOf(user) || "");
                    const isSelf = userId === currentUserId;
                    const active = statusOf(user) === "Active";
                    const rowBusy = busyId === userId;

                    return (
                      <motion.tr
                        layout
                        key={userId || user.email}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(index * 0.025, 0.2),
                        }}
                        className="group transition-colors hover:bg-indigo-500/[0.025]"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="max-w-[230px] truncate text-xs font-black text-slate-900 dark:text-white">
                                  {user.name || "Unnamed user"}
                                </p>
                                {isSelf && <Badge tone="indigo">You</Badge>}
                              </div>
                              <p className="mt-1 flex max-w-[250px] items-center gap-1.5 truncate text-[11px] text-slate-500">
                                <Mail size={11} className="shrink-0" />
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <Badge tone={user.role === "ADMIN" ? "indigo" : "slate"}>
                            {user.role === "ADMIN" ? (
                              <ShieldCheck size={11} />
                            ) : (
                              <UserCog size={11} />
                            )}
                            {roleLabel(user.role)}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <Badge tone={active ? "green" : "red"}>
                            <span
                              className={cx(
                                "h-1.5 w-1.5 rounded-full",
                                active ? "bg-emerald-500" : "bg-rose-500"
                              )}
                            />
                            {active ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <Clock3 size={13} />
                            {dateLabel(user.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={!canManage || rowBusy}
                              onClick={() => openEdit(user)}
                              title="Edit user"
                              aria-label={`Edit ${user.name || "user"}`}
                              className="rounded-xl border border-transparent p-2.5 text-slate-400 transition hover:border-indigo-500/15 hover:bg-indigo-500/10 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={!canManage || rowBusy || (isSelf && active)}
                              onClick={() => requestToggle(user)}
                              title={
                                isSelf && active
                                  ? "You cannot deactivate your own account"
                                  : active
                                    ? "Deactivate account"
                                    : "Activate account"
                              }
                              aria-label={
                                active
                                  ? `Deactivate ${user.name || "user"}`
                                  : `Activate ${user.name || "user"}`
                              }
                              className={cx(
                                "rounded-xl border border-transparent p-2.5 transition disabled:cursor-not-allowed disabled:opacity-30",
                                active
                                  ? "text-slate-400 hover:border-amber-500/15 hover:bg-amber-500/10 hover:text-amber-600"
                                  : "text-slate-400 hover:border-emerald-500/15 hover:bg-emerald-500/10 hover:text-emerald-600"
                              )}
                            >
                              {rowBusy && busyAction === "status" ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : active ? (
                                <UserX size={15} />
                              ) : (
                                <UserCheck size={15} />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={!canManage || rowBusy || isSelf}
                              onClick={() => requestDelete(user)}
                              title={isSelf ? "You cannot delete your own account" : "Delete user"}
                              aria-label={`Delete ${user.name || "user"}`}
                              className="rounded-xl border border-transparent p-2.5 text-slate-400 transition hover:border-rose-500/15 hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              {rowBusy && busyAction === "delete" ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-200/70 px-5 py-4 text-[10px] font-semibold text-slate-500 dark:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              Showing {filteredUsers.length} of {users.length} members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-indigo-500" />
              User actions require administrator access
            </span>
          </div>
        )}
      </section>

      {/* Create/edit form */}
      <UserModal
        open={modalOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        error={formError}
        onClose={closeModal}
        onSubmit={saveUser}
      />

      {/* Confirm status/delete */}
      <ConfirmDialog
        state={confirm}
        busy={confirmBusy}
        onCancel={() => !confirmBusy && setConfirm(null)}
        onConfirm={runConfirmedAction}
      />

      <Toast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}