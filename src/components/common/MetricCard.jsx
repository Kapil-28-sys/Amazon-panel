export default function MetricCard({ label, value, helper, icon: Icon, tone = "orange" }) {
  const tones = {
    orange: "bg-[#fff7ed] text-[#c45500] ring-orange-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    purple: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <div className="group relative overflow-hidden rounded bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#ff9900]/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded p-3 ring-1 ${tones[tone] || tones.orange}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {helper && <p className="relative mt-3 text-xs font-medium text-gray-500">{helper}</p>}
    </div>
  );
}
