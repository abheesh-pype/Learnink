"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Star } from "lucide-react";
import ImagePicker, { EMPTY_IMAGE, resolvePickedImage, type PickedImage } from "@/components/admin/ImagePicker";
import TestimonialAvatar from "@/components/TestimonialAvatar";
import GoogleReviewTag from "@/components/GoogleReviewTag";

interface Testimonial {
    _id: string;
    name: string;
    content: string;
    role?: string;
    imageUrl?: string;
    rating: number;
    order: number;
    source?: "website" | "google";
    sourceUrl?: string | null;
}

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [role, setRole] = useState("");
    const [image, setImage] = useState<PickedImage>(EMPTY_IMAGE);
    const [pickerKey, setPickerKey] = useState(0); // bump to reset the image picker
    const [error, setError] = useState("");
    const [rating, setRating] = useState(5);
    const [order, setOrder] = useState("0");
    // Copied from a Google review: shows a "Google review" tag on the website.
    const [fromGoogle, setFromGoogle] = useState(false);
    const [sourceUrl, setSourceUrl] = useState("");

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/admin/testimonials");
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error("Failed to fetch testimonials", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // The profile image is optional, but if one was picked it must be usable.
        if (!image.empty && !image.ready) {
            setError("The profile image link didn't load. Fix or clear it before publishing.");
            return;
        }
        setSubmitting(true);
        setError("");

        try {
            const imageUrl = await resolvePickedImage(image);
            const res = await fetch("/api/admin/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, content, role, imageUrl, rating, order: parseInt(order) || 0,
                    source: fromGoogle ? "google" : "website",
                    sourceUrl: fromGoogle ? sourceUrl : "",
                }),
            });
            const saved = await res.json();
            if (!res.ok) throw new Error(saved.error || "Failed to add testimonial.");

            setName("");
            setContent("");
            setRole("");
            setSourceUrl("");
            setPickerKey((k) => k + 1);
            setImage(EMPTY_IMAGE);
            setOrder((prev) => ((parseInt(prev) || 0) + 1).toString());
            fetchTestimonials();
        } catch (err) {
            console.error("Failed to add testimonial", err);
            setError(err instanceof Error ? err.message : "Failed to add testimonial.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
            fetchTestimonials();
        } catch (error) {
            console.error("Failed to delete testimonial", error);
        }
    };

    return (
        <div className="animate-[fade-in_0.5s_ease-out_forwards] space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-2">Testimonials</h1>
                <p className="text-slate-600 font-medium">Manage student reviews and success stories.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm sticky top-10">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 text-slate-800">
                            <div className="icon-tile w-10 h-10">
                                <Plus size={20} />
                            </div>
                            <h3 className="text-xl font-bold">Add Testimonial</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Student Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet focus:outline-none transition-all font-bold" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Role/Program</label>
                                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet focus:outline-none transition-all font-bold" placeholder="e.g. MBA Student" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                    Profile Image <span className="normal-case tracking-normal font-medium text-slate-400">(optional)</span>
                                </label>
                                <ImagePicker key={pickerKey} onChange={setImage} variant="avatar" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Rating (1-5)</label>
                                <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet focus:outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Content</label>
                                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet focus:outline-none transition-all font-medium h-32" required />
                            </div>
                            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={fromGoogle}
                                        onChange={(e) => setFromGoogle(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 accent-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-bold text-slate-800">This is a Google review</span>
                                        <span className="block text-xs text-slate-500">Shows a &quot;Google review&quot; tag on the website. Copy the reviewer&apos;s name, stars and text exactly as on Google.</span>
                                    </span>
                                </label>
                                {fromGoogle && (
                                    <div className="space-y-1.5">
                                        <label htmlFor="google-review-url" className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                                            Link to the review <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
                                        </label>
                                        <input
                                            id="google-review-url"
                                            type="url"
                                            value={sourceUrl}
                                            onChange={(e) => setSourceUrl(e.target.value)}
                                            placeholder="https://maps.app.goo.gl/..."
                                            className="w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                                        />
                                        <p className="pl-1 text-xs text-slate-500">
                                            In Google Maps, open the review → Share → Copy link. Visitors can click the tag to read it on Google.
                                            Short links (maps.app.goo.gl) are changed to the full Google Maps address when possible; you can also paste the full address from the browser bar.
                                        </p>
                                    </div>
                                )}
                            </div>
                            {error && <p className="text-sm font-bold text-rose-600 pl-1">{error}</p>}
                            <button type="submit" disabled={submitting || (!image.empty && !image.ready)} className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold hover:shadow-sm transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                {submitting ? <Loader2 className="animate-spin" /> : "Publish Testimonial"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
                    ) : (
                        <div className="space-y-4">
                            {testimonials.map((item) => (
                                <div key={item._id} className="bg-white p-6 rounded-lg border border-slate-200 flex items-start gap-6 group hover:border-violet/50 hover:shadow-sm transition-all duration-300">
                                    <TestimonialAvatar name={item.name} imageUrl={item.imageUrl} />
                                    <div className="flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-3">
                                            <h4 className="font-black text-slate-800">{item.name}</h4>
                                            <div className="flex text-primary" aria-label={`Rated ${item.rating} out of 5`}>
                                                {Array.from({ length: item.rating }, (_, i) => <Star key={i} size={12} className="fill-current" />)}
                                            </div>
                                            {item.source === "google" && <GoogleReviewTag url={item.sourceUrl} />}
                                        </div>
                                        <p className="text-slate-500 text-sm italic">&quot;{item.content}&quot;</p>
                                    </div>
                                    <button onClick={() => handleDelete(item._id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
