import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogIn, LogOut, Menu, Search, ShieldCheck } from "lucide-react";
import { vendors } from "../../data/marketplaceData";
import { clearSession, getCurrentSession } from "../../config/localAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const [session, setSession] = useState(getCurrentSession);

  const logout = () => {
    clearSession();
    setSession({
      loggedIn: false,
      role: "Guest",
      name: "Not signed in",
    });
    navigate("/login");
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
            onClick={() => navigate("/login")}
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
    </header>
  );
}
