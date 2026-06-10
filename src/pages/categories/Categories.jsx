import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Box, CheckCircle2, Image, Layers, PackageSearch, Plus, ShieldAlert, X } from "lucide-react";
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
  if (status?.toLowerCase() === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    image: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status?.toLowerCase() === "active").length,
    [categories]
  );
  const pagedCategories = categories.slice((page - 1) * pageSize, page * pageSize);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_BASE_URL);
      setCategories(readCategories(response.data));
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

  const createCategory = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setError("");
      await axios.post(`${API_BASE_URL}/add`, {
        name: form.name.trim(),
        image: form.image.trim(),
        status: form.status,
      });
      setForm({ name: "", image: "", status: "active" });
      setShowForm(false);
      setPage(1);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Catalog governance</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600">Create marketplace categories and review live catalog groups.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847]"
          >
            <Plus size={17} />
            Add category
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Categories" value={categories.length} helper="catalog groups" icon={Layers} tone="purple" />
        <MetricCard label="Listings mapped" value={products.length} helper="products assigned" icon={PackageSearch} tone="blue" />
        <MetricCard label="Active" value={activeCategories} helper="available categories" icon={CheckCircle2} tone="green" />
      </div>

      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers size={19} className="text-[#c45500]" />
            <h2 className="font-bold">Category map</h2>
          </div>
          {loading && <span className="text-sm text-gray-500">Loading categories...</span>}
          {error && <span className="text-sm font-medium text-red-600">{error}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Image</th>
                <th className="px-5 py-3 font-semibold">Listings</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedCategories.map((category) => (
                <tr key={categoryKey(category)} className="hover:bg-[#f7fafa]">
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
                  <td className="px-5 py-4">{products.filter((product) => product.category === category.name).length}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClass(category.status)}`}>
                      {category.status?.toLowerCase() === "active" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                      {category.status || "inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && categories.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-gray-500" colSpan={4}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <DataPager
          total={categories.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={updatePageSize}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Add category</h2>
                <p className="text-xs text-slate-300">Create a category in the live catalog.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createCategory} className="grid gap-4 p-5">
              <label className="text-sm font-medium text-gray-700">
                Category name
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  placeholder="Electronics"
                  required
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Image
                <input
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  placeholder="electronics.jpg"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={17} />
                  {saving ? "Saving..." : "Save category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
