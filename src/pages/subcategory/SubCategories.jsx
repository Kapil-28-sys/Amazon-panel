import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const SUB_API = "https://amazon-multi-vendor-3.onrender.com/api/subcategories";
const CAT_API = "https://amazon-multi-vendor-3.onrender.com/api/categories";

const readList = (payload, keys = ["subCategories", "subcategories", "data"]) => {
  if (Array.isArray(payload)) return payload;
  for (const k of keys) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

const EMPTY_FORM = { categoryId: "", name: "", image: "", status: "active" };

/* ── categoryId can be a plain string OR a populated object like { _id, name } ── */
const getCatId   = (val) => (val && typeof val === "object") ? (val._id ?? val.id ?? "") : (val ?? "");
const getCatName = (val, categories) => {
  if (val && typeof val === "object") return val.name ?? "—";          // already populated
  return categories.find((c) => (c._id ?? c.id) === val)?.name ?? val ?? "—"; // lookup by id
};

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories]       = useState([]);
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(5);
  const [showForm, setShowForm]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [error, setError]                 = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return subCategories;
    const q = search.toLowerCase();
    return subCategories.filter((s) =>
      s.name?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q) ||
      getCatName(s.categoryId, categories).toLowerCase().includes(q)
    );
  }, [subCategories, search, categories]);

  const activeCount = subCategories.filter(
    (s) => s.status?.toLowerCase() === "active"
  ).length;

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [subRes, catRes] = await Promise.all([
        axios.get(SUB_API),
        axios.get(CAT_API),
      ]);
      setSubCategories(readList(subRes.data));
      setCategories(readList(catRes.data, ["categories", "data"]));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  };

  const openEdit = (sub) => {
    setEditTarget(sub);
    setForm({
      categoryId: getCatId(sub.categoryId),   // ← always extract string ID
      name:       sub.name   ?? "",
      image:      sub.image  ?? "",
      status:     sub.status ?? "active",
    });
    setError("");
    setShowForm(true);
  };

  const openDelete  = (sub) => { setDeleteTarget(sub); setError(""); };
  const closeForm   = () => { setShowForm(false); setEditTarget(null); setError(""); };
  const closeDelete = () => { setDeleteTarget(null); setError(""); };

  const handleField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const saveSubCategory = async () => {
    if (!form.name.trim())       { setError("Sub category name is required."); return; }
    if (!form.categoryId.trim()) { setError("Please select a parent category."); return; }
    try {
      setSaving(true);
      setError("");
      const payload = {
        categoryId: form.categoryId.trim(),
        name:       form.name.trim(),
        image:      form.image.trim() || "default.jpg",
        status:     form.status,
      };
      if (editTarget) {
        await axios.put(`${SUB_API}/update/${editTarget._id}`, payload);
      } else {
        await axios.post(`${SUB_API}/add`, payload);
        setPage(1);
      }
      closeForm();
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      await axios.delete(`${SUB_API}/delete/${deleteTarget._id}`);
      closeDelete();
      setPage(1);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Unable to delete.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 p-1">

      {/* ── header ── */}
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">
              Catalog governance
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Sub Categories</h1>
            <p className="text-sm text-gray-500">
              Manage sub categories nested inside parent catalog groups.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847]"
          >
            + Add sub category
          </button>
        </div>
      </div>

      {/* ── metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sub Categories",   value: subCategories.length, color: "#7c3aed" },
          { label: "Parent Categories", value: categories.length,   color: "#2563eb" },
          { label: "Active",            value: activeCount,          color: "#059669" },
        ].map((m) => (
          <div key={m.label} className="rounded bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{m.label}</p>
            <p className="mt-1 text-3xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── table card ── */}
      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <span className="font-bold text-gray-800">Sub category list</span>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#ff9900]"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="text-lg leading-none text-gray-400 hover:text-gray-600">
                ×
              </button>
            )}
          </div>
          {loading && <span className="text-sm text-gray-400">Loading…</span>}
          {error && !showForm && !deleteTarget && (
            <span className="text-sm text-red-500">{error}</span>
          )}
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                {["Sub Category", "Parent Category", "Image", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((sub) => (
                <tr key={sub._id ?? sub.id ?? sub.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">{sub.name}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {/* ← safe: always renders a string */}
                    {getCatName(sub.categoryId, categories)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{sub.image || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1 ${
                      sub.status?.toLowerCase() === "active"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}>
                      {sub.status || "inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(sub)}
                        className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-[#ff9900] hover:text-[#c45500]">
                        Edit
                      </button>
                      <button type="button" onClick={() => openDelete(sub)}
                        className="rounded border border-red-100 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    {search ? `No results for "${search}"` : "No sub categories yet. Add one above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
          <span>{filtered.length} total</span>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded border border-gray-200 px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border px-2 py-1 disabled:opacity-40">‹
            </button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded border px-2 py-1 disabled:opacity-40">›
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">
                  {editTarget ? "Edit sub category" : "Add sub category"}
                </h2>
                <p className="text-xs text-slate-300">Fill in the details below.</p>
              </div>
              <button type="button" onClick={closeForm}
                className="rounded p-1 text-xl leading-none hover:bg-white/20">×
              </button>
            </div>

            <div className="space-y-4 p-5">

              {error && (
                <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Parent category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleField("categoryId", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900]"
                >
                  <option value="">— Select a category —</option>
                  {categories.map((c) => (
                    <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <input
                    value={form.categoryId}
                    onChange={(e) => handleField("categoryId", e.target.value)}
                    placeholder="Paste category ID manually"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900]"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Sub category name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  placeholder="e.g. Mobiles, Laptops"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Image filename</label>
                <input
                  value={form.image}
                  onChange={(e) => handleField("image", e.target.value)}
                  placeholder="mobiles.jpg  (leave blank for default)"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleField("status", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                <button type="button" onClick={closeForm}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={saveSubCategory} disabled={saving}
                  className="rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847] disabled:opacity-50">
                  {saving ? "Saving…" : editTarget ? "Update" : "Save sub category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="font-bold">Delete sub category</h2>
                <p className="text-xs text-slate-300">This cannot be undone.</p>
              </div>
              <button type="button" onClick={closeDelete}
                className="rounded p-1 text-xl leading-none hover:bg-white/20">×
              </button>
            </div>

            <div className="space-y-4 p-5">
              {error && (
                <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">"{deleteTarget.name}"</strong>?
                All associated data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeDelete}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={confirmDelete} disabled={deleting}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}