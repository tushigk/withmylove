"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Heart, Plus, Calendar, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Reminder {
  _id: string;
  title: string;
  date: string;
  type: "anniversary" | "birthday" | "event";
}

export default function ReminderSystem() {
  const { data, mutate } = useSWR("/api/reminders", fetcher);

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    title: string;
    date: string;
    type: Reminder["type"];
  }>({
    title: "",
    date: "",
    type: "event",
  });

  const reminders: Reminder[] = Array.isArray(data) ? data : [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReminder),
      });
      setShowModal(false);
      setNewReminder({ title: "", date: "", type: "event" });
      mutate();
    } catch {
      console.error("Failed to add");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = !data;

  return (
    <div className="flex flex-col gap-12 py-10 pb-32 max-w-2xl mx-auto">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Timeless Moments</p>
          </div>
          <h2 className="text-5xl font-black text-gradient leading-tight italic tracking-tighter pr-3">Special Days</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="w-20 h-20 bg-gradient-to-br from-gray-100 to-white border-4 border-white text-pink-500 rounded-full shadow-[0_20px_40px_rgba(224,169,165,0.2)] flex items-center justify-center transition-all hover:shadow-pink-200"
        >
          <Plus size={36} strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="space-y-8 relative px-4">
        <div className="absolute left-8 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-200/50 via-pink-50 to-transparent rounded-full" />

        <AnimatePresence>
          {isLoading ? (
            <div className="pl-20 py-10 opacity-30 italic font-medium">Syncing our universe...</div>
          ) : reminders.length === 0 ? (
            <div className="pl-20 py-10">
              <p className="text-gray-300 italic text-xl tracking-tight leading-relaxed">The stars are waiting to be named. <br />Add our first special day together.</p>
            </div>
          ) : (
            reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((reminder, index) => {
              const rDate = new Date(reminder.date);
              const daysLeft = Math.ceil((rDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <motion.div
                  layout
                  key={reminder._id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="pl-20 relative group"
                >
                  <div className={cn(
                    "absolute left-4 top-8 w-8 h-8 rounded-full flex items-center justify-center text-white ring-[8px] ring-white shadow-xl z-10 transition-transform duration-500 group-hover:scale-125",
                    reminder.type === 'anniversary' ? "bg-rose-500" : reminder.type === 'birthday' ? "bg-amber-400" : "bg-indigo-400"
                  )}>
                    {reminder.type === 'anniversary' ? <Heart size={16} fill="white" /> :
                      reminder.type === 'birthday' ? <Gift size={16} /> : <Calendar size={16} />}
                  </div>

                  <div className="glass-card p-10 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-[0_40px_80px_rgba(224,169,165,0.2)] transition-all duration-700 border-2 border-transparent hover:border-white">
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/50 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/20">
                          {reminder.type}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-100" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 opacity-60">
                          <Clock size={10} /> {daysLeft > 0 ? `${daysLeft} days until` : 'Happy day!'}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-gray-800 transition-colors uppercase tracking-widest leading-none drop-shadow-sm group-hover:text-pink-500">
                        {reminder.title}
                      </h3>
                    </div>

                    <div className="text-left md:text-right pt-4 md:pt-0 border-t border-white/10 md:border-t-0">
                      <div className="text-4xl font-black text-gradient italic tracking-tighter leading-none mb-1 pr-3">
                        {rDate.getDate()}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                        {rDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-rose-900/10 backdrop-blur-xl">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card p-12 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] space-y-10 bg-gradient-to-br from-white to-pink-50/10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-800 tracking-tighter">New Special Day</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] italic">Marking down another reason to celebrate us</p>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Occasion Title</label>
                    <input
                      type="text"
                      placeholder="e.g. First Kiss Anniversary"
                      value={newReminder.title}
                      onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                      className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-pink-50 transition-all font-bold text-lg"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Date</label>
                      <input
                        type="date"
                        value={newReminder.date}
                        onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                        className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-pink-50 transition-all font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Category</label>
                      <select
                        value={newReminder.type}
                        onChange={e => setNewReminder({ ...newReminder, type: e.target.value as Reminder['type'] })}
                        className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-pink-50 transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="anniversary">Anniversary</option>
                        <option value="birthday">Birthday</option>
                        <option value="event">Special Event</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-6 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Discard</button>
                  <button type="submit" disabled={isSaving} className="flex-[2] py-6 bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-100 transition-all hover:scale-[1.02]">
                    {isSaving ? "Saving Light..." : "Preserve Today"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
