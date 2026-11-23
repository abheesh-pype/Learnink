"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import ImagePicker, { EMPTY_IMAGE, resolvePickedImage, type PickedImage } from "@/components/admin/ImagePicker";

interface Photo {
    _id: string;
    imageUrl: string;
    caption?: string;
    order: number;
}

export default function AdminGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [image, setImage] = useState<PickedImage>(EMPTY_IMAGE);
    const [pickerKey, setPickerKey] = useState(0); // bump to reset the image picker
    const [error, setError] = useState("");
    const [caption, setCaption] = useState("");
    const [order, setOrder] = useState("0");

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const res = await fetch("/api/admin/gallery");
            if (res.ok) {
                const data = await res.json();
                setPhotos(data);
            }
        } catch (error) {
            console.error("Failed to fetch gallery", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image.ready) {
            setError("Please upload an image or paste a link that loads in the preview.");
            return;
        }
        setSubmitting(true);
        setError("");

        try {
            const imageUrl = await resolvePickedImage(image);
            const res = await fetch("/api/admin/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl, caption, order: parseInt(order) || 0 }),
            });
            const saved = await res.json();
            if (!res.ok) throw new Error(saved.error || "Failed to add photo.");

            setPickerKey((k) => k + 1);
            setImage(EMPTY_IMAGE);
            setCaption("");
            setOrder((prev) => ((parseInt(prev) || 0) + 1).toString());
            fetchPhotos();
        } catch (err) {
            console.error("Failed to add photo", err);
            setError(err instanceof Error ? err.message : "Failed to add photo.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
            if (res.ok) fetchPhotos();
        } catch (error) {
            console.error("Failed to delete photo", error);
        }
    };

    return (
        <div className="animate-[fade-in_0.5s_ease-out_forwards] space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-2">Photo Gallery</h1>
                <p className="text-slate-600 font-medium">Add photos of your campus, events, and milestones.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm sticky top-10">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 text-slate-800">
                            <div className="icon-tile w-10 h-10">
                                <Plus size={20} />
                            </div>
                            <h3 className="text-xl font-bold">Add Photo</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Image</label>
                                <ImagePicker key={pickerKey} onChange={setImage} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Caption</label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/15 transition-all text-slate-900 font-bold"
                                    placeholder="Brief description"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Order</label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/15 transition-all text-slate-900 font-bold"
                                />
                            </div>
                            {error && <p className="text-sm font-bold text-rose-600 pl-1">{error}</p>}
                            <button
                                type="submit"
                                disabled={submitting || !image.ready}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold hover:shadow-sm transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Add to Gallery"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {photos.map((photo) => (
                                <div key={photo._id} className="bg-white rounded-lg border border-slate-200 overflow-hidden group shadow-sm hover:shadow-sm transition-all relative">
                                    <div className="relative w-full h-48">
                                        {/* Plain <img>: images can come from any host (uploads, Google, Drive). */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={photo.imageUrl}
                                            alt={photo.caption || "Gallery Image"}
                                            referrerPolicy="no-referrer"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <p className="font-bold text-slate-800 truncate">{photo.caption || "No Caption"}</p>
                                        <button onClick={() => handleDelete(photo._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
