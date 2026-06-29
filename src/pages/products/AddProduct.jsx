// AddProduct.jsx
// path: src/pages/products/AddProduct.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ArrowLeft, PackagePlus, ShieldCheck,
  Plus, Trash2, Tag, Layers, X, GripVertical, Image as ImageIcon,
  Check, Info, Sparkles, Box, FileText, Image, Palette,
  Shield, Search, Hash, AlertCircle, Package, Zap
} from "lucide-react";
import { getCurrentSession } from "../../config/localAuth";

const BASE_URL = "https://amazon-multi-vendor-3.onrender.com/api";
const ADD_URL  = "https://amazon-multi-vendor-3.onrender.com/api/products/add";
const VENDOR_ID = "6a2926ad76ab1ef00da7b71c";

// ── Shared input style ─────────────────────────────────────────
const inp =
  "mt-1 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all " +
  "placeholder:text-gray-400 shadow-sm hover:border-gray-300";

const selectInp =
  "mt-1 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all " +
  "shadow-sm hover:border-gray-300 cursor-pointer";

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
        {Icon && <Icon size={14} className="text-indigo-600" />}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function generateSlug(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function dedupeAttrs(raw) {
  const seen = new Set();
  return raw.filter(({ name }) => seen.has(name) ? false : (seen.add(name), true));
}
function cartesian(arrays) {
  if (!arrays.length) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  return first.flatMap((v) => restCombos.map((combo) => [v, ...combo]));
}
function buildVariants(attributesMeta) {
  const filled = attributesMeta.filter(
    (a) => a.name.trim() && a.values.some((v) => v.trim())
  );
  if (!filled.length) return [];
  const combos = cartesian(filled.map((a) => a.values.filter((v) => v.trim())));
  return combos.map((combo) => ({
    sku: "",
    attributes: filled.map((a, i) => ({ name: a.name, value: combo[i] })),
    images: [],
    inventory: { stock: "", quantity: "" },
    offer: {
      mrp: "",
      sellingPrice: "",
      salePrice: "",
      handlingTime: 2,
      itemCondition: "New",
      maximumOrderQuantity: 5,
    },
  }));
}

// ── Step Badge ────────────────────────────────────────────────
function StepBadge({ n, label, active, done }) {
  return (
    <div className={`flex items-center gap-2.5 transition-all ${active ? "opacity-100" : done ? "opacity-80" : "opacity-40"}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
        done ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
          : active ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
          : "bg-gray-200 text-gray-500"
      }`}>
        {done ? <Check size={14} /> : n}
      </span>
      <div>
        <p className={`text-xs font-bold ${active ? "text-gray-900" : "text-gray-500"}`}>{label}</p>
      </div>
    </div>
  );
}

// ── Attr Field ────────────────────────────────────────────────
function AttrField({ attr, value, onChange }) {
  const change = (e) => onChange(attr._id, e.target.value);
  const label = <>{attr.name}{attr.required && <span className="ml-1 text-red-500">*</span>}</>;
  if (attr.type === "dropdown") {
    return (
      <label className="block text-sm font-medium text-gray-700">{label}
        <select value={value} onChange={change} className={selectInp}>
          <option value="">Select…</option>
          {attr.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium text-gray-700">{label}
      <input type={attr.type === "number" ? "number" : "text"} value={value} onChange={change}
        placeholder={`Enter ${attr.name.toLowerCase()}`} className={inp} />
    </label>
  );
}

// ── Attributes Meta Builder ───────────────────────────────────
function AttributesMetaBuilder({ attributesMeta, setAttributesMeta }) {
  const addGroup    = () => setAttributesMeta((p) => [...p, { id: Date.now(), name: "", values: [""] }]);
  const removeGroup = (id) => setAttributesMeta((p) => p.filter((g) => g.id !== id));
  const updateName  = (id, name) => setAttributesMeta((p) => p.map((g) => g.id === id ? { ...g, name } : g));
  const addVal      = (id) => setAttributesMeta((p) => p.map((g) => g.id === id ? { ...g, values: [...g.values, ""] } : g));
  const updateVal   = (id, vi, v) => setAttributesMeta((p) => p.map((g) => g.id === id ? { ...g, values: g.values.map((x, i) => i === vi ? v : x) } : g));
  const removeVal   = (id, vi) => setAttributesMeta((p) => p.map((g) => g.id === id ? { ...g, values: g.values.filter((_, i) => i !== vi) } : g));

  return (
    <div className="space-y-3">
      {attributesMeta.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mx-auto mb-3">
            <Tag size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No attribute groups yet</p>
          <p className="text-xs text-gray-400 mt-1">Add groups like Color, Size to auto-generate variants.</p>
        </div>
      )}
      {attributesMeta.map((group) => (
        <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <GripVertical size={14} className="text-gray-300 shrink-0 cursor-grab" />
            <input value={group.name} onChange={(e) => updateName(group.id, e.target.value)}
              placeholder="Attribute name, e.g. Color"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-gray-50 transition-all" />
            <button onClick={() => removeGroup(group.id)}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pl-5">
            {group.values.map((val, vi) => (
              <div key={vi} className="flex items-center gap-1">
                <input value={val} onChange={(e) => updateVal(group.id, vi, e.target.value)}
                  placeholder={`Value ${vi + 1}`}
                  className="w-28 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-gray-50 transition-all" />
                {group.values.length > 1 && (
                  <button onClick={() => removeVal(group.id, vi)}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-300 hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addVal(group.id)}
              className="flex items-center gap-1 rounded-lg border border-dashed border-indigo-300 px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Plus size={10} /> Add value
            </button>
          </div>
          {group.name.trim() && group.values.some((v) => v.trim()) && (
            <div className="mt-3 pl-5 flex flex-wrap gap-1.5">
              {group.values.filter((v) => v.trim()).map((v) => (
                <span key={v} className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {group.name}: {v}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={addGroup}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 py-3 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
        <Plus size={15} /> Add attribute group
      </button>
    </div>
  );
}

// ── Variants Table ────────────────────────────────────────────
function VariantsTable({ variants, setVariants }) {
  if (!variants.length) return null;

  const update = (idx, field, value) => {
    setVariants((prev) => prev.map((v, i) => {
      if (i !== idx) return v;
      if (field.includes(".")) {
        const [p, c] = field.split(".");
        return { ...v, [p]: { ...v[p], [c]: value } };
      }
      return { ...v, [field]: value };
    }));
  };

  const remove = (idx) => setVariants((prev) => prev.filter((_, i) => i !== idx));

  const cellInp =
    "w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none " +
    "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white transition-all";

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
            <Layers size={12} className="text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-gray-700">
            {variants.length} variant{variants.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
          Fill SKU + pricing + image for each
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-gray-500 whitespace-nowrap">Combination</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">SKU</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">MRP ₹</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Selling ₹</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Sale ₹</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Stock</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Max Qty</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Condition</th>
              {/* ✅ NEW: Image URL column */}
              <th className="px-3 py-3 text-left font-semibold text-gray-500">Image URL</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-500">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variants.map((v, idx) => (
              <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">

                {/* Combination badges */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {v.attributes.map((a) => (
                      <span key={a.name} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {a.name}: <strong className="ml-0.5 text-indigo-700">{a.value}</strong>
                      </span>
                    ))}
                  </div>
                </td>

                {/* SKU */}
                <td className="px-3 py-2.5">
                  <input
                    value={v.sku}
                    onChange={(e) => update(idx, "sku", e.target.value)}
                    placeholder="SKU-001"
                    className={`w-28 ${cellInp}`}
                  />
                </td>

                {/* MRP */}
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={v.offer.mrp}
                    onChange={(e) => update(idx, "offer.mrp", e.target.value)}
                    placeholder="999"
                    className={`w-20 ${cellInp}`}
                  />
                </td>

                {/* Selling Price */}
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={v.offer.sellingPrice}
                    onChange={(e) => update(idx, "offer.sellingPrice", e.target.value)}
                    placeholder="799"
                    className={`w-20 ${cellInp}`}
                  />
                </td>

                {/* Sale Price */}
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={v.offer.salePrice}
                    onChange={(e) => update(idx, "offer.salePrice", e.target.value)}
                    placeholder="749"
                    className={`w-20 ${cellInp}`}
                  />
                </td>

                {/* Stock */}
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={v.inventory.stock}
                    onChange={(e) => update(idx, "inventory.stock", e.target.value)}
                    placeholder="10"
                    className={`w-16 ${cellInp}`}
                  />
                </td>

                {/* Max Order Qty */}
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={v.offer.maximumOrderQuantity}
                    onChange={(e) => update(idx, "offer.maximumOrderQuantity", Number(e.target.value))}
                    placeholder="5"
                    min="1"
                    className={`w-14 ${cellInp}`}
                  />
                </td>

                {/* Item Condition */}
                <td className="px-3 py-2.5">
                  <select
                    value={v.offer.itemCondition}
                    onChange={(e) => update(idx, "offer.itemCondition", e.target.value)}
                    className={cellInp}
                  >
                    <option>New</option>
                    <option>Used</option>
                    <option>Refurbished</option>
                  </select>
                </td>

                {/* ✅ NEW: Image URL — stored as images[0] */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {/* Tiny preview */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                      {v.images[0] ? (
                        <img
                          src={v.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <ImageIcon size={12} className="text-gray-300" />
                      )}
                    </div>
                    <input
                      value={v.images[0] ?? ""}
                      onChange={(e) =>
                        update(idx, "images", e.target.value ? [e.target.value] : [])
                      }
                      placeholder="https://…/image.jpg"
                      className={`w-44 ${cellInp}`}
                    />
                  </div>
                </td>

                {/* Delete */}
                <td className="px-3 py-2.5 text-center">
                  <button
                    onClick={() => remove(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors mx-auto group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TAB 1: Basic Info ──────────────────────────────────────────
function TabBasicInfo({ form, setForm, categories, subCategories, catLoading, subCatLoading,
  attrLoading, selectedCat, selectedSub, selectedCatName, selectedSubName,
  attributes, attrValues, setAttrValues, handleCatChange, handleSubChange }) {
  return (
    <div className="space-y-8">
      <SectionTitle icon={Hash} label="Identifiers" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700 md:col-span-2">
          Product Name <span className="text-red-500">*</span>
          <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
            placeholder="e.g. Women Floral Printed Top" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Item Name
          <input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            placeholder="e.g. Omaan Women Casual Top" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Product Type
          <input value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}
            placeholder="e.g. Apparel" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Brand Name
          <input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            placeholder="e.g. Omaan" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Recommended Browse Node
          <input value={form.recommendedBrowseNode} onChange={(e) => setForm({ ...form, recommendedBrowseNode: e.target.value })}
            placeholder="e.g. Women Tops" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          External Product ID
          <input value={form.externalProductId} onChange={(e) => setForm({ ...form, externalProductId: e.target.value })}
            placeholder="e.g. OMAAN-TOP-001" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Base Price (₹)
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Opening Stock
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="0" className={inp} />
        </label>
      </div>

      <SectionTitle icon={Layers} label="Category" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">
          Category <span className="text-red-500">*</span>
          {catLoading ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-400 p-2.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" /> Loading…
            </div>
          ) : (
            <select value={selectedCat} onChange={(e) => handleCatChange(e.target.value)} className={selectInp}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Sub-category <span className="text-red-500">*</span>
          {subCatLoading ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-400 p-2.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" /> Loading…
            </div>
          ) : (
            <select value={selectedSub} onChange={(e) => handleSubChange(e.target.value)}
              disabled={!subCategories.length} className={`${selectInp} disabled:cursor-not-allowed disabled:opacity-50`}>
              <option value="">Select sub-category…</option>
              {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}
        </label>
      </div>
      {attrLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600 shrink-0" />
          Loading product attribute fields…
        </div>
      )}
      {!attrLoading && attributes.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Category Attributes — {attributes.length} fields</p>
            <span className="text-xs text-white bg-indigo-500 px-2 py-0.5 rounded-full font-medium">{attributes.filter((a) => a.required).length} required</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {attributes.map((attr) => (
              <AttrField key={attr._id} attr={attr} value={attrValues[attr._id] ?? ""}
                onChange={(id, val) => setAttrValues((prev) => ({ ...prev, [id]: val }))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB 2: Description ─────────────────────────────────────────
function TabDescription({ desc, setDesc }) {
  const addBullet    = () => setDesc((d) => ({ ...d, bulletPoints: [...d.bulletPoints, ""] }));
  const removeBullet = (i) => setDesc((d) => ({ ...d, bulletPoints: d.bulletPoints.filter((_, idx) => idx !== i) }));
  const updateBullet = (i, v) => setDesc((d) => ({ ...d, bulletPoints: d.bulletPoints.map((x, idx) => idx === i ? v : x) }));
  return (
    <div className="space-y-8">
      <SectionTitle icon={FileText} label="Product Description" />
      <label className="block text-sm font-semibold text-gray-700">
        Product Description
        <textarea value={desc.productDescription}
          onChange={(e) => setDesc((d) => ({ ...d, productDescription: e.target.value }))}
          rows={5} placeholder="Detailed product description…" className={`${inp} resize-none`} />
      </label>

      <SectionTitle icon={Zap} label="Bullet Points" />
      <div className="space-y-2.5">
        {desc.bulletPoints.map((bp, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
            <input value={bp} onChange={(e) => updateBullet(i, e.target.value)}
              placeholder={`Bullet point ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm hover:border-gray-300" />
            {desc.bulletPoints.length > 1 && (
              <button onClick={() => removeBullet(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button onClick={addBullet} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-2 ml-9">
          <Plus size={14} /> Add bullet point
        </button>
      </div>

      <SectionTitle icon={Search} label="Search & Meta Keywords" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">
          Metadata <span className="text-xs font-normal text-gray-400">(space separated)</span>
          <input value={desc.metadata} onChange={(e) => setDesc((d) => ({ ...d, metadata: e.target.value }))}
            placeholder="women floral printed top casual wear" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Meta Keywords <span className="text-xs font-normal text-gray-400">(comma separated)</span>
          <input value={desc.metaKeywords} onChange={(e) => setDesc((d) => ({ ...d, metaKeywords: e.target.value }))}
            placeholder="women top, floral top, casual wear" className={inp} />
        </label>
        <label className="block text-sm font-semibold text-gray-700 md:col-span-2">
          Search Keywords <span className="text-xs font-normal text-gray-400">(comma separated)</span>
          <input value={desc.searchKeywords} onChange={(e) => setDesc((d) => ({ ...d, searchKeywords: e.target.value }))}
            placeholder="women clothing, summer top, fashion top" className={inp} />
        </label>
      </div>
    </div>
  );
}

// ── TAB 3: Product Details ─────────────────────────────────────
function TabProductDetails({ details, setDetails }) {
  const upd    = (k, v) => setDetails((d) => ({ ...d, [k]: v }));
  const updDim = (section, k, v) => setDetails((d) => ({ ...d, [section]: { ...d[section], [k]: v } }));
  const addFeature    = () => setDetails((d) => ({ ...d, specialFeatures: [...d.specialFeatures, ""] }));
  const removeFeature = (i) => setDetails((d) => ({ ...d, specialFeatures: d.specialFeatures.filter((_, idx) => idx !== i) }));
  const updateFeature = (i, v) => setDetails((d) => ({ ...d, specialFeatures: d.specialFeatures.map((x, idx) => idx === i ? v : x) }));
  const addComp    = () => setDetails((d) => ({ ...d, includedComponents: [...d.includedComponents, ""] }));
  const removeComp = (i) => setDetails((d) => ({ ...d, includedComponents: d.includedComponents.filter((_, idx) => idx !== i) }));
  const updateComp = (i, v) => setDetails((d) => ({ ...d, includedComponents: d.includedComponents.map((x, idx) => idx === i ? v : x) }));
  const listInp = "flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm hover:border-gray-300";
  return (
    <div className="space-y-8">
      <SectionTitle icon={Tag} label="Target & Type" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Target Audience<input value={details.targetAudienceKeyword} onChange={(e) => upd("targetAudienceKeyword", e.target.value)} placeholder="e.g. Women" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Item Type Name<input value={details.itemTypeName} onChange={(e) => upd("itemTypeName", e.target.value)} placeholder="e.g. Top" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Generic Keyword<input value={details.genericKeyword} onChange={(e) => upd("genericKeyword", e.target.value)} placeholder="e.g. Women Top" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Occasion<input value={details.occasion} onChange={(e) => upd("occasion", e.target.value)} placeholder="e.g. Casual" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Theme<input value={details.theme} onChange={(e) => upd("theme", e.target.value)} placeholder="e.g. Floral" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Item Shape / Fit<input value={details.itemShape} onChange={(e) => upd("itemShape", e.target.value)} placeholder="e.g. Regular Fit" className={inp} /></label>
      </div>

      <SectionTitle icon={Box} label="Manufacturer" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Manufacturer<input value={details.manufacturer} onChange={(e) => upd("manufacturer", e.target.value)} placeholder="e.g. Omaan Fashion Pvt Ltd" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Manufacturer Contact<input value={details.manufacturerContactInfo} onChange={(e) => upd("manufacturerContactInfo", e.target.value)} placeholder="e.g. support@omaan.com" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Model Number<input value={details.modelNumber} onChange={(e) => upd("modelNumber", e.target.value)} placeholder="e.g. WT-101" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Part Number<input value={details.partNumber} onChange={(e) => upd("partNumber", e.target.value)} placeholder="e.g. OMAAN-WT-101" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Material<input value={details.material} onChange={(e) => upd("material", e.target.value)} placeholder="e.g. Cotton" className={inp} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-gray-700">Unit Count<input type="number" value={details.unitCount} onChange={(e) => upd("unitCount", e.target.value)} placeholder="1" className={inp} /></label>
          <label className="block text-sm font-semibold text-gray-700">Unit Type<input value={details.unitCountType} onChange={(e) => upd("unitCountType", e.target.value)} placeholder="Piece" className={inp} /></label>
        </div>
      </div>

      <SectionTitle icon={Sparkles} label="Special Features" />
      <div className="space-y-2.5">
        {details.specialFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <input value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}, e.g. Lightweight`} className={listInp} />
            {details.specialFeatures.length > 1 && (
              <button onClick={() => removeFeature(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={14} /></button>
            )}
          </div>
        ))}
        <button onClick={addFeature} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-1"><Plus size={14} /> Add feature</button>
      </div>

      <SectionTitle icon={Package} label="Included Components" />
      <div className="space-y-2.5">
        {details.includedComponents.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <input value={c} onChange={(e) => updateComp(i, e.target.value)} placeholder={`Component ${i + 1}, e.g. 1 Women Top`} className={listInp} />
            {details.includedComponents.length > 1 && (
              <button onClick={() => removeComp(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={14} /></button>
            )}
          </div>
        ))}
        <button onClick={addComp} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-1"><Plus size={14} /> Add component</button>
      </div>

      <SectionTitle icon={Box} label="Item Dimensions (cm)" />
      <div className="grid gap-5 md:grid-cols-3">
        {["length","width","height"].map((k) => (
          <label key={k} className="block text-sm font-semibold text-gray-700 capitalize">{k}
            <input type="number" value={details.itemDimensions[k]} onChange={(e) => updDim("itemDimensions", k, e.target.value)} placeholder="0" className={inp} />
          </label>
        ))}
      </div>

      <SectionTitle icon={Box} label="Package Dimensions (cm)" />
      <div className="grid gap-5 md:grid-cols-3">
        {["length","width","height"].map((k) => (
          <label key={k} className="block text-sm font-semibold text-gray-700 capitalize">{k}
            <input type="number" value={details.packageDimensions[k]} onChange={(e) => updDim("packageDimensions", k, e.target.value)} placeholder="0" className={inp} />
          </label>
        ))}
      </div>

      <SectionTitle icon={Package} label="Weight & Packaging" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Item Weight<input type="number" value={details.itemWeight} onChange={(e) => upd("itemWeight", e.target.value)} placeholder="200" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Weight Unit<select value={details.itemWeightUnit} onChange={(e) => upd("itemWeightUnit", e.target.value)} className={selectInp}><option>grams</option><option>kg</option><option>lbs</option><option>oz</option></select></label>
        <label className="block text-sm font-semibold text-gray-700">Package Weight (grams)<input type="number" value={details.packageWeight} onChange={(e) => upd("packageWeight", e.target.value)} placeholder="250" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Packaging Type<input value={details.packagingType} onChange={(e) => upd("packagingType", e.target.value)} placeholder="e.g. Polybag" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Source Type<select value={details.sourceType} onChange={(e) => upd("sourceType", e.target.value)} className={selectInp}><option>Manufacturer</option><option>Distributor</option><option>Reseller</option></select></label>
        <label className="block text-sm font-semibold text-gray-700">Fulfillment Channel<select value={details.fulfillmentChannel} onChange={(e) => upd("fulfillmentChannel", e.target.value)} className={selectInp}><option>Seller</option><option>Marketplace</option><option>FBA</option></select></label>
        <label className="block text-sm font-semibold text-gray-700">Number of Packs<input type="number" value={details.numberOfPacks} onChange={(e) => upd("numberOfPacks", e.target.value)} placeholder="1" className={inp} /></label>
      </div>
    </div>
  );
}

// ── TAB 4: Images ──────────────────────────────────────────────
function TabImages({ images, setImages }) {
  const addImage    = () => setImages((p) => [...p, ""]);
  const removeImage = (i) => setImages((p) => p.filter((_, idx) => idx !== i));
  const updateImage = (i, v) => setImages((p) => p.map((x, idx) => idx === i ? v : x));
  return (
    <div className="space-y-6">
      <SectionTitle icon={Image} label="Product Images" />
      <p className="text-sm text-gray-500 -mt-4">Add image URLs for the main product listing.</p>
      <div className="space-y-3">
        {images.map((url, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
              {url
                ? <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.style.display="none"; }} />
                : <ImageIcon size={18} className="text-gray-300" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input value={url} onChange={(e) => updateImage(i, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm hover:border-gray-300" />
                {images.length > 1 && (
                  <button onClick={() => removeImage(i)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                {i === 0 ? <span className="text-indigo-600 font-medium">★ Main listing image</span> : `Image ${i + 1}`}
              </p>
            </div>
          </div>
        ))}
        <button onClick={addImage}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 py-3.5 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all mt-2">
          <Plus size={15} /> Add image URL
        </button>
      </div>
    </div>
  );
}

// ── TAB 5: Attributes & Variants ──────────────────────────────
function TabVariants({ attributesMeta, setAttributesMeta, variants, setVariants }) {
  return (
    <div className="space-y-8">
      <SectionTitle icon={Tag} label="Attribute Groups" />
      <p className="text-sm text-gray-500 -mt-4">Add groups like Color, Size — variants auto-generate below.</p>
      <AttributesMetaBuilder attributesMeta={attributesMeta} setAttributesMeta={setAttributesMeta} />
      {variants.length > 0 && (
        <>
          <SectionTitle icon={Layers} label="Variants" />
          <p className="text-sm text-gray-500 -mt-4">Fill SKU, pricing, image and stock for each combination. Delete unwanted ones.</p>
          <VariantsTable variants={variants} setVariants={setVariants} />
        </>
      )}
      {attributesMeta.length > 0 && variants.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-400 font-medium">Fill in at least one attribute name and one value to generate variants.</p>
        </div>
      )}
    </div>
  );
}

// ── TAB 6: Safety & Compliance ────────────────────────────────
function TabSafety({ safety, setSafety }) {
  const upd = (k, v) => setSafety((s) => ({ ...s, [k]: v }));
  return (
    <div className="space-y-8">
      <SectionTitle icon={Shield} label="Origin & Compliance" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Country / Region of Origin<input value={safety.countryRegionOfOrigin} onChange={(e) => upd("countryRegionOfOrigin", e.target.value)} placeholder="e.g. India" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Dangerous Goods Regulation<select value={safety.dangerousGoodsRegulation} onChange={(e) => upd("dangerousGoodsRegulation", e.target.value)} className={selectInp}><option value="No">No</option><option value="Yes">Yes</option></select></label>
        <label className="block text-sm font-semibold text-gray-700">Buyer Age Restriction<input value={safety.buyerAgeRestriction} onChange={(e) => upd("buyerAgeRestriction", e.target.value)} placeholder="e.g. None / 18+ / 13+" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Regulatory Compliance Certification<input value={safety.regulatoryComplianceCertification} onChange={(e) => upd("regulatoryComplianceCertification", e.target.value)} placeholder="e.g. Textile Certified" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700 md:col-span-2">Mandatory Cautionary Statement<input value={safety.mandatoryCautionaryStatement} onChange={(e) => upd("mandatoryCautionaryStatement", e.target.value)} placeholder="e.g. Keep away from fire" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Safety Attestation<input value={safety.safetyAttestation} onChange={(e) => upd("safetyAttestation", e.target.value)} placeholder="e.g. Safe Product" className={inp} /></label>
        <label className="block text-sm font-semibold text-gray-700">Safety Attestation Address<input value={safety.safetyAttestationAddress} onChange={(e) => upd("safetyAttestationAddress", e.target.value)} placeholder="e.g. Jaipur, Rajasthan" className={inp} /></label>
      </div>

      <SectionTitle icon={Package} label="Shipping & Gift" />
      <div className="flex flex-wrap gap-4">
        {[["shipsGlobally","Ships Globally"],["giftMessageAvailable","Gift Message Available"],["giftWrapAvailable","Gift Wrap Available"]].map(([k, label]) => (
          <label key={k} className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
            safety[k] ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}>
            <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
              safety[k] ? "border-indigo-500 bg-indigo-500" : "border-gray-300 bg-white"
            }`}>
              {safety[k] && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
            <input type="checkbox" checked={safety[k]} onChange={(e) => upd(k, e.target.checked)} className="sr-only" />
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: SEO ─────────────────────────────────────────────────
function TabSeo({ seo, setSeo, slug, setSlug, setSlugEdited, productName }) {
  const descLen  = seo.metaDesc.length;
  const titleLen = seo.metaTitle.length;
  const descColor = descLen > 160 ? "#ef4444" : descLen > 130 ? "#f59e0b" : descLen > 0 ? "#22c55e" : "#94a3b8";
  return (
    <div className="space-y-6">
      <SectionTitle icon={Search} label="SEO Settings" />
      <label className="block text-sm font-semibold text-gray-700">
        <div className="flex items-center justify-between mb-1">
          <span>Meta Title</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${titleLen > 60 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{titleLen}/60</span>
        </div>
        <input value={seo.metaTitle} onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))}
          maxLength={70} placeholder="Title shown in Google results…" className={inp} />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        <div className="flex items-center justify-between mb-1">
          <span>Meta Description</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100" style={{ color: descColor }}>{descLen}/160</span>
        </div>
        <textarea value={seo.metaDesc} onChange={(e) => setSeo((s) => ({ ...s, metaDesc: e.target.value }))}
          rows={3} placeholder="Short description shown under title in Google…" className={`${inp} resize-none`} />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        <div className="flex items-center justify-between mb-1">
          <span>URL Slug</span>
          {slug && <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">/products/{slug}</span>}
        </div>
        <div className="mt-1 flex overflow-hidden rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-sm transition-all">
          <span className="flex items-center bg-gray-100 px-3 text-xs text-gray-500 border-r border-gray-200 whitespace-nowrap font-mono">/products/</span>
          <input value={slug} onChange={(e) => { setSlug(generateSlug(e.target.value)); setSlugEdited(true); }}
            placeholder="auto-generated-from-name"
            className="flex-1 bg-white px-3 py-2.5 text-sm font-mono text-indigo-600 outline-none" />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Auto-generated from product name. Edit manually if needed.</p>
      </label>

      {/* Google Preview */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search size={13} className="text-gray-400" />
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Google Search Preview</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-0.5 text-xs text-[#006621] font-medium">yoursite.com/products/<span>{slug || "product-slug"}</span></p>
          <p className="text-lg font-medium leading-snug text-[#1a0dab] cursor-default">{seo.metaTitle || productName || "Product Title — Your Store"}</p>
          <p className="mt-1 text-sm leading-snug text-gray-600">{seo.metaDesc ? seo.metaDesc.slice(0, 160) : "Your meta description will appear here…"}</p>
        </div>
        <p className="mt-2.5 text-xs text-gray-400">Approximation of how your product appears on Google.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
const TABS = [
  { id: "basic",    label: "Basic Info",            icon: Hash },
  { id: "desc",     label: "Description",           icon: FileText },
  { id: "details",  label: "Product Details",       icon: Box },
  { id: "images",   label: "Images",                icon: Image },
  { id: "variants", label: "Attributes & Variants", icon: Palette },
  { id: "safety",   label: "Safety",                icon: Shield },
  { id: "seo",      label: "SEO",                   icon: Search },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const session  = getCurrentSession();

  const [step,      setStep]      = useState(1);
  const [activeTab, setActiveTab] = useState("basic");

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
    productName: "", itemName: "", productType: "", brandName: "",
    recommendedBrowseNode: "", externalProductId: "", price: "", stock: "",
  });
  const [desc, setDesc] = useState({
    productDescription: "", bulletPoints: [""],
    metadata: "", metaKeywords: "", searchKeywords: "",
  });
  const [details, setDetails] = useState({
    targetAudienceKeyword: "", modelNumber: "", manufacturer: "", genericKeyword: "",
    specialFeatures: [""], material: "", itemTypeName: "", occasion: "", partNumber: "",
    itemShape: "", theme: "", manufacturerContactInfo: "", unitCount: 1, unitCountType: "Piece",
    includedComponents: [""],
    itemDimensions:    { length: "", width: "", height: "" },
    packageDimensions: { length: "", width: "", height: "" },
    itemWeight: "", itemWeightUnit: "grams", packageWeight: "",
    packagingType: "", sourceType: "Manufacturer", fulfillmentChannel: "Seller", numberOfPacks: 1,
  });
  const [images,         setImages]         = useState([""]);
  const [attributesMeta, setAttributesMeta] = useState([]);
  const [variants,       setVariants]       = useState([]);
  const [safety, setSafety] = useState({
    countryRegionOfOrigin: "India", dangerousGoodsRegulation: "No",
    buyerAgeRestriction: "None", mandatoryCautionaryStatement: "",
    regulatoryComplianceCertification: "", safetyAttestation: "",
    safetyAttestationAddress: "", shipsGlobally: true,
    giftMessageAvailable: false, giftWrapAvailable: false,
  });
  const [seo,        setSeo]        = useState({ metaTitle: "", metaDesc: "" });
  const [slug,       setSlug]       = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => { setVariants(buildVariants(attributesMeta)); }, [attributesMeta]);

  useEffect(() => {
    if (!slugEdited && form.productName) setSlug(generateSlug(form.productName));
    if (!seo.metaTitle && form.productName) setSeo((s) => ({ ...s, metaTitle: form.productName }));
  }, [form.productName]);

  useEffect(() => {
    setCatLoading(true);
    fetch(`${BASE_URL}/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  const handleCatChange = async (catId) => {
    const cat = categories.find((c) => c._id === catId);
    setSelectedCat(catId); setSelectedCatName(cat?.name ?? "");
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
    setSelectedSub(subId); setSelectedSubName(sub?.name ?? "");
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
      setAttributes(deduped); setAttrValues(defaults);
    } catch (e) { console.error(e); }
    finally { setAttrLoading(false); }
  };

  const addListing = async () => {
    setSubmitError("");

    const payload = {
      vendorId:              VENDOR_ID,
      productName:           form.productName,
      itemName:              form.itemName,
      productType:           form.productType,
      recommendedBrowseNode: form.recommendedBrowseNode,
      brandName:             form.brandName,
      externalProductId:     form.externalProductId,
      sku:                   form.externalProductId,
      price:                 Number(form.price  || 0),
      stock:                 Number(form.stock  || 0),
      categoryId:            selectedCat,
      subCategoryId:         selectedSub,
      metadata:              desc.metadata,
      metaKeywords:          desc.metaKeywords.split(",").map((s) => s.trim()).filter(Boolean),
      searchKeywords:        desc.searchKeywords.split(",").map((s) => s.trim()).filter(Boolean),
      description: {
        productDescription: desc.productDescription,
        bulletPoints:       desc.bulletPoints.filter((b) => b.trim()),
      },
      images: images.filter((u) => u.trim()),
      attributes: attributes.map((a) => ({ attributeId: a._id, name: a.name, value: attrValues[a._id] ?? "" })),
      attributesMeta: attributesMeta
        .filter((g) => g.name.trim() && g.values.some((v) => v.trim()))
        .map((g) => ({ name: g.name.trim(), values: g.values.filter((v) => v.trim()) })),
      variants: variants.map((v) => ({
        sku: v.sku,
        attributes: v.attributes,
        // ✅ images array — now populated from the Image URL column in the table
        images: v.images.filter((u) => u.trim()),
        inventory: {
          stock:    Number(v.inventory.stock || 0),
          quantity: Number(v.inventory.stock || 0),
        },
        offer: {
          mrp:                  Number(v.offer.mrp          || 0),
          sellingPrice:         Number(v.offer.sellingPrice || 0),
          salePrice:            Number(v.offer.salePrice    || 0),
          handlingTime:         v.offer.handlingTime,
          itemCondition:        v.offer.itemCondition,
          maximumOrderQuantity: Number(v.offer.maximumOrderQuantity || 5),
        },
      })),
      productDetails: {
        targetAudienceKeyword:         details.targetAudienceKeyword,
        modelNumber:                   details.modelNumber,
        manufacturer:                  details.manufacturer,
        genericKeyword:                details.genericKeyword,
        specialFeatures:               details.specialFeatures.filter((f) => f.trim()),
        material:                      details.material,
        itemTypeName:                  details.itemTypeName,
        occasion:                      details.occasion,
        partNumber:                    details.partNumber,
        itemShape:                     details.itemShape,
        theme:                         details.theme,
        manufacturerContactInfo:       details.manufacturerContactInfo,
        unitCount:                     Number(details.unitCount || 1),
        unitCountType:                 details.unitCountType,
        includedComponents:            details.includedComponents.filter((c) => c.trim()),
      },
      dimensions: {
        itemDimensions:    {
          length: Number(details.itemDimensions.length || 0),
          width:  Number(details.itemDimensions.width  || 0),
          height: Number(details.itemDimensions.height || 0),
        },
        packageDimensions: {
          length: Number(details.packageDimensions.length || 0),
          width:  Number(details.packageDimensions.width  || 0),
          height: Number(details.packageDimensions.height || 0),
        },
        itemWeight:     Number(details.itemWeight    || 0),
        itemWeightUnit: details.itemWeightUnit,
        packageWeight:  Number(details.packageWeight || 0),
      },
      packaging: {
        packagingType:      details.packagingType,
        sourceType:         details.sourceType,
        fulfillmentChannel: details.fulfillmentChannel,
        numberOfPacks:      Number(details.numberOfPacks || 1),
      },
      safetyCompliance: {
        countryRegionOfOrigin:             safety.countryRegionOfOrigin,
        dangerousGoodsRegulation:          safety.dangerousGoodsRegulation,
        buyerAgeRestriction:               safety.buyerAgeRestriction,
        mandatoryCautionaryStatement:      safety.mandatoryCautionaryStatement,
        regulatoryComplianceCertification: safety.regulatoryComplianceCertification,
        safetyAttestation:                 safety.safetyAttestation,
        safetyAttestationAddress:          safety.safetyAttestationAddress,
        shipsGlobally:                     safety.shipsGlobally,
        complianceMedia:                   [],
      },
      giftOptions: {
        giftMessageAvailable: safety.giftMessageAvailable,
        giftWrapAvailable:    safety.giftWrapAvailable,
      },
      slug:            slug || generateSlug(form.productName),
      metaTitle:       seo.metaTitle || form.productName,
      metaDescription: seo.metaDesc,
    };

    console.log("📦 Submitting payload:", JSON.stringify(payload, null, 2));
    setSubmitting(true);
    try {
      const res = await fetch(ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseText = await res.text();
      console.log(`📨 Response ${res.status}:`, responseText);
      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try { const e = JSON.parse(responseText); errMsg = e.message || e.error || e.msg || errMsg; } catch (_) {}
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

  const canSubmit      = form.productName.trim() && selectedCat && selectedSub && !submitting;
  const step1Ready     = selectedCat && selectedSub && !attrLoading;
  const metaGroupCount = attributesMeta.filter((g) => g.name.trim() && g.values.some((v) => v.trim())).length;

  const tabCls = (t) =>
    `flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
      activeTab === t
        ? "border-indigo-500 text-indigo-700 bg-indigo-50/50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-5 min-h-screen bg-gray-50/50">

      {/* ── Page Header ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-0.5">Inventory Command Center</p>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30">
                  <PackagePlus size={18} className="text-white" />
                </div>
                Add Marketplace Listing
              </h1>
            </div>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100">
            <StepBadge n={1} label="Choose Category" active={step === 1} done={step > 1} />
            <div className="flex items-center gap-1 mx-2">
              <div className={`h-0.5 w-8 rounded-full transition-all ${step > 1 ? "bg-indigo-500" : "bg-gray-200"}`} />
              <ChevronRight size={13} className={step > 1 ? "text-indigo-500" : "text-gray-300"} />
            </div>
            <StepBadge n={2} label="Fill & Submit" active={step === 2} done={false} />
          </div>
        </div>

        {/* Vendor badge */}
        <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs text-indigo-700">
          <ShieldCheck size={14} className="shrink-0 text-indigo-500" />
          <span>Vendor ID: <strong className="font-mono">{VENDOR_ID}</strong></span>
        </div>
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-indigo-50/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-500/30">1</div>
              <div>
                <h2 className="font-bold text-gray-900">Choose Category</h2>
                <p className="text-sm text-gray-500">Select category and sub-category first. Attribute fields load automatically.</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
                {catLoading ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400 py-2.5 px-3.5">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" /> Loading…
                  </div>
                ) : (
                  <select value={selectedCat} onChange={(e) => handleCatChange(e.target.value)} className={selectInp}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                )}
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Sub-category <span className="text-red-500">*</span>
                {subCatLoading ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400 py-2.5 px-3.5">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" /> Loading…
                  </div>
                ) : (
                  <select value={selectedSub} onChange={(e) => handleSubChange(e.target.value)}
                    disabled={!subCategories.length} className={`${selectInp} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <option value="">Select sub-category…</option>
                    {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                )}
              </label>
            </div>
            {attrLoading && (
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3.5 text-sm text-indigo-700">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600 shrink-0" />
                Loading product attribute fields…
              </div>
            )}
            {!attrLoading && attributes.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-sm text-emerald-700">
                  <strong>{attributes.length} attribute fields</strong> loaded for <em>{selectedCatName} › {selectedSubName}</em>.
                  <span className="ml-1 text-emerald-600 font-medium">({attributes.filter((a) => a.required).length} required)</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <button onClick={() => navigate("/admin/products")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
            <button onClick={() => setStep(2)} disabled={!step1Ready}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-700 transition-all">
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {/* Step 2 header */}
          <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-indigo-50/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-500/30">2</div>
              <div>
                <h2 className="font-bold text-gray-900">Product Details</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-700">{selectedCatName}</span>
                  <ChevronRight size={12} />
                  <span className="font-semibold text-gray-700">{selectedSubName}</span>
                  <button onClick={() => setStep(1)} className="ml-2 text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Change</button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-none bg-white">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} className={tabCls(t.id)} onClick={() => setActiveTab(t.id)}>
                  <Icon size={13} />
                  {t.label}
                  {t.id === "variants" && metaGroupCount > 0 && (
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{metaGroupCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "basic"    && <TabBasicInfo form={form} setForm={setForm} categories={categories}
              subCategories={subCategories} catLoading={catLoading} subCatLoading={subCatLoading}
              attrLoading={attrLoading} selectedCat={selectedCat} selectedSub={selectedSub}
              selectedCatName={selectedCatName} selectedSubName={selectedSubName}
              attributes={attributes} attrValues={attrValues} setAttrValues={setAttrValues}
              handleCatChange={handleCatChange} handleSubChange={handleSubChange} />}
            {activeTab === "desc"     && <TabDescription desc={desc} setDesc={setDesc} />}
            {activeTab === "details"  && <TabProductDetails details={details} setDetails={setDetails} />}
            {activeTab === "images"   && <TabImages images={images} setImages={setImages} />}
            {activeTab === "variants" && <TabVariants attributesMeta={attributesMeta} setAttributesMeta={setAttributesMeta} variants={variants} setVariants={setVariants} />}
            {activeTab === "safety"   && <TabSafety safety={safety} setSafety={setSafety} />}
            {activeTab === "seo"      && <TabSeo seo={seo} setSeo={setSeo} slug={slug} setSlug={setSlug} setSlugEdited={setSlugEdited} productName={form.productName} />}
          </div>

          {/* Error */}
          {submitError && (
            <div className="mx-6 mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="shrink-0" />
              {submitError}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate("/admin/products")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={addListing} disabled={!canSubmit}
                className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-700 transition-all">
                {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {submitting ? "Saving…" : "Save Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}