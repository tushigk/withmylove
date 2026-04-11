"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, LogOut } from "lucide-react";
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
    <div className="relative min-h-screen pb-32 bg-mesh selection:bg-pink-100">
      {/* Header */}
      <header className="p-8 pb-4 flex justify-between items-center max-w-4xl mx-auto sticky top-0 z-[60] backdrop-blur-md bg-white/5">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 15 }}
            className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-200/50"
          >
            <Heart size={24} fill="currentColor" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-gradient leading-none">OUR SPACE</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">
                Together with {user === "tushig" ? "Anujin" : "Tushig"}
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3 cursor-pointer glass-button rounded-2xl hover:bg-white/60 text-gray-400 hover:text-pink-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <BottomNav />

      {/* Atmospheric Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-[var(--color-primary)]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-[#d4af37]/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
