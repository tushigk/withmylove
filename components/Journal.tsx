"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Heart, Plus, MapPin, Calendar, Search, Star, Edit3, History, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
  history?: { title: string; content: string; editedAt: string }[];
}

export default function Journal({ user }: { user: string }) {
  const { data, mutate } = useSWR("/api/journal", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", content: "" });
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const entries: JournalEntry[] = Array.isArray(data) ? data : [];

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleEditEntry = async (id: string) => {
    setIsSaving(true);
    try {
      await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editData }),
      });
      setEditingId(null);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry._id);
    setEditData({ title: entry.title, content: entry.content });
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {filteredEntries.length === 0 ? (
          <div className="py-24 text-center space-y-4 opacity-20 italic">
            <Book size={64} className="mx-auto" />
            <p className="text-xl font-medium tracking-tight">
              {searchQuery ? "No memories match your search." : "Our story begins with the first word..."}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              layout
              key={entry._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 rounded-[3.5rem] relative group hover:shadow-2xl hover:scale-[1.01] transition-all duration-700"
            >
              <div className="absolute top-10 right-5 flex gap-2">
                {entry.author === user && editingId !== entry._id && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startEditing(entry)}
                    className="p-3 bg-blue-50 text-blue-400 rounded-2xl hover:bg-blue-100 transition-colors"
                    title="Edit Memory"
                  >
                    <Edit3 size={18} />
                  </motion.button>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center text-gray-400 font-black text-xl border-4 border-white shadow-inner shrink-0">
                    {entry.author[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === entry._id ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full text-2xl font-black text-gray-800 bg-white/50 border-b-2 border-pink-200 outline-none focus:border-pink-500 py-1"
                      />
                    ) : (
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-pink-500 transition-colors truncate">{entry.title}</h3>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">
                        <Calendar size={12} /> {new Date(entry.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-pink-300 italic">
                        by {entry.author}
                      </span>
                      {entry.history && entry.history.length > 0 && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <button
                            onClick={() => setShowHistoryId(showHistoryId === entry._id ? null : entry._id)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <History size={12} /> Edited
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {editingId === entry._id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      className="w-full p-4 bg-white/50 border-2 border-pink-100 rounded-2xl outline-none focus:border-pink-400 min-h-[150px] text-lg leading-relaxed text-gray-600"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 font-bold text-xs uppercase"
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry._id)}
                        disabled={isSaving}
                        className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-2 font-bold text-xs uppercase shadow-lg shadow-pink-100"
                      >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check size={16} />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed font-serif text-gray-500 pl-2 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                )}

                <AnimatePresence>
                  {showHistoryId === entry._id && entry.history && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-4 overflow-hidden"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Previous Versions</h4>
                      <div className="space-y-6">
                        {entry.history.slice().reverse().map((hist, hIdx) => (
                          <div key={hIdx} className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-pink-300 uppercase">{hist.title}</span>
                              <span className="text-[9px] font-medium text-gray-400">{new Date(hist.editedAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm italic font-serif text-gray-400 pl-2 border-l-2 border-pink-100">{hist.content}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
