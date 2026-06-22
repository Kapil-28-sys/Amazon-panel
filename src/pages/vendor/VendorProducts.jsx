import { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import {
  AlertTriangle,
  BarChart3,
  Box,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  ImagePlus,
  IndianRupee,
  Loader2,
  PackagePlus,
  Search,
  Star,
  Tags,
  TrendingUp,
  X,
} from "lucide-react";
import MetricCard from "../../components/common/MetricCard";
import { apiUrl } from "../../config/api";
import { getCurrentSession } from "../../config/localAuth";
import { inr, performance, products, vendorName } from "../../data/marketplaceData";

// ─── Constants ────────────────────────────────────────────────────────────────

const productTabs = [
  { label: "Workspace",        path: "/vendor/products/workspace", key: "workspace" },
  { label: "Add product",      path: "/vendor/products/add",       key: "add"       },
  { label: "Manage product",   path: "/vendor/products/manage",    key: "manage"    },
  { label: "Manage pricing",   path: "/vendor/products/pricing",   key: "pricing"   },
  { label: "Analyse review",   path: "/vendor/products/reviews",   key: "reviews"   },
  { label: "Research product", path: "/vendor/products/research",  key: "research"  },
  { label: "Product report",   path: "/vendor/products/reports",   key: "reports"   },
];

const reviewInsights = [
  { label: "Sound quality",  score: 4.7, mentions: 286 },
  { label: "Charging speed", score: 4.4, mentions: 174 },
  { label: "Packaging",      score: 3.9, mentions: 92  },
];

const researchItems = [
  { keyword: "wireless earbuds",     demand: "High",   competition: "Medium", opportunity: "Launch bundle"   },
  { keyword: "fast charger type c",  demand: "High",   competition: "High",   opportunity: "Price match"     },
  { keyword: "phone accessories",    demand: "Medium", competition: "Low",    opportunity: "Add variations"  },
];

const INITIAL_FORM = {
  productName:        "",
  brand:              "",
  categoryId:         "",
  subCategoryId:      "",
  subToSubCategoryId: "",
  sku:                "",
  price:              "",
  salePrice:          "",
  discount:           "",
  minQuantity:        "1",
  maxQuantity:        "",
  stock:              "",
  description:        "",
  status:             "active",
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const Field = ({ label, placeholder, type = "text", value, name, onChange, required = false, span2 = false }) => (
  <label className={`text-sm font-medium text-gray-700 ${span2 ? "md:col-span-2" : ""}`}>
    {label}{required && <span className="ml-0.5 text-red-500">*</span>}
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="mt-1 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
    />
  </label>
);

const ProductHeader = ({ title, description, vendorId }) => (
  <section className="rounded bg-[#232f3e] p-5 text-white shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-[#ff9900]">Vendor products</p>
    <h1 className="mt-1 text-2xl font-bold">{title}</h1>
    <p className="mt-1 text-sm text-slate-300">{description}</p>
    <p className="mt-3 text-xs font-medium text-slate-400">{vendorName(vendorId)}</p>
  </section>
);

const ProductTabs = () => (
  <nav className="flex gap-2 overflow-x-auto rounded bg-white p-2 shadow-sm ring-1 ring-black/5">
    {productTabs.map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        className={({ isActive }) =>
          `min-w-fit rounded px-3 py-2 text-sm font-bold ${
            isActive ? "bg-[#ff9900] text-[#111827]" : "text-gray-600 hover:bg-[#f7fafa]"
          }`
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
);

const ProductTable = ({ vendorProducts }) => (
  <section className="rounded bg-white shadow-sm ring-1 ring-black/5">
    <div className="border-b border-gray-100 px-5 py-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Box size={19} className="text-[#c45500]" />
        Product catalog
      </h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#232f3e] text-white">
          <tr>
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Stock</th>
            <th className="px-5 py-3">Sold</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vendorProducts.map((product) => (
            <tr key={product.id} className="hover:bg-[#f7fafa]">
              <td className="px-5 py-4">
                <p className="font-bold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.asin} | {product.category}</p>
              </td>
              <td className="px-5 py-4 font-bold">{inr(product.price)}</td>
              <td className="px-5 py-4">{product.stock} units</td>
              <td className="px-5 py-4">{product.sold}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-[#fef6e7] px-3 py-1 text-xs font-bold text-[#c45500]">
                  {product.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

// ─── Add Product View (API-wired) ─────────────────────────────────────────────

function AddProductView({ vendorId }) {
  const [form, setForm]               = useState(INITIAL_FORM);
  const [thumbnailFile, setThumbnail] = useState(null);   // File object
  const [imageFiles, setImageFiles]   = useState([]);     // File[]
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(null);   // product from response

  const thumbRef   = useRef();
  const imagesRef  = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-calculate discount when price / salePrice change
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const price     = parseFloat(name === "price"     ? value : prev.price)     || 0;
      const salePrice = parseFloat(name === "salePrice" ? value : prev.salePrice) || 0;
      if (price > 0 && salePrice > 0 && salePrice < price) {
        next.discount = String(Math.round(((price - salePrice) / price) * 100));
      } else {
        next.discount = "";
      }
      return next;
    });
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbRef.current) thumbRef.current.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!thumbnailFile) {
      setError("Please upload a thumbnail image.");
      return;
    }

    setLoading(true);

    try {
      // Build FormData so images can be sent as files
      const data = new FormData();

      // Scalar fields
      data.append("vendorId",           vendorId);
      data.append("productName",        form.productName);
      data.append("brand",              form.brand);
      data.append("categoryId",         form.categoryId);
      data.append("subCategoryId",      form.subCategoryId);
      data.append("subToSubCategoryId", form.subToSubCategoryId);
      data.append("sku",                form.sku);
      data.append("price",              form.price);
      data.append("salePrice",          form.salePrice);
      data.append("discount",           form.discount);
      data.append("minQuantity",        form.minQuantity);
      data.append("maxQuantity",        form.maxQuantity);
      data.append("stock",              form.stock);
      data.append("description",        form.description);
      data.append("status",             form.status);

      // Files
      data.append("thumbnailImage", thumbnailFile);
      imageFiles.forEach((file) => data.append("images", file));

      const response = await axios.post(apiUrl("/api/products/add"), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = response.data;
      if (payload.success) {
        setSuccess(payload.product);
        setForm(INITIAL_FORM);
        setThumbnail(null);
        setImageFiles([]);
        if (thumbRef.current)  thumbRef.current.value  = "";
        if (imagesRef.current) imagesRef.current.value = "";
      } else {
        setError(payload.message || "Something went wrong.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProductHeader
        title="Add product"
        description="Create a new listing with product details, pricing, inventory, and compliance fields."
        vendorId={vendorId}
      />

      {/* Success banner */}
      {success && (
        <div className="flex items-start gap-3 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="font-bold">Product added successfully!</p>
            <p className="mt-0.5 text-xs text-green-700">
              ID: {success._id} &nbsp;·&nbsp; {success.productName}
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <PackagePlus size={20} className="text-[#c45500]" />
          <h2 className="font-bold">New listing form</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">

          {/* ── Basic info ── */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Basic info</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <Field required label="Product title" name="productName" value={form.productName} placeholder="iPhone 15 Pro Max" onChange={handleChange} />
              <Field required label="Brand"         name="brand"       value={form.brand}       placeholder="Apple"             onChange={handleChange} />
              <Field required label="SKU"           name="sku"         value={form.sku}         placeholder="APL-IP15PM-256"    onChange={handleChange} />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>
              <label className="text-sm font-medium text-gray-700 md:col-span-2">
                Description<span className="ml-0.5 text-red-500">*</span>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  placeholder="Key product features, warranty, and box contents"
                  onChange={handleChange}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                />
              </label>
            </div>
          </fieldset>

          {/* ── Categories ── */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Categories</legend>
            <div className="grid gap-4 md:grid-cols-3">
              <Field required label="Category ID"           name="categoryId"         value={form.categoryId}         placeholder="6844b2f5…1111" onChange={handleChange} />
              <Field         label="Sub-category ID"        name="subCategoryId"      value={form.subCategoryId}      placeholder="6844b2f5…2222" onChange={handleChange} />
              <Field         label="Sub-sub-category ID"    name="subToSubCategoryId" value={form.subToSubCategoryId} placeholder="6844b2f5…3333" onChange={handleChange} />
            </div>
          </fieldset>

          {/* ── Pricing ── */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Pricing</legend>
            <div className="grid gap-4 md:grid-cols-3">
              <Field required label="MRP price (₹)"   name="price"     value={form.price}     placeholder="149999" type="number" onChange={handlePriceChange} />
              <Field         label="Sale price (₹)"   name="salePrice" value={form.salePrice} placeholder="139999" type="number" onChange={handlePriceChange} />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Discount (%)
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    placeholder="Auto-calculated"
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded border border-gray-300 bg-[#f7fafa] px-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-400">Auto-fills from MRP vs sale price</p>
              </div>
            </div>
          </fieldset>

          {/* ── Inventory ── */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Inventory &amp; limits</legend>
            <div className="grid gap-4 md:grid-cols-3">
              <Field required label="Opening stock"   name="stock"       value={form.stock}       placeholder="50" type="number" onChange={handleChange} />
              <Field         label="Min qty per order" name="minQuantity" value={form.minQuantity} placeholder="1"  type="number" onChange={handleChange} />
              <Field         label="Max qty per order" name="maxQuantity" value={form.maxQuantity} placeholder="5"  type="number" onChange={handleChange} />
            </div>
          </fieldset>

          {/* ── Images ── */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Images</legend>
            <div className="grid gap-4 md:grid-cols-2">

              {/* Thumbnail */}
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  Thumbnail image<span className="ml-0.5 text-red-500">*</span>
                </p>
                {!thumbnailFile ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 p-6 text-sm text-gray-500 hover:border-[#ff9900] hover:text-[#c45500]">
                    <ImagePlus size={24} />
                    <span>Click to upload thumbnail</span>
                    <input
                      ref={thumbRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && setThumbnail(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded border border-gray-200 bg-[#f7fafa] p-3">
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="thumbnail"
                      className="h-14 w-14 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{thumbnailFile.name}</p>
                      <p className="text-xs text-gray-400">{(thumbnailFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={removeThumbnail} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Product images */}
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Product images (multiple)</p>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 p-6 text-sm text-gray-500 hover:border-[#ff9900] hover:text-[#c45500]">
                  <ImagePlus size={24} />
                  <span>Click to upload images</span>
                  <input
                    ref={imagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      setImageFiles((prev) => [...prev, ...Array.from(e.target.files)])
                    }
                  />
                </label>
                {imageFiles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {imageFiles.map((file, i) => (
                      <li key={i} className="flex items-center gap-2 rounded border border-gray-200 bg-[#f7fafa] px-3 py-2 text-sm">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                        <span className="min-w-0 flex-1 truncate text-gray-700">{file.name}</span>
                        <button type="button" onClick={() => removeImage(i)} className="text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Submit ── */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </p>
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded bg-[#ff9900] px-6 text-sm font-bold text-[#111827] hover:bg-[#f3a847] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Saving…" : "Save product"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

// ─── Other views (unchanged) ──────────────────────────────────────────────────

function WorkspaceView({ vendorProducts, vendorId }) {
  const lowStock  = vendorProducts.filter((p) => p.stock < 15).length;
  const suppressed = vendorProducts.filter((p) => p.status === "Suppressed").length;
  const revenue   = vendorProducts.reduce((sum, p) => sum + p.price * p.sold, 0);
  return (
    <>
      <ProductHeader title="Product workspace" description="Daily control center for catalog health, stock action, listing issues, and launch work." vendorId={vendorId} />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Listings"      value={vendorProducts.length} helper="active catalog items"      icon={Box}           tone="orange" />
        <MetricCard label="Low stock"     value={lowStock}              helper="need replenishment"        icon={AlertTriangle} tone="red"    />
        <MetricCard label="Suppressed"    value={suppressed}            helper="listing quality issues"    icon={ClipboardCheck} tone="purple" />
        <MetricCard label="Catalog sales" value={inr(revenue)}          helper="sample lifetime sales"     icon={IndianRupee}   tone="green"  />
      </section>
      <ProductTable vendorProducts={vendorProducts} />
    </>
  );
}

function ManageProductView({ vendorProducts, vendorId }) {
  return (
    <>
      <ProductHeader title="Manage product" description="Review listings, catalog status, inventory availability, and product level actions." vendorId={vendorId} />
      <ProductTable vendorProducts={vendorProducts} />
    </>
  );
}

function ManagePricingView({ vendorProducts, vendorId }) {
  return (
    <>
      <ProductHeader title="Manage pricing" description="Adjust product prices, track buy box competitiveness, and monitor marketplace fee impact." vendorId={vendorId} />
      <section className="rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold"><Tags size={19} className="text-[#c45500]" /> Pricing desk</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {vendorProducts.map((product) => (
            <div key={product.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_140px_140px_140px] md:items-center">
              <div>
                <p className="font-bold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.status}</p>
              </div>
              <p className="font-bold">{inr(product.price)}</p>
              <input type="number" defaultValue={product.price} className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#ff9900]" />
              <button className="rounded bg-[#232f3e] px-3 py-2 text-sm font-bold text-white">Update</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function AnalyseReviewView({ vendorId }) {
  return (
    <>
      <ProductHeader title="Analyse review" description="Understand customer sentiment, review themes, rating movement, and improvement actions." vendorId={vendorId} />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Average rating"   value="4.5" helper="last 90 days"           icon={Star}          tone="orange" />
        <MetricCard label="Positive reviews" value="86%" helper="from verified orders"   icon={TrendingUp}    tone="green"  />
        <MetricCard label="Action themes"    value="3"   helper="quality topics found"   icon={AlertTriangle} tone="red"    />
      </section>
      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="font-bold">Review themes</h2>
        <div className="mt-4 space-y-3">
          {reviewInsights.map((item) => (
            <div key={item.label} className="rounded border border-gray-200 bg-[#f7fafa] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-bold text-gray-900">{item.label}</p>
                <p className="text-sm font-bold text-[#c45500]">{item.score}/5</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.mentions} customer mentions</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ResearchProductView({ vendorId }) {
  return (
    <>
      <ProductHeader title="Research product" description="Find product opportunities using keyword demand, competition, and launch recommendations." vendorId={vendorId} />
      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search keyword, ASIN, category" className="h-10 w-full rounded border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#ff9900]" />
          </div>
          <button className="rounded bg-[#ff9900] px-5 py-2 text-sm font-bold text-[#111827]">Research</button>
        </div>
        <div className="mt-5 grid gap-3">
          {researchItems.map((item) => (
            <div key={item.keyword} className="grid gap-3 rounded border border-gray-200 p-4 md:grid-cols-[1fr_110px_130px_160px]">
              <p className="font-bold text-gray-900">{item.keyword}</p>
              <p>{item.demand}</p>
              <p>{item.competition}</p>
              <p className="font-medium text-[#007185]">{item.opportunity}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductReportView({ vendorProducts, vendorId }) {
  const vendorPerformance = performance.find((item) => item.vendorId === vendorId);
  const totalSales = vendorProducts.reduce((sum, p) => sum + p.sold, 0);
  return (
    <>
      <ProductHeader title="Product report" description="Download-ready product performance view covering sales, stock, growth, and account health." vendorId={vendorId} />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Units sold" value={totalSales}                              helper="sample product data" icon={BarChart3}    tone="blue"   />
        <MetricCard label="Growth"     value={vendorPerformance?.growth || "New"}      helper="vendor trend"        icon={TrendingUp}   tone="green"  />
        <MetricCard label="Health"     value={`${vendorPerformance?.health || 0}%`}    helper="account health"      icon={ClipboardCheck} tone="purple" />
        <MetricCard label="Products"   value={vendorProducts.length}                   helper="report rows"         icon={FileBarChart} tone="orange" />
      </section>
      <ProductTable vendorProducts={vendorProducts} />
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function VendorProducts() {
  const location      = useLocation();
  const session       = getCurrentSession();
  const vendorProducts = products.filter((p) => p.vendorId === session.vendorId);
  const activeTab     =
    productTabs.find((tab) => location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`))?.key ||
    "workspace";

  const views = {
    workspace: <WorkspaceView   vendorProducts={vendorProducts} vendorId={session.vendorId} />,
    add:       <AddProductView                                  vendorId={session.vendorId} />,
    manage:    <ManageProductView vendorProducts={vendorProducts} vendorId={session.vendorId} />,
    pricing:   <ManagePricingView vendorProducts={vendorProducts} vendorId={session.vendorId} />,
    reviews:   <AnalyseReviewView                               vendorId={session.vendorId} />,
    research:  <ResearchProductView                             vendorId={session.vendorId} />,
    reports:   <ProductReportView vendorProducts={vendorProducts} vendorId={session.vendorId} />,
  };

  return (
    <div className="space-y-5">
      <ProductTabs />
      {views[activeTab]}
    </div>
  );
}