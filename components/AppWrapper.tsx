"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Login from "@/components/Login";
import useSWR, { mutate as globalMutate } from "swr";
import { usePathname } from "next/navigation";

const subscribe = () => () => { };
const USER_KEY = "couple-user";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useSWR(USER_KEY, () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_KEY);
    }
    return null;
  });

  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const handleLogin = (username: string) => {
    localStorage.setItem(USER_KEY, username);
    globalMutate(USER_KEY, username);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    globalMutate(USER_KEY, null);
  };

  if (!isClient) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen pb-32">
      {/* Header */}
      <header className="p-8 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">OUR SPACE</h1>
            <p className="text-[10px] font-bold text-[var(--color-secondary)]/40 uppercase tracking-widest leading-none">
              Welcome, {user}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3 glass-button rounded-2xl">
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <BottomNav />

      {/* Floating Elements for atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-[var(--color-accent)]/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
