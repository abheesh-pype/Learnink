
import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EnquiryPopup from "@/components/EnquiryPopup";
import Stats from "@/components/Stats";
import { getContactInfo } from "@/lib/contactSettings";
import Programs from "@/components/Programs";
import Partners from "@/components/Partners";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageSEO } from "@/lib/models";
import { getGallerySections, getPartners, getPrograms, getSiteConfig, getTestimonials } from "@/lib/publicData";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const [pageSeo, globalConfig] = await Promise.all([
      PageSEO.findOne({ pageKey: 'home' }).lean(),
      getSiteConfig(),
    ]);

    const title = pageSeo?.title || globalConfig?.title || "Learnink Education | Linking Learning, Skills & Careers";
    const description = pageSeo?.description || globalConfig?.description || "Learnink Education Pvt Ltd is an all-in-one education platform offering degree programs, fast track courses, and more.";
    const keywords = pageSeo?.keywords?.length ? pageSeo.keywords : globalConfig?.keywords;
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
      title: "Learnink Education | Linking Learning, Skills & Careers",
      description: "Learnink Education Pvt Ltd is an all-in-one education platform offering degree programs, fast track courses, and more.",
    };
  }
}

export default async function Home() {
  // Stats numbers are edited in Admin → Contact → Numbers.
  // Everything the page shows is loaded here, in parallel, so it arrives with the HTML.
  const [contact, programs, partners, gallery, testimonials] = await Promise.all([
    getContactInfo(),
    getPrograms(),
    getPartners(),
    getGallerySections(),
    getTestimonials(),
  ]);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      {/* Enquiry form popup, 10 seconds after the page loads */}
      <EnquiryPopup />
      <Stats numbers={contact} />

      {/* Sections alternate light paper / white; each heading carries its own "View all" link */}
      <Programs limit={3} initialPrograms={programs} />
      <Partners limit={6} initialPartners={partners} />
      <Gallery initialSections={gallery} />
      <Testimonials initialTestimonials={testimonials} />

      {/* Call to action: compact band, text left, buttons right */}
      <section className="bg-primary">
        <div className="container-page flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl lg:text-[2.6rem]">
              Ready to Start Your <span className="text-shimmer-light">Journey?</span>
            </h2>
            <p className="mt-3 text-white/80">Talk to our counsellors and find the right program for your career goals.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/contact" className="btn-light px-7 py-3.5 text-base">
              Enquire Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-md border border-white/50 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/");
}
