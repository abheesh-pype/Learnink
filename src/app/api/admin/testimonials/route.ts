import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Testimonial } from "@/lib/models";
import { getServerSession } from "next-auth";
import { isUploadedImagePath, normalizeImageUrl } from "@/lib/imageUrl";
import { refreshPublicPages } from "@/lib/revalidate";
import { expandGoogleShortLink } from "@/lib/googleLink";

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

        const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
        const name = text(body.name, 120);
        const content = text(body.content, 2000);
        if (!name || !content) {
            return NextResponse.json({ error: "Please enter the student's name and the review text." }, { status: 400 });
        }
        const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating)) || 5));
        const order = Number.isFinite(Number(body.order)) ? Math.trunc(Number(body.order)) : 0;

        // Copied from a Google review: tagged on the website, with an optional link to the original review.
        const source = body.source === "google" ? "google" : "website";
        let sourceUrl = source === "google" ? text(body.sourceUrl, 1000) : "";
        if (sourceUrl && !/^https:\/\/\S+$/i.test(sourceUrl)) {
            return NextResponse.json({ error: "The Google review link must start with https://" }, { status: 400 });
        }
        if (sourceUrl) sourceUrl = await expandGoogleShortLink(sourceUrl);

        const testimonial = await Testimonial.create({
            name,
            content,
            role: text(body.role, 120),
            rating,
            order,
            imageUrl,
            source,
            sourceUrl: sourceUrl || null,
        });
        refreshPublicPages();
        return NextResponse.json(testimonial);
    } catch {
        return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
    }
}
