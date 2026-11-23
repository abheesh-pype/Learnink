import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { HeroEnquiry } from "@/lib/models";

const STATUSES = ["new", "contacted", "resolved"];

// Admin: change the status of a quick enquiry.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { status } = await req.json();
        if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
        await dbConnect();
        const { id } = await params;
        const updated = await HeroEnquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
        return NextResponse.json(JSON.parse(JSON.stringify(updated)));
    } catch (e) {
        console.error("Failed to update quick enquiry", e);
        return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
    }
}

// Admin: delete a quick enquiry.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;
        await HeroEnquiry.findByIdAndDelete(id);
        return NextResponse.json({ message: "Enquiry deleted" });
    } catch (e) {
        console.error("Failed to delete quick enquiry", e);
        return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
    }
}
