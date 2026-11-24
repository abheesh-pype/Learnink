"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ExternalLink, FileText, FolderPlus, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBlogDate, type BlogPostSummary, type BlogSectionWithPosts } from "@/lib/blogShared";

const inputClass =
    "w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 focus:border-primary focus:outline-none";

/**
 * Admin → Blogs: headings (e.g. "What's in the Class") and their posts.
 * The website shows the posts ticked as "Popular post" on top, then every post under "Latest News".
 */
export default function AdminBlogs() {
    const [sections, setSections] = useState<BlogSectionWithPosts[]>([]);
    const [unsorted, setUnsorted] = useState<BlogPostSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newHeading, setNewHeading] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/blog-sections");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSections(data.sections);
            setUnsorted(data.unsorted);
            setError("");
        } catch {
            setError("Couldn't load the blog. Refresh the page to try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const createHeading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHeading.trim()) return setError("Please enter a heading.");
        setCreating(true);
        const res = await fetch("/api/admin/blog-sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newHeading }),
        }).catch(() => null);
        setCreating(false);
        if (!res?.ok) {
            const data = await res?.json().catch(() => ({}));
            return setError(data?.error || "Couldn't create the heading.");
        }
        setNewHeading("");
        setError("");
        load();
    };

    const moveHeading = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const reordered = [...sections];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setSections(reordered);
        await Promise.all(
            reordered
                .map((s, i) => ({ s, i }))
                .filter(({ s, i }) => s.order !== i)
                .map(({ s, i }) =>
                    fetch(`/api/admin/blog-sections/${s._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ order: i }),
                    })
                )
        ).catch(() => null);
        load();
    };

    const deletePost = async (post: BlogPostSummary) => {
        if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
        const res = await fetch(`/api/admin/blog-posts/${post._id}`, { method: "DELETE" }).catch(() => null);
        if (res?.ok) load();
        else setError("Couldn't delete the post.");
    };

    const total = sections.reduce((n, s) => n + s.posts.length, 0) + unsorted.length;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">Blogs</h1>
                    <p className="font-medium text-slate-600">
                        Write posts and tick &quot;Popular post&quot; on the ones to show under Popular Posts at the top of the Blogs page.
                    </p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                    <Link href="/blogs" target="_blank" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary">
                        View Blogs Page <ExternalLink size={16} />
                    </Link>
                    <Link href="/admin/blogs/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
                        <Plus size={16} /> New Post
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* New heading */}
                <div className="lg:col-span-1">
                    <form onSubmit={createHeading} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 lg:sticky lg:top-10">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 text-slate-800">
                            <div className="icon-tile h-10 w-10">
                                <FolderPlus size={20} />
                            </div>
                            <h3 className="text-xl font-bold">New Heading</h3>
                        </div>
                        <input
                            value={newHeading}
                            onChange={(e) => setNewHeading(e.target.value)}
                            maxLength={120}
                            placeholder="e.g. What's in the Class"
                            className={inputClass}
                            aria-label="Heading"
                        />
                        <button type="submit" disabled={creating} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-50">
                            {creating ? <Loader2 className="animate-spin" size={18} /> : "Create Heading"}
                        </button>
                        <p className="text-xs text-slate-500">Headings with no published posts are hidden on the website.</p>
                    </form>
                </div>

                {/* Headings and posts */}
                <div className="space-y-6 lg:col-span-2">
                    {error && <p className="font-bold text-rose-600">{error}</p>}
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-slate-500">
                                {sections.length} heading{sections.length === 1 ? "" : "s"} · {total} post{total === 1 ? "" : "s"}
                            </p>
                            {sections.map((section, i) => (
                                <HeadingCard
                                    key={section._id}
                                    section={section}
                                    isFirst={i === 0}
                                    isLast={i === sections.length - 1}
                                    onMove={(d) => moveHeading(i, d)}
                                    onChanged={load}
                                    onError={setError}
                                    onDeletePost={deletePost}
                                />
                            ))}
                            {unsorted.length > 0 && (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-white">
                                    <div className="border-b border-slate-100 p-5">
                                        <h2 className="text-lg font-bold text-slate-900">No heading</h2>
                                        <p className="text-xs text-slate-500">Shown under &quot;More Articles&quot;. Edit a post to give it a heading.</p>
                                    </div>
                                    <PostList posts={unsorted} onDelete={deletePost} />
                                </div>
                            )}
                            {sections.length === 0 && unsorted.length === 0 && (
                                <div className="rounded-lg border border-slate-200 bg-white p-16 text-center">
                                    <FileText size={40} className="mx-auto text-slate-300" />
                                    <h3 className="mt-4 text-xl font-bold text-slate-800">No posts yet</h3>
                                    <p className="mt-1 text-slate-500">Create a heading, then click &quot;New Post&quot;.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function HeadingCard({
    section, isFirst, isLast, onMove, onChanged, onError, onDeletePost,
}: {
    section: BlogSectionWithPosts;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: -1 | 1) => void;
    onChanged: () => void;
    onError: (message: string) => void;
    onDeletePost: (post: BlogPostSummary) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(section.title);

    const save = async () => {
        const res = await fetch(`/api/admin/blog-sections/${section._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        }).catch(() => null);
        if (!res?.ok) {
            const data = await res?.json().catch(() => ({}));
            return onError(data?.error || "Couldn't rename the heading.");
        }
        setEditing(false);
        onChanged();
    };

    const remove = async () => {
        const n = section.posts.length;
        const message = n
            ? `Delete the heading "${section.title}"? Its ${n} post${n === 1 ? "" : "s"} will be kept and moved to "More Articles".`
            : `Delete the heading "${section.title}"?`;
        if (!confirm(message)) return;
        const res = await fetch(`/api/admin/blog-sections/${section._id}`, { method: "DELETE" }).catch(() => null);
        if (res?.ok) onChanged();
        else onError("Couldn't delete the heading.");
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
                {editing ? (
                    <div className="flex flex-1 gap-2">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} autoFocus aria-label="Heading" />
                        <IconButton label="Save heading" onClick={save}><Check size={18} /></IconButton>
                        <IconButton label="Cancel" onClick={() => { setEditing(false); setTitle(section.title); }}><X size={18} /></IconButton>
                    </div>
                ) : (
                    <>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                            <p className="text-xs text-slate-500">{section.posts.length} post{section.posts.length === 1 ? "" : "s"}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Link href={`/admin/blogs/new?section=${section._id}`} className="mr-1 inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-100">
                                <Plus size={14} /> Post
                            </Link>
                            <IconButton label="Move heading up" onClick={() => onMove(-1)} disabled={isFirst}><ArrowUp size={18} /></IconButton>
                            <IconButton label="Move heading down" onClick={() => onMove(1)} disabled={isLast}><ArrowDown size={18} /></IconButton>
                            <IconButton label="Rename heading" onClick={() => setEditing(true)}><Pencil size={18} /></IconButton>
                            <IconButton label="Delete heading" onClick={remove} danger><Trash2 size={18} /></IconButton>
                        </div>
                    </>
                )}
            </div>
            {section.posts.length > 0 ? (
                <PostList posts={section.posts} onDelete={onDeletePost} />
            ) : (
                <p className="p-5 text-sm text-slate-500">No posts yet. Click &quot;+ Post&quot; to write one.</p>
            )}
        </section>
    );
}

function PostList({ posts, onDelete }: { posts: BlogPostSummary[]; onDelete: (post: BlogPostSummary) => void }) {
    return (
        <ul className="divide-y divide-slate-100">
            {posts.map((post) => (
                <li key={post._id} className="flex items-center gap-4 p-4">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                        {post.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-800">{post.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            {formatBlogDate(post.publishedAt)}
                            {post.tag && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold uppercase">{post.tag}</span>}
                            {post.featured && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                                    <Star size={10} className="fill-current" /> Popular
                                </span>
                            )}
                            {!post.published && <span className="rounded bg-slate-200 px-1.5 py-0.5 font-semibold text-slate-700">Draft</span>}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Link href={`/admin/blogs/${post._id}`} className={cn("rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800")} title="Edit" aria-label={`Edit ${post.title}`}>
                            <Pencil size={18} />
                        </Link>
                        <IconButton label={`Delete ${post.title}`} onClick={() => onDelete(post)} danger><Trash2 size={18} /></IconButton>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={cn(
                "rounded-md p-2 text-slate-400 transition-colors disabled:pointer-events-none disabled:opacity-30",
                danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:bg-slate-100 hover:text-slate-800"
            )}
        >
            {children}
        </button>
    );
}
