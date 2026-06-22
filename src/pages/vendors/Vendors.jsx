import { useMemo, useState } from "react";
import { CheckCircle2, Package, Plus, Search, Store, TrendingUp, Users, X } from "lucide-react";
import { inr, performance, products, vendors as seedVendors } from "../../data/marketplaceData";
import DataPager from "../../components/common/DataPager";
import MetricCard from "../../components/common/MetricCard";

export default function Vendors() {
  const [vendors, setVendors] = useState(seedVendors);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    email: "",
    category: "General Merchandise",
    city: "",
  });

  const visibleVendors = useMemo(
    () =>
      vendors.filter((vendor) =>
        `${vendor.name} ${vendor.owner} ${vendor.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, vendors]
  );

  const pagedVendors = visibleVendors.slice((page - 1) * pageSize, page * pageSize);
  const updatePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const createVendor = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.owner.trim()) return;

    setVendors((current) => [
      {
        id: `vdr-${Date.now()}`,
        ...form,
        status: "Review",
        fulfillment: "Easy Ship",
        rating: 0,
        joined: "Today",
        sla: "Pending",
      },
      ...current,
    ]);
    setForm({
      name: "",
      owner: "",
      email: "",
      category: "",
      city: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">
              Superadmin workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Vendor management</h1>
            <p className="text-sm text-gray-600">
              Create sellers, review onboarding, and monitor catalog performance.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search vendors"
                className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847]"
            >
              <Plus size={17} />
              Add vendor
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total vendors" value={visibleVendors.length} helper="seller panels in view" icon={Store} tone="orange" />
        <MetricCard label="Active sellers" value={visibleVendors.filter((vendor) => vendor.status === "Active").length} helper="approved for selling" icon={CheckCircle2} tone="green" />
        <MetricCard label="Vendor products" value={products.length} helper="catalog listings owned" icon={Package} tone="purple" />
      </div>

      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Vendor panels</h2>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Plus size={16} />
            Add vendor
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232f3e] text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Vendor</th>
                <th className="px-5 py-3 font-semibold">Performance</th>
                <th className="px-5 py-3 font-semibold">Catalog</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedVendors.map((vendor) => {
                const perf = performance.find((item) => item.vendorId === vendor.id);
                const catalogCount = products.filter((item) => item.vendorId === vendor.id).length;

                return (
                  <tr key={vendor.id} className="hover:bg-[#f7fafa]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-500">{vendor.owner} · {vendor.city}</p>
                      <p className="text-xs text-gray-500">{vendor.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <TrendingUp size={15} className="text-emerald-600" />
                          {perf ? inr(perf.revenue) : "Pending"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <Users size={15} className="text-sky-600" />
                          {perf?.orders || 0} orders
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{catalogCount} products</p>
                      <p className="text-xs text-gray-500">{vendor.fulfillment}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 size={14} />
                        {vendor.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <DataPager
            total={visibleVendors.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={updatePageSize}
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Add vendor</h2>
                <p className="text-xs text-slate-300">New vendors start in review.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createVendor} className="grid gap-4 p-5 md:grid-cols-2">
              {[
                ["name", "Store name"],
                ["owner", "Owner name"],
                ["email", "Business email"],
                ["category", "Primary category"],
                ["city", "City"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-gray-700">
                  {label}
                  <input
                    value={form[key]}
                    type={key === "email" ? "email" : "text"}
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
                <button className="inline-flex items-center gap-2 rounded bg-[#ff9900] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847]">
                  <Store size={17} />
                  Create vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
