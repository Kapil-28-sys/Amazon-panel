import { ClipboardList, RotateCcw } from "lucide-react";
import { getCurrentSession } from "../../config/localAuth";
import { inr, orders } from "../../data/marketplaceData";

export default function VendorOrders() {
  const session = getCurrentSession();
  const vendorOrders = orders.filter((order) => order.vendorId === session.vendorId);

  return (
    <div className="space-y-5">
      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Vendor orders</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600">Track new orders, shipped orders, returns, and cancellations.</p>
      </section>

      <section className="rounded bg-white shadow-sm ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList size={19} className="text-[#c45500]" />
            Order list
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {vendorOrders.map((order) => (
            <div key={order.id} className="grid gap-3 px-5 py-4 md:grid-cols-[120px_1fr_120px_120px] md:items-center">
              <p className="font-bold">{order.id}</p>
              <div>
                <p className="font-medium text-gray-900">{order.customer}</p>
                <p className="text-xs text-gray-500">{order.date} · {order.channel}</p>
              </div>
              <p>{order.status}</p>
              <p className="font-bold">{inr(order.total)}</p>
            </div>
          ))}
        </div>
      </section>

      <details className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5" open>
        <summary className="flex cursor-pointer items-center gap-2 font-bold">
          <RotateCcw size={18} className="text-[#c45500]" />
          Order dropdown options
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Workspace", "Manage order", "Manage return", "Resolve claims", "Order reports"].map((item) => (
            <button key={item} className="rounded border border-gray-200 bg-[#f7fafa] px-3 py-2 text-left text-sm font-medium">
              {item}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
