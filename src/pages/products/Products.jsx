// Products.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle, Eye, PackageCheck,
  PackagePlus, Search, SlidersHorizontal,
  Pencil, Trash2, ExternalLink,
} from "lucide-react";
import { inr, vendorName, vendors } from "../../data/marketplaceData";
import DataPager from "../../components/common/DataPager";
import MetricCard from "../../components/common/MetricCard";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api";

const STATUS_OPTIONS = ["All", "Active", "Draft", "Suppressed", "Pending"];

const stockClass = (p) => {
  if (p.status === "Suppressed") return "bg-red-50 text-red-700 ring-red-200";
  if (p.stock < 15)             return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
};

// ── Delete Confirm Modal ─────────────────────────────────────
function DeleteModal({ product, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Delete product?</h3>
        <p className="mt-1 text-sm text-gray-500">
          <strong className="text-gray-700">{product?.productName ?? product?.name}</strong> will be
          permanently removed. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
            {deleting && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();

  const [catalog,         setCatalog]         = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError,   setProductsError]   = useState("");
  const [successMsg,      setSuccessMsg]       = useState("");

  const [vendorId,      setVendorId]      = useState("all");
  const [query,         setQuery]         = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [showFilters,   setShowFilters]   = useState(false);
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(5);

  // delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── success toast ──
  useEffect(() => {
    if (location.state?.added) {
      setSuccessMsg("Product added successfully!");
      window.history.replaceState({}, "");
      const t = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(t);
    }
    if (location.state?.updated) {
      setSuccessMsg("Product updated successfully!");
      window.history.replaceState({}, "");
      const t = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  // ── fetch products ──
  const fetchProducts = () => {
    setProductsLoading(true);
    setProductsError("");
    fetch(`${BASE_URL}/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((d) => setCatalog(Array.isArray(d) ? d : (d.data ?? d.products ?? [])))
      .catch((e) => setProductsError(e.message || "Failed to load products."))
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── filter logic ──
  const visibleProducts = useMemo(
    () => catalog.filter((p) => {
      const matchV = vendorId === "all" || p.vendorId === vendorId;
      const matchQ = `${p.productName ?? p.name ?? ""} ${p.asin ?? p.sku ?? ""} ${p.category ?? p.categoryId?.name ?? ""} ${vendorName(p.vendorId)} ${p.slug ?? ""}`
        .toLowerCase().includes(query.toLowerCase());
      const matchS = statusFilter === "All" || (p.status ?? "Active") === statusFilter;
      return matchV && matchQ && matchS;
    }),
    [catalog, query, vendorId, statusFilter]
  );

  const pagedProducts  = visibleProducts.slice((page - 1) * pageSize, page * pageSize);
  const updatePageSize = (size) => { setPageSize(size); setPage(1); };

  // ── delete handler ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const id = deleteTarget._id ?? deleteTarget.id;
      const res = await fetch(`${BASE_URL}/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCatalog((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
      setSuccessMsg("Product deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      setProductsError("Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      {/* ── Success toast ── */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
          <span className="text-base">✓</span>
          {successMsg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Inventory command center</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Products and catalog</h1>
            <p className="text-sm text-gray-600">Monitor vendor listings, stock health, ASIN status, and catalog ownership.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={vendorId}
              onChange={(e) => { setVendorId(e.target.value); setPage(1); }}
              className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
            >
              <option value="all">All vendors</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search catalog, slug…"
                className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30 sm:w-80"
              />
            </div>

            <button
              onClick={() => navigate("/admin/products/add")}
              className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f08c00] transition-colors"
            >
              <PackagePlus size={17} /> Add listing
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible listings"  value={visibleProducts.length}                                        helper="catalog records in view"   icon={Eye}           tone="blue"   />
        <MetricCard label="Low stock"         value={visibleProducts.filter((p) => p.stock < 15).length}           helper="needs replenishment"       icon={AlertTriangle} tone="orange" />
        <MetricCard label="Suppressed"        value={visibleProducts.filter((p) => p.status === "Suppressed").length} helper="requires catalog action" icon={PackageCheck}  tone="red"    />
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Marketplace catalog</h2>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition-colors
              ${showFilters ? "border-[#ff9900] bg-amber-50 text-[#c45500]" : "border-gray-300 hover:bg-gray-50"}`}
          >
            <SlidersHorizontal size={16} /> Filters
            {statusFilter !== "All" && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff9900] text-[9px] font-black text-white">1</span>
            )}
          </button>
        </div>

        {/* ── Filter bar ── */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Status</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors
                    ${statusFilter === s
                      ? "border-[#ff9900] bg-[#ff9900] text-[#111]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#ff9900] hover:text-[#c45500]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {statusFilter !== "All" && (
              <button
                onClick={() => { setStatusFilter("All"); setPage(1); }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 font-semibold">Vendor</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Inventory</th>
                <th className="px-5 py-3 font-semibold">Sales</th>
                <th className="px-5 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              {/* Loading */}
              {productsLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff9900] mr-2 align-middle" />
                    Loading products…
                  </td>
                </tr>
              )}

              {/* Error */}
              {!productsLoading && productsError && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-500">
                    ⚠ {productsError}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!productsLoading && !productsError && pagedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!productsLoading && !productsError && pagedProducts.map((p) => {
                const displayName     = p.productName ?? p.name ?? "—";
                const displayStock    = p.stock ?? 0;
                const displayStatus   = p.status ?? "Active";
                const displaySold     = p.sold ?? 0;
                const displayImage    = p.image ?? p.images?.[0] ?? "";
                const displayAsin     = p.asin ?? p.sku ?? "—";
                const displayCategory = p.category ?? p.categoryId?.name ?? "—";
                const displaySlug     = p.slug ?? "";
                const productId       = p._id ?? p.id;

                return (
                  <tr key={productId} className="hover:bg-[#f7fafa]">

                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {displayImage ? (
                          <img src={displayImage} alt={displayName} className="h-12 w-12 rounded object-cover ring-1 ring-gray-200" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-gray-300 text-xs">N/A</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 max-w-[180px] truncate">{displayName}</p>
                          <p className="text-xs text-gray-500">{displayAsin} · {displayCategory}</p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-4">
                      {displaySlug ? (
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[140px] truncate rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                            {displaySlug}
                          </span>
                          <a
                            href={`/products/${displaySlug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View live page"
                            className="text-gray-400 hover:text-[#ff9900] transition-colors"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">no slug</span>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="px-5 py-4 font-medium">{vendorName(p.vendorId)}</td>

                    {/* Price */}
                    <td className="px-5 py-4 font-bold">{inr(p.price ?? 0)}</td>

                    {/* Inventory */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stockClass({ ...p, stock: displayStock, status: displayStatus })}`}>
                        {displayStock < 15 && <AlertTriangle size={13} />}
                        {displayStatus} · {displayStock}
                      </span>
                    </td>

                    {/* Sales */}
                    <td className="px-5 py-4">{displaySold.toLocaleString("en-IN")} units</td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/admin/products/${displaySlug || productId}/edit`)}
                          title="Edit product"
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:border-[#ff9900] hover:text-[#c45500] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          title="Delete product"
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        <DataPager
          total={visibleProducts.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={updatePageSize}
        />
      </div>

    </div>
  );
}