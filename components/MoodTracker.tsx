"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown, Heart, Coffee, Sun, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const moods = [
  { id: 'happy', icon: Smile, label: 'Happy', color: 'bg-yellow-100 text-yellow-600', heart: '❤️' },
  { id: 'loved', icon: Heart, label: 'Loved', color: 'bg-pink-100 text-pink-600', heart: '💖' },
  { id: 'calm', icon: Coffee, label: 'Calm', color: 'bg-blue-100 text-blue-600', heart: '✨' },
  { id: 'energetic', icon: Sun, label: 'Energetic', color: 'bg-orange-100 text-orange-600', heart: '🔥' },
  { id: 'sad', icon: Frown, label: 'Sad', color: 'bg-indigo-100 text-indigo-600', heart: '🥺' },
  { id: 'tired', icon: CloudRain, label: 'Tired', color: 'bg-slate-100 text-slate-600', heart: '☁️' },
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

  const { data: moodsData, error, isLoading, mutate } = useSWR(user ? ["/api/mood", user] : null, ([url]) => fetcher(url), {
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
        body: JSON.stringify({
          mood: mood.id,
          label: mood.label,
          user: user
        }),
      });
      await mutate();
    } catch {
      console.error("Failed to save mood");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-md mx-auto p-6 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[3rem] border-b-8 border-pink-400/20 text-center space-y-6 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent" />
        
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400/60 leading-none">
            {partnerName}&apos;s Status
          </p>
          <h3 className="text-sm font-bold text-gray-400 capitalize">Today&apos;s Feeling</h3>
        </div>

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : partnerMoodToday ? (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-pink-50 to-white rounded-[2.5rem] flex items-center justify-center text-6xl shadow-xl ring-8 ring-pink-50/50 animate-float">
                {moods.find(m => m.id === partnerMoodToday.mood)?.heart || '✨'}
              </div>
              <p className="text-2xl font-black text-gradient uppercase tracking-tighter">
                {partnerMoodToday.label}
              </p>
            </motion.div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center opacity-30 gap-3 italic">
              <Coffee size={40} className="animate-pulse" />
              <p className="tracking-tighter font-medium">Waiting for {partnerName}...</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black tracking-tight text-gray-800">Your Vibe</h2>
        <div className="h-px w-12 bg-pink-200 mx-auto" />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-gray-100/50 rounded-[2rem] animate-pulse" />
            ))}
          </motion.div>
        ) : alreadySetToday ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 rounded-[3.5rem] text-center space-y-8 bg-gradient-to-br from-white to-pink-50/20 shadow-xl border-t-4 border-white"
          >
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 bg-pink-400/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center text-6xl shadow-2xl ring-4 ring-white transition-transform hover:scale-110 duration-500 cursor-default">
                {moods.find(m => m.id === selectedMood)?.heart || '❤️'}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight italic text-center">
                You are feeling <span className="text-pink-500">{selectedMood}</span>
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-2 bg-gray-50 rounded-full inline-block">
                Shared with {partnerName} Today
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">One vibe per day ❤️ Come back tomorrow!</p>
              <Heart className="text-pink-400 animate-pulse fill-pink-400" size={24} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isActive = selectedMood === mood.id;
              
              return (
                <motion.button
                  key={mood.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={isSaving}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] transition-all duration-300 shadow-sm",
                    isActive ? cn(mood.color, "shadow-xl ring-4 ring-white scale-110 z-10") : "bg-white/60 backdrop-blur-md border border-white hover:bg-white hover:shadow-lg",
                    isSaving && "opacity-50 cursor-wait"
                  )}
                >
                  <div className="p-3 bg-white/50 rounded-2xl shadow-inner">
                    <Icon size={32} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
