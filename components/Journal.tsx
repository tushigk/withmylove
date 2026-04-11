"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Heart } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Entry {
  _id: string;
  date: string;
  content: string;
  author: string;
  liked?: boolean;
}

export default function Journal({ user }: { user: string }) {
  const { data, error, mutate } = useSWR("/api/journal", fetcher);

  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ content: "" });
  const [isSaving, setIsSaving] = useState(false);

  const entries: Entry[] = Array.isArray(data) ? data : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEntry, author: user }),
      });
      setShowModal(false);
      setNewEntry({ content: "" });
      mutate(); // Revalidate SWR data
    } catch {
      console.error("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = !data && !error;

  if (isLoading) return <div className="text-center py-20 opacity-50">Loading our memories...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-6 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Our Journey</h2>
          <p className="text-sm text-[var(--color-secondary)]/60">Every moment matters</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="p-4 bg-[var(--color-secondary)] text-white rounded-full shadow-xl"
        >
          <Plus size={24} />
        </motion.button>
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
              <h3 className="text-2xl font-bold">New Memory</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  placeholder="What happened today?"
                  value={newEntry.content}
                  onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                  className="w-full p-6 bg-white/50 border border-white/40 rounded-3xl outline-none h-48 text-lg"
                  required
                />
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-[var(--color-secondary)] text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:scale-[1.02] transition-transform disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Memory"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary)] before:to-transparent">
        {entries.length === 0 ? (
          <p className="pl-10 text-[var(--color-secondary)]/40 italic text-left">No memories yet. Let&apos;s write one!</p>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={entry._id}
              className="pl-10 relative"
            >
              <div className="absolute left-[13px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-pearl)]" />

              <div className="glass-card p-8 rounded-[2.5rem] space-y-4 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)]/40">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <p className="text-[var(--color-secondary)]/80 leading-relaxed font-serif italic text-xl">
                    &quot;{entry.content}&quot;
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-[10px] font-bold uppercase">
                      {entry.author[0]}
                    </div>
                    <span className="text-xs font-bold text-[var(--color-secondary)]/60 uppercase tracking-widest">
                      {entry.author}
                    </span>
                  </div>
                  <button className={entry.liked ? "text-rose-500" : "text-gray-300 hover:text-rose-400 transition-colors"}>
                    <Heart size={20} fill={entry.liked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
