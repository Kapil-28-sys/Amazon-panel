import { useState } from "react";
import axios from "axios";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { apiUrl } from "../../config/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(apiUrl("/api/admin/login"), form);
      localStorage.setItem("adminToken", res.data.token);
      
      // Using a slightly more modern redirect delay for UX
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Background decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-500 p-3 rounded-xl mb-4 shadow-lg shadow-indigo-500/50">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Admin Portal
            </h2>
            <p className="text-indigo-200/60 text-sm mt-2">
              Please enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-indigo-300/50" />
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-indigo-300/50" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Footer Info */}
          <p className="text-center text-white/40 text-xs mt-8">
            Secured by enterprise-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
