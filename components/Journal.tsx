"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Heart, Plus, MapPin, Calendar, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  liked?: boolean;
}

export default function Journal({ user }: { user: string }) {
  const { data, mutate } = useSWR("/api/journal", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });

  const entries: JournalEntry[] = Array.isArray(data) ? data : [];

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.content) return;
    
    setIsSaving(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEntry, author: user }),
      });
      setNewEntry({ title: "", content: "" });
      setShowForm(false);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 py-10 pb-32">
      {/* Search and Filter Area */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search memories..." 
            className="w-full pl-14 pr-6 py-5 bg-white/50 border border-white/40 rounded-[2rem] outline-none focus:bg-white focus:shadow-2xl transition-all duration-500 placeholder:text-gray-300 font-medium"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] text-white rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-pink-200"
        >
          <Plus size={32} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddEntry} className="glass-card p-10 rounded-[3rem] space-y-6 shadow-2xl bg-gradient-to-br from-white to-pink-50/20">
              <div className="space-y-2 text-center pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-800">New Memory</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Share a piece of your heart</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Capture this moment with a title..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full p-6 bg-white/40 border border-white/60 rounded-2xl outline-none focus:bg-white transition-all text-xl font-bold placeholder:text-gray-200"
                  required
                />
                <textarea
                  placeholder="Tell our story..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="w-full p-6 bg-white/40 border border-white/60 rounded-2xl outline-none focus:bg-white transition-all min-h-[180px] text-lg leading-relaxed placeholder:text-gray-200"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-5 bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-100 disabled:opacity-50"
                >
                  {isSaving ? "Safeguarding..." : "Preserve Memory"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {entries.length === 0 ? (
          <div className="py-24 text-center space-y-4 opacity-20 italic">
            <Book size={64} className="mx-auto" />
            <p className="text-xl font-medium tracking-tight">Our story begins with the first word...</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              layout
              key={entry._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 rounded-[3.5rem] relative group hover:shadow-2xl hover:scale-[1.01] transition-all duration-700"
            >
              <div className="absolute top-10 right-10 flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  className={cn("p-3 rounded-2xl transition-colors", entry.liked ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-300 hover:text-red-400")}
                >
                  <Heart size={20} fill={entry.liked ? "currentColor" : "none"} />
                </motion.button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center text-gray-400 font-black text-xl border-4 border-white shadow-inner">
                    {entry.author[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-pink-500 transition-colors">{entry.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">
                        <Calendar size={12} /> {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-pink-300 italic">
                        by {entry.author}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-lg leading-relaxed font-serif text-gray-500 pl-2">
                  {entry.content}
                </p>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                     <MapPin size={12} /> Captured in our hearts
                   </div>
                   <Star className="text-amber-200" size={16} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
