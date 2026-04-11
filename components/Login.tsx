"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Lock, User } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.username);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[var(--color-pearl)] to-pink-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 rounded-[3rem] shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-xl animate-pulse">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-gradient">Welcome to Our Space</h1>
          <p className="text-sm text-[var(--color-secondary)]/60">A private corner for us.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]/40" size={20} />
              <input
                type="text"
                placeholder="Who are you?"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]/40" size={20} />
              <input
                type="password"
                placeholder="Secret Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                required
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-center text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-[var(--color-secondary)] text-white rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95 shadow-xl"
          >
            Enter Our Home
          </button>
        </form>
      </motion.div>
    </div>
  );
}
