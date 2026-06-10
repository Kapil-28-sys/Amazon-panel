import { useState } from "react";
import { Bell, ChevronDown, LogIn, LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import { vendors } from "../../data/marketplaceData";

export default function Navbar() {
  const [session, setSession] = useState({
    loggedIn: true,
    role: "Superadmin",
    name: "Super Admin",
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("Superadmin");

  const login = (event) => {
    event.preventDefault();
    setSession({
      loggedIn: true,
      role: loginRole,
      name: loginRole === "Vendor" ? "Vendor Admin" : "Super Admin",
    });
    setShowLogin(false);
  };

  const logout = () => {
    setSession({
      loggedIn: false,
      role: "Guest",
      name: "Not signed in",
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#131921] bg-[#131921] text-white">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <button className="rounded p-2 hover:bg-white/10 md:hidden">
          <Menu size={22} />
        </button>

        <div className="min-w-fit">
          <p className="text-xs text-slate-300">Marketplace</p>
          <p className="text-sm font-bold">Amazon-style Admin</p>
        </div>

        <div className="flex min-w-0 flex-1 overflow-hidden rounded border-2 border-[#ff9900] bg-white">
          <select className="hidden bg-[#f3f3f3] px-3 text-sm text-gray-800 outline-none sm:block">
            <option>All vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id}>{vendor.name}</option>
            ))}
          </select>
          <input
            className="min-w-0 flex-1 px-4 py-2 text-sm text-gray-900 outline-none"
            placeholder="Search products, orders, vendors, customers"
          />
          <button className="flex w-12 items-center justify-center bg-[#ff9900] text-[#111827]">
            <Search size={20} />
          </button>
        </div>

        <div className="hidden items-center gap-2 rounded border border-white/15 px-3 py-2 text-sm lg:flex">
          <ShieldCheck size={17} className="text-[#ff9900]" />
          <span>{session.role}</span>
          <ChevronDown size={14} />
        </div>

        {session.loggedIn ? (
          <button
            onClick={logout}
            className="hidden items-center gap-2 rounded border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10 sm:inline-flex"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="hidden items-center gap-2 rounded bg-[#ff9900] px-3 py-2 text-sm font-bold text-[#111827] hover:bg-[#f3a847] sm:inline-flex"
          >
            <LogIn size={16} />
            Login
          </button>
        )}

        <button className="relative rounded p-2 hover:bg-white/10">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff9900]" />
        </button>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-gray-900 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#232f3e] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Sign in</h2>
                <p className="text-xs text-slate-300">Choose admin or vendor panel access.</p>
              </div>
              <button onClick={() => setShowLogin(false)} className="rounded p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={login} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-2 rounded bg-gray-100 p-1">
                {["Superadmin", "Vendor"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setLoginRole(role)}
                    className={`rounded px-3 py-2 text-sm font-bold ${
                      loginRole === role ? "bg-[#ff9900] text-[#111827]" : "text-gray-600"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  placeholder={loginRole === "Vendor" ? "vendor@example.com" : "admin@example.com"}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Password
                <input
                  type="password"
                  placeholder="Password"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/30"
                />
              </label>

              <button className="w-full rounded bg-[#ff9900] px-4 py-2.5 text-sm font-bold text-[#111827] hover:bg-[#f3a847]">
                Login as {loginRole}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
