import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { GalleryPhoto, GallerySection } from "@/lib/models";
import { UUID_RE } from "@/lib/gallery";
import { getServerSession } from "next-auth";
import { isUploadedImagePath, normalizeImageUrl } from "@/lib/imageUrl";
import { isUploadedVideoPath, normalizeVideoUrl } from "@/lib/videoUrl";
import { refreshPublicPages } from "@/lib/revalidate";

export async function GET() {
    try {
        await dbConnect();
        const photos = await GalleryPhoto.find({}).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(photos);
    } catch {
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await req.json();

        // Every item belongs to a section (heading).
        const sectionId = typeof body.sectionId === "string" ? body.sectionId : "";
        if (!UUID_RE.test(sectionId) || !(await GallerySection.findById(sectionId))) {
            return NextResponse.json({ error: "Choose a gallery section first." }, { status: 400 });
        }

        const mediaType = body.mediaType === "video" ? "video" : "image";
        const raw = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

        // Either a file uploaded via /api/upload, or a link (Drive / YouTube links are converted).
        const imageUrl =
            mediaType === "video"
                ? isUploadedVideoPath(raw) ? raw : normalizeVideoUrl(raw)
                : isUploadedImagePath(raw) ? raw : normalizeImageUrl(raw);
        if (!imageUrl) {
            return NextResponse.json(
                {
                    error: mediaType === "video"
                        ? "Upload a video or paste a valid YouTube, Google Drive or video link (https://…)."
                        : "Upload an image or paste a valid image link (https://…).",
                },
                { status: 400 }
            );
        }

        const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 300) : "";
        // New items go to the end of their section unless a position is given.
        let order = Number(body.order);
        if (!Number.isFinite(order)) {
            const last = await GalleryPhoto.findOne({ sectionId }).sort({ order: -1 }).lean();
            order = (last?.order ?? -1) + 1;
        }
        const photo = await GalleryPhoto.create({ imageUrl, mediaType, caption, order: Math.trunc(order), sectionId });
        refreshPublicPages();
        return NextResponse.json(photo);
    } catch {
        return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
    }
}
