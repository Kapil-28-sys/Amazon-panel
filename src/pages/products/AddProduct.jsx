import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package, Tag, DollarSign, Image as ImageIcon,
  Upload, CheckCircle, ChevronDown, Layers, Hash,
  BarChart2, ShoppingBag, Percent, ArrowLeft
} from "lucide-react";
import { apiUrl } from "../../config/api";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const SectionHeader = ({ icon: Icon, color, children }) => (
  <h3 className={`flex items-center gap-2 font-bold text-base mb-5 text-slate-700 pb-3 border-b border-slate-100`}>
    <Icon size={18} className={color} /> {children}
  </h3>
);

// ─── component ───────────────────────────────────────────────────────────────
function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // dropdown data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subToSubs, setSubToSubs] = useState([]);
  const [vendors, setVendors] = useState([]);

  // image files (thumbnail + gallery)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [data, setData] = useState({
    vendorId: "",
    productName: "",
    categoryId: "",
    subCategoryId: "",
    subToSubCategoryId: "",
    brand: "",
    sku: "",
    price: "",
    salePrice: "",
    discount: "",
    minQuantity: 1,
    maxQuantity: "",
    stock: "",
    description: "",
    status: "active",
  });

  // ── fetch vendors & categories on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, vendorRes] = await Promise.all([
          axios.get(apiUrl("/api/categories")),
          axios.get(apiUrl("/api/vendors")),
        ]);
        setCategories(catRes.data?.categories || catRes.data || []);
        setVendors(vendorRes.data?.vendors || vendorRes.data || []);
      } catch (err) {
        console.error("Failed to fetch init data", err);
      }
    };
    load();
  }, []);

  // ── fetch sub-categories when category changes ────────────────────────────
  useEffect(() => {
    if (!data.categoryId) { setSubCategories([]); setSubToSubs([]); return; }
    const fetch = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/subcategories?categoryId=${data.categoryId}`));
        setSubCategories(res.data?.subCategories || res.data || []);
        setSubToSubs([]);
        setData(d => ({ ...d, subCategoryId: "", subToSubCategoryId: "" }));
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [data.categoryId]);

  // ── fetch sub-to-sub when sub-category changes ────────────────────────────
  useEffect(() => {
    if (!data.subCategoryId) { setSubToSubs([]); return; }
    const fetch = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/subtosubcategories?subCategoryId=${data.subCategoryId}`));
        setSubToSubs(res.data?.subToSubCategories || res.data || []);
        setData(d => ({ ...d, subToSubCategoryId: "" }));
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [data.subCategoryId]);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  // ── thumbnail ────────────────────────────────────────────────────────────
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── gallery (multiple) ───────────────────────────────────────────────────
  const handleGallery = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
    setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== "") formData.append(k, v); });
    if (thumbnailFile) formData.append("thumbnailImage", thumbnailFile);
    galleryFiles.forEach(f => formData.append("images", f));

    try {
      await axios.post(apiUrl("/api/products/add"), formData);
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  // ── derived ──────────────────────────────────────────────────────────────
  const categorySelected = !!data.categoryId;
  const subCategorySelected = !!data.subCategoryId;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-5 md:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition mb-5 group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Product</h1>
          <p className="text-slate-500 text-sm mt-1">Fill in the details below to list a product on the marketplace.</p>
        </div>

        {/* Progress hint */}
        <div className="flex items-center gap-2 mb-7 text-xs font-medium">
          {[
            { label: "1. Category", done: categorySelected },
            { label: "2. Sub-Category", done: subCategorySelected },
            { label: "3. Product Details", done: false },
          ].map((step, i) => (
            <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${step.done ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400"}`}>
              {step.done && <CheckCircle size={12} />} {step.label}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── STEP 1: Category Selection ──────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SectionHeader icon={Tag} color="text-orange-500">
              Category Selection
            </SectionHeader>
            <div className="grid md:grid-cols-3 gap-5">

              {/* Category */}
              <Field label="Category *">
                <div className="relative">
                  <select
                    name="categoryId"
                    value={data.categoryId}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer pr-9`}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              {/* Sub-Category */}
              <Field label="Sub-Category">
                <div className="relative">
                  <select
                    name="subCategoryId"
                    value={data.subCategoryId}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer pr-9 ${!categorySelected ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!categorySelected}
                  >
                    <option value="">
                      {!categorySelected ? "Select category first" : "Select sub-category"}
                    </option>
                    {subCategories.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              {/* Sub-to-Sub */}
              <Field label="Sub-Sub-Category">
                <div className="relative">
                  <select
                    name="subToSubCategoryId"
                    value={data.subToSubCategoryId}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer pr-9 ${!subCategorySelected ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!subCategorySelected}
                  >
                    <option value="">
                      {!subCategorySelected ? "Select sub-category first" : "Select (optional)"}
                    </option>
                    {subToSubs.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

            </div>
          </div>

          {/* ── STEP 2: General Info ─────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SectionHeader icon={Package} color="text-blue-500">
              General Information
            </SectionHeader>
            <div className="grid md:grid-cols-2 gap-5">

              <Field label="Vendor">
                <div className="relative">
                  <select
                    name="vendorId"
                    value={data.vendorId}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer pr-9`}
                    required
                  >
                    <option value="">Select vendor</option>
                    {vendors.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Product Name *">
                <input name="productName" placeholder="e.g. iPhone 15 Pro Max" onChange={handleChange} className={inputCls} required />
              </Field>

              <Field label="Brand">
                <input name="brand" placeholder="e.g. Apple" onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="SKU">
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="sku" placeholder="APL-IP15PM-256" onChange={handleChange} className={`${inputCls} pl-8`} />
                </div>
              </Field>

              <div className="md:col-span-2">
                <Field label="Description *">
                  <textarea
                    name="description"
                    placeholder="Describe the product for customers..."
                    onChange={handleChange}
                    className={`${inputCls} h-32 resize-none`}
                    required
                  />
                </Field>
              </div>

            </div>
          </div>

          {/* ── STEP 3: Pricing ──────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SectionHeader icon={DollarSign} color="text-green-500">
              Pricing & Inventory
            </SectionHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

              <Field label="MRP (₹) *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input name="price" type="number" placeholder="149999" onChange={handleChange} className={`${inputCls} pl-7`} required />
                </div>
              </Field>

              <Field label="Sale Price (₹)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input name="salePrice" type="number" placeholder="139999" onChange={handleChange} className={`${inputCls} pl-7`} />
                </div>
              </Field>

              <Field label="Discount %">
                <div className="relative">
                  <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="discount" type="number" placeholder="7" onChange={handleChange} className={`${inputCls} pr-7`} />
                </div>
              </Field>

              <Field label="Stock *">
                <div className="relative">
                  <BarChart2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="stock" type="number" placeholder="50" onChange={handleChange} className={`${inputCls} pl-8`} required />
                </div>
              </Field>

              <Field label="Min Qty">
                <input name="minQuantity" type="number" defaultValue={1} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Max Qty">
                <input name="maxQuantity" type="number" placeholder="5" onChange={handleChange} className={inputCls} />
              </Field>

            </div>
          </div>

          {/* ── STEP 4: Images ───────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SectionHeader icon={ImageIcon} color="text-purple-500">
              Product Images
            </SectionHeader>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Thumbnail */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Thumbnail Image *</p>
                <label className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
                  {preview ? (
                    <div className="relative w-full">
                      <img src={preview} className="h-44 w-full object-contain rounded-xl" alt="Thumbnail" />
                      <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-slate-300 mb-2" size={28} />
                      <p className="text-sm font-medium text-slate-500">Upload thumbnail</p>
                      <p className="text-xs text-slate-400 mt-1">Main display image</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleThumbnail} className="absolute inset-0 opacity-0 cursor-pointer" required />
                </label>
              </div>

              {/* Gallery */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Gallery Images</p>
                <label className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
                  {galleryPreviews.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {galleryPreviews.map((src, i) => (
                        <img key={i} src={src} className="h-20 w-full object-cover rounded-lg" alt={`gallery-${i}`} />
                      ))}
                      <div className="h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-slate-400 font-medium">Change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Layers className="mx-auto text-slate-300 mb-2" size={28} />
                      <p className="text-sm font-medium text-slate-500">Upload multiple</p>
                      <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select many</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleGallery} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
              </div>

            </div>
          </div>

          {/* ── Status + Actions ─────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SectionHeader icon={ShoppingBag} color="text-indigo-500">
              Listing Status
            </SectionHeader>
            <div className="flex items-center gap-4 flex-wrap">
              {["active", "inactive", "draft"].map(s => (
                <label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold capitalize ${data.status === s ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  <input type="radio" name="status" value={s} checked={data.status === s} onChange={handleChange} className="hidden" />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pb-6">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl shadow-lg text-white transition-all ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]"}`}
            >
              {!loading && <CheckCircle size={17} />}
              {loading ? "Publishing..." : "Publish Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProduct;