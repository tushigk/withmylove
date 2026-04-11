"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { motion as m, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2, Heart } from "lucide-react";

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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("File is too large! Please select an image under 3MB.");
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
          alert("Upload failed: " + (err.error || "Unknown error"));
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
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
            <m.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "View memory"}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-8 text-white text-center">
              <span className="text-sm font-medium tracking-wide uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                Uploaded by {selectedPhoto.uploader}
              </span>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
