import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  Filter,
  Grid,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import InputField from "../components/forms/InputField";

/* =========================================================
   MAIN RESOURCE PAGE COMPONENT
========================================================= */

export default function ResourcePage({
  title = "Resources",
  eyebrow = "Workspace Management",
  description = "Manage, search, and analyze your research workspace records.",
  icon: Icon = Database,
  resourceName = "resource",
  initialData = [],
  columns = [],
  fields = [],
  searchPlaceholder = "Search records...",
  emptyTitle,
  emptyDescription,
}) {
  /* Records & Filter States */
  const [records, setRecords] = useState(initialData);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  /* Modal & Drawer States */
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  /* UI Feedback States */
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  /* Real-time Query Filtered Computation */
  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const search = query.toLowerCase();

    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [records, query]);

  /* Handlers */
  const openCreate = () => {
    setEditing(null);
    setForm(
      Object.fromEntries(
        fields.map((field) => [field.key, field.defaultValue || ""])
      )
    );
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({ ...record });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (editing) {
      setRecords((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...item, ...form } : item
        )
      );
      setNotice(`Updated ${resourceName} successfully.`);
    } else {
      const newEntry = {
        ...form,
        id: `${Date.now()}`,
        createdAt: "Just now",
      };
      setRecords((current) => [newEntry, ...current]);
      setNotice(`Created new ${resourceName} entry.`);
    }

    setIsSaving(false);
    setModalOpen(false);
  };

  const removeRecord = (id) => {
    setRecords((current) => current.filter((item) => item.id !== id));
    setNotice(`Deleted ${resourceName} entry.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto pb-10">
      {/* =====================================================
          EXECUTIVE HERO HEADER
      ====================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0a0f1d] p-7 text-white shadow-2xl shadow-indigo-950/20 sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-200 backdrop-blur-md">
              <Sparkles size={14} />
              {eyebrow || "Workspace Management"}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2.5 max-w-xl text-xs leading-6 text-slate-300/90 sm:text-sm">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" />
              New {resourceName}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CARD & TOOLBAR CONTAINER
      ====================================================== */}
      <Card className="overflow-hidden p-0 border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 shadow-xl">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100/80 p-5 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/20">
                <Icon size={20} />
              </div>
            )}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                All {title.toLowerCase()}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {filtered.length} {filtered.length === 1 ? "record" : "records"} found
              </p>
            </div>
          </div>

          {/* Search Input & View Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 pl-10 pr-9 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Switcher */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-950/80">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-xl p-2 transition-all ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Table View"
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl p-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={emptyTitle || `No ${title.toLowerCase()} found`}
              description={
                emptyDescription ||
                `Create a new ${resourceName} to begin organizing your workspace.`
              }
              action={
                <Button onClick={openCreate} variant="secondary">
                  <Plus size={15} />
                  Create one
                </Button>
              }
            />
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-500">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-6 py-4">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {column.render
                          ? column.render(record)
                          : record[column.key] ?? "—"}
                      </td>
                    ))}

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewRecord(record)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(record)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                          title="Edit record"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => removeRecord(record.id)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-md shadow-xl shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-3 dark:border-slate-800/80">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {record.name || record.title || `Entry #${record.id}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(record)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeRecord(record.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {columns.slice(0, 3).map((col) => (
                    <div key={col.key} className="text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {col.label}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {col.render ? col.render(record) : record[col.key] ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100/80 pt-3 dark:border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => setViewRecord(record)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:gap-2 transition-all dark:text-indigo-400"
                  >
                    Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${resourceName}` : `Create ${resourceName}`}
        description={`Manage this ${resourceName} entry in your workspace.`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {fields.map((field) => (
            <InputField
              key={field.key}
              label={field.label}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={form[field.key] || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              required={field.required !== false}
            />
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Save changes" : `Create ${resourceName}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================
          VIEW DETAILS DRAWER MODAL
      ====================================================== */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {resourceName.toUpperCase()} Record Overview
              </h3>
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {Object.entries(viewRecord).map(([k, val]) => (
                <div key={k} className="rounded-2xl border border-slate-100 p-3.5 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{k}</span>
                  <span className="text-slate-900 dark:text-white font-semibold text-xs">{String(val || "—")}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}