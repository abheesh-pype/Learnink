import { Program } from "@/lib/models";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CourseSchema } from "@/components/JsonLd";

import dbConnect from "@/lib/db";
import { SITE_URL as siteUrl } from "@/lib/site";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { slug } = await params;
    const program = await Program.findOne({ slug }).lean();

    if (!program) return {};

    const title = program.metaTitle || program.title;
    const description = program.metaDescription || program.description;

    return {
        title: title,
        description: description,
        keywords: program.keywords,
        alternates: {
            canonical: `${siteUrl}/programs/${slug}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `${siteUrl}/programs/${slug}`,
            type: 'article',
        },
        twitter: {
            card: 'summary',
            title: title,
            description: description,
        },
    };
}

export default async function ProgramPage({ params }: Props) {
    await dbConnect();
    const { slug } = await params;
    const program = await Program.findOne({ slug }).lean();

    if (!program) notFound();

    return (
        <>
            <CourseSchema
                name={program.title}
                description={program.description}
                provider="Learnink Education"
                url={`${siteUrl}/programs/${slug}`}
                category={program.category}
            />
            <main className="min-h-screen pt-20 flex flex-col bg-white">
                <Navbar />

                {/* Page banner */}
                <header className="bg-brand-gradient relative overflow-hidden">
                    <div className="container-page relative py-14 lg:py-20">
                        <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
                            <ArrowLeft size={18} /> Back to Programs
                        </Link>
                        {program.category && (
                            <span className="mt-8 block w-fit text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                {program.category}
                            </span>
                        )}
                        <h1 className="mt-3 max-w-4xl font-display text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl">
                            {program.title}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 bg-primary-50">
                    <div className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12 lg:py-16">
                        <article className="card p-6 sm:p-10 lg:col-span-8">
                            <div className="prose prose-lg max-w-none text-slate-600">
                                <p className="mb-8 text-lg font-medium leading-relaxed text-slate-700">
                                    {program.description}
                                </p>

                                {program.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: program.content }} />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50 p-8 text-center text-slate-500">
                                        Detailed content coming soon.
                                    </div>
                                )}
                            </div>
                        </article>

                        <aside className="lg:col-span-4">
                            <div className="bg-brand-gradient sticky top-28 overflow-hidden rounded-lg p-6 text-white shadow-sm sm:p-8">
                                <p className="font-display text-2xl font-semibold">Interested in this program?</p>
                                <p className="mt-2 text-sm text-white/80">Get in touch with our counselors today.</p>
                                <Link href="/contact" className="btn-light mt-6 w-full">
                                    Enquire Now
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    );
}
