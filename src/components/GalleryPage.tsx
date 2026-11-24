import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryBrowser from "@/components/GalleryBrowser";
import PageHeader from "@/components/ui/PageHeader";
import { getGallerySections } from "@/lib/publicData";

/** Shared by /gallery (All) and /gallery/<sectionId> (that collection pre-selected). */
export default async function GalleryPage({ sectionId }: { sectionId: string | null }) {
    const sections = await getGallerySections();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Gallery" }]}
                eyebrow="Visual Journey"
                title={<>Our <span className="italic text-primary">Gallery</span></>}
                lead="Photos and videos from our campus, events and celebrations. Choose a collection to see it on its own."
            />
            <section className="section w-full flex-1">
                <div className="container-page">
                    <GalleryBrowser sections={sections} initialSectionId={sectionId} />
                </div>
            </section>
            <Footer />
        </main>
    );
}
