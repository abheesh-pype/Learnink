import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (gallery videos)

// Raster images (SVG is excluded on purpose: it can carry scripts) and common web video formats.
const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
};
const VIDEO_EXTS = ["mp4", "webm", "mov"];

// Check the file's real format from its first bytes; the browser-reported type can be faked.
function hasValidSignature(bytes: Buffer, ext: string) {
    const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
    switch (ext) {
        case "jpg": return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        case "png": return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        case "gif": return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
        case "webp": return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
        case "avif": return ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));
        case "mp4":
        case "mov": return ascii(4, 8) === "ftyp";
        case "webm": return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
        default: return false;
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const ext = ALLOWED_TYPES[file.type];
        if (!ext) {
            return NextResponse.json(
                { error: "Only JPG, PNG, WebP, GIF or AVIF images, or MP4, WebM or MOV videos are allowed." },
                { status: 400 }
            );
        }

        const isVideo = VIDEO_EXTS.includes(ext);
        if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
            return NextResponse.json(
                { error: isVideo ? "Video must be 50 MB or smaller." : "Image must be 5 MB or smaller." },
                { status: 400 }
            );
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        if (!hasValidSignature(bytes, ext)) {
            return NextResponse.json({ error: `This file is not a valid ${isVideo ? "video" : "image"}.` }, { status: 400 });
        }

        // Server-generated name: never trust the client's filename.
        const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), bytes);

        return NextResponse.json({ message: "Success", url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
