import { NextResponse } from "next/server";
import { loadGallerySections } from "@/lib/gallery";

// Public: gallery sections (heading + photos / videos), empty sections left out.
export async function GET() {
    try {
        return NextResponse.json(await loadGallerySections());
    } catch {
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }
}
