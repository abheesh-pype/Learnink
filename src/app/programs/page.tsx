import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getPrograms } from "@/lib/publicData";
import { withPageUrl } from "@/lib/site";
import Programs from "@/components/Programs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO, SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
    try {
        await dbConnect();
        const pageSeo = await PageSEO.findOne({ pageKey: 'programs' }).lean();
        const globalConfig = await SiteConfig.findOne({ key: 'global-seo' }).lean();

        const title = pageSeo?.title || "Educational Programs";
        const description = pageSeo?.description || "Explore our wide range of educational programs - Fast Track Degrees, Credit Transfer, Online Degrees, and more.";
        const keywords = pageSeo?.keywords?.length ? pageSeo.keywords : ["degree programs", "fast track degree", "online education"];
        const ogImage = pageSeo?.ogImage || globalConfig?.ogImage;

        return {
            title,
            description,
            keywords,
            openGraph: {
                title,
                description,
                images: ogImage ? [{ url: ogImage }] : undefined,
            },
        };
    } catch {
        return {
            title: "Educational Programs",
            description: "Explore our wide range of educational programs",
        };
    }
}

export default async function ProgramsPage() {
    const programs = await getPrograms();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Programs" }]}
                eyebrow="Our Programs"
                title={<>Designed for Your <span className="italic text-primary">Success</span></>}
                lead="Flexible programs from leading universities, tailored to your career goals and academic needs."
            />
            <section className="section w-full flex-1">
                <div className="container-page">
                    <Programs embedded initialPrograms={programs} />
                </div>
            </section>
            <Footer />
        </main>
    );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/programs");
}
