"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/imageUrl";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024; // keep in sync with /api/upload

type SourceMode = "upload" | "link";
type LinkStatus = "idle" | "loading" | "ok" | "error";

/** What the admin has picked. `ready` means it can be saved; `empty` means nothing was picked. */
export interface PickedImage {
    empty: boolean;
    ready: boolean;
    file: File | null;
    url: string | null;
}

export const EMPTY_IMAGE: PickedImage = { empty: true, ready: false, file: null, url: null };

/** Uploads a picked file (or returns the picked link). Returns null when nothing was picked. */
export async function resolvePickedImage(image: PickedImage): Promise<string | null> {
    if (image.file) {
        const data = new FormData();
        data.append("file", image.file);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed.");
        return json.url;
    }
    return image.url;
}

interface ImagePickerProps {
    onChange: (image: PickedImage) => void;
    /** "wide" for gallery photos, "avatar" for small square profile pictures. */
    variant?: "wide" | "avatar";
}

/**
 * Image field with two sources: upload from the computer, or paste a link
 * (Google Images, Google Drive share links, or any direct image URL).
 * Reset it by changing its `key`.
 */
export default function ImagePicker({ onChange, variant = "wide" }: ImagePickerProps) {
    const [mode, setMode] = useState<SourceMode>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState("");
    const [linkInput, setLinkInput] = useState("");
    const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const linkUrl = linkInput.trim() ? normalizeImageUrl(linkInput) : null;
    const avatar = variant === "avatar";
    const previewBox = avatar
        ? "relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50"
        : "relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50";

    // Report the current selection to the parent form.
    useEffect(() => {
        if (mode === "upload") {
            onChange(file ? { empty: false, ready: true, file, url: null } : EMPTY_IMAGE);
        } else if (!linkInput.trim()) {
            onChange(EMPTY_IMAGE);
        } else {
            onChange({ empty: false, ready: linkStatus === "ok", file: null, url: linkUrl });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, file, linkInput, linkStatus]);

    // Free the local preview when the selected file changes or the picker unmounts.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const selectFile = (selected: File | null) => {
        setFileError("");
        if (selected && !ACCEPTED_TYPES.includes(selected.type)) {
            setFileError("Only JPG, PNG, WebP, GIF or AVIF images are allowed.");
            selected = null;
        } else if (selected && selected.size > MAX_BYTES) {
            setFileError("Image must be 5 MB or smaller.");
            selected = null;
        }
        setFile(selected);
        setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
        if (!selected && fileInputRef.current) fileInputRef.current.value = "";
    };

    const changeLink = (value: string) => {
        setLinkInput(value);
        setLinkStatus(value.trim() && normalizeImageUrl(value) ? "loading" : "idle");
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100" role="tablist" aria-label="Image source">
                {([
                    { id: "upload", label: "Upload", icon: Upload },
                    { id: "link", label: "Link", icon: Link2 },
                ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={mode === id}
                        onClick={() => setMode(id)}
                        className={cn(
                            "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                            mode === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <Icon size={16} /> {label}
                    </button>
                ))}
            </div>

            {mode === "link" ? (
                <div className="space-y-2">
                    <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => changeLink(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/15 transition-all text-slate-900 font-bold"
                        placeholder="Paste a Google Images, Drive or image link"
                    />
                    <p className="text-xs text-slate-500 pl-1">
                        Google Drive files must be shared as &quot;Anyone with the link&quot;.
                    </p>
                    {linkInput.trim() && !linkUrl && (
                        <p className="text-sm font-bold text-rose-600 pl-1">
                            That doesn&apos;t look like an image link. It should start with https://
                        </p>
                    )}
                    {linkUrl && (
                        <div className={previewBox}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                key={linkUrl}
                                src={linkUrl}
                                alt="Linked image preview"
                                referrerPolicy="no-referrer"
                                onLoad={() => setLinkStatus("ok")}
                                onError={() => setLinkStatus("error")}
                                className={cn("w-full h-full object-cover", linkStatus !== "ok" && "invisible")}
                            />
                            {linkStatus === "loading" && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                    {linkStatus === "error" && (
                        <p className="text-sm font-bold text-rose-600 pl-1">
                            This link didn&apos;t load an image. Check it&apos;s a direct image link, or that the Drive file is shared publicly.
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <input
                        ref={fileInputRef}
                        id={inputId}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
                        className="sr-only"
                    />
                    {previewUrl ? (
                        <div className={previewBox}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="Selected image preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => selectFile(null)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-700 hover:text-rose-500 shadow"
                                aria-label="Remove selected image"
                            >
                                <X size={16} />
                            </button>
                            {!avatar && (
                                <p className="absolute bottom-0 inset-x-0 px-3 py-1.5 bg-black/50 text-white text-xs font-bold truncate">{file?.name}</p>
                            )}
                        </div>
                    ) : (
                        <label
                            htmlFor={inputId}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 cursor-pointer hover:border-primary hover:text-primary transition-all",
                                avatar ? "h-28" : "h-48"
                            )}
                        >
                            <ImagePlus size={avatar ? 24 : 32} />
                            <span className="font-bold text-sm">Choose an image from your computer</span>
                            <span className="text-xs">JPG, PNG, WebP, GIF or AVIF · max 5 MB</span>
                        </label>
                    )}
                    {fileError && <p className="text-sm font-bold text-rose-600 pl-1">{fileError}</p>}
                </>
            )}
        </div>
    );
}
