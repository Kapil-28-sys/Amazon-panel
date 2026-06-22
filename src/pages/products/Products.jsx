// Products.jsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ChevronRight, Eye, PackageCheck,
  PackagePlus, Search, SlidersHorizontal, X,
} from "lucide-react";
import { inr, vendorName, vendors } from "../../data/marketplaceData";
import DataPager from "../../components/common/DataPager";
import MetricCard from "../../components/common/MetricCard";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api";
const ADD_URL  = "https://amazon-multi-vendor-3.onrender.com/api/products/add";

const inputCls =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30 bg-white";

const stockClass = (p) => {
  if (p.status === "Suppressed") return "bg-red-50 text-red-700 ring-red-200";
  if (p.stock < 15)             return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
};

function dedupeAttrs(raw) {
  const seen = new Set();
  return raw.filter(({ name }) => seen.has(name) ? false : (seen.add(name), true));
}

function AttrField({ attr, value, onChange }) {
  const change = (e) => onChange(attr._id, e.target.value);
  const label = (
    <>
      {attr.name}
      {attr.required && <span className="ml-1 text-red-500">*</span>}
    </>
  );

  if (attr.type === "dropdown") {
    return (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <select value={value} onChange={change} className={inputCls}>
          <option value="">Select…</option>
          {attr.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type={attr.type === "number" ? "number" : "text"}
        value={value}
        onChange={change}
        placeholder={`Enter ${attr.name.toLowerCase()}`}
        className={inputCls}
      />
    </label>
  );
}

function StepBadge({ n, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "opacity-100" : done ? "opacity-60" : "opacity-30"}`}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
        ${done ? "bg-emerald-500 text-white" : active ? "bg-[#ff9900] text-[#111]" : "bg-gray-200 text-gray-500"}`}>
        {done ? "✓" : n}
      </span>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
  );
}

