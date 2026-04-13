"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Sparkles, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
  unlockAt?: string;
}

export default function SurpriseMessage({ user }: { user: string }) {
  const { data, mutate } = useSWR("/api/messages", fetcher);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messages: Message[] = Array.isArray(data) ? data : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: user,
          content: content,
        }),
      });
      setContent("");
      mutate();
    } catch {
      console.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const partnerName = user === "tushig" ? "Anujin" : "Tushig";

  return (
    <div className="flex flex-col gap-12 py-10 pb-32 max-w-2xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-pink-50 rounded-full border border-pink-100 mb-2">
          <Sparkles size={14} className="text-pink-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Heart to Heart</span>
        </div>
        <h2 className="text-5xl font-black text-gray-800 tracking-tighter italic">Whispers of <span className="text-gradient pr-3">Love</span></h2>
        <p className="text-sm text-gray-400 font-medium tracking-tight">Send a surprise message for {partnerName} to find.</p>
      </div>

      {/* Message Composer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[4rem] shadow-[0_40px_100px_rgba(224,169,165,0.2)] bg-gradient-to-br from-white to-pink-50/20 border-b-[12px] border-pink-50"
      >
        <form onSubmit={handleSend} className="space-y-8">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write your precious words for ${partnerName}...`}
              className="w-full p-8 bg-white/40 border border-white/60 rounded-[2.5rem] outline-none focus:bg-white focus:shadow-2xl transition-all min-h-[160px] text-xl leading-relaxed placeholder:text-gray-200"
              required
            />
            <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-50 grayscale">
              <Heart size={16} className="text-pink-400" fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Sealed with love</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="w-full py-6 bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSending ? "Whispering..." : (
              <>
                Send to {partnerName} <SendHorizontal size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Inbox / History */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest">Recent Notes</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
        </div>

        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="py-20 text-center space-y-6 opacity-20 italic grayscale">
              <MessageSquare size={64} className="mx-auto" />
              <p className="text-xl font-medium tracking-tight">Silence is beautiful, but words are magical. <br />Start the conversation...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, x: msg.sender === user ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex flex-col gap-2",
                  msg.sender === user ? "items-end" : "items-start px-2"
                )}
              >
                <div className={cn(
                  "max-w-[85%] p-8 rounded-[3rem] shadow-sm relative group transition-all duration-500 hover:shadow-2xl",
                  msg.sender === user
                    ? "bg-white border-2 border-pink-50 text-gray-600 rounded-tr-none"
                    : "bg-gradient-to-br from-[var(--color-primary)] to-[#c68b87] text-white rounded-tl-none"
                )}>
                  {msg.sender !== user && (
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-pink-500 border-2 border-pink-100">
                      <Heart size={18} fill="currentColor" />
                    </div>
                  )}

                  <p className="text-lg leading-relaxed font-serif italic">
                    &quot;{msg.content}&quot;
                  </p>

                  <div className={cn(
                    "mt-4 pt-4 border-t flex items-center justify-between gap-4",
                    msg.sender === user ? "border-pink-50/50" : "border-white/10"
                  )}>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {msg.sender === user ? "You sent this" : `From ${msg.sender}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
