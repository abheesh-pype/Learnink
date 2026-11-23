import { Metadata } from "next";
import { redirect } from "next/navigation";
import { withPageUrl } from "@/lib/site";
import GalleryPage from "@/components/GalleryPage";
import { getGallerySections } from "@/lib/publicData";

// Gallery opened from a homepage "Explore More" button: that heading's filter is selected.
export default async function GallerySectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
    const { sectionId } = await params;
    const sections = await getGallerySections();
    // Unknown or now-empty heading: show the whole gallery instead.
    if (!sections.some((s) => s._id === sectionId)) redirect("/gallery");
    return <GalleryPage sectionId={sectionId} />;
}

export async function generateMetadata({ params }: { params: Promise<{ sectionId: string }> }): Promise<Metadata> {
    const { sectionId } = await params;
    const section = (await getGallerySections()).find((s) => s._id === sectionId);
    return withPageUrl(
        {
            title: section ? `${section.title} | Gallery` : "Gallery",
            description: section?.description || "Photos and videos from Learnink's campus, events and celebrations.",
        },
        `/gallery/${sectionId}`
    );
}
