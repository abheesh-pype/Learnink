"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import ImagePicker, { EMPTY_IMAGE, resolvePickedImage, type PickedImage } from "@/components/admin/ImagePicker";
import { BLOG_LIMITS, type BlogSectionWithPosts } from "@/lib/blogShared";

const inputClass =
    "w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none";
const labelClass = "pl-1 text-xs font-bold uppercase tracking-widest text-slate-500";

const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface FormState {
    title: string;
    sectionId: string;
    tag: string;
    publishedAt: string;
    excerpt: string;
    content: string;
    featured: boolean;
    published: boolean;
    coverImage: string; // current saved image ("" = none)
}

const EMPTY_FORM: FormState = {
    title: "", sectionId: "", tag: "", publishedAt: today(), excerpt: "", content: "", featured: false, published: true, coverImage: "",
};

/** Admin → Blogs → New Post / Edit Post. */
export default function BlogPostEditor() {
    const { id } = useParams<{ id: string }>();
    const isNew = id === "new";
    const router = useRouter();

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [slug, setSlug] = useState("");
    const [sections, setSections] = useState<BlogSectionWithPosts[]>([]);
    const [newImage, setNewImage] = useState<PickedImage>(EMPTY_IMAGE);
    const [changingImage, setChangingImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const sectionsRes = await fetch("/api/admin/blog-sections");
                if (sectionsRes.ok) setSections((await sectionsRes.json()).sections);

                if (isNew) {
                    // "+ Post" on a heading opens /admin/blogs/new?section=<id>
                    const section = new URLSearchParams(window.location.search).get("section") ?? "";
                    setForm({ ...EMPTY_FORM, sectionId: section });
                } else {
                    const res = await fetch(`/api/admin/blog-posts/${id}`);
                    if (!res.ok) throw new Error("This post couldn't be found.");
                    const p = await res.json();
                    setSlug(p.slug);
                    setForm({
                        title: p.title ?? "",
                        sectionId: p.sectionId ?? "",
                        tag: p.tag ?? "",
                        publishedAt: String(p.publishedAt ?? today()).slice(0, 10),
                        excerpt: p.excerpt ?? "",
                        content: p.content ?? "",
                        featured: Boolean(p.featured),
                        published: Boolean(p.published),
                        coverImage: p.coverImage ?? "",
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Couldn't load the post.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isNew]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!form.title.trim()) return setError("Please enter a title.");
        if (!newImage.empty && !newImage.ready) return setError("The cover image link didn't load. Fix or clear it first.");

        setSaving(true);
        try {
            const uploaded = await resolvePickedImage(newImage); // null when no new image was picked
            const coverImage = changingImage ? uploaded ?? "" : form.coverImage;
            const res = await fetch(isNew ? "/api/admin/blog-posts" : `/api/admin/blog-posts/${id}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, coverImage }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Couldn't save the post.");
            router.push("/admin/blogs");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save the post.");
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    return (
        <form onSubmit={save} className="mx-auto max-w-4xl space-y-8 pb-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <Link href="/admin/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary">
                        <ArrowLeft size={16} /> All posts
                    </Link>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{isNew ? "New Post" : "Edit Post"}</h1>
                </div>
                {!isNew && form.published && slug && (
                    <Link href={`/blogs/${slug}`} target="_blank" className="inline-flex items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary sm:self-auto">
                        View on website <ExternalLink size={16} />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main */}
                <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="space-y-1.5">
                        <label htmlFor="post-title" className={labelClass}>Title <span className="text-rose-500">*</span></label>
                        <input id="post-title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={BLOG_LIMITS.title} className={`${inputClass} font-bold`} placeholder="e.g. Expand Your Mind: The Power of Study Abroad" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="post-excerpt" className={labelClass}>Short summary <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span></label>
                        <textarea id="post-excerpt" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} maxLength={BLOG_LIMITS.excerpt} rows={2} className={`${inputClass} resize-y`} placeholder="One or two sentences shown under the title and in search results." />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="post-content" className={labelClass}>Article</label>
                        <textarea
                            id="post-content"
                            value={form.content}
                            onChange={(e) => set("content", e.target.value)}
                            maxLength={BLOG_LIMITS.content}
                            rows={18}
                            className={`${inputClass} resize-y font-medium leading-relaxed`}
                            placeholder={"Write the article here.\n\nLeave an empty line between paragraphs.\n\n## A subheading\n\n- A bullet point\n- Another bullet point"}
                        />
                        <p className="pl-1 text-xs text-slate-500">
                            Empty line = new paragraph · start a line with <code className="rounded bg-slate-100 px-1">## </code> for a subheading ·
                            start lines with <code className="rounded bg-slate-100 px-1">- </code> for a bullet list.
                        </p>
                    </div>
                </div>

                {/* Side */}
                <div className="space-y-6">
                    <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
                        <div className="space-y-1.5">
                            <label htmlFor="post-section" className={labelClass}>Heading</label>
                            <select id="post-section" value={form.sectionId} onChange={(e) => set("sectionId", e.target.value)} className={inputClass}>
                                <option value="">No heading (More Articles)</option>
                                {sections.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="post-tag" className={labelClass}>Tag</label>
                            <input id="post-tag" value={form.tag} onChange={(e) => set("tag", e.target.value)} maxLength={BLOG_LIMITS.tag} className={inputClass} placeholder="e.g. University" />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="post-date" className={labelClass}>Date</label>
                            <input id="post-date" type="date" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputClass} />
                        </div>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                            <span>
                                <span className="block text-sm font-bold text-slate-800">Popular post</span>
                                <span className="block text-xs text-slate-500">Show under &quot;Popular Posts&quot; at the top of the Blogs page, and first in the article sidebar.</span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                            <span>
                                <span className="block text-sm font-bold text-slate-800">Published</span>
                                <span className="block text-xs text-slate-500">Untick to save as a draft (hidden on the website).</span>
                            </span>
                        </label>
                    </div>

                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
                        <span className={labelClass}>Cover image</span>
                        {form.coverImage && !changingImage ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={form.coverImage} alt="Current cover" referrerPolicy="no-referrer" className="aspect-[7/5] w-full rounded-md object-cover" />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setChangingImage(true)} className="flex-1 rounded-md border border-slate-200 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary">Change</button>
                                    <button type="button" onClick={() => set("coverImage", "")} className="flex-1 rounded-md border border-slate-200 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">Remove</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImagePicker onChange={(img) => { setNewImage(img); setChangingImage(true); }} />
                                {form.coverImage && (
                                    <button type="button" onClick={() => { setChangingImage(false); setNewImage(EMPTY_IMAGE); }} className="text-xs font-bold text-slate-500 hover:text-primary">
                                        Keep the current image
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Save bar */}
            <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                <p className="flex-1 pl-2 text-sm font-bold" aria-live="polite">
                    {error ? <span className="text-rose-600">{error}</span> : <span className="text-slate-400">{form.published ? "Will be visible on the website after saving." : "Saved as a draft (not visible)."}</span>}
                </p>
                <button type="submit" disabled={saving} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {isNew ? (form.published ? "Publish Post" : "Save Draft") : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
