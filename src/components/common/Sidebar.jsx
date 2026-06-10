import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Box,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Users,
} from "lucide-react";

const navItems = [
  { name: "Performance", path: "/admin", icon: LayoutDashboard, end: true },
  { name: "Vendors", path: "/admin/vendors", icon: Building2 },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ClipboardList },
  { name: "Customers", path: "/admin/users", icon: Users },
  { name: "Categories", path: "/admin/categories", icon: Box },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-[#ff9900] text-[#111827]"
        : "text-slate-200 hover:bg-[#37475a] hover:text-white"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-72 shrink-0 flex-col overflow-hidden bg-[#131921] text-white md:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#ff9900] text-[#111827]">
            <Store size={23} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Amazon Seller Hub</h1>
            <p className="text-xs text-slate-400">Multi-vendor control panel</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#232f3e] px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
        <p className="mt-1 text-sm font-semibold">Super Admin</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <BarChart3 size={14} />
          Marketplace health 91%
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.end} className={linkClass}>
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
