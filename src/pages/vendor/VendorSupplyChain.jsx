import { MapPin, PackageCheck, Truck } from "lucide-react";

const shipments = [
  { id: "SHP-4401", status: "In transit", carrier: "Amazon Transportation", eta: "14 Jun 2026" },
  { id: "SHP-4396", status: "Warehouse received", carrier: "FBA Bengaluru", eta: "Completed" },
  { id: "SHP-4388", status: "Pickup scheduled", carrier: "Easy Ship", eta: "13 Jun 2026" },
];

export default function VendorSupplyChain() {
  return (
    <div className="space-y-5">
      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#c45500]">Vendor supply chain</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Supply Chain</h1>
        <p className="text-sm text-gray-600">Manage shipments, warehouse inventory, pickup plans, and SLA health.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Inbound shipments", "12", Truck],
          ["Warehouse units", "1,486", PackageCheck],
          ["Pickup cities", "4", MapPin],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
            <Icon className="text-[#c45500]" size={22} />
            <p className="mt-3 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="font-bold">Shipment tracker</h2>
        <div className="mt-4 divide-y divide-gray-100">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="grid gap-3 py-3 md:grid-cols-[120px_1fr_160px]">
              <p className="font-bold">{shipment.id}</p>
              <p>{shipment.status} · {shipment.carrier}</p>
              <p className="text-sm text-gray-500">{shipment.eta}</p>
            </div>
          ))}
        </div>
      </section>

      <details className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5" open>
        <summary className="cursor-pointer font-bold">Supply chain dropdown options</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Shipments", "Warehouse stock", "Pickup slots", "SLA breaches", "FBA transfers", "Packaging issues"].map((item) => (
            <button key={item} className="rounded border border-gray-200 bg-[#f7fafa] px-3 py-2 text-left text-sm font-medium">
              {item}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
