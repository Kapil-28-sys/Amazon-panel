import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Box,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  PackageSearch,
  Settings,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { getCurrentSession } from "../../config/localAuth";

const navItems = [
  { name: "Performance", path: "/admin", icon: LayoutDashboard, end: true, roles: ["Super Admin", "Assistant Super Admin", "Vendor"] },
  { name: "Vendors", path: "/admin/vendors", icon: Building2, roles: ["Super Admin"] },
  { name: "Products", path: "/admin/products", icon: Package, roles: ["Super Admin", "Assistant Super Admin", "Vendor"] },
  { name: "Orders", path: "/admin/orders", icon: ClipboardList, roles: ["Super Admin", "Assistant Super Admin", "Vendor"] },
  { name: "Customers", path: "/admin/users", icon: Users, roles: ["Super Admin", "Assistant Super Admin"] },
  {
    name: "Categories",
    icon: Box,
    items: [
      { name: "Category", path: "/admin/categories" },
      { name: "Sub Category", path: "/admin/subcategory" },
      { name: "Sub to Sub Category", path: "/admin/subtosubcategory" },
      // ✅ FIX 1: Changed label from "categoryattribute" to "Category Attribute"
      // BUG: The label was all lowercase with no spaces — looked broken in the sidebar UI
      { name: "Category Attribute", path: "/admin/categoryattribute" },
    ],
    roles: ["Super Admin", "Assistant Super Admin"],
  },
  { name: "Settings", path: "/admin/settings", icon: Settings, roles: ["Super Admin"] },
];

const vendorNavSections = [
  {
    name: "Product",
    icon: PackageSearch,
    items: [
      { name: "Workspace", path: "/vendor/products/workspace" },
      { name: "Add product", path: "/vendor/products/add" },
      { name: "Manage product", path: "/vendor/products/manage" },
      { name: "Manage pricing", path: "/vendor/products/pricing" },
      { name: "Analyse review", path: "/vendor/products/reviews" },
      { name: "Research product", path: "/vendor/products/research" },
      { name: "Product report", path: "/vendor/products/reports" },
    ],
  },
  {
    name: "Order",
    icon: ClipboardList,
    items: [
      { name: "Workspace", path: "/vendor/orders/workspace" },
      { name: "Manage order", path: "/vendor/orders/manage" },
      { name: "Manage return", path: "/vendor/orders/returns" },
      { name: "Resolve claims", path: "/vendor/orders/claims" },
      { name: "Order reports", path: "/vendor/orders/reports" },
    ],
  },
  {
    name: "Supply Chain",
    icon: Truck,
    items: [
      { name: "Overview", path: "/vendor/supply-chain" },
      { name: "Shipments", path: "/vendor/supply-chain/shipments" },
    ],
  },
  {
    name: "Finance",
    icon: CreditCard,
    items: [
      { name: "Overview", path: "/vendor/finance" },
      { name: "Payouts", path: "/vendor/finance/payouts" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const session = getCurrentSession();
  const isVendor = session.role === "Vendor";
  const visibleNavItems = navItems.filter((item) => item.roles.includes(session.role));

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(vendorNavSections.map((section) => [section.name, true]))
  );

  // ✅ FIX 2: openCategories was always starting as false and had no logic to
  // auto-open when you navigate directly to a categories route via URL.
  // Now it initializes based on whether the current URL matches a categories sub-path.
  const [openCategories, setOpenCategories] = useState(() => {
    const catItem = navItems.find((i) => i.items);
    if (!catItem) return false;
    return catItem.items.some(
      (sub) =>
        location.pathname === sub.path ||
        location.pathname.startsWith(sub.path + "/")
    );
  });

  // ✅ FIX 3: Auto-open the accordion when navigating to a categories sub-route
  // BUG: Without this, refreshing the page or deep-linking to /admin/categoryattribute
  // would leave the accordion closed even though you're on that page.
  useEffect(() => {
    const catItem = navItems.find((i) => i.items);
    if (!catItem) return;
    const isActive = catItem.items.some(
      (sub) =>
        location.pathname === sub.path ||
        location.pathname.startsWith(sub.path + "/")
    );
    if (isActive) setOpenCategories(true);
  }, [location.pathname]);

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
        <p className="mt-1 text-sm font-semibold">{session.name}</p>
        <p className="text-xs text-slate-400">{session.role}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <BarChart3 size={14} />
          Marketplace health 91%
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
        {isVendor
          ? vendorNavSections.map((section) => {
              const Icon = section.icon;
              const isOpen = openSections[section.name];
              const isActiveSection = section.items.some((item) =>
                location.pathname.startsWith(item.path)
              );

              return (
                <div key={section.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((current) => ({
                        ...current,
                        [section.name]: !current[section.name],
                      }))
                    }
                    className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                      isActiveSection
                        ? "bg-[#37475a] text-white"
                        : "text-slate-200 hover:bg-[#37475a] hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{section.name}</span>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {isOpen && (
                    <div className="space-y-1 pl-8">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `block rounded px-3 py-2 text-sm transition ${
                              isActive
                                ? "bg-[#ff9900] font-bold text-[#111827]"
                                : "text-slate-300 hover:bg-[#37475a] hover:text-white"
                            }`
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          : visibleNavItems.map((item) => {
              const Icon = item.icon;

              // ── Categories accordion ──────────────────────────────
              if (item.items) {
                // ✅ FIX 4: THE MAIN BUG — startsWith("/admin/categories") was
                // ALSO matching "/admin/categoryattribute" because the string
                // "/admin/categoryattribute" literally starts with "/admin/categor".
                //
                // This caused isActiveSection to be TRUE when you were on the
                // categoryattribute page, which made React think the accordion
                // was in a weird active state and broke the click toggle behavior.
                //
                // The fix: always append "/" when checking startsWith so that
                // "/admin/categories/" does NOT match "/admin/categoryattribute".
                const isActiveSection = item.items.some(
                  (sub) =>
                    location.pathname === sub.path ||
                    location.pathname.startsWith(sub.path + "/")
                );

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setOpenCategories((p) => !p)}
                      className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                        isActiveSection
                          ? "bg-[#37475a] text-white"
                          : "text-slate-200 hover:bg-[#37475a] hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-left">{item.name}</span>
                      {openCategories ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {openCategories && (
                      <div className="space-y-1 pl-8">
                        {item.items.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            // ✅ FIX 5: NavLink's isActive prop also uses startsWith internally.
                            // For paths like /admin/categories, it would wrongly highlight
                            // the "Category" link when on /admin/categoryattribute.
                            // Using end={true} forces an exact match for the parent path.
                            end
                            className={({ isActive }) =>
                              `block rounded px-3 py-2 text-sm transition ${
                                isActive
                                  ? "bg-[#ff9900] font-bold text-[#111827]"
                                  : "text-slate-300 hover:bg-[#37475a] hover:text-white"
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Normal nav links ──────────────────────────────────
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