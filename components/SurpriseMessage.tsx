"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function SurpriseMessage({ user }: { user: string }) {
  const { data, error, mutate } = useSWR("/api/messages", fetcher);

  const [showForm, setShowForm] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messages: Message[] = Array.isArray(data) ? data : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: user, content: newMsg }),
      });
      setNewMsg("");
      setShowForm(false);
      mutate(); // Instant update
    } catch {
      console.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const isLoading = !data && !error;

  if (isLoading) return <div className="text-center py-20 opacity-50">Opening our surprise boxes...</div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-6 pb-32">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-gradient">Love Letters</h2>
        <p className="text-sm text-[var(--color-secondary)]/60 italic">Little sparks from the heart</p>
      </div>

      <div className="space-y-12 relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-pink-100 before:via-pink-200 before:to-transparent">
        <AnimatePresence>
          {messages.map((msg: Message, index) => {
            const isMe = msg.sender === user;
            const dateStr = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            return (
              <motion.div
                layout
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex items-center justify-between gap-8",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Timeline Dot & Date Label */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 transition-transform hover:scale-125">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-pink-400 shadow-sm" />
                  <span className="whitespace-nowrap bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter text-pink-400 border border-pink-100 shadow-sm">
                    {dateStr}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "w-[42%] glass-card p-6 rounded-[2rem] relative shadow-lg hover:shadow-2xl transition-all duration-500",
                  isMe ? "border-l-4 border-gray-200" : "border-r-4 border-pink-400 bg-gradient-to-br from-pink-50/20 to-white"
                )}>
                  {!isMe && (
                    <div className="absolute -top-3 -right-3 bg-pink-500 text-white p-2 rounded-xl shadow-lg ring-4 ring-white animate-pulse">
                      <Heart size={14} fill="currentColor" />
                    </div>
                  )}
                  <p className="text-sm font-serif italic text-[var(--color-secondary)]/90 leading-relaxed mb-4 text-left">
                    &quot;{msg.content}&quot;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100/50">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black uppercase shadow-inner">
                      {msg.sender[0]}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{msg.sender}</span>
                  </div>
                </div>
                
                {/* Empty spacer for the other side of timeline */}
                <div className="w-[42%]" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showForm ? (
        <motion.form 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSend} 
          className="glass-card p-8 rounded-[3rem] shadow-2xl space-y-6"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-pink-400" />
            Write a Surprise
          </h3>
          <textarea
            placeholder="Type your heart out..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            className="w-full p-6 bg-white/50 border border-white/40 rounded-3xl outline-none h-40 text-lg shadow-inner"
            required
          />
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancel</button>
            <button type="submit" disabled={isSending} className="flex-1 py-4 bg-[var(--color-secondary)] text-white rounded-2xl font-bold shadow-lg shadow-pink-200 disabled:opacity-50">
              {isSending ? "Sending..." : "Send Surprise"}
            </button>
          </div>
        </motion.form>
      ) : (
        <button 
          onClick={() => setShowForm(true)}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-5 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-black uppercase tracking-widest shadow-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 z-50 group hover:scale-110 active:scale-95"
        >
          <Mail size={20} className="group-hover:rotate-12 transition-transform" />
          <span>Surprise {user === 'tushig' ? 'Anujin' : 'Tushig'}</span>
        </button>
      )}
    </div>
  );
}
