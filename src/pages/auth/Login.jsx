import { useState } from "react";
import axios from "axios";
import { AlertCircle, ChevronRight, Lock, Mail, Loader2, ShieldCheck, Store } from "lucide-react";
import { apiUrl } from "../../config/api";
import { getDefaultPath, saveSession, userForRole } from "../../config/localAuth";

// ─── Static Super Admin Credentials ───────────────────────────────────────────
const SUPER_ADMIN = {
  email: "superadmin@marketplace.com",
  password: "Admin@1234",
};

const TABS = [
  { key: "superadmin", label: "Super Admin", icon: ShieldCheck },
  { key: "vendor", label: "Vendor", icon: Store },
];

export default function Login() {
  const [activeTab, setActiveTab] = useState("superadmin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const completeLogin = (user, token) => {
    saveSession(user, token);
    setTimeout(() => {
      window.location.href = getDefaultPath(user);
    }, 500);
  };

  // ── Super Admin static login ──────────────────────────────────────────────
  const handleSuperAdminLogin = (e) => {
    e.preventDefault();
    setError("");

    if (
      form.email.trim().toLowerCase() !== SUPER_ADMIN.email ||
      form.password !== SUPER_ADMIN.password
    ) {
      setError("Invalid super admin credentials.");
      return;
    }

    setLoading(true);
    const sessionUser = userForRole("superadmin", {
      email: SUPER_ADMIN.email,
      name: "Super Admin",
    });

    // No real token for static login — pass a placeholder so saveSession works
    completeLogin(sessionUser, "static-superadmin-token");
    setLoading(false);
  };

  // ── Vendor API login ──────────────────────────────────────────────────────
  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(apiUrl("/api/users/login"), form);
      const payload = response.data || {};
      const apiUser = payload.user || payload.data?.user || payload.data || payload;
      const token =
        payload.token ||
        payload.accessToken ||
        payload.data?.token ||
        payload.data?.accessToken;

      if (!token) {
        throw new Error("Login successful, but token was not returned.");
      }

      const sessionUser = userForRole(
        apiUser.role || apiUser.userType || apiUser.type,
        {
          email: apiUser.email || form.email,
          name: apiUser.name || apiUser.fullName || apiUser.username,
          vendorId: apiUser.vendorId || apiUser.vendor?._id || apiUser.vendor?.id,
        }
      );

      completeLogin(sessionUser, token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = activeTab === "superadmin" ? handleSuperAdminLogin : handleVendorLogin;

  const switchTab = (key) => {
    setActiveTab(key);
    setForm({ email: "", password: "" });
    setError("");
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Header */}
      <header className="flex h-20 items-center justify-center border-b border-[#e7e7e7] bg-white">
        <div className="text-center">
          <p className="text-xs text-[#565959]">Marketplace</p>
          <h1 className="text-2xl font-bold text-[#131921]">
            amazon<span className="text-[#ff9900]"> admin</span>
          </h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[390px] flex-col px-4 py-8">
        <section className="rounded border border-[#d5d9d9] bg-white shadow-sm overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-[#d5d9d9]">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "border-b-2 border-[#ff9900] bg-white text-[#131921]"
                    : "bg-[#f7fafa] text-[#565959] hover:bg-[#eef0f0]"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Title */}
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#232f3e] text-white">
                {activeTab === "superadmin" ? <ShieldCheck size={22} /> : <Store size={22} />}
              </div>
              <div>
                <h2 className="text-3xl font-normal leading-tight">Sign in</h2>
                <p className="mt-1 text-sm text-[#565959]">
                  {activeTab === "superadmin"
                    ? "Access the super admin dashboard"
                    : "Access your vendor dashboard"}
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded border border-[#c40000] bg-[#fff8f8] p-3 text-sm text-[#c40000]">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-bold text-[#111827]">
                Email or mobile phone number
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#565959]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    placeholder={
                      activeTab === "superadmin"
                        ? "superadmin@marketplace.com"
                        : "vendor@example.com"
                    }
                    className="h-10 w-full rounded border border-[#888c8c] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#c8f3fa]"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </label>

              <label className="block text-sm font-bold text-[#111827]">
                Password
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#565959]" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    placeholder="Password"
                    className="h-10 w-full rounded border border-[#888c8c] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#c8f3fa]"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </label>

              <button
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#ffd814] px-4 text-sm font-medium text-[#111827] shadow-sm hover:bg-[#f7ca00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
              </button>
            </form>

            <p className="mt-4 text-xs leading-5 text-[#565959]">
              By continuing, you agree to the marketplace admin conditions of use and privacy notice.
            </p>

            <div className="my-5 border-t border-[#e7e7e7]" />

            <button className="flex items-center gap-1 text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
              <ChevronRight size={15} />
              Need help signing in?
            </button>
          </div>
        </section>

        <div className="my-6 flex items-center gap-3 text-xs text-[#565959]">
          <span className="h-px flex-1 bg-[#e7e7e7]" />
          New to this admin panel?
          <span className="h-px flex-1 bg-[#e7e7e7]" />
        </div>

        <div className="rounded border border-[#d5d9d9] bg-[#f7fafa] p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#007185]" />
            <p className="text-sm leading-5 text-[#565959]">
              {activeTab === "superadmin"
                ? "Use the super admin credentials provided by your system administrator."
                : "Use your registered marketplace vendor account credentials to sign in."}
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-[#e7e7e7] bg-[#f7fafa] px-4 py-6 text-center text-xs text-[#565959]">
        <div className="mb-3 flex justify-center gap-6 text-[#007185]">
          <span>Conditions of Use</span>
          <span>Privacy Notice</span>
          <span>Help</span>
        </div>
        <p>© 2026 Marketplace Admin</p>
      </footer>
    </div>
  );
}