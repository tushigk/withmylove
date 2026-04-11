"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Heart, Plus } from "lucide-react";
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
  const { data, error, mutate } = useSWR("/api/reminders", fetcher);

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

  const isLoading = !data && !error;

  if (isLoading) return <div className="text-center py-20 opacity-50">Syncing our special days...</div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-6 pb-32">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Special Dates</h2>
          <p className="text-sm text-[var(--color-secondary)]/60 italic">Moments to remember forever</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="p-4 bg-white border-2 border-pink-200 text-pink-500 rounded-full shadow-lg"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-200 via-pink-100 to-transparent rounded-full" />
        
        <AnimatePresence>
          {reminders.length === 0 ? (
            <p className="pl-16 text-[var(--color-secondary)]/30 italic text-left">No special days added yet.</p>
          ) : (
            reminders.map((reminder, index) => (
              <motion.div
                layout
                key={reminder._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="pl-16 relative"
              >
                <div className={cn(
                  "absolute left-3 top-4 w-7 h-7 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-lg z-10",
                  reminder.type === 'anniversary' ? "bg-rose-500" : reminder.type === 'birthday' ? "bg-amber-500" : "bg-blue-500"
                )}>
                  {reminder.type === 'anniversary' ? <Heart size={14} fill="currentColor" /> : 
                   reminder.type === 'birthday' ? <Gift size={14} /> : <Plus size={14} />}
                </div>

                <div className="glass-card p-6 rounded-[2rem] flex justify-between items-center group hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-white/50">
                  <div className="space-y-1 text-left">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]/30">
                      {new Date(reminder.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-pink-500 transition-colors uppercase tracking-tight">{reminder.title}</h3>
                  </div>
                  
                  <div className="text-right">
                    <div className="px-4 py-2 bg-white/40 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 border border-white/20">
                      {reminder.type}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-8 rounded-[3rem] shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-bold">New Special Day</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (e.g. First Date)"
                  value={newReminder.title}
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                  className="w-full p-4 bg-white/50 border border-white/40 rounded-2xl outline-none"
                  required
                />
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={e => setNewReminder({...newReminder, date: e.target.value})}
                  className="w-full p-4 bg-white/50 border border-white/40 rounded-2xl outline-none"
                  required
                />
                <select 
                  value={newReminder.type}
                  onChange={e => setNewReminder({...newReminder, type: e.target.value as Reminder['type']})}
                  className="w-full p-4 bg-white/50 border border-white/40 rounded-2xl outline-none appearance-none"
                >
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="event">Special Event</option>
                </select>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg">
                    {isSaving ? "Saving..." : "Save Day"}
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
