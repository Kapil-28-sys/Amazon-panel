import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  CheckCircle2,
  Image,
  Layers,
  PackageSearch,
  Plus,
  ShieldAlert,
  X,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { products } from "../../data/marketplaceData";
import DataPager from "../../components/common/DataPager";
import MetricCard from "../../components/common/MetricCard";

const API_BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api/categories";

const readCategories = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const categoryKey = (category) => category._id || category.id || category.name;

const statusClass = (status) => {
  if (status?.toLowerCase() === "active")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
};

const EMPTY_FORM = { name: "", image: "", status: "active" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Add / Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
  const [form, setForm] = useState(EMPTY_FORM);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter / search
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const activeCategories = useMemo(
    () =>
      categories.filter((c) => c.status?.toLowerCase() === "active").length,
    [categories]
  );

  const pagedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ── API helpers ───────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(API_BASE_URL);
      setCategories(readCategories(data));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const updatePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  // ── Open / close modals ───────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditTarget(category);
    setForm({
      name: category.name,
      image: category.image || "",
      status: category.status || "active",
    });
    setError("");
    setShowForm(true);
  };

  const openDelete = (category) => {
    setDeleteTarget(category);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setError("");
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setError("");
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const saveCategory = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setError("");

      if (editTarget) {
        // PUT – update existing
        await axios.put(`${API_BASE_URL}/update/${editTarget._id}`, {
          name: form.name.trim(),
          image: form.image.trim(),
          status: form.status,
        });
      } else {
        // POST – create new
        await axios.post(`${API_BASE_URL}/add`, {
          name: form.name.trim(),
          image: form.image.trim(),
          status: form.status,
        });
        setPage(1);
      }

      closeForm();
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      await axios.delete(`${API_BASE_URL}/delete/${deleteTarget._id}`);
      closeDelete();
      setPage(1);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">
              Catalog governance
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Categories
            </h1>
            <p className="text-sm text-gray-600">
              Create marketplace categories and review live catalog groups.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847]"
          >
            <Plus size={17} />
            Add category
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Categories"
          value={categories.length}
          helper="catalog groups"
          icon={Layers}
          tone="purple"
        />
        <MetricCard
          label="Listings mapped"
          value={products.length}
          helper="products assigned"
          icon={PackageSearch}
          tone="blue"
        />
        <MetricCard
          label="Active"
          value={activeCategories}
          helper="available categories"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        {/* Table header bar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers size={19} className="text-[#c45500]" />
            <h2 className="font-bold">Category map</h2>
          </div>

          {/* Search / filter input */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by name or status…"
              className="w-full rounded border border-gray-200 py-1.5 pl-8 pr-8 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-sm text-gray-500">Loading…</span>
            )}
            {error && !showForm && !deleteTarget && (
              <span className="text-sm font-medium text-red-600">{error}</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Image</th>
                <th className="px-5 py-3 font-semibold">Listings</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedCategories.map((category) => (
                <tr
                  key={categoryKey(category)}
                  className="hover:bg-[#f7fafa]"
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-bold text-gray-900">
                      <Box size={17} className="text-[#c45500]" />
                      {category.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Image size={16} className="text-gray-400" />
                      {category.image || "No image"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {
                      products.filter(
                        (p) => p.category === category.name
                      ).length
                    }
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClass(
                        category.status
                      )}`}
                    >
                      {category.status?.toLowerCase() === "active" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <ShieldAlert size={14} />
                      )}
                      {category.status || "inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(category)}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-[#ff9900] hover:text-[#c45500] transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(category)}
                        className="inline-flex items-center gap-1 rounded border border-red-100 px-2.5 py-1 text-xs font-medium text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredCategories.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-gray-500"
                    colSpan={5}
                  >
                    {search
                      ? `No categories match "${search}".`
                      : "No categories found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DataPager
          total={filteredCategories.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={updatePageSize}
        />
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">
                  {editTarget ? "Edit category" : "Add category"}
                </h2>
                <p className="text-xs text-slate-300">
                  {editTarget
                    ? "Update category details in the live catalog."
                    : "Create a category in the live catalog."}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="rounded p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={saveCategory} className="grid gap-4 p-5">
              {error && (
                <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
                  {error}
                </p>
              )}

              <label className="text-sm font-medium text-gray-700">
                Category name
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  placeholder="Electronics"
                  required
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Image
                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  placeholder="electronics.jpg"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={17} />
                  {saving
                    ? "Saving…"
                    : editTarget
                    ? "Update category"
                    : "Save category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="font-bold">Delete category</h2>
                <p className="text-xs text-slate-300">
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={closeDelete}
                className="rounded p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {error && (
                <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
                  {error}
                </p>
              )}
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  "{deleteTarget.name}"
                </span>
                ? All associated data will be permanently removed.
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={closeDelete}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteCategory}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={15} />
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