export default function Products() {
  const [catalog,          setCatalog]          = useState([]);
  const [productsLoading,  setProductsLoading]  = useState(true);
  const [productsError,    setProductsError]    = useState("");

  const [vendorId,  setVendorId]  = useState("all");
  const [query,     setQuery]     = useState("");
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(5);
  const [showForm,  setShowForm]  = useState(false);

  const [step, setStep] = useState(1);

  const [categories,    setCategories]    = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [catLoading,    setCatLoading]    = useState(false);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const [selectedCat,   setSelectedCat]   = useState("");
  const [selectedSub,   setSelectedSub]   = useState("");
  const [selectedCatName, setSelectedCatName] = useState("");
  const [selectedSubName, setSelectedSubName] = useState("");

  const [attributes,  setAttributes]  = useState([]);
  const [attrValues,  setAttrValues]  = useState({});
  const [attrLoading, setAttrLoading] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    sku:         "",
    price:       "",
    stock:       "",
  });

  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── fetch products from API ──
  useEffect(() => {
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
  }, []);

  // ── fetch categories on mount ──
  useEffect(() => {
    setCatLoading(true);
    fetch(`${BASE_URL}/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  const resetModal = () => {
    setStep(1);
    setSelectedCat(""); setSelectedCatName("");
    setSelectedSub(""); setSelectedSubName("");
    setSubCategories([]);
    setAttributes([]);
    setAttrValues({});
    setForm({ productName: "", sku: "", price: "", stock: "" });
    setSubmitError("");
  };

  const handleCatChange = async (catId) => {
    const cat = categories.find((c) => c._id === catId);
    setSelectedCat(catId);
    setSelectedCatName(cat?.name ?? "");
    setSelectedSub(""); setSelectedSubName("");
    setSubCategories([]);
    setAttributes([]);
    setAttrValues({});
    if (!catId) return;
    setSubCatLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/subcategories`);
      const data = await res.json();
      const all  = Array.isArray(data) ? data : (data.data ?? data.subcategories ?? []);
      setSubCategories(all.filter((s) => s.categoryId?._id === catId));
    } catch (e) { console.error(e); }
    finally { setSubCatLoading(false); }
  };

  const handleSubChange = async (subId) => {
    const sub = subCategories.find((s) => s._id === subId);
    setSelectedSub(subId);
    setSelectedSubName(sub?.name ?? "");
    setAttributes([]);
    setAttrValues({});
    if (!subId) return;
    setAttrLoading(true);
    try {
      const res    = await fetch(`${BASE_URL}/categoryattribute/category/${selectedCat}`);
      const json   = await res.json();
      const raw    = Array.isArray(json) ? json : (json.data ?? []);
      const deduped = dedupeAttrs(raw);
      const defaults = {};
      deduped.forEach((a) => { defaults[a._id] = ""; });
      setAttributes(deduped);
      setAttrValues(defaults);
    } catch (e) { console.error(e); }
    finally { setAttrLoading(false); }
  };

  const goToStep2 = () => setStep(2);

  const addListing = async () => {
    setSubmitError("");

    const attributesPayload = attributes.map((a) => ({
      attributeId: a._id,
      name:        a.name,
      value:       attrValues[a._id] ?? "",
    }));

    const payload = {
      productName:   form.productName,
      sku:           form.sku,
      price:         Number(form.price  || 0),
      stock:         Number(form.stock  || 0),
      categoryId:    selectedCat,
      subCategoryId: selectedSub,
      attributes:    attributesPayload,
    };

    console.log("📦 Submitting payload:", JSON.stringify(payload, null, 2));

    setSubmitting(true);
    try {
      const res = await fetch(ADD_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log(`📨 Response ${res.status}:`, responseText);

      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const errJson = JSON.parse(responseText);
          errMsg = errJson.message || errJson.error || errJson.msg || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const newProduct = JSON.parse(responseText);
      setCatalog((c) => [newProduct?.data ?? newProduct, ...c]);
      setShowForm(false);
      resetModal();
    } catch (e) {
      console.error("❌ Submit error:", e);
      setSubmitError(e.message || "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const step1Ready      = selectedCat && selectedSub && !attrLoading;
  const requiredMissing = attributes.filter((a) => a.required).some((a) => !attrValues[a._id]?.toString().trim());
  const canSubmit       = form.productName.trim() && form.sku.trim() && !requiredMissing && !submitting;

  const visibleProducts = useMemo(
    () => catalog.filter((p) => {
      const matchV = vendorId === "all" || p.vendorId === vendorId;
      const matchQ = `${p.productName ?? p.name ?? ""} ${p.asin ?? p.sku ?? ""} ${p.category ?? p.categoryId?.name ?? ""} ${vendorName(p.vendorId)}`
        .toLowerCase().includes(query.toLowerCase());
      return matchV && matchQ;
    }),
    [catalog, query, vendorId]
  );
  const pagedProducts  = visibleProducts.slice((page - 1) * pageSize, page * pageSize);
  const updatePageSize = (size) => { setPageSize(size); setPage(1); };

  return (
    <div className="space-y-5">

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
                placeholder="Search catalog"
                className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30 sm:w-80"
              />
            </div>
            <button
              onClick={() => { resetModal(); setShowForm(true); }}
              className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f08c00] transition-colors"
            >
              <PackagePlus size={17} /> Add listing
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible listings" value={visibleProducts.length}                                          helper="catalog records in view"  icon={Eye}           tone="blue"   />
        <MetricCard label="Low stock"        value={visibleProducts.filter((p) => p.stock < 15).length}              helper="needs replenishment"       icon={AlertTriangle} tone="orange" />
        <MetricCard label="Suppressed"       value={visibleProducts.filter((p) => p.status === "Suppressed").length} helper="requires catalog action"   icon={PackageCheck}  tone="red"    />
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Marketplace catalog</h2>
          <button className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Vendor</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Inventory</th>
                <th className="px-5 py-3 font-semibold">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              {/* Loading state */}
              {productsLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff9900] mr-2 align-middle" />
                    Loading products…
                  </td>
                </tr>
              )}

              {/* Error state */}
              {!productsLoading && productsError && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-red-500">
                    ⚠ {productsError}
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!productsLoading && !productsError && pagedProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!productsLoading && !productsError && pagedProducts.map((p) => {
                const displayName     = p.productName ?? p.name ?? "—";
                const displayStock    = p.stock ?? 0;
                const displayStatus   = p.status ?? "Active";
                const displaySold     = p.sold ?? 0;
                const displayImage    = p.image ?? p.images?.[0] ?? "";
                const displayAsin     = p.asin ?? p.sku ?? "—";
                const displayCategory = p.category ?? p.categoryId?.name ?? "—";

                return (
                  <tr key={p._id ?? p.id} className="hover:bg-[#f7fafa]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {displayImage ? (
                          <img src={displayImage} alt={displayName} className="h-12 w-12 rounded object-cover ring-1 ring-gray-200" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-gray-300 text-xs">N/A</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">{displayAsin} · {displayCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium">{vendorName(p.vendorId)}</td>
                    <td className="px-5 py-4 font-bold">{inr(p.price ?? 0)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stockClass({ ...p, stock: displayStock, status: displayStatus })}`}>
                        {displayStock < 15 && <AlertTriangle size={13} />}
                        {displayStatus} · {displayStock}
                      </span>
                    </td>
                    <td className="px-5 py-4">{displaySold.toLocaleString("en-IN")} units</td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
        <DataPager total={visibleProducts.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={updatePageSize} />
      </div>

      {/* ══════════════════════════════════════════════
          ADD LISTING MODAL
      ══════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Add marketplace listing</h2>
                <div className="mt-2 flex items-center gap-3">
                  <StepBadge n={1} label="Choose category" active={step === 1} done={step > 1} />
                  <ChevronRight size={14} className="text-slate-400" />
                  <StepBadge n={2} label="Fill & submit"   active={step === 2} done={false} />
                </div>
              </div>
              <button onClick={() => { setShowForm(false); resetModal(); }} className="rounded p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <div className="p-5 space-y-5">
                <p className="text-sm text-gray-500">
                  Select a category and sub-category first. Product attribute fields will load automatically.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                    {catLoading ? (
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff9900]" />
                        Loading…
                      </div>
                    ) : (
                      <select value={selectedCat} onChange={(e) => handleCatChange(e.target.value)} className={inputCls}>
                        <option value="">Select category…</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    )}
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    Sub-category <span className="text-red-500">*</span>
                    {subCatLoading ? (
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff9900]" />
                        Loading sub-categories…
                      </div>
                    ) : (
                      <select
                        value={selectedSub}
                        onChange={(e) => handleSubChange(e.target.value)}
                        disabled={!subCategories.length}
                        className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <option value="">Select sub-category…</option>
                        {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    )}
                  </label>
                </div>

                {attrLoading && (
                  <div className="flex items-center gap-2 rounded border border-dashed border-[#ff9900]/40 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
                    Loading product attribute fields…
                  </div>
                )}

                {!attrLoading && attributes.length > 0 && (
                  <div className="rounded border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    ✓ <strong>{attributes.length} attribute fields</strong> loaded for <em>{selectedCatName} › {selectedSubName}</em>.
                    <span className="ml-1 text-emerald-600">
                      ({attributes.filter((a) => a.required).length} required)
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => { setShowForm(false); resetModal(); }}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goToStep2}
                    disabled={!step1Ready}
                    className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-5 py-2 text-sm font-bold text-[#111827] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f08c00] transition-colors"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <>
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

                  <div className="flex items-center gap-1 rounded bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{selectedCatName}</span>
                    <ChevronRight size={12} />
                    <span className="font-semibold text-gray-700">{selectedSubName}</span>
                    <button
                      onClick={() => setStep(1)}
                      className="ml-auto text-[#c45500] hover:underline font-medium"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Product details</p>
                    <div className="grid gap-4 md:grid-cols-2">

                      <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                        Product name <span className="text-red-500">*</span>
                        <input
                          value={form.productName}
                          onChange={(e) => setForm({ ...form, productName: e.target.value })}
                          placeholder="e.g. Cotton Floral Dress"
                          className={inputCls}
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        SKU <span className="text-red-500">*</span>
                        <input
                          value={form.sku}
                          onChange={(e) => setForm({ ...form, sku: e.target.value })}
                          placeholder="e.g. SKU-CFD-001"
                          className={inputCls}
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Price (₹)
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                        Opening stock
                        <input
                          type="number"
                          value={form.stock}
                          onChange={(e) => setForm({ ...form, stock: e.target.value })}
                          placeholder="0"
                          className={inputCls}
                        />
                      </label>

                    </div>
                  </div>

                  {attributes.length > 0 && (
                    <div className="rounded border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">
                          Product attributes — {attributes.length} fields
                        </p>
                        <span className="text-xs text-gray-400">
                          {attributes.filter((a) => a.required).length} required
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {attributes.map((attr) => (
                          <AttrField
                            key={attr._id}
                            attr={attr}
                            value={attrValues[attr._id] ?? ""}
                            onChange={(id, val) => setAttrValues((prev) => ({ ...prev, [id]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 border-t border-gray-100 px-5 py-4">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowForm(false); resetModal(); }}
                      className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addListing}
                      disabled={!canSubmit}
                      className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-5 py-2 text-sm font-bold text-[#111827] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f08c00] transition-colors"
                    >
                      {submitting && (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#111827]/30 border-t-[#111827]" />
                      )}
                      {submitting ? "Saving…" : "Save listing"}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}