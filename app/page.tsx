"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export default function Home() {
  const startDate = new Date("2026-03-07");
  const today = new Date();
  const togetherDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col gap-10 py-10">
      {/* Couple Image Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-square w-full max-w-sm mx-auto rounded-[3rem] overflow-hidden shadow-2xl group"
      >
        <Image
          src="/couple_moment.png"
          alt="Our Moment"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="text-white">
            <h3 className="text-3xl font-bold">Forever Together</h3>
            <p className="text-sm opacity-80 flex items-center gap-1"><Sparkles size={14} /> Since Mar 7, 2024</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/30 text-white shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70 leading-none mb-1">Days</span>
            <span className="text-2xl font-black leading-none">{togetherDays}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats/Quick Actions */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-2 aspect-square justify-center text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 mb-2">
            <Heart size={24} fill="currentColor" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Photos Shared</p>
          <span className="text-2xl font-black">1,248</span>
        </div>
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-2 aspect-square justify-center text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-2">
            <Sparkles size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Sweet Sparks</p>
          <span className="text-2xl font-black">42</span>
        </div>
      </div>

      <div className="text-center italic text-[var(--color-secondary)]/50 font-serif text-lg">
        &quot;You&apos;re the peace I&apos;ve been searching for.&quot;
      </div>
    </div>
  );
}
