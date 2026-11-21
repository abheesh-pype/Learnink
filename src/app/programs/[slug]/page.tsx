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
                    <div className="glow-blob -right-24 -top-24 h-80 w-80 bg-glow/25" aria-hidden="true" />
                    <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
                    <div className="container-page relative py-14 lg:py-20">
                        <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
                            <ArrowLeft size={18} /> Back to Programs
                        </Link>
                        {program.category && (
                            <span className="mt-6 block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-200">
                                {program.category}
                            </span>
                        )}
                        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
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
                            <div className="bg-brand-gradient sticky top-28 overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-violet/25 sm:p-8">
                                <p className="text-lg font-semibold">Interested in this program?</p>
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
