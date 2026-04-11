"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { motion as m, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2, Heart, Trash } from "lucide-react";
import { createPortal } from "react-dom";

interface Photo {
  _id: string;
  url: string;
  caption: string;
  uploader: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AlbumPage() {
  const { data: photos, mutate, isLoading } = useSWR("/api/photos", fetcher);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "alert", title: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setDialog({ isOpen: true, type: "alert", title: "File Too Large", message: "Please select an image under 3MB to save space." });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const username = localStorage.getItem("couple-user") || "anonymous";

        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: base64String,
            caption: "",
            uploader: username,
          }),
        });

        if (res.ok) {
          mutate();
        } else {
          const err = await res.json();
          setDialog({ isOpen: true, type: "alert", title: "Upload Failed", message: err.error || "Unknown error occurred during upload." });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setDialog({ isOpen: true, type: "alert", title: "Upload Error", message: "An error occurred while reading the file." });
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-24">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Our Album</h2>
          <p className="text-gray-400 font-medium mt-1">Capturing the little things 📸</p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
        </div>
      ) : (
        <div className="columns-2 gap-4 space-y-4 px-2">
          {photos?.length > 0 ? (
            photos.map((photo: Photo, i: number) => (
              <m.div
                key={photo._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative break-inside-avoid rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || "Our memory"}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center gap-2">
                    <Heart className="text-pink-400" size={16} fill="currentColor" />
                    <span className="text-white text-xs font-semibold capitalize bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                      By {photo.uploader}
                    </span>
                  </div>
                </div>
              </m.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-16 py-20 text-gray-400">
              No photos yet. Start capturing moments!
            </div>
          )}
        </div>
      )}

      {mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedPhoto && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X />
                </button>
                <m.div
                  initial={{ scale: 0.85, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-md max-h-[90vh] flex flex-col items-center cursor-default"
                >
                  {/* Premium Frosted Frame */}
                  <div className="w-full relative shadow-[0_40px_100px_rgba(224,169,165,0.4)] rounded-[3rem] p-3 bg-white/10 backdrop-blur-2xl border border-white/20">
                    <div className="w-full rounded-[2.5rem] overflow-hidden relative flex items-center justify-center bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPhoto.url}
                          alt={selectedPhoto.caption || "View memory"}
                          className="w-full h-auto max-h-[60vh] object-contain"
                        />
                    </div>
                  </div>

                  {/* Captions and Actions Below Card */}
                  <div className="mt-8 flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-widest uppercase text-white bg-white/15 px-6 py-3 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-2">
                        <Heart className="text-pink-400" size={16} fill="currentColor" />
                        By {selectedPhoto.uploader}
                      </span>
                    </div>
                    
                    {typeof window !== "undefined" && localStorage.getItem("couple-user") === selectedPhoto.uploader && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialog({
                            isOpen: true,
                            type: "confirm",
                            title: "Delete Memory?",
                            message: "Are you sure you want to delete this precious memory? This cannot be undone.",
                            onConfirm: async () => {
                              const username = localStorage.getItem("couple-user");
                              try {
                                setIsDeleting(true);
                                const res = await fetch(`/api/photos?id=${selectedPhoto._id}&username=${username}`, {
                                  method: "DELETE"
                                });
                                if (res.ok) {
                                  mutate();
                                  setSelectedPhoto(null);
                                } else {
                                  const err = await res.json();
                                  setDialog({ isOpen: true, type: "alert", title: "Error", message: err.error || "Failed to delete photo" });
                                }
                              } catch (err) {
                                console.error("Delete Error:", err);
                                setDialog({ isOpen: true, type: "alert", title: "Error", message: "Error deleting photo" });
                              } finally {
                                setIsDeleting(false);
                              }
                            }
                          });
                        }}
                        disabled={isDeleting}
                        className="bg-red-500/80 hover:bg-red-500 text-white text-[10px] uppercase tracking-widest font-black px-6 py-3 rounded-[2rem] backdrop-blur-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />} 
                        {isDeleting ? "Deleting..." : "Delete Photo"}
                      </button>
                    )}
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Custom Dialog Modal */}
          <AnimatePresence>
            {dialog.isOpen && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
              >
                <m.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-4"
                >
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">{dialog.title}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">{dialog.message}</p>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-4 rounded-[1.5rem] bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                      {dialog.type === "confirm" ? "Cancel" : "Okay"}
                    </button>
                    {dialog.type === "confirm" && (
                      <button
                        onClick={() => {
                          setDialog(prev => ({ ...prev, isOpen: false }));
                          dialog.onConfirm?.();
                        }}
                        className="flex-1 py-4 rounded-[1.5rem] bg-[var(--color-primary)] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-pink-200 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
