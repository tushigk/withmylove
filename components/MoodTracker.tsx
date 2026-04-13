"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown, Heart, Coffee, Sun, CloudRain, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { format } from "date-fns";

const moods = [
  { id: 'happy', icon: Smile, label: 'Happy', color: 'bg-yellow-50 text-yellow-600', heart: '😊' },
  { id: 'loved', icon: Heart, label: 'Loved', color: 'bg-pink-50 text-pink-600', heart: '💖' },
  { id: 'calm', icon: Coffee, label: 'Calm', color: 'bg-blue-50 text-blue-600', heart: '✨' },
  { id: 'energetic', icon: Sun, label: 'Energetic', color: 'bg-orange-50 text-orange-600', heart: '🔥' },
  { id: 'sad', icon: Frown, label: 'Sad', color: 'bg-indigo-50 text-indigo-600', heart: '🥺' },
  { id: 'tired', icon: CloudRain, label: 'Tired', color: 'bg-slate-50 text-slate-600', heart: '☁️' },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MoodEntry {
  _id: string;
  user: string;
  mood: string;
  label: string;
  createdAt: string;
}

export default function MoodTracker({ user }: { user: string }) {
  const [isSaving, setIsSaving] = useState(false);

  const { data: moodsData, isLoading, mutate } = useSWR(user ? ["/api/mood", user] : null, ([url]) => fetcher(url), {
    revalidateOnFocus: true
  });

  const moodsList = Array.isArray(moodsData) ? moodsData : [];

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const sortedMoods = [...moodsList].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const ownLatest = sortedMoods.find((m: MoodEntry) => m.user === user);
  const partnerLatest = sortedMoods.find((m: MoodEntry) => m.user !== user);

  const alreadySetToday = !!(ownLatest && isToday(ownLatest.createdAt));
  const selectedMood = ownLatest ? ownLatest.mood : null;
  const partnerName = user === "tushig" ? "Anujin" : "Tushig";
  const partnerMoodToday = partnerLatest && isToday(partnerLatest.createdAt) ? partnerLatest : null;

  const handleMoodSelect = async (mood: { id: string, label: string }) => {
    if (alreadySetToday || isSaving || isLoading) return;

    setIsSaving(true);
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.id, label: mood.label, user: user }),
      });
      await mutate();
    } catch {
      console.error("Failed to save mood");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 py-10 pb-32 max-w-lg mx-auto">
      {/* Partner Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-[4rem] border-b-[12px] border-pink-100/50 text-center space-y-8 shadow-[0_40px_80px_rgba(224,169,165,0.15)] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-pink-200/40 to-transparent" />

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-pink-300" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400/60 leading-none">
              {partnerName}&apos;s Vibe
            </p>
            <Sparkles size={14} className="text-pink-300" />
          </div>
          <h3 className="text-sm font-bold text-gray-400 capitalize italic">How they feel today</h3>
        </div>

        <div className="flex flex-col items-center gap-6">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-pink-50 border-t-pink-300 rounded-full animate-spin" />
            </div>
          ) : partnerMoodToday ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-36 h-36 bg-gradient-to-br from-white to-pink-50 rounded-[3.5rem] flex items-center justify-center text-7xl shadow-[0_20px_40px_rgba(224,169,165,0.2)] ring-[16px] ring-pink-50/30 animate-float border border-white">
                {moods.find(m => m.id === partnerMoodToday.mood)?.heart || '✨'}
              </div>
              <p className="text-3xl font-black text-gradient uppercase tracking-tighter italic">
                {partnerMoodToday.label}
              </p>
            </motion.div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center opacity-20 gap-4 italic grayscale">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Coffee size={40} className="animate-pulse" />
              </div>
              <p className="tracking-tighter font-bold uppercase text-xs">Waiting for {partnerName}...</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tighter text-gray-800">Your Turn</h2>
        <div className="flex justify-center gap-1">
          <div className="w-8 h-1 bg-pink-200 rounded-full" />
          <div className="w-2 h-1 bg-pink-100 rounded-full" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-100/50 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : alreadySetToday ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-14 rounded-[4.5rem] text-center space-y-10 bg-gradient-to-br from-white via-white to-pink-50/30 shadow-2xl border-t-8 border-white"
          >
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-[40px] animate-pulse" />
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center text-7xl shadow-[0_25px_50px_rgba(0,0,0,0.1)] ring-8 ring-white transition-transform hover:scale-110 duration-700 cursor-default">
                {moods.find(m => m.id === selectedMood)?.heart || '❤️'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                <Star size={16} fill="currentColor" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-tight italic">
                Today, you feel <br /><span className="text-gradient drop-shadow-sm">{selectedMood}</span>
              </h3>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-pink-50 rounded-full border border-pink-100 border-dashed">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" />
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">
                  Shared with {partnerName}
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60 px-6 text-center leading-relaxed">
                One sweet selection per day. <br />See you tomorrow, love!
              </p>
              <Heart className="text-pink-200" size={20} fill="currentColor" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-3 gap-6"
          >
            {moods.map((mood, i) => {
              const Icon = mood.icon;
              const isActive = selectedMood === mood.id;

              return (
                <motion.button
                  key={mood.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.08, y: -8 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={isSaving}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-8 rounded-[3rem] transition-all duration-500 shadow-sm border-2",
                    isActive ? cn(mood.color, "shadow-2xl ring-8 ring-white scale-110 z-10 border-transparent") : "bg-white/70 backdrop-blur-md border-white/40 hover:bg-white hover:shadow-2xl hover:border-[var(--color-accent)]",
                    isSaving && "opacity-50 cursor-wait"
                  )}
                >
                  <div className="p-4 bg-white/80 rounded-[1.5rem] shadow-inner border border-white/50 text-gray-500 group-hover:text-pink-500 transition-colors">
                    <Icon size={36} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{mood.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood History Timeline */}
      {sortedMoods.length > 0 && (
        <div className="mt-16 relative">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-pink-50/80 backdrop-blur-sm rounded-full border border-pink-100/50 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-400">Time Capsule</span>
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tighter italic">Mood History</h2>
          </div>

          <div className="relative pl-[1.125rem]">
            {/* Continuous left border line */}
            <div className="absolute left-[1.125rem] top-6 bottom-6 w-1 -ml-[2px] bg-gradient-to-b from-pink-200 via-pink-100 to-transparent rounded-full opacity-60" />

            <div className="space-y-5 relative">
              {sortedMoods.slice(0, 30).map((entry: MoodEntry, index: number) => {
                const moodInfo = moods.find(m => m.id === entry.mood);
                const isMe = entry.user === user;
                const entryDate = new Date(entry.createdAt);
                const userName = entry.user === "tushig" ? "Tushig" : "Anujin";

                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, x: -20, y: 10 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                    className="relative pl-8 group"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[3px] border-white bg-pink-300 shadow-sm z-10 transition-transform group-hover:scale-150 duration-300" />

                    <div className={cn(
                      "glass-card p-3 pr-5 rounded-[2rem] flex items-center gap-4 bg-white/70 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/80 hover:shadow-[0_8px_30px_-4px_rgba(224,169,165,0.2)] hover:scale-[1.02] transition-all duration-300",
                      isMe ? "hover:border-pink-200/50" : "hover:border-blue-200/50"
                    )}>
                      <div className={cn(
                        "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/50 bg-gradient-to-br from-white/60 to-transparent group-hover:rotate-12 transition-transform duration-300",
                        moodInfo?.color?.split(" ")[1] || "text-gray-600",
                        moodInfo?.color?.split(" ")[0] || "bg-gray-50"
                      )}>
                        <span className="drop-shadow-sm">{moodInfo?.heart}</span>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                         <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-black text-gray-800 text-lg leading-none truncate">{moodInfo?.label || entry.label}</h4>
                            <span className={cn(
                              "text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full shrink-0 border",
                              isMe ? "bg-pink-50 text-pink-500 border-pink-100" : "bg-blue-50 text-blue-500 border-blue-100"
                            )}>
                              {userName}
                            </span>
                         </div>
                         <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider opacity-80">{format(entryDate, "MMM d • h:mm a")}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
