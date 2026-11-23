import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Testimonial } from "@/lib/models";
import { getServerSession } from "next-auth";
import { isUploadedImagePath, normalizeImageUrl } from "@/lib/imageUrl";
import { refreshPublicPages } from "@/lib/revalidate";

export async function GET() {
    try {
        await dbConnect();
        const testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(testimonials);
    } catch {
        return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await req.json();

        // Profile image is optional: an uploaded file (/uploads/...) or an http(s) link (Drive links are converted).
        const raw = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
        let imageUrl: string | null = null;
        if (raw) {
            imageUrl = isUploadedImagePath(raw) ? raw : normalizeImageUrl(raw);
            if (!imageUrl) {
                return NextResponse.json({ error: "The profile image link isn't valid." }, { status: 400 });
            }
        }

        const testimonial = await Testimonial.create({ ...body, imageUrl });
        refreshPublicPages();
        return NextResponse.json(testimonial);
    } catch {
        return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
    }
}
