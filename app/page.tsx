"use client";

import Image from "next/image";
import { motion as m } from "framer-motion";
import { Heart, Sparkles, MapPin, Calendar, ArrowRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const START_DATE = new Date("2026-03-07T00:00:00");
const TARGET_DATE = new Date("2026-08-06");

export default function Home() {
  const [timeSince, setTimeSince] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - START_DATE.getTime();

      if (diff < 0) {
        setTimeSince({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeSince({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const togetherDays = Math.floor((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntil = Math.ceil((TARGET_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));


  return (
    <div className="flex flex-col gap-12 py-12">
      {/* Hero Section */}
      <section className="relative">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(224,169,165,0.3)] group"
        >
          <Image
            src="/couple_moment.png"
            alt="Our Moment"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-10 left-10 right-10 space-y-4">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <MapPin size={12} className="text-[var(--color-primary)]" />
              <span>Our Secret Paradise</span>
            </m.div>
            <h3 className="text-4xl font-black text-white leading-tight">Every moment is a <span className="text-[var(--color-primary)]">treasure</span>.</h3>

            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Since</span>
                <span className="text-sm font-bold text-white">Mar 7, 2026</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</span>
                <span className="text-sm font-bold text-pink-400 flex items-center gap-1">Madly in love <Heart size={12} fill="currentColor" /></span>
              </div>
            </div>
          </div>
        </m.div>

        {/* Floating Together Count */}
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.6 }}
          className="absolute -top-6 -right-2 md:right-[20%] w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center border-4 border-[var(--color-accent)] animate-float"
        >
          <span className="text-4xl font-black text-gradient leading-none">{togetherDays}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Days</span>
        </m.div>
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-2 gap-6">
        <Link href="/journal" className="col-span-2">
          <m.div
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-[3rem] flex items-center justify-between group cursor-pointer overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--color-primary)]/10 transition-colors" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-500">
                <Heart size={32} fill="currentColor" />
              </div>
              <div>
                <h4 className="text-xl font-black text-gray-800">New Memory</h4>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Write something sweet today...</p>
              </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-pink-400 group-hover:translate-x-2 transition-all" size={24} />
          </m.div>
        </Link>

        {[
          {
            icon: Sparkles,
            label: "Time",
            value: `${timeSince.days}d ${String(timeSince.hours).padStart(2, '0')}:${String(timeSince.minutes).padStart(2, '0')}:${String(timeSince.seconds).padStart(2, '0')}`,
            color: "text-amber-500",
            bg: "bg-amber-100",
            smallText: true,
            href: "/"
          },
          { icon: Calendar, label: "Upcoming", value: `${daysUntil} Days`, color: "text-blue-500", bg: "bg-blue-100", href: "/dates" },
          { icon: ImageIcon, label: "Gallery", value: "Our Album", color: "text-purple-500", bg: "bg-purple-100", href: "/album" }
        ].map((item, i) => (
          <Link href={item.href} key={i} className={cn(i === 2 ? "col-span-2" : "col-span-1")}>
            <m.div
              whileHover={{ y: -5 }}
              className="glass-card p-6 h-full rounded-[3rem] flex flex-col items-center justify-center gap-3 text-center group"
            >
              <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500", item.bg, item.color)}>
                <item.icon size={28} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <span className={cn("font-black text-gray-800 tracking-tighter leading-none block", "text-xl")}>
                  {item.value}
                </span>
              </div>
            </m.div>
          </Link>
        ))}

      </section>

      {/* Quote Section */}
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center space-y-4 px-8"
      >
        <div className="flex justify-center gap-1">
          {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-pink-200" />)}
        </div>
        <p className="text-2xl font-serif italic text-gray-400 leading-relaxed">
          &quot;In your arms, I found the home I never knew I was missing.&quot;
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-300">— Forever Yours</p>
      </m.div>
    </div>
  );
}
