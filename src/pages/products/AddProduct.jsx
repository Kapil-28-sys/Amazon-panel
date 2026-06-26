// AddProduct.jsx
// path: src/pages/products/AddProduct.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, PackagePlus, ShieldCheck } from "lucide-react";
import { getCurrentSession } from "../../config/localAuth";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api";
const ADD_URL  = "https://amazon-multi-vendor-3.onrender.com/api/products/add";

// ── Super admin ke liye fixed vendorId (localAuth mein bhi same rakho) ──
const SUPER_ADMIN_VENDOR_ID = "6a2926ad76ab1ef00da7b71c";

const inputCls =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30 bg-white";

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeAttrs(raw) {
  const seen = new Set();
  return raw.filter(({ name }) =>
    seen.has(name) ? false : (seen.add(name), true)
  );
}

// ── Vendor ID resolver ───────────────────────────────────────
// Super admin → fixed SUPER_ADMIN_VENDOR_ID
// Vendor      → vendorId from session
function resolveVendorId(session) {
  if (!session?.loggedIn) return null;
  const role = session.role?.toLowerCase().replace(/[\s_-]/g, "");
  if (role === "superadmin" || role === "admin") return SUPER_ADMIN_VENDOR_ID;
  return session.vendorId || null;
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
    <div className={`flex items-center gap-2 ${active ? "opacity-100" : done ? "opacity-70" : "opacity-30"}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
        done ? "bg-emerald-500 text-white" : active ? "bg-[#ff9900] text-[#111]" : "bg-gray-200 text-gray-500"
      }`}>
        {done ? "✓" : n}
      </span>
      <span className={`text-sm font-semibold ${active ? "text-gray-900" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}

function SeoTab({ seo, setSeo, slug, productName }) {
  const descLen  = seo.metaDesc.length;
  const titleLen = seo.metaTitle.length;
  const descColor =
    descLen > 160 ? "#ef4444" : descLen > 130 ? "#f59e0b" : descLen > 0 ? "#22c55e" : "#94a3b8";

  return (
    <div className="space-y-5">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center justify-between">
          <span>Meta Title</span>
          <span className={`text-xs ${titleLen > 60 ? "text-red-500" : "text-gray-400"}`}>{titleLen}/60</span>
        </div>
        <input
          value={seo.metaTitle}
          onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))}
          maxLength={70}
          placeholder="Title shown in Google results…"
          className={inputCls}
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center justify-between">
          <span>Meta Description</span>
          <span className="text-xs font-semibold" style={{ color: descColor }}>{descLen}/160</span>
        </div>
        <textarea
          value={seo.metaDesc}
          onChange={(e) => setSeo((s) => ({ ...s, metaDesc: e.target.value }))}
          rows={3}
          placeholder="Short description shown under the title in Google…"
          className={`${inputCls} resize-none`}
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Keywords <span className="ml-1 text-xs font-normal text-gray-400">(comma separated)</span>
        <input
          value={seo.keywords}
          onChange={(e) => setSeo((s) => ({ ...s, keywords: e.target.value }))}
          placeholder="running shoes, nike, sports footwear"
          className={inputCls}
        />
      </label>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Google preview</p>
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-0.5 text-xs text-[#006621]">
            yoursite.com/products/<span className="font-medium">{slug || "product-slug"}</span>
          </p>
          <p className="text-lg font-medium leading-snug text-[#1a0dab] cursor-default">
            {seo.metaTitle || productName || "Product Title — Your Store"}
          </p>
          <p className="mt-1 text-sm leading-snug text-gray-600">
            {seo.metaDesc ? seo.metaDesc.slice(0, 160) : "Your meta description will appear here…"}
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-400">Approximation of Google search appearance.</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function AddProduct() {
  const navigate   = useNavigate();
  const session    = getCurrentSession();
  const vendorId   = resolveVendorId(session);
  const isSuperAdmin = session.role?.toLowerCase().replace(/[\s_-]/g, "") === "superadmin"
                    || session.role?.toLowerCase().replace(/[\s_-]/g, "") === "admin";

  const [step, setStep] = useState(1);

  const [categories,      setCategories]      = useState([]);
  const [subCategories,   setSubCategories]   = useState([]);
  const [catLoading,      setCatLoading]      = useState(false);
  const [subCatLoading,   setSubCatLoading]   = useState(false);
  const [selectedCat,     setSelectedCat]     = useState("");
  const [selectedSub,     setSelectedSub]     = useState("");
  const [selectedCatName, setSelectedCatName] = useState("");
  const [selectedSubName, setSelectedSubName] = useState("");

  const [attributes,  setAttributes]  = useState([]);
  const [attrValues,  setAttrValues]  = useState({});
  const [attrLoading, setAttrLoading] = useState(false);

  const [form, setForm] = useState({ productName: "", sku: "", price: "", stock: "" });
  const [slug,       setSlug]       = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [seo,        setSeo]        = useState({ metaTitle: "", metaDesc: "", keywords: "" });
  const [activeTab,  setActiveTab]  = useState("details");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setCatLoading(true);
    fetch(`${BASE_URL}/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  const handleNameChange = (val) => {
    setForm((f) => ({ ...f, productName: val }));
    if (!slugEdited) setSlug(generateSlug(val));
    if (!seo.metaTitle) setSeo((s) => ({ ...s, metaTitle: val }));
  };

  const handleCatChange = async (catId) => {
    const cat = categories.find((c) => c._id === catId);
    setSelectedCat(catId);
    setSelectedCatName(cat?.name ?? "");
    setSelectedSub(""); setSelectedSubName("");
    setSubCategories([]); setAttributes([]); setAttrValues({});
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
    setAttributes([]); setAttrValues({});
    if (!subId) return;
    setAttrLoading(true);
    try {
      const res     = await fetch(`${BASE_URL}/categoryattribute/category/${selectedCat}`);
      const json    = await res.json();
      const raw     = Array.isArray(json) ? json : (json.data ?? []);
      const deduped = dedupeAttrs(raw);
      const defaults = {};
      deduped.forEach((a) => { defaults[a._id] = ""; });
      setAttributes(deduped);
      setAttrValues(defaults);
    } catch (e) { console.error(e); }
    finally { setAttrLoading(false); }
  };

  const addListing = async () => {
    setSubmitError("");

    if (!vendorId) {
      setSubmitError("Vendor ID not found. Please log in again.");
      return;
    }

    const attributesPayload = attributes.map((a) => ({
      attributeId: a._id,
      name:        a.name,
      value:       attrValues[a._id] ?? "",
    }));

    const payload = {
      vendorId,
      productName:     form.productName,
      sku:             form.sku,
      price:           Number(form.price  || 0),
      stock:           Number(form.stock  || 0),
      categoryId:      selectedCat,
      subCategoryId:   selectedSub,
      attributes:      attributesPayload,
      slug:            slug || generateSlug(form.productName),
      metaTitle:       seo.metaTitle || form.productName,
      metaDescription: seo.metaDesc,
      metaKeywords:    seo.keywords,
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

      navigate("/admin/products", { state: { added: true } });
    } catch (e) {
      console.error("❌ Submit error:", e);
      setSubmitError(e.message || "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const step1Ready      = selectedCat && selectedSub && !attrLoading;
  const requiredMissing = attributes.filter((a) => a.required).some((a) => !attrValues[a._id]?.toString().trim());
  const canSubmit       = form.productName.trim() && form.sku.trim() && !requiredMissing && !submitting && !!vendorId;

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
      activeTab === t
        ? "border-[#ff9900] text-[#c45500]"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Inventory command center</p>
              <h1 className="mt-0.5 text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PackagePlus size={22} className="text-[#ff9900]" />
                Add marketplace listing
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <StepBadge n={1} label="Choose category" active={step === 1} done={step > 1} />
            <ChevronRight size={14} className="text-gray-400" />
            <StepBadge n={2} label="Fill & submit"   active={step === 2} done={false} />
          </div>
        </div>

        <div className="sm:hidden mt-3 flex items-center gap-3">
          <StepBadge n={1} label="Choose category" active={step === 1} done={step > 1} />
          <ChevronRight size={14} className="text-gray-400" />
          <StepBadge n={2} label="Fill & submit"   active={step === 2} done={false} />
        </div>

        {/* Vendor ID banner */}
        <div className={`mt-4 flex items-center gap-2 rounded border px-4 py-2 text-xs ${
          vendorId
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          <ShieldCheck size={14} className="shrink-0" />
          {vendorId ? (
            <span>
              {isSuperAdmin ? "Super Admin" : session.name} —{" "}
              Vendor ID: <strong className="font-mono">{vendorId}</strong>
            </span>
          ) : (
            <span>⚠️ Vendor ID not found — please log out and log back in.</span>
          )}
        </div>
      </div>

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-gray-900">Step 1 — Choose category</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a category and sub-category. Product attribute fields will load automatically.
            </p>
          </div>

          <div className="p-6 space-y-5">
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
                ✓ <strong>{attributes.length} attribute fields</strong> loaded for{" "}
                <em>{selectedCatName} › {selectedSubName}</em>.
                <span className="ml-1 text-emerald-600">
                  ({attributes.filter((a) => a.required).length} required)
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              onClick={() => navigate("/admin/products")}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
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
        <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">

          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-gray-900">Step 2 — Product details</h2>
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{selectedCatName}</span>
              <ChevronRight size={12} />
              <span className="font-semibold text-gray-700">{selectedSubName}</span>
              <button onClick={() => setStep(1)} className="ml-2 text-[#c45500] hover:underline font-medium">
                Change
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-100 px-6">
            <button className={tabCls("details")} onClick={() => setActiveTab("details")}>
              📦 Product Info
            </button>
            <button className={tabCls("seo")} onClick={() => setActiveTab("seo")}>
              🔍 SEO
              {(seo.metaTitle || seo.metaDesc) && (
                <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          <div className="p-6">

            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Product info</p>
                  <div className="grid gap-4 md:grid-cols-2">

                    <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                      Product name <span className="text-red-500">*</span>
                      <input
                        value={form.productName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Cotton Floral Dress"
                        className={inputCls}
                      />
                    </label>

                    <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <span>URL Slug</span>
                        {slug && (
                          <span className="text-xs text-gray-400">
                            /products/<span className="font-mono text-[#c45500]">{slug}</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex overflow-hidden rounded border border-gray-300 focus-within:border-[#ff9900] focus-within:ring-2 focus-within:ring-[#ff9900]/30">
                        <span className="flex items-center bg-gray-100 px-3 text-xs text-gray-500 border-r border-gray-300 whitespace-nowrap">
                          /products/
                        </span>
                        <input
                          value={slug}
                          onChange={(e) => { setSlug(generateSlug(e.target.value)); setSlugEdited(true); }}
                          placeholder="auto-generated-from-name"
                          className="flex-1 bg-white px-3 py-2 text-sm font-mono text-[#c45500] outline-none"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Auto-generated from product name. You can edit it manually.</p>
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

                {!seo.metaTitle && !seo.metaDesc && (
                  <div
                    className="flex cursor-pointer items-center gap-3 rounded border border-dashed border-[#ff9900]/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 hover:bg-amber-100 transition-colors"
                    onClick={() => setActiveTab("seo")}
                  >
                    <span className="text-lg">🔍</span>
                    <div>
                      <p className="font-semibold">Add SEO details to improve search visibility</p>
                      <p className="text-xs text-amber-600">Click to fill meta title, description & keywords →</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "seo" && (
              <SeoTab seo={seo} setSeo={setSeo} slug={slug} productName={form.productName} />
            )}

          </div>

          {submitError && (
            <div className="mx-6 mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/products")}
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

        </div>
      )}

    </div>
  );
}