"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Film, Link2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isEmbeddedVideo, normalizeVideoUrl } from "@/lib/videoUrl";
import { EMPTY_IMAGE, type PickedImage } from "@/components/admin/ImagePicker";

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 50 * 1024 * 1024; // keep in sync with /api/upload

type SourceMode = "upload" | "link";
type LinkStatus = "idle" | "loading" | "ok" | "error";

/**
 * Video field with two sources: upload an MP4 / WebM / MOV file, or paste a YouTube, Google Drive or
 * direct video link. Reports the same `PickedImage` shape as ImagePicker, so `resolvePickedImage` uploads it.
 * Reset it by changing its `key`.
 */
export default function VideoPicker({ onChange }: { onChange: (video: PickedImage) => void }) {
    const [mode, setMode] = useState<SourceMode>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState("");
    const [linkInput, setLinkInput] = useState("");
    const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const linkUrl = linkInput.trim() ? normalizeVideoUrl(linkInput) : null;
    const embedded = linkUrl ? isEmbeddedVideo(linkUrl) : false;
    // YouTube / Drive players can't report load errors to us, so a valid link counts as ready.
    const linkReady = embedded || linkStatus === "ok";

    useEffect(() => {
        if (mode === "upload") {
            onChange(file ? { empty: false, ready: true, file, url: null } : EMPTY_IMAGE);
        } else if (!linkInput.trim()) {
            onChange(EMPTY_IMAGE);
        } else {
            onChange({ empty: false, ready: !!linkUrl && linkReady, file: null, url: linkUrl });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, file, linkInput, linkStatus]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const selectFile = (selected: File | null) => {
        setFileError("");
        if (selected && !ACCEPTED_TYPES.includes(selected.type)) {
            setFileError("Only MP4, WebM or MOV videos are allowed.");
            selected = null;
        } else if (selected && selected.size > MAX_BYTES) {
            setFileError("Video must be 50 MB or smaller. Upload it to YouTube and paste the link instead.");
            selected = null;
        }
        setFile(selected);
        setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
        if (!selected && fileInputRef.current) fileInputRef.current.value = "";
    };

    const changeLink = (value: string) => {
        setLinkInput(value);
        setLinkStatus(value.trim() && normalizeVideoUrl(value) ? "loading" : "idle");
    };

    const box = "relative w-full h-48 rounded-md overflow-hidden border-2 border-slate-200 bg-slate-900";

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-1" role="tablist" aria-label="Video source">
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
                            "flex items-center justify-center gap-2 rounded py-2 text-sm font-bold transition-colors",
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
                        className="w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-900 transition-colors focus:border-primary focus:outline-none"
                        placeholder="Paste a YouTube, Google Drive or video link"
                    />
                    <p className="pl-1 text-xs text-slate-500">
                        Google Drive videos must be shared as &quot;Anyone with the link&quot;.
                    </p>
                    {linkInput.trim() && !linkUrl && (
                        <p className="pl-1 text-sm font-bold text-rose-600">
                            That doesn&apos;t look like a video link. It should start with https://
                        </p>
                    )}
                    {linkUrl && (
                        <div className={box}>
                            {embedded ? (
                                <iframe
                                    key={linkUrl}
                                    src={linkUrl}
                                    title="Video preview"
                                    className="h-full w-full"
                                    allow="encrypted-media; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <>
                                    <video
                                        key={linkUrl}
                                        src={linkUrl}
                                        controls
                                        preload="metadata"
                                        onLoadedMetadata={() => setLinkStatus("ok")}
                                        onError={() => setLinkStatus("error")}
                                        className={cn("h-full w-full object-contain", linkStatus !== "ok" && "invisible")}
                                    />
                                    {linkStatus === "loading" && (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                            <Loader2 className="animate-spin" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {!embedded && linkStatus === "error" && (
                        <p className="pl-1 text-sm font-bold text-rose-600">
                            This link didn&apos;t load a video. Use a YouTube or Drive link, or a direct link to an MP4/WebM file.
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
                        <div className={box}>
                            <video src={previewUrl} controls preload="metadata" className="h-full w-full object-contain" />
                            <button
                                type="button"
                                onClick={() => selectFile(null)}
                                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow hover:text-rose-500"
                                aria-label="Remove selected video"
                            >
                                <X size={16} />
                            </button>
                            <p className="pointer-events-none absolute inset-x-0 top-0 truncate bg-black/50 px-3 py-1.5 text-xs font-bold text-white">
                                {file?.name} · {file ? (file.size / 1024 / 1024).toFixed(1) : 0} MB
                            </p>
                        </div>
                    ) : (
                        <label
                            htmlFor={inputId}
                            className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-primary hover:text-primary"
                        >
                            <Film size={32} />
                            <span className="text-sm font-bold">Choose a video from your computer</span>
                            <span className="text-xs">MP4, WebM or MOV · max 50 MB</span>
                        </label>
                    )}
                    {fileError && <p className="pl-1 text-sm font-bold text-rose-600">{fileError}</p>}
                </>
            )}
        </div>
    );
}
