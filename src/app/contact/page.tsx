import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { withPageUrl } from "@/lib/site";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO, SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";
import { getContactInfo } from "@/lib/contactSettings";

async function buildMetadata(): Promise<Metadata> {
    try {
        await dbConnect();
        const pageSeo = await PageSEO.findOne({ pageKey: 'contact' }).lean();
        const globalConfig = await SiteConfig.findOne({ key: 'global-seo' }).lean();

        const title = pageSeo?.title || "Contact Us";
        const description = pageSeo?.description || "Get in touch with Learnink Education. Submit your enquiry, talk to our counselors, or visit our office in Calicut.";
        const keywords = pageSeo?.keywords?.length ? pageSeo.keywords : ["contact learnink", "education enquiry", "calicut education"];
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
            title: "Contact Us",
            description: "Get in touch with Learnink Education",
        };
    }
}

export default async function ContactPage() {
    // Phone, email, address etc. are edited in Admin → Contact.
    const info = await getContactInfo();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Contact" }]}
                eyebrow="Get in Touch"
                title={<>Let&apos;s Start Your <span className="italic text-primary">Journey</span></>}
                lead="Have questions about our programs? Our counsellors are here to guide you every step of the way."
            />
            <div className="w-full flex-1">
                <Contact info={info} />
            </div>
            <Footer />
        </main>
    );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/contact");
}
