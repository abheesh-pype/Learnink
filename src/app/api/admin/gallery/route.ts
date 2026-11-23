import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { GalleryPhoto } from "@/lib/models";
import { getServerSession } from "next-auth";
import { isUploadedImagePath, normalizeImageUrl } from "@/lib/imageUrl";
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

        // Either a file uploaded via /api/upload, or an http(s) image link (Drive links are converted).
        const raw = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
        const imageUrl = isUploadedImagePath(raw) ? raw : normalizeImageUrl(raw);
        if (!imageUrl) {
            return NextResponse.json(
                { error: "Upload an image or paste a valid image link (https://…)." },
                { status: 400 }
            );
        }

        const photo = await GalleryPhoto.create({ ...body, imageUrl });
        refreshPublicPages();
        return NextResponse.json(photo);
    } catch {
        return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
    }
}
