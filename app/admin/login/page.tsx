"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Login dummy sederhana (nanti bisa upgrade ke Supabase Auth)
    if (email === "admin@luriq.com" && password === "luriq123") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Email atau password salah");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-light text-center mb-2 text-coffee">Admin Login</h1>
        <p className="text-center text-caramel text-sm mb-8">
          Luriq Cake & Cookies
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-2 text-coffee">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-coffee"
              required
              placeholder="admin@luriq.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-coffee">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-coffee"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coffee text-white py-3 rounded-xl hover:bg-caramel transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Demo: admin@luriq.com / luriq123
        </p>
        <p className="text-center text-xs mt-4">
          <a href="/" className="text-caramel hover:underline">← Kembali ke Beranda</a>
        </p>
      </div>
    </div>
  );
}
