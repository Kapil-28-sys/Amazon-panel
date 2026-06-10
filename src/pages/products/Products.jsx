import { useMemo, useState } from "react";
import { AlertTriangle, Eye, PackageCheck, PackagePlus, Search, SlidersHorizontal, X } from "lucide-react";
import { inr, products as seedProducts, vendorName, vendors } from "../../data/marketplaceData";
import DataPager from "../../components/common/DataPager";
import MetricCard from "../../components/common/MetricCard";

const stockClass = (product) => {
  if (product.status === "Suppressed") return "bg-red-50 text-red-700 ring-red-200";
  if (product.stock < 15) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
};

export default function Products() {
  const [catalog, setCatalog] = useState(seedProducts);
  const [vendorId, setVendorId] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendorId: vendors[0]?.id || "",
    name: "",
    asin: "",
    category: "",
    price: "",
    stock: "",
  });

  const visibleProducts = useMemo(
    () =>
      catalog.filter((product) => {
        const matchesVendor = vendorId === "all" || product.vendorId === vendorId;
        const matchesQuery = `${product.name} ${product.asin} ${product.category} ${vendorName(product.vendorId)}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesVendor && matchesQuery;
      }),
    [catalog, query, vendorId]
  );

  const pagedProducts = visibleProducts.slice((page - 1) * pageSize, page * pageSize);

  const updatePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const addListing = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.vendorId) return;

    const stock = Number(form.stock || 0);
    setCatalog((current) => [
      {
        id: `PRD-${Date.now().toString().slice(-4)}`,
        vendorId: form.vendorId,
        name: form.name,
        asin: form.asin || `B0NEW${Date.now().toString().slice(-4)}`,
        category: form.category || "General",
        price: Number(form.price || 0),
        stock,
        sold: 0,
        status: stock === 0 ? "Suppressed" : stock < 15 ? "Low Stock" : "In Stock",
        image: "https://images.unsplash.com/photo-1589917791524-05d1fbf684d8?auto=format&fit=crop&w=160&q=80",
      },
      ...current,
    ]);
    setShowForm(false);
    setForm({
      vendorId: vendors[0]?.id || "",
      name: "",
      asin: "",
      category: "",
      price: "",
      stock: "",
    });
  };

  return (
    <div className="space-y-5">
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
              onChange={(event) => {
                setVendorId(event.target.value);
                setPage(1);
              }}
              className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
            >
              <option value="all">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search catalog"
                className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30 sm:w-80"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827]"
            >
              <PackagePlus size={17} />
              Add listing
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible listings" value={visibleProducts.length} helper="catalog records in view" icon={Eye} tone="blue" />
        <MetricCard label="Low stock" value={visibleProducts.filter((product) => product.stock < 15).length} helper="needs replenishment" icon={AlertTriangle} tone="orange" />
        <MetricCard label="Suppressed" value={visibleProducts.filter((product) => product.status === "Suppressed").length} helper="requires catalog action" icon={PackageCheck} tone="red" />
      </div>

      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Marketplace catalog</h2>
          <button className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium">
            <SlidersHorizontal size={16} />
            Filters
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
              {pagedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#f7fafa]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-12 w-12 rounded object-cover ring-1 ring-gray-200" />
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.asin} · {product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">{vendorName(product.vendorId)}</td>
                  <td className="px-5 py-4 font-bold">{inr(product.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stockClass(product)}`}>
                      {product.stock < 15 && <AlertTriangle size={13} />}
                      {product.status} · {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">{product.sold.toLocaleString("en-IN")} units</td>
                </tr>
              ))}
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Add marketplace listing</h2>
                <p className="text-xs text-slate-300">Create a vendor-owned catalog item.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addListing} className="grid gap-4 p-5 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Vendor
                <select
                  value={form.vendorId}
                  onChange={(event) => setForm({ ...form, vendorId: event.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </label>

              {[
                ["name", "Product name"],
                ["asin", "ASIN / SKU"],
                ["category", "Category"],
                ["price", "Price"],
                ["stock", "Opening stock"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-gray-700">
                  {label}
                  <input
                    value={form[key]}
                    type={key === "price" || key === "stock" ? "number" : "text"}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                  />
                </label>
              ))}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827]">
                  Save listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
