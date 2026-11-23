"use client";

import { useId, useRef, useState } from "react";
import {
    AlertCircle, ArrowDown, ArrowUp, Check, CheckCircle2, Film, ImagePlus, Link2, Loader2, Pencil, Trash2, X,
} from "lucide-react";
import GalleryMedia from "@/components/GalleryMedia";
import { cn } from "@/lib/utils";

export interface AdminGalleryItem {
    _id: string;
    imageUrl: string;
    mediaType?: "image" | "video";
    caption?: string;
}

export interface AdminGallerySection {
    _id: string;
    title: string;
    description?: string | null;
    order: number;
    items: AdminGalleryItem[];
}

// Keep in sync with /api/upload.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

type UploadState = { name: string; status: "waiting" | "uploading" | "done" | "error"; error?: string };

interface Props {
    section: AdminGallerySection;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: -1 | 1) => void;
    onChanged: () => void; // reload the gallery from the server
    onDeleted: () => void;
}

const inputClass =
    "w-full rounded-md border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none";

/** One gallery heading with its photos / videos: rename, reorder, bulk upload, add by link, captions, delete. */
export default function GallerySectionCard({ section, isFirst, isLast, onMove, onChanged, onDeleted }: Props) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(section.title);
    const [description, setDescription] = useState(section.description ?? "");
    const [savingHeading, setSavingHeading] = useState(false);
    const [error, setError] = useState("");

    const [uploads, setUploads] = useState<UploadState[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const [linkType, setLinkType] = useState<"image" | "video">("image");
    const [link, setLink] = useState("");
    const [addingLink, setAddingLink] = useState(false);

    const busy = uploads.some((u) => u.status === "waiting" || u.status === "uploading");
    const photoCount = section.items.filter((i) => i.mediaType !== "video").length;
    const videoCount = section.items.length - photoCount;

    // --- Heading ---------------------------------------------------------------

    const saveHeading = async () => {
        setError("");
        if (!title.trim()) return setError("Please enter a heading.");
        setSavingHeading(true);
        const res = await fetch(`/api/admin/gallery-sections/${section._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
        }).catch(() => null);
        setSavingHeading(false);
        if (!res?.ok) {
            const data = await res?.json().catch(() => ({}));
            return setError(data?.error || "Couldn't save the heading.");
        }
        setEditing(false);
        onChanged();
    };

    const deleteSection = async () => {
        const count = section.items.length;
        const message = count
            ? `Delete "${section.title}" and its ${count} photo/video item${count === 1 ? "" : "s"}? This can't be undone.`
            : `Delete "${section.title}"?`;
        if (!confirm(message)) return;
        const res = await fetch(`/api/admin/gallery-sections/${section._id}`, { method: "DELETE" }).catch(() => null);
        if (res?.ok) onDeleted();
        else setError("Couldn't delete the section.");
    };

    // --- Bulk upload -------------------------------------------------------------

    const addItem = async (imageUrl: string, mediaType: "image" | "video") => {
        const res = await fetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sectionId: section._id, imageUrl, mediaType }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Couldn't add it to the gallery.");
    };

    const uploadFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (!files.length) return;
        setError("");
        setUploads(files.map((f) => ({ name: f.name, status: "waiting" })));
        const mark = (i: number, patch: Partial<UploadState>) =>
            setUploads((list) => list.map((u, j) => (j === i ? { ...u, ...patch } : u)));

        // One at a time, so items keep the order they were picked in.
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isVideo = VIDEO_TYPES.includes(file.type);
            if (!isVideo && !IMAGE_TYPES.includes(file.type)) {
                mark(i, { status: "error", error: "Not a supported photo or video type" });
                continue;
            }
            if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
                mark(i, { status: "error", error: isVideo ? "Video is over 50 MB" : "Photo is over 5 MB" });
                continue;
            }
            mark(i, { status: "uploading" });
            try {
                const data = new FormData();
                data.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: data });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(json.error || "Upload failed");
                await addItem(json.url, isVideo ? "video" : "image");
                mark(i, { status: "done" });
            } catch (err) {
                mark(i, { status: "error", error: err instanceof Error ? err.message : "Upload failed" });
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        onChanged();
    };

    const addLink = async () => {
        if (!link.trim()) return;
        setError("");
        setAddingLink(true);
        try {
            await addItem(link.trim(), linkType);
            setLink("");
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't add the link.");
        } finally {
            setAddingLink(false);
        }
    };

    // --- Items ---------------------------------------------------------------------

    const deleteItem = async (id: string) => {
        if (!confirm("Remove this from the gallery?")) return;
        const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" }).catch(() => null);
        if (res?.ok) onChanged();
        else setError("Couldn't remove the item.");
    };

    const saveCaption = async (item: AdminGalleryItem, caption: string) => {
        if ((item.caption ?? "") === caption.trim()) return;
        const res = await fetch(`/api/admin/gallery/${item._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caption }),
        }).catch(() => null);
        if (res?.ok) onChanged();
        else setError("Couldn't save the caption.");
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white">
            {/* Heading bar */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                {editing ? (
                    <div className="flex-1 space-y-2">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} placeholder="Heading" autoFocus />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={2}
                            className={cn(inputClass, "resize-y font-medium")}
                            placeholder="Short description (optional)"
                        />
                        <div className="flex gap-2">
                            <button onClick={saveHeading} disabled={savingHeading} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
                                {savingHeading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setTitle(section.title);
                                    setDescription(section.description ?? "");
                                }}
                                className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                        {section.description && <p className="mt-1 text-sm text-slate-600">{section.description}</p>}
                        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {photoCount} photo{photoCount === 1 ? "" : "s"} · {videoCount} video{videoCount === 1 ? "" : "s"}
                            {section.items.length === 0 && " · hidden on the website until you add something"}
                        </p>
                    </div>
                )}

                {!editing && (
                    <div className="flex shrink-0 items-center gap-1">
                        <IconButton label="Move section up" onClick={() => onMove(-1)} disabled={isFirst}><ArrowUp size={18} /></IconButton>
                        <IconButton label="Move section down" onClick={() => onMove(1)} disabled={isLast}><ArrowDown size={18} /></IconButton>
                        <IconButton label="Rename section" onClick={() => setEditing(true)}><Pencil size={18} /></IconButton>
                        <IconButton label="Delete section" onClick={deleteSection} danger><Trash2 size={18} /></IconButton>
                    </div>
                )}
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {/* Bulk upload */}
                <div>
                    <input
                        ref={fileInputRef}
                        id={inputId}
                        type="file"
                        multiple
                        accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
                        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                        className="sr-only"
                        disabled={busy}
                    />
                    <label
                        htmlFor={inputId}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            if (!busy) uploadFiles(e.dataTransfer.files);
                        }}
                        className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-7 text-center transition-colors",
                            dragOver ? "border-primary bg-primary-50 text-primary" : "border-slate-300 bg-slate-50 text-slate-500 hover:border-primary hover:text-primary",
                            busy && "pointer-events-none opacity-60"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <ImagePlus size={24} /> <Film size={24} />
                        </span>
                        <span className="text-sm font-bold">Add photos &amp; videos — choose or drop several at once</span>
                        <span className="text-xs">Photos: JPG, PNG, WebP, GIF, AVIF up to 5 MB · Videos: MP4, WebM, MOV up to 50 MB</span>
                    </label>

                    {uploads.length > 0 && (
                        <ul className="mt-3 space-y-1.5 text-sm">
                            {uploads.map((u, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    {u.status === "done" && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
                                    {u.status === "error" && <AlertCircle size={16} className="shrink-0 text-rose-600" />}
                                    {(u.status === "uploading" || u.status === "waiting") && (
                                        <Loader2 size={16} className={cn("shrink-0", u.status === "uploading" ? "animate-spin text-primary" : "text-slate-300")} />
                                    )}
                                    <span className="truncate font-medium text-slate-700">{u.name}</span>
                                    {u.error && <span className="shrink-0 text-rose-600">— {u.error}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Add by link */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        value={linkType}
                        onChange={(e) => setLinkType(e.target.value as "image" | "video")}
                        className="rounded-md border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-primary focus:outline-none"
                        aria-label="Link type"
                    >
                        <option value="image">Photo link</option>
                        <option value="video">Video link</option>
                    </select>
                    <div className="relative flex-1">
                        <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                            placeholder={linkType === "video" ? "YouTube, Google Drive or video link" : "Google Images, Drive or image link"}
                            className={cn(inputClass, "pl-9")}
                        />
                    </div>
                    <button
                        onClick={addLink}
                        disabled={addingLink || !link.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                    >
                        {addingLink ? <Loader2 size={16} className="animate-spin" /> : "Add link"}
                    </button>
                </div>

                {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

                {/* Items */}
                {section.items.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((item) => (
                            <div key={item._id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                                <div className="relative h-32 bg-slate-100">
                                    <GalleryMedia url={item.imageUrl} mediaType={item.mediaType} alt={item.caption || "Gallery item"} className="absolute inset-0" />
                                    {item.mediaType === "video" && (
                                        <span className="pointer-events-none absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                            <Film size={10} /> Video
                                        </span>
                                    )}
                                    <button
                                        onClick={() => deleteItem(item._id)}
                                        className="absolute right-1.5 top-1.5 rounded bg-white/90 p-1.5 text-slate-600 shadow hover:text-rose-600"
                                        aria-label="Remove from gallery"
                                        title="Remove"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <input
                                    defaultValue={item.caption ?? ""}
                                    onBlur={(e) => saveCaption(item, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                    maxLength={300}
                                    placeholder="Add caption…"
                                    className="w-full border-0 border-t border-slate-100 px-2.5 py-2 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:bg-primary-50 focus:outline-none"
                                    aria-label="Caption"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function IconButton({
    label, onClick, disabled, danger, children,
}: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
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
