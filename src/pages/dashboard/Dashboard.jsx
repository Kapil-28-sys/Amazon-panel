import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Box,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  inr,
  orders,
  performance,
  products,
  summaryFor,
  vendorName,
  vendors,
} from "../../data/marketplaceData";
import MetricCard from "../../components/common/MetricCard";

export default function Dashboard() {
  const [vendorId, setVendorId] = useState("all");
  const summary = summaryFor(vendorId);
  const scopedPerformance = useMemo(
    () => (vendorId === "all" ? performance : performance.filter((item) => item.vendorId === vendorId)),
    [vendorId]
  );
  const scopedOrders = vendorId === "all" ? orders : orders.filter((order) => order.vendorId === vendorId);
  const scopedProducts = vendorId === "all" ? products : products.filter((product) => product.vendorId === vendorId);

  const metrics = [
    { label: "Revenue", value: inr(summary.revenue), icon: CircleDollarSign, tone: "green", helper: "settled marketplace revenue" },
    { label: "Orders", value: summary.orders.toLocaleString("en-IN"), icon: ClipboardList, tone: "blue", helper: "last 30 days" },
    { label: "Products", value: summary.products, icon: Box, tone: "purple", helper: `${summary.lowStock} need stock action` },
    { label: "Vendors", value: vendorId === "all" ? vendors.length : 1, icon: Building2, tone: "orange", helper: "active seller panels" },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded bg-[#232f3e] p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff9900]">
              {vendorId === "all" ? "Superadmin performance center" : "Vendor performance panel"}
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              {vendorId === "all" ? "Marketplace command dashboard" : vendorName(vendorId)}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Track vendor revenue, catalog quality, order health, returns, and growth in one Amazon-style operations view.
            </p>
          </div>

          <select
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
            className="w-full rounded border border-white/20 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none lg:w-72"
          >
            <option value="all">Superadmin: All vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                Vendor: {vendor.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded bg-white shadow-sm ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <BarChart3 size={19} className="text-[#c45500]" />
              Vendor performance
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {scopedPerformance.map((item) => (
              <div key={item.vendorId} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_170px_140px_110px] md:items-center">
                <div>
                  <p className="font-bold text-gray-900">{vendorName(item.vendorId)}</p>
                  <p className="text-xs text-gray-500">{item.orders.toLocaleString("en-IN")} orders · {item.conversion} conversion</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-bold">{inr(item.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account health</p>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-[#ff9900]" style={{ width: `${item.health}%` }} />
                  </div>
                </div>
                <p className={`font-bold ${item.growth.startsWith("-") ? "text-red-600" : "text-emerald-700"}`}>
                  {item.growth}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 font-bold text-gray-900">
            <AlertTriangle size={19} className="text-[#c45500]" />
            Operational alerts
          </h2>
          <div className="mt-4 space-y-3">
            {scopedProducts
              .filter((product) => product.stock < 15 || product.status === "Suppressed")
              .map((product) => (
                <div key={product.id} className="rounded border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-bold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">
                    {vendorName(product.vendorId)} · {product.status} · {product.stock} units
                  </p>
                </div>
              ))}
            {scopedOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="rounded border border-gray-200 p-3">
                <p className="text-sm font-bold text-gray-900">{order.id}</p>
                <p className="text-xs text-gray-600">
                  {order.status} · {vendorName(order.vendorId)} · {inr(order.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{vendor.name}</p>
                <p className="text-xs text-gray-500">{vendor.category}</p>
              </div>
              <span className="flex items-center gap-1 rounded bg-[#fef6e7] px-2 py-1 text-xs font-bold text-[#c45500]">
                <Star size={13} fill="currentColor" />
                {vendor.rating}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">Fulfillment SLA</span>
              <span className="font-bold text-gray-900">{vendor.sla}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Growth</span>
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <TrendingUp size={15} />
                {performance.find((item) => item.vendorId === vendor.id)?.growth || "New"}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
