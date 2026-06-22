import { CircleDollarSign, CreditCard, ReceiptText } from "lucide-react";
import { getCurrentSession } from "../../config/localAuth";
import { inr, performance } from "../../data/marketplaceData";

export default function VendorFinance() {
  const session = getCurrentSession();
  const vendorPerformance = performance.find((item) => item.vendorId === session.vendorId);
  const revenue = vendorPerformance?.revenue || 0;

  return (
    <div className="space-y-5">
      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Vendor finance</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-600">Review payouts, commissions, invoices, deductions, and settlement status.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Gross revenue", inr(revenue), CircleDollarSign],
          ["Next payout", inr(Math.round(revenue * 0.18)), CreditCard],
          ["Marketplace fees", inr(Math.round(revenue * 0.07)), ReceiptText],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
            <Icon className="text-[#c45500]" size={22} />
            <p className="mt-3 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </section>

      <details className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5" open>
        <summary className="cursor-pointer font-bold">Finance dropdown options</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Payouts", "Invoices", "Commission", "Refund charges", "Tax reports", "Settlement history"].map((item) => (
            <button key={item} className="rounded border border-gray-200 bg-[#f7fafa] px-3 py-2 text-left text-sm font-medium">
              {item}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